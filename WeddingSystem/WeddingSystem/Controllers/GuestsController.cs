using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeddingSystem.BLO;
using WeddingSystem.Models.Requests;
using WeddingSystem.Models.Responses;

namespace WeddingSystem.Controllers;

[ApiController, Authorize, Route("api/guests")]
public sealed class GuestsController(GuestBLO guests) : ControllerBase
{
    [HttpGet]
    public Task<PagedResponse<GuestResponse>> List([FromQuery] GuestQuery query, CancellationToken ct) => guests.ListAsync(query, ct);
    [HttpGet("{id:int}")]
    public Task<GuestResponse> Get(int id, CancellationToken ct) => guests.GetAsync(id, ct);
    [HttpPost, Authorize(Policy = "Admin")]
    public async Task<ActionResult<GuestResponse>> Create(GuestWriteRequest request, CancellationToken ct)
    {
        var guest = await guests.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = guest.Id }, guest);
    }
    [HttpPut("{id:int}"), Authorize(Policy = "Admin")]
    public Task<GuestResponse> Update(int id, GuestWriteRequest request, CancellationToken ct) => guests.UpdateAsync(id, request, ct);
    [HttpDelete("{id:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await guests.DeleteAsync(id, ct);
        return NoContent();
    }
    [HttpPut("{id:int}/attendance")]
    public Task<GuestResponse> Attendance(int id, AttendanceRequest request, CancellationToken ct) =>
        guests.AttendanceAsync(id, request.AttendanceStatusId, ct);
}
