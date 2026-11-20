using Microsoft.EntityFrameworkCore;
using WeddingSystem.DBO.Context;
using WeddingSystem.Models.Entities;
using WeddingSystem.Models.Responses;

namespace WeddingSystem.DBO;

public sealed class LookupDBO(WeddingDbContext db)
{
    public async Task<IReadOnlyList<LookupResponse>> TagsAsync(CancellationToken ct) => await db.GuestTags.AsNoTracking()
        .OrderBy(x => x.Id).Select(x => new LookupResponse(x.Id, x.TagName)).ToListAsync(ct);
    public async Task<IReadOnlyList<LookupResponse>> StatusesAsync(CancellationToken ct) => await db.AttendanceStatuses.AsNoTracking()
        .OrderBy(x => x.Id).Select(x => new LookupResponse(x.Id, x.Status)).ToListAsync(ct);
    public Task<bool> TagExistsAsync(int id, CancellationToken ct) => db.GuestTags.AnyAsync(x => x.Id == id, ct);
    public Task<bool> StatusExistsAsync(int id, CancellationToken ct) => db.AttendanceStatuses.AnyAsync(x => x.Id == id, ct);
    public async Task<bool> TagUsedAsync(int id, CancellationToken ct) =>
        await db.Guests.AnyAsync(x => x.RelationId == id, ct) || await db.SeatingTables.AnyAsync(x => x.GuestTagId == id, ct);
    public Task<GuestTagEntity?> FindTagAsync(int id, CancellationToken ct) => db.GuestTags.SingleOrDefaultAsync(x => x.Id == id, ct);
    public void AddTag(GuestTagEntity tag) => db.GuestTags.Add(tag);
    public void DeleteTag(GuestTagEntity tag) => db.GuestTags.Remove(tag);
    public Task SaveAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
