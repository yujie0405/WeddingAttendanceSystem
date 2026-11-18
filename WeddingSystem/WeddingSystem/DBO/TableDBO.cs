using Microsoft.EntityFrameworkCore;
using WeddingSystem.DBO.Context;
using WeddingSystem.Models.Entities;

namespace WeddingSystem.DBO;

public sealed class TableDBO(WeddingDbContext db)
{
    public Task<List<SeatingTableEntity>> ListAsync(CancellationToken ct) => db.SeatingTables.AsNoTracking().OrderBy(t => t.TableNumber).ToListAsync(ct);
    public async Task<Dictionary<int, int>> UsageAsync(CancellationToken ct) => await db.Guests.AsNoTracking()
        .Where(g => g.TableNumber != null).GroupBy(g => g.TableNumber!.Value)
        .Select(g => new { Number = g.Key, Count = g.Sum(x => x.GuestNum) }).ToDictionaryAsync(x => x.Number, x => x.Count, ct);
    public Task<bool> UsedAsync(int number, CancellationToken ct) => db.Guests.AnyAsync(g => g.TableNumber == number, ct);
    public Task<bool> TagExistsAsync(int id, CancellationToken ct) => db.GuestTags.AnyAsync(t => t.Id == id, ct);
    public Task<SeatingTableEntity?> FindAsync(int number, CancellationToken ct) => db.SeatingTables.SingleOrDefaultAsync(t => t.TableNumber == number, ct);
    public void Add(SeatingTableEntity table) => db.SeatingTables.Add(table);
    public void Delete(SeatingTableEntity table) => db.SeatingTables.Remove(table);
    public Task SaveAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
