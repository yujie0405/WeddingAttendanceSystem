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
using Supabase.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using System.Threading.RateLimiting;
using WeddingSystem.Models.Entities;

var builder = WebApplication.CreateBuilder(args);
builder.AddWebConfigDefaults();
// Support the connection name already used by local .NET user-secrets.
if (string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("WeddingDb")))
    builder.Configuration["ConnectionStrings:WeddingDb"] = builder.Configuration.GetConnectionString("DefaultConnection");
// Keep startup independent of Windows Event Log write permissions.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Services.AddControllers();
builder.Services.AddScoped<IPasswordHasher<UserEntity>, PasswordHasher<UserEntity>>();
builder.Services.Configure<PasswordHasherOptions>(options => options.IterationCount = 210000);
builder.Services.AddScoped<LoginTokens>();
builder.Services.AddScoped<ILegacyPasswordVerifier, LegacyPasswordVerifier>();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 15, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});
var supabaseUrl = builder.Configuration["Supabase:Url"]?.TrimEnd('/');
var supabaseKey = builder.Configuration["Supabase:Key"];
if (!Uri.TryCreate(supabaseUrl, UriKind.Absolute, out var supabaseUri) || supabaseUri.Scheme != "https" || string.IsNullOrWhiteSpace(supabaseKey))
    throw new InvalidOperationException("Configure a valid HTTPS Supabase:Url and Supabase:Key.");
builder.Services.AddSupabase(supabaseUrl!, supabaseKey, options =>
{
    // Each HTTP request has its own client; the browser owns persistent login sessions.
    options.AutoRefreshToken = false;
    options.AutoConnectRealtime = false;
});
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
        Description = "Paste the accessToken returned by POST /api/auth/login. Swagger adds the Bearer prefix."
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
builder.Services.AddScoped<TableDBO>();
builder.Services.AddScoped<TableBLO>();
var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    if (origins.Length > 0) policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
}));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.Audience = LoginTokens.Audience;
    options.RequireHttpsMetadata = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true,
        ValidateIssuerSigningKey = true, RequireSignedTokens = true,
        ValidIssuer = LoginTokens.Issuer,
        ValidAudience = LoginTokens.Audience,
        IssuerSigningKey = LoginTokens.SigningKey(builder.Configuration),
        ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
        ClockSkew = TimeSpan.FromSeconds(30)
    };
});
builder.Services.AddAuthorization(options =>
    options.AddPolicy("Admin", policy => policy.RequireAuthenticatedUser().RequireAssertion(async context =>
    {
        if (context.Resource is not HttpContext http || !Guid.TryParse(context.User.FindFirst("sub")?.Value, out var id))
            return false;
        var db = http.RequestServices.GetRequiredService<WeddingDbContext>();
        return await db.Users.AnyAsync(user => user.Id == id && user.Type == UserEntity.AdminType, http.RequestAborted);
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
// Render redirects public HTTP at its edge and proxies to Kestrel over HTTP.
var runsOnRender = string.Equals(Environment.GetEnvironmentVariable("RENDER"), "true", StringComparison.OrdinalIgnoreCase);
if (!app.Environment.IsDevelopment() && !runsOnRender) app.UseHttpsRedirection();
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "WeddingSystem" })).AllowAnonymous();
app.MapControllers();
app.Run();

public partial class Program;
