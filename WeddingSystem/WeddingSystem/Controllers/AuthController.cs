using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeddingSystem.DBO.Context;

namespace WeddingSystem.Controllers;

[ApiController, Authorize, Route("api/auth")]
public sealed class AuthController(IAuthorizationService authorization) : ControllerBase
{
    // Uses the same server Admin policy as management endpoints, never browser metadata.
    [HttpGet("me")]
    public async Task<IActionResult> Me([FromServices] WeddingDbContext db, CancellationToken cancellationToken)
    {
        var subject = User.FindFirst("sub")?.Value;
        var profile = Guid.TryParse(subject, out var id)
            ? await db.Users.Where(x => x.Id == id).Select(x => new { x.Email, x.Username })
                .SingleOrDefaultAsync(cancellationToken)
            : null;
        var admin = await authorization.AuthorizeAsync(User, HttpContext, "Admin");
        return Ok(new
        {
            id = User.FindFirst("sub")?.Value,
            email = profile?.Email ?? User.FindFirst("email")?.Value,
            name = profile?.Username ?? User.FindFirst("email")?.Value ?? subject ?? "",
            role = admin.Succeeded ? "admin" : "guest"
        });
    }
}
