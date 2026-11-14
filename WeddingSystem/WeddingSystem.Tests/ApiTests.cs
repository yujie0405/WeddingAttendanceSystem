using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using WeddingSystem.DBO.Context;
using WeddingSystem.Models.Responses;
using Xunit;

namespace WeddingSystem.Tests;

// Every test uses a deliberately unreachable database address. No production config or writes.
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    internal const string Issuer = "https://tests.invalid";
    internal const string Key = "test-only-signing-key-at-least-thirty-two-bytes-long";
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:WeddingDb"] = "Host=127.0.0.1;Port=1;Database=tests;Username=tests;Password=tests;Timeout=1",
            ["Authentication:Authority"] = "",
            ["Authentication:AdminUserIds"] = "test-admin",
            ["Cors:AllowedOrigins:0"] = "http://localhost:5173"
        }));
        builder.ConfigureServices(services => services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.Authority = null;
            options.ConfigurationManager = null;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = Issuer, ValidAudience = "authenticated",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key)),
                ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true,
                ValidateIssuerSigningKey = true, RequireSignedTokens = true
            };
        }));
    }
    public HttpClient Authenticated(string user)
    {
        var token = new JwtSecurityToken(Issuer, "authenticated", [new Claim("sub", user)],
            expires: DateTime.UtcNow.AddMinutes(5), signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key)), SecurityAlgorithms.HmacSha256));
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", new JwtSecurityTokenHandler().WriteToken(token));
        return client;
    }
}

public sealed class ApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task HealthStartsWithoutDatabaseAccess()
    {
        using var client = factory.CreateClient();
        var result = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        Assert.Contains("WeddingSystem", await result.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData("/api/guests")]
    [InlineData("/api/guest-tags")]
    [InlineData("/api/admin/summary/angpau")]
    public async Task AnonymousRequestsAreRejected(string route)
    {
        using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(route)).StatusCode);
    }

    [Fact]
    public async Task ForgedBearerTokenIsRejected()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new("Bearer", "not-a-valid-token");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/guests")).StatusCode);
    }

    [Fact]
    public async Task StaffCannotReadFinancialTotals()
    {
        using var client = factory.Authenticated("staff");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin/summary/angpau")).StatusCode);
    }

    [Theory]
    [InlineData("staff", "staff")]
    [InlineData("test-admin", "admin")]
    public async Task CurrentUserUsesServerAuthorizationPolicy(string subject, string expectedRole)
    {
        using var client = factory.Authenticated(subject);
        var result = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        using var document = JsonDocument.Parse(await result.Content.ReadAsStringAsync());
        Assert.Equal(subject, document.RootElement.GetProperty("id").GetString());
        Assert.Equal(expectedRole, document.RootElement.GetProperty("role").GetString());
        Assert.False(document.RootElement.TryGetProperty("access_token", out _));
    }

    [Fact]
    public async Task CurrentUserRejectsAnonymousRequests()
    {
        using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    [InlineData(101)]
    public async Task InvalidPagingRejectedBeforeDatabaseAccess(int pageSize)
    {
        using var client = factory.Authenticated("staff");
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync($"/api/guests?pageSize={pageSize}")).StatusCode);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(1.001)]
    [InlineData(10000000000)]
    public async Task InvalidMoneyRejectedBeforeDatabaseAccess(decimal amount)
    {
        using var client = factory.Authenticated("test-admin");
        var result = await client.PutAsJsonAsync("/api/admin/guests/1/angpau", new { amount });
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
        Assert.Contains("INVALID_AMOUNT", await result.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task MissingAmountCannotSilentlyResetTotal()
    {
        using var client = factory.Authenticated("test-admin");
        Assert.Equal(HttpStatusCode.BadRequest,
            (await client.PutAsJsonAsync("/api/admin/guests/1/angpau", new { })).StatusCode);
    }

    [Fact]
    public async Task SwaggerContainsGuestRoutesAndNoWeatherSample()
    {
        using var client = factory.CreateClient();
        var json = await client.GetStringAsync("/swagger/v1/swagger.json");
        Assert.Contains("/api/guests", json);
        Assert.DoesNotContain("WeatherForecast", json);
    }

    [Fact]
    public async Task SwaggerGuestTagsRequiresTheDefinedHttpBearerScheme()
    {
        using var client = factory.CreateClient();
        using var document = JsonDocument.Parse(await client.GetStringAsync("/swagger/v1/swagger.json"));
        var root = document.RootElement;
        var scheme = root.GetProperty("components").GetProperty("securitySchemes").GetProperty("Bearer");
        Assert.Equal("http", scheme.GetProperty("type").GetString());
        Assert.Equal("bearer", scheme.GetProperty("scheme").GetString());
        Assert.Equal("JWT", scheme.GetProperty("bearerFormat").GetString());
        var operation = root.GetProperty("paths").GetProperty("/api/guest-tags").GetProperty("get");
        Assert.Equal(0, operation.GetProperty("security")[0].GetProperty("Bearer").GetArrayLength());
        Assert.True(operation.GetProperty("responses").TryGetProperty("401", out _));
        Assert.True(operation.GetProperty("responses").TryGetProperty("403", out _));
        var health = root.GetProperty("paths").GetProperty("/health").GetProperty("get");
        Assert.True(!health.TryGetProperty("security", out var security) || security.GetArrayLength() == 0);
    }

    [Fact]
    public void GuestProjectionContainsNoMoney()
    {
        Assert.DoesNotContain(typeof(GuestResponse).GetProperties(), property =>
            property.Name.Contains("Angpau", StringComparison.OrdinalIgnoreCase) || property.Name == "Amount");
    }

    [Fact]
    public void PostgreSqlMappingsGenerateQuotedSchemaNamesWithoutConnecting()
    {
        var options = new DbContextOptionsBuilder<WeddingDbContext>()
            .UseNpgsql("Host=127.0.0.1;Port=1;Database=tests;Username=tests;Password=tests").Options;
        using var db = new WeddingDbContext(options);
        var sql = db.Guests.Select(g => new { g.Id, g.TableNumber, g.AttendanceStatusId }).ToQueryString();
        Assert.Contains("public.\"Guest\"", sql);
        Assert.Contains("\"Table\"", sql);
        Assert.Contains("\"AttendanceStatus\"", sql);
    }
}
