using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using WeddingSystem.Models.Entities;

namespace WeddingSystem.Infrastructure;

public sealed class LoginTokens(IConfiguration configuration)
{
    public const string Issuer = "WeddingSystem";
    public const string Audience = "WeddingSystem.Frontend";
    public static SymmetricSecurityKey SigningKey(IConfiguration configuration)
    {
        var value = configuration["Authentication:SigningKey"];
        if (string.IsNullOrWhiteSpace(value) || Encoding.UTF8.GetByteCount(value) < 64)
            throw new ApiException(503, "LOGIN_NOT_CONFIGURED", "Configure a server-only Authentication:SigningKey of at least 64 bytes.");
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(value));
    }

    public object Issue(UserEntity user)
    {
        var expires = DateTime.UtcNow.AddHours(8);
        var token = new JwtSecurityToken(Issuer, Audience,
            [new Claim("sub", user.Id.ToString()), new Claim("email", user.Email)],
            notBefore: DateTime.UtcNow, expires: expires,
            signingCredentials: new SigningCredentials(SigningKey(configuration), SecurityAlgorithms.HmacSha256));
        return new { accessToken = new JwtSecurityTokenHandler().WriteToken(token), expiresAt = expires };
    }
}
