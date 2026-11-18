using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeddingSystem.BLO;

namespace WeddingSystem.Controllers;

public sealed class TableRequest
{
    [Range(1, short.MaxValue)] public int TableNumber { get; set; }
    [Range(1, 10000)] public int Capacity { get; set; }
    [Range(1, short.MaxValue)] public int? GuestTagId { get; set; }
}

[ApiController, Authorize, Route("api/tables")]
public sealed class TablesController(TableBLO tables) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<TableResponse>> List(CancellationToken ct) => tables.ListAsync(ct);
    [HttpPost, Authorize(Policy = "Admin")]
    public async Task<ActionResult<TableResponse>> Create(TableRequest request, CancellationToken ct)
    {
        var table = await tables.CreateAsync(request.TableNumber, request.Capacity, ct, request.GuestTagId);
        return Created($"/api/tables/{table.TableNumber}", table);
    }
    [HttpDelete("{number:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(int number, CancellationToken ct)
    {
        await tables.DeleteAsync(number, ct);
        return NoContent();
    }
}
