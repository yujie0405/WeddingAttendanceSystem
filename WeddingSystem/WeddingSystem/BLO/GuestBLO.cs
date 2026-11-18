using WeddingSystem.DBO;
using WeddingSystem.Infrastructure;
using WeddingSystem.Models.Entities;
using WeddingSystem.Models.Requests;
using WeddingSystem.Models.Responses;

namespace WeddingSystem.BLO;

public sealed class GuestBLO(GuestDBO guests, LookupDBO lookups, IConfiguration config)
{
    public Task<PagedResponse<GuestResponse>> ListAsync(GuestQuery query, CancellationToken ct)
    {
        if ((long)(query.Page - 1) * query.PageSize > int.MaxValue)
            throw new ApiException(400, "INVALID_PAGE", "Page is too large.");
        return guests.ListAsync(query, ct);
    }
    public async Task<GuestResponse> GetAsync(int id, CancellationToken ct) =>
        await guests.ReadAsync(id, ct) ?? throw Missing();
    public async Task<GuestResponse> CreateAsync(GuestWriteRequest request, CancellationToken ct)
    {
        await ValidateAsync(request, ct);
        var guest = new GuestEntity();
        Apply(guest, request);
        guests.Add(guest);
        await guests.SaveAsync(ct);
        return await GetAsync(guest.Id, ct);
    }
    public async Task<GuestResponse> UpdateAsync(int id, GuestWriteRequest request, CancellationToken ct)
    {
        var guest = await guests.FindAsync(id, ct) ?? throw Missing();
        await ValidateAsync(request, ct);
        Apply(guest, request);
        await guests.SaveAsync(ct);
        return await GetAsync(id, ct);
    }
    public async Task<GuestResponse> AttendanceAsync(int id, int status, CancellationToken ct)
    {
        if (!await lookups.StatusExistsAsync(status, ct))
            throw new ApiException(400, "INVALID_STATUS", "Select an existing attendance status.");
        if (await guests.SetAttendanceAsync(id, status, ct) == 0) throw Missing();
        return await GetAsync(id, ct);
    }
    public async Task<AngpauResponse> GetAngpauAsync(int id, CancellationToken ct) =>
        await guests.ReadAngpauAsync(id, ct) ?? throw Missing();
    public async Task<AngpauResponse> SetAngpauAsync(int id, decimal amount, CancellationToken ct)
    {
        if (amount < 0 || amount > 9999999999.99m || decimal.Round(amount, 2) != amount)
            throw new ApiException(400, "INVALID_AMOUNT", "Enter a nonnegative amount with at most two decimal places.");
        if (await guests.SetAngpauAsync(id, amount, ct) == 0) throw Missing();
        return new(id, amount);
    }
    public Task<decimal> TotalAsync(CancellationToken ct) => guests.AngpauTotalAsync(ct);
    public async Task<AttendanceSummary> SummaryAsync(CancellationToken ct)
    {
        var arrived = config.GetValue<int>("Attendance:ArrivedStatusId");
        if (arrived <= 0 || !await lookups.StatusExistsAsync(arrived, ct))
            throw new ApiException(503, "STATUS_NOT_CONFIGURED", "Configure the arrived status ID before requesting attendance totals.");
        return await guests.SummaryAsync(arrived, ct);
    }
    private async Task ValidateAsync(GuestWriteRequest request, CancellationToken ct)
    {
        if (request.TableNumber is { } number && !await lookups.TableExistsAsync(number, ct))
            throw new ApiException(400, "INVALID_TABLE", "Select an existing table.");
        if (string.IsNullOrWhiteSpace(request.GuestName))
            throw new ApiException(400, "INVALID_NAME", "Enter a guest name.");
        if (!await lookups.TagExistsAsync(request.RelationId, ct))
            throw new ApiException(400, "INVALID_RELATION", "Select an existing relationship.");
        if (!await lookups.StatusExistsAsync(request.AttendanceStatusId, ct))
            throw new ApiException(400, "INVALID_STATUS", "Select an existing attendance status.");
    }
    private static void Apply(GuestEntity guest, GuestWriteRequest request)
    {
        guest.GuestName = request.GuestName.Trim();
        guest.RelationId = request.RelationId;
        guest.WeddingSide = request.WeddingSide;
        guest.GuestNum = request.GuestNum;
        guest.AttendanceStatusId = request.AttendanceStatusId;
        guest.TableNumber = request.TableNumber;
    }
    private static ApiException Missing() => new(404, "GUEST_NOT_FOUND", "Guest not found.");
}
