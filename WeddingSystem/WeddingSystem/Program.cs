using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
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
        Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme { Reference = new() { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }] = []
    });
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
    app.UseSwagger();
    app.UseSwaggerUI();
}
if (!app.Environment.IsDevelopment()) app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "WeddingSystem" })).AllowAnonymous();
app.MapControllers();
app.Run();

public partial class Program;
