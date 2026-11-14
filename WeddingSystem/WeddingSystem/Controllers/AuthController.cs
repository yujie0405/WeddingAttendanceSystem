using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WeddingSystem.Controllers;

[ApiController, Authorize, Route("api/auth")]
public sealed class AuthController(IAuthorizationService authorization) : ControllerBase
{
    // Uses the same server Admin policy as management endpoints, never browser metadata.
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var admin = await authorization.AuthorizeAsync(User, HttpContext, "Admin");
        return Ok(new
        {
            id = User.FindFirst("sub")?.Value,
            name = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value ?? "",
            role = admin.Succeeded ? "admin" : "staff"
        });
    }
}
