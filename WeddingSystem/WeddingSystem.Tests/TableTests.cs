using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using WeddingSystem.BLO;
using WeddingSystem.DBO;
using WeddingSystem.DBO.Context;
using WeddingSystem.Infrastructure;
using Xunit;

namespace WeddingSystem.Tests;

public sealed class TableTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private readonly WeddingDbContext db;
    private readonly TableBLO tables;
    public TableTests()
    {
        connection.Open();
        db = new(new DbContextOptionsBuilder<WeddingDbContext>().UseSqlite(connection).Options);
        db.Database.ExecuteSqlRaw("CREATE TABLE \"Table\" (id INTEGER PRIMARY KEY AUTOINCREMENT, TableNum INTEGER NOT NULL UNIQUE, TableGustTagNum INTEGER NULL, Capacity INTEGER NOT NULL CHECK(Capacity > 0)); CREATE TABLE Guest (id INTEGER PRIMARY KEY, \"Table\" INTEGER REFERENCES \"Table\"(TableNum) ON DELETE RESTRICT, GuestNum INTEGER NOT NULL, RelationId INTEGER NULL); CREATE TABLE Guest_Tag (id INTEGER PRIMARY KEY, TagName TEXT NOT NULL, CreatedDate TEXT NOT NULL)");
        tables = new(new TableDBO(db));
    }
    [Fact]
    public async Task UsesChosenTableNumbersAndListsThemInOrder()
    {
        var first = await tables.CreateAsync(25, 10, default);
        var second = await tables.CreateAsync(9, 12, default);
        await tables.DeleteAsync(second.TableNumber, default);
        var third = await tables.CreateAsync(40, 8, default);
        Assert.Equal(25, first.TableNumber);
        Assert.Equal(9, second.TableNumber);
        Assert.Equal(40, third.TableNumber);
        var list = await tables.ListAsync(default);
        Assert.Equal(new[] { first.TableNumber, third.TableNumber }, list.Select(t => t.TableNumber));
    }
    [Fact]
    public async Task AssignedCountsUsePartySizeAndPreventDeletion()
    {
        var table = await tables.CreateAsync(1, 10, default);
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO Guest (id, \"Table\", GuestNum) VALUES (1, {table.TableNumber}, 3), (2, {table.TableNumber}, 2)");
        var listed = Assert.Single(await tables.ListAsync(default));
        Assert.Equal(5, listed.AssignedCount);
        var error = await Assert.ThrowsAsync<ApiException>(() => tables.DeleteAsync(table.TableNumber, default));
        Assert.Equal("TABLE_IN_USE", error.Code);
        Assert.Single(await tables.ListAsync(default));
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(10001)]
    public async Task RejectsInvalidCapacity(int capacity)
    {
        Assert.Equal("INVALID_CAPACITY", (await Assert.ThrowsAsync<ApiException>(() => tables.CreateAsync(1, capacity, default))).Code);
        Assert.Empty(await tables.ListAsync(default));
    }
    public void Dispose() { db.Dispose(); connection.Dispose(); }

    [Fact]
    public async Task TableGuestTagIsStoredSeparatelyFromCapacity()
    {
        await db.Database.ExecuteSqlRawAsync("INSERT INTO Guest_Tag (id, TagName, CreatedDate) VALUES (7, 'Family', '2026-11-18')");
        var table = await tables.CreateAsync(3, 12, default, 7);
        Assert.Equal(12, table.Capacity);
        Assert.Equal(7, table.GuestTagId);
        Assert.Equal(7, Assert.Single(await tables.ListAsync(default)).GuestTagId);
        Assert.True(await new LookupDBO(db).TagUsedAsync(7, default));
    }
    [Fact]
    public async Task InvalidGuestTagCannotCreateTable()
    {
        Assert.Equal("INVALID_RELATION", (await Assert.ThrowsAsync<ApiException>(() => tables.CreateAsync(1, 10, default, 999))).Code);
        Assert.Empty(await tables.ListAsync(default));
    }
    [Fact]
    public async Task DuplicateNumberCannotReplaceExistingTable()
    {
        await tables.CreateAsync(8, 12, default);
        var error = await Assert.ThrowsAsync<ApiException>(() => tables.CreateAsync(8, 20, default));
        Assert.Equal("TABLE_NUMBER_EXISTS", error.Code);
        var table = Assert.Single(await tables.ListAsync(default));
        Assert.Equal(8, table.TableNumber);
        Assert.Equal(12, table.Capacity);
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(32768)]
    public async Task InvalidTableNumberIsRejected(int number)
    {
        Assert.Equal("INVALID_TABLE_NUMBER", (await Assert.ThrowsAsync<ApiException>(() => tables.CreateAsync(number, 10, default))).Code);
        Assert.Empty(await tables.ListAsync(default));
    }
}
