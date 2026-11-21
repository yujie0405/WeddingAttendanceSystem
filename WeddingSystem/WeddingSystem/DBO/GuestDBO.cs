using Microsoft.EntityFrameworkCore;
using WeddingSystem.DBO.Context;
using WeddingSystem.Models.Entities;
using WeddingSystem.Models.Requests;
using WeddingSystem.Models.Responses;

namespace WeddingSystem.DBO;

public sealed class GuestDBO(WeddingDbContext db)
{
    private static System.Linq.Expressions.Expression<Func<GuestEntity, GuestResponse>> Projection => g =>
        new(g.Id, g.GuestName, g.RelationId, g.Relation == null ? null : g.Relation.TagName, g.WeddingSide,
            g.GuestNum, g.AttendanceStatusId, g.Attendance.Status, g.TableNumber, g.CreatedDate);

    public async Task<PagedResponse<GuestResponse>> ListAsync(GuestQuery filter, CancellationToken ct)
    {
        var query = db.Guests.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            var table = int.TryParse(search, out var number) ? number : (int?)null;
            query = query.Where(g => g.GuestName.Contains(search) || (table != null && g.TableNumber == table));
        }
        if (filter.WeddingSide is int side) query = query.Where(g => g.WeddingSide == side);
        if (filter.AttendanceStatusId is int status) query = query.Where(g => g.AttendanceStatusId == status);
        if (filter.RelationId is int relation) query = query.Where(g => g.RelationId == relation);
        if (filter.TableNumber is int tableNumber) query = query.Where(g => g.TableNumber == tableNumber);
        var count = await query.CountAsync(ct);
        var items = await query.OrderBy(g => g.Id).Skip(checked((filter.Page - 1) * filter.PageSize))
            .Take(filter.PageSize).Select(Projection).ToListAsync(ct);
        return new(items, filter.Page, filter.PageSize, count);
    }
    public Task<GuestResponse?> ReadAsync(int id, CancellationToken ct) => db.Guests.AsNoTracking()
        .Where(g => g.Id == id).Select(Projection).SingleOrDefaultAsync(ct);
    public Task<GuestEntity?> FindForUpdateAsync(int id, CancellationToken ct)
    {
        var guests = db.Database.IsNpgsql()
            ? db.Guests.FromSql($"""SELECT * FROM public."Guest" WHERE "id" = {id} FOR UPDATE""")
            : db.Guests;
        return guests.SingleOrDefaultAsync(g => g.Id == id, ct);
    }
    public Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginWriteAsync(CancellationToken ct) =>
        db.Database.BeginTransactionAsync(ct);
    public Task<int?> TableCapacityAsync(int number, CancellationToken ct)
    {
        // Serialize assignments targeting the same PostgreSQL table row.
        var tables = db.Database.IsNpgsql()
            ? db.SeatingTables.FromSql($"""SELECT * FROM public."Table" WHERE "TableNum" = {number} FOR NO KEY UPDATE""")
            : db.SeatingTables;
        return tables.AsNoTracking().Where(t => t.TableNumber == number)
            .Select(t => (int?)t.Capacity).SingleOrDefaultAsync(ct);
    }
    public Task<long> AssignedPeopleAsync(int number, int? excludingId, CancellationToken ct) =>
        db.Guests.Where(g => g.TableNumber == number && (excludingId == null || g.Id != excludingId))
            .SumAsync(g => (long)g.GuestNum, ct);
    public Task<int> DeleteAsync(int id, CancellationToken ct) =>
        db.Guests.Where(g => g.Id == id).ExecuteDeleteAsync(ct);
    public void Add(GuestEntity guest) => db.Guests.Add(guest);
    public Task SaveAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
    public Task<int> SetAttendanceAsync(int id, int status, CancellationToken ct) => db.Guests.Where(g => g.Id == id)
        .ExecuteUpdateAsync(s => s.SetProperty(g => g.AttendanceStatusId, status), ct);
    public Task<int> SetAngpauAsync(int id, decimal amount, CancellationToken ct) => db.Guests.Where(g => g.Id == id)
        .ExecuteUpdateAsync(s => s.SetProperty(g => g.Angpau, amount), ct);
    public Task<AngpauResponse?> ReadAngpauAsync(int id, CancellationToken ct) => db.Guests.AsNoTracking()
        .Where(g => g.Id == id).Select(g => new AngpauResponse(g.Id, g.Angpau ?? 0m)).SingleOrDefaultAsync(ct);
    public async Task<decimal> AngpauTotalAsync(CancellationToken ct) => await db.Guests.SumAsync(g => g.Angpau, ct) ?? 0m;
    public async Task<AttendanceSummary> SummaryAsync(int arrived, CancellationToken ct)
    {
        var result = await db.Guests.AsNoTracking().GroupBy(g => 1).Select(rows => new AttendanceSummary(
            rows.Count(), rows.Sum(g => (long)g.GuestNum), rows.Count(g => g.AttendanceStatusId == arrived),
            rows.Sum(g => g.AttendanceStatusId == arrived ? (long)g.GuestNum : 0))).SingleOrDefaultAsync(ct);
        return result ?? new(0, 0, 0, 0);
    }
}
