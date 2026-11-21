using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeddingSystem.DBO.Context;
using Xunit;

namespace WeddingSystem.Tests;

public sealed class DatabaseLoginApiTests
{
    [Fact]
    public async Task RegisterLoginAndReadProfileThroughRealAuthenticationPipeline()
    {
        using var factory = new LoginFactory();
        using var client = factory.CreateClient();
        var register = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "new@example.com", username = "New User", password = "password123", confirmPassword = "password123", type = 1
        });
        Assert.Equal(HttpStatusCode.Created, register.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/auth/login", new { email = "new@example.com", password = "wrong" })).StatusCode);
        var login = await client.PostAsJsonAsync("/api/auth/login", new { email = "new@example.com", password = "password123" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        using var session = JsonDocument.Parse(await login.Content.ReadAsStringAsync());
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.RootElement.GetProperty("accessToken").GetString());
        var profile = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
        var body = await profile.Content.ReadAsStringAsync();
        using var user = JsonDocument.Parse(body);
        Assert.Equal("New User", user.RootElement.GetProperty("name").GetString());
        Assert.Equal("guest", user.RootElement.GetProperty("role").GetString());
        Assert.DoesNotContain("password", body, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin/summary/angpau")).StatusCode);
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WeddingDbContext>();
        var account = await db.Users.SingleAsync();
        Assert.Equal(2, account.Type);
        account.Type = 1;
        await db.SaveChangesAsync();

        using var adminProfile = JsonDocument.Parse(await client.GetStringAsync("/api/auth/me"));
        Assert.Equal("admin", adminProfile.RootElement.GetProperty("role").GetString());
        var invalidAmount = new { amount = -1 };
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/admin/guests/1/angpau", invalidAmount)).StatusCode);

        account.Type = 2;
        await db.SaveChangesAsync();
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync("/api/admin/guests/1/angpau", invalidAmount)).StatusCode);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "forged");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    private sealed class LoginFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection connection = new("Data Source=:memory:");
        public LoginFactory()
        {
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = "CREATE TABLE User (AccountId TEXT PRIMARY KEY, AuthUserId TEXT NULL, Email TEXT NOT NULL UNIQUE COLLATE NOCASE, UserName TEXT NOT NULL, Password TEXT NULL, createdDate TEXT NOT NULL, type INTEGER NULL)";
            command.ExecuteNonQuery();
        }
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Authentication:SigningKey"] = RegistrationTests.Key,
                ["Authentication:AdminUserIds"] = "",
                ["Supabase:Url"] = "https://tests.invalid", ["Supabase:Key"] = "test-key"
            }));
            builder.ConfigureServices(services => services.AddScoped(_ => new WeddingDbContext(
                new DbContextOptionsBuilder<WeddingDbContext>().UseSqlite(connection).Options)));
        }
        protected override void Dispose(bool disposing) { base.Dispose(disposing); if (disposing) connection.Dispose(); }
    }
}
