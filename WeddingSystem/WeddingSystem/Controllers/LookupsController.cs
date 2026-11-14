using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeddingSystem.BLO;
using WeddingSystem.Models.Requests;
using WeddingSystem.Models.Responses;

namespace WeddingSystem.Controllers;

[ApiController, Authorize, Route("api")]
public sealed class LookupsController(LookupBLO lookups) : ControllerBase
{
    [HttpGet("attendance-statuses")]
    public Task<IReadOnlyList<LookupResponse>> Statuses(CancellationToken ct) => lookups.StatusesAsync(ct);
    [HttpGet("guest-tags")]
    public Task<IReadOnlyList<LookupResponse>> Tags(CancellationToken ct) => lookups.TagsAsync(ct);
    [HttpPost("guest-tags"), Authorize(Policy = "Admin")]
    public async Task<ActionResult<LookupResponse>> Create(TagRequest request, CancellationToken ct)
    {
        var tag = await lookups.SaveTagAsync(null, request.TagName, ct);
        return Created("/api/guest-tags", tag);
    }
    [HttpPut("guest-tags/{id:int}"), Authorize(Policy = "Admin")]
    public Task<LookupResponse> Update(int id, TagRequest request, CancellationToken ct) => lookups.SaveTagAsync(id, request.TagName, ct);
    [HttpDelete("guest-tags/{id:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await lookups.DeleteTagAsync(id, ct);
        return NoContent();
    }
}
