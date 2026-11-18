using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WeddingSystem.Controllers;
using WeddingSystem.DBO.Context;
using WeddingSystem.Infrastructure;
using WeddingSystem.Models.Entities;
using Xunit;

namespace WeddingSystem.Tests;

public sealed class RegistrationTests
{
    internal const string Key = "test-only-signing-key-of-at-least-sixty-four-bytes-for-local-login-tests";

    [Theory]
    [InlineData("invalid", "username", "password123", "password123")]
    [InlineData("user@example.com", "", "password123", "password123")]
    [InlineData("user@example.com", "username", "short", "short")]
    [InlineData("user@example.com", "username", "password123", "different")]
    public void RejectsInvalidRegistration(string email, string username, string password, string confirmation)
    {
        var request = new RegisterRequest { Email = email, Username = username, Password = password, ConfirmPassword = confirmation };
        Assert.False(Validator.TryValidateObject(request, new ValidationContext(request), [], true));
    }

    [Fact]
    public async Task RegistrationStoresHashAndLoginValidatesDatabasePassword()
    {
        using var fixture = new LoginFixture();
        Assert.Equal(201, Assert.IsType<ObjectResult>(await fixture.Controller.Register(Request(), default)).StatusCode);
        var user = await fixture.Db.Users.SingleAsync();
        Assert.Equal("user@example.com", user.Email);
        Assert.NotEqual("password123", user.Password);
        Assert.NotEqual(PasswordVerificationResult.Failed, fixture.Hasher.VerifyHashedPassword(user, user.Password!, "password123"));
        Assert.IsType<UnauthorizedObjectResult>(await fixture.Controller.Login(new() { Email = user.Email, Password = "wrong" }, default));
        var result = Assert.IsType<OkObjectResult>(await fixture.Controller.Login(new() { Email = "USER@example.com", Password = "password123" }, default));
        var json = JsonSerializer.Serialize(result.Value);
        Assert.DoesNotContain(user.Password!, json);
        using var document = JsonDocument.Parse(json);
        var token = document.RootElement.GetProperty("accessToken").GetString()!;
        var principal = new JwtSecurityTokenHandler { MapInboundClaims = false }.ValidateToken(token, new TokenValidationParameters
        {
            ValidIssuer = LoginTokens.Issuer, ValidAudience = LoginTokens.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key)),
            ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true
        }, out _);
        Assert.Equal(user.Id.ToString(), principal.FindFirst("sub")?.Value);
        Assert.Null(principal.FindFirst("role"));
        Assert.Equal(0, fixture.Legacy.Calls);
    }

    [Fact]
    public async Task DuplicateRegistrationCannotOverwritePassword()
    {
        using var fixture = new LoginFixture();
        await fixture.Controller.Register(Request(), default);
        var hash = (await fixture.Db.Users.SingleAsync()).Password;
        var duplicate = Request(); duplicate.Email = "USER@example.com"; duplicate.Password = duplicate.ConfirmPassword = "attacker-password";
        Assert.IsType<ConflictObjectResult>(await fixture.Controller.Register(duplicate, default));
        Assert.Equal(hash, (await fixture.Db.Users.SingleAsync()).Password);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ExistingAccountMigratesOnlyAfterOwnershipVerification(bool verified)
    {
        using var fixture = new LoginFixture();
        fixture.Legacy.Verified = verified;
        var user = new UserEntity { Id = Guid.NewGuid(), AuthUserId = Guid.NewGuid(), Email = "user@example.com", Username = "Existing", CreatedDate = DateTimeOffset.UtcNow };
        fixture.Db.Users.Add(user); await fixture.Db.SaveChangesAsync();
        var result = await fixture.Controller.Login(new() { Email = user.Email, Password = "password123" }, default);
        if (verified)
        {
            Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(user.Password);
            fixture.Legacy.Verified = false;
            Assert.IsType<OkObjectResult>(await fixture.Controller.Login(new() { Email = user.Email, Password = "password123" }, default));
        }
        else { Assert.IsType<UnauthorizedObjectResult>(result); Assert.Null(user.Password); }
        Assert.Equal(1, fixture.Legacy.Calls);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("password123")]
    public async Task MissingOrPlainTextPasswordDoesNotAuthenticate(string? password)
    {
        using var fixture = new LoginFixture();
        fixture.Db.Users.Add(new() { Id = Guid.NewGuid(), Email = "user@example.com", Username = "Existing", Password = password, CreatedDate = DateTimeOffset.UtcNow });
        await fixture.Db.SaveChangesAsync();
        Assert.IsType<UnauthorizedObjectResult>(await fixture.Controller.Login(new() { Email = "user@example.com", Password = "password123" }, default));
        Assert.Equal(0, fixture.Legacy.Calls);
    }

    private static RegisterRequest Request() => new() { Email = "User@example.com", Username = " User ", Password = "password123", ConfirmPassword = "password123" };

    private sealed class LoginFixture : IDisposable
    {
        private readonly SqliteConnection connection = new("Data Source=:memory:");
        public WeddingDbContext Db { get; }
        public PasswordHasher<UserEntity> Hasher { get; } = new();
        public FakeLegacy Legacy { get; } = new();
        public RegistrationController Controller { get; }
        public LoginFixture()
        {
            connection.Open();
            Db = new(new DbContextOptionsBuilder<WeddingDbContext>().UseSqlite(connection).Options);
            Db.Database.ExecuteSqlRaw("CREATE TABLE User (AccountId TEXT PRIMARY KEY, AuthUserId TEXT NULL, Email TEXT NOT NULL UNIQUE COLLATE NOCASE, UserName TEXT NOT NULL, Password TEXT NULL, createdDate TEXT NOT NULL)");
            var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Authentication:SigningKey"] = Key }).Build();
            Controller = new(Db, Hasher, new LoginTokens(config), Legacy);
        }
        public void Dispose() { Db.Dispose(); connection.Dispose(); }
    }

    private sealed class FakeLegacy : ILegacyPasswordVerifier
    {
        public bool Verified { get; set; }
        public int Calls { get; private set; }
        public Task<bool> Verify(string email, string password, Guid id, CancellationToken cancellationToken)
        { Calls++; return Task.FromResult(Verified); }
    }
}
