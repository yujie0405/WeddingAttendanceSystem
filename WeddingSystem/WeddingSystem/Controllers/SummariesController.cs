using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeddingSystem.BLO;
using WeddingSystem.Models.Requests;
using WeddingSystem.Models.Responses;

namespace WeddingSystem.Controllers;

[ApiController, Authorize, Route("api")]
public sealed class SummariesController(GuestBLO guests) : ControllerBase
{
    [HttpGet("summary/attendance")]
    public Task<AttendanceSummary> Attendance(CancellationToken ct) => guests.SummaryAsync(ct);
    [HttpGet("admin/guests/{id:int}/angpau"), Authorize(Policy = "Admin")]
    public Task<AngpauResponse> Angpau(int id, CancellationToken ct) => guests.GetAngpauAsync(id, ct);
    [HttpPut("admin/guests/{id:int}/angpau"), Authorize(Policy = "Admin")]
    public Task<AngpauResponse> SetAngpau(int id, AngpauRequest request, CancellationToken ct) => guests.SetAngpauAsync(id, request.Amount, ct);
    [HttpGet("admin/summary/angpau"), Authorize(Policy = "Admin")]
    public async Task<object> Total(CancellationToken ct) => new { amount = await guests.TotalAsync(ct), currency = "MYR" };
}
