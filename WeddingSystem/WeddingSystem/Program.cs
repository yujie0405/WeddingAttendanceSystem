using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using WeddingSystem.BLO;
using WeddingSystem.Configuration;
using WeddingSystem.DBO;
using WeddingSystem.DBO.Context;
using WeddingSystem.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.AddWebConfigDefaults();
// Keep startup independent of Windows Event Log write permissions.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Paste only the Supabase user session access_token, without the Bearer prefix. " +
            "Swagger adds Authorization: Bearer <access_token>. The connected frontend signs in through Supabase Auth."
    });
    options.OperationFilter<SwaggerBearerSecurityFilter>();
});
builder.Services.AddDbContext<WeddingDbContext>((services, options) =>
{
    var connection = services.GetRequiredService<IConfiguration>().GetConnectionString("WeddingDb");
    if (string.IsNullOrWhiteSpace(connection))
        throw new ApiException(503, "DATABASE_NOT_CONFIGURED", "Configure the WeddingDb connection string on the server.");
    options.UseNpgsql(connection);
});
builder.Services.AddScoped<GuestDBO>();
builder.Services.AddScoped<LookupDBO>();
builder.Services.AddScoped<GuestBLO>();
builder.Services.AddScoped<LookupBLO>();
var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    if (origins.Length > 0) policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
}));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    var authority = builder.Configuration["Authentication:Authority"];
    if (!string.IsNullOrWhiteSpace(authority)) options.Authority = authority;
    options.Audience = builder.Configuration["Authentication:Audience"] ?? "authenticated";
    options.RequireHttpsMetadata = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true,
        ValidateIssuerSigningKey = true, RequireSignedTokens = true,
        ClockSkew = TimeSpan.FromSeconds(30)
    };
});
builder.Services.AddAuthorization(options =>
    options.AddPolicy("Admin", policy => policy.RequireAuthenticatedUser().RequireAssertion(context =>
    {
        if (context.Resource is not HttpContext http || context.User.FindFirst("sub") is not { } subject)
            return false;
        var configured = http.RequestServices.GetRequiredService<IConfiguration>()["Authentication:AdminUserIds"] ?? "";
        return configured.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Contains(subject.Value, StringComparer.Ordinal);
    })));

var app = builder.Build();
app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    try
    {
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        await using var scope = app.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<WeddingDbContext>();
        await db.Database.ExecuteSqlRawAsync("SELECT 1", timeout.Token);
        Console.WriteLine("Connection success");
    }
    catch (Exception exception)
    {
        Console.WriteLine("Connection failed");
        // Use fixed messages: raw exception text may expose database credentials.
        Console.WriteLine(exception switch
        {
            ApiException { Code: "DATABASE_NOT_CONFIGURED" } =>
                "The WeddingDb connection string is not configured.",
            OperationCanceledException or TimeoutException =>
                "The database connection check timed out.",
            PostgresException { SqlState: "28P01" or "28000" } =>
                "Database authentication failed. Check the configured database credentials.",
            PostgresException { SqlState: "3D000" } =>
                "The configured database does not exist.",
            NpgsqlException =>
                "Unable to connect to PostgreSQL. Check network access, server settings, and TLS configuration.",
            _ => "The database connection check could not complete. Check the server configuration."
        });
    }

    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("v1/swagger.json", "WeddingSystem API v1");
    });
}
if (!app.Environment.IsDevelopment()) app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "WeddingSystem" })).AllowAnonymous();
app.MapControllers();
app.Run();

public partial class Program;
