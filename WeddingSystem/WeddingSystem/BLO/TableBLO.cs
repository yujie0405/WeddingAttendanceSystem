using WeddingSystem.DBO;
using WeddingSystem.Infrastructure;
using WeddingSystem.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace WeddingSystem.BLO;

public sealed record TableResponse(int TableNumber, int Capacity, int AssignedCount, int? GuestTagId);

public sealed class TableBLO(TableDBO tables)
{
    public async Task<IReadOnlyList<TableResponse>> ListAsync(CancellationToken ct)
    {
        var rows = await tables.ListAsync(ct);
        var usage = await tables.UsageAsync(ct);
        return rows.Select(t => new TableResponse(t.TableNumber, t.Capacity, usage.GetValueOrDefault(t.TableNumber), t.GuestTagId)).ToList();
    }
    public async Task<TableResponse> CreateAsync(int tableNumber, int capacity, CancellationToken ct, int? guestTagId = null)
    {
        if (tableNumber < 1 || tableNumber > short.MaxValue)
            throw new ApiException(400, "INVALID_TABLE_NUMBER", "Enter a whole table number between 1 and 32767.");
        if (capacity < 1 || capacity > 10000) throw new ApiException(400, "INVALID_CAPACITY", "Enter a capacity between 1 and 10000.");
        if (await tables.FindAsync(tableNumber, ct) is not null)
            throw new ApiException(409, "TABLE_NUMBER_EXISTS", "This table number is already in use.");
        if (guestTagId is { } tag && (tag < 1 || tag > short.MaxValue || !await tables.TagExistsAsync(tag, ct)))
            throw new ApiException(400, "INVALID_RELATION", "Select an existing guest tag.");
        var table = new SeatingTableEntity { TableNumber = tableNumber, Capacity = capacity, GuestTagId = guestTagId };
        tables.Add(table);
        try { await tables.SaveAsync(ct); }
        catch (DbUpdateException error) when (error.InnerException is PostgresException { SqlState: "23505", ConstraintName: "Table_TableNum_unique" })
        { throw new ApiException(409, "TABLE_NUMBER_EXISTS", "This table number is already in use."); }
        return new(table.TableNumber, table.Capacity, 0, table.GuestTagId);
    }
    public async Task DeleteAsync(int number, CancellationToken ct)
    {
        var table = await tables.FindAsync(number, ct) ?? throw new ApiException(404, "TABLE_NOT_FOUND", "Table not found.");
        if (await tables.UsedAsync(number, ct)) throw new ApiException(409, "TABLE_IN_USE", "Reassign guests before deleting this table.");
        tables.Delete(table);
        await tables.SaveAsync(ct);
    }
}
