using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using WeddingSystem.DBO.Context;
using WeddingSystem.Infrastructure;
using WeddingSystem.Models.Entities;

namespace WeddingSystem.Controllers;

public sealed class RegisterRequest
{
    [Required, EmailAddress, MaxLength(254)] public string Email { get; set; } = "";
    [Required, StringLength(100)] public string Username { get; set; } = "";
    [Required, StringLength(128, MinimumLength = 8)] public string Password { get; set; } = "";
    [Required, Compare(nameof(Password))] public string ConfirmPassword { get; set; } = "";
}

public sealed class LoginRequest
{
    [Required, EmailAddress, MaxLength(254)] public string Email { get; set; } = "";
    [Required, MaxLength(128)] public string Password { get; set; } = "";
}

[ApiController, Route("api/auth"), EnableRateLimiting("login")]
public sealed class RegistrationController(WeddingDbContext db, IPasswordHasher<UserEntity> passwords,
    LoginTokens tokens, ILegacyPasswordVerifier legacy) : ControllerBase
{
    [AllowAnonymous, HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username)) return BadRequest(new { code = "INVALID_INPUT" });
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email.ToLower() == email, cancellationToken))
            return Conflict(new { code = "ACCOUNT_EXISTS" });
        var user = new UserEntity
        {
            Id = Guid.NewGuid(), Email = email, Username = request.Username.Trim(), CreatedDate = DateTimeOffset.UtcNow,
            Type = UserEntity.GuestType
        };
        user.Password = passwords.HashPassword(user, request.Password);
        db.Users.Add(user);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException error) when (error.InnerException is PostgresException { SqlState: "23505" })
        { return Conflict(new { code = "ACCOUNT_EXISTS" }); }
        return StatusCode(201, new { message = "Account created. Sign in with your email and password." });
    }

    [AllowAnonymous, HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email.ToLower() == email, cancellationToken);
        if (user is null) return Unauthorized(new { code = "INVALID_CREDENTIALS" });
        var verification = PasswordVerificationResult.Failed;
        if (!string.IsNullOrEmpty(user.Password))
        {
            try { verification = passwords.VerifyHashedPassword(user, user.Password, request.Password); }
            catch (FormatException) { /* Never accept raw or invalid legacy values. */ }
        }
        else if (user.AuthUserId is { } authId && await legacy.Verify(email, request.Password, authId, cancellationToken))
            verification = PasswordVerificationResult.SuccessRehashNeeded;
        if (verification == PasswordVerificationResult.Failed) return Unauthorized(new { code = "INVALID_CREDENTIALS" });
        var result = tokens.Issue(user);
        if (verification == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.Password = passwords.HashPassword(user, request.Password);
            await db.SaveChangesAsync(cancellationToken);
        }
        return Ok(result);
    }
}
