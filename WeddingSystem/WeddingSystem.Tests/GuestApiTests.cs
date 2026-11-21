using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using WeddingSystem.DBO.Context;
using WeddingSystem.Infrastructure;
using Xunit;

namespace WeddingSystem.Tests;

public sealed class GuestApiTests
{
    [Theory]
    [InlineData("0")]
    [InlineData("2")]
    public async Task AttendanceSummaryCountsPeopleWithDetectedOrConfiguredArrivedStatus(string arrivedStatusId)
    {
        using var factory = new GuestFactory { ArrivedStatusId = arrivedStatusId };
        using var client = factory.Admin();
        var party = new { guestName = "Party of three", relationId = 7, weddingSide = 1, guestNum = 3 };
        using var created = await client.PostAsJsonAsync("/api/guests", party);
        created.EnsureSuccessStatusCode();
        var id = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();
        await factory.AddGuestWithoutRelationshipAsync();

        var before = await client.GetFromJsonAsync<JsonElement>("/api/summary/attendance");
        Assert.Equal(4, before.GetProperty("totalPeople").GetInt64());
        Assert.Equal(0, before.GetProperty("arrivedPeople").GetInt64());

        using var checkedIn = await client.PutAsJsonAsync($"/api/guests/{id}/attendance", new { attendanceStatusId = 2 });
        checkedIn.EnsureSuccessStatusCode();
        var after = await client.GetFromJsonAsync<JsonElement>("/api/summary/attendance");
        Assert.Equal(4, after.GetProperty("totalPeople").GetInt64());
        Assert.Equal(3, after.GetProperty("arrivedPeople").GetInt64());
    }

    [Fact]
    public async Task ImportedGuestWithoutRelationshipIsCountedAndReturned()
    {
        using var factory = new GuestFactory();
        using var client = factory.Admin();
        var id = await factory.AddGuestWithoutRelationshipAsync();

        var page = await client.GetFromJsonAsync<JsonElement>("/api/guests");
        Assert.Equal(1, page.GetProperty("totalCount").GetInt32());
        var listed = Assert.Single(page.GetProperty("items").EnumerateArray());
        Assert.Equal(id, listed.GetProperty("id").GetInt32());
        Assert.Equal("Imported Guest", listed.GetProperty("guestName").GetString());
        Assert.Equal(JsonValueKind.Null, listed.GetProperty("relationId").ValueKind);
        Assert.Equal(JsonValueKind.Null, listed.GetProperty("relationship").ValueKind);
        var guest = await client.GetFromJsonAsync<JsonElement>($"/api/guests/{id}");
        Assert.Equal(id, guest.GetProperty("id").GetInt32());
    }

    [Fact]
    public async Task LookupsAndGuestCreateEditUseActualSchemaAndDefaultStatus()
    {
        using var factory = new GuestFactory();
        using var client = factory.Admin();
        var statuses = await client.GetFromJsonAsync<JsonElement>("/api/attendance-statuses");
        Assert.Equal(1, statuses[0].GetProperty("id").GetInt32());
        Assert.Equal("Not arrived", statuses[0].GetProperty("name").GetString());
        Assert.Equal(7, (await client.GetFromJsonAsync<JsonElement>("/api/guest-tags"))[0].GetProperty("id").GetInt32());
        Assert.Equal(17, (await client.GetFromJsonAsync<JsonElement>("/api/tables"))[0].GetProperty("tableNumber").GetInt32());
        var created = await client.PostAsJsonAsync("/api/guests", new { guestName = " New Guest ", relationId = 7, weddingSide = 2, guestNum = 3, tableNumber = 17 });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var guest = await created.Content.ReadFromJsonAsync<JsonElement>();
        var id = guest.GetProperty("id").GetInt32();
        Assert.Equal("New Guest", guest.GetProperty("guestName").GetString());
        Assert.Equal(1, guest.GetProperty("attendanceStatusId").GetInt32());
        Assert.Equal("Family", guest.GetProperty("relationship").GetString());
        Assert.Equal(17, guest.GetProperty("tableNumber").GetInt32());
        Assert.False(guest.TryGetProperty("angpau", out _));
        Assert.Equal(3, (await client.GetFromJsonAsync<JsonElement>("/api/tables"))[0].GetProperty("assignedCount").GetInt32());
        var edited = await client.PutAsJsonAsync($"/api/guests/{id}", new { guestName = "Edited Guest", relationId = 8, weddingSide = 1, guestNum = 2, attendanceStatusId = 2, tableNumber = (int?)null });
        Assert.Equal(HttpStatusCode.OK, edited.StatusCode);
        var updated = await edited.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, updated.GetProperty("attendanceStatusId").GetInt32());
        Assert.Equal("Friends", updated.GetProperty("relationship").GetString());
        Assert.Equal(JsonValueKind.Null, updated.GetProperty("tableNumber").ValueKind);
        Assert.Equal(0, (await client.GetFromJsonAsync<JsonElement>("/api/tables"))[0].GetProperty("assignedCount").GetInt32());
    }

    [Fact]
    public async Task TableCapacityCountsPeopleAndGuestDeletionReleasesSeats()
    {
        using var factory = new GuestFactory();
        using var client = factory.Admin();
        var party = new { guestName = "Party", relationId = 7, weddingSide = 1, guestNum = 10, tableNumber = 17 };
        using var created = await client.PostAsJsonAsync("/api/guests", party);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var id = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();
        var guestUrl = $"/api/guests/{id}";

        using var update = await client.PutAsJsonAsync(guestUrl, party);
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        using var overflow = await client.PostAsJsonAsync("/api/guests", party with { guestNum = 1 });
        Assert.Equal(HttpStatusCode.Conflict, overflow.StatusCode);
        Assert.Equal("TABLE_CAPACITY_EXCEEDED", (await overflow.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("code").GetString());

        using var deleted = await client.DeleteAsync(guestUrl);
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        using var missing = await client.GetAsync(guestUrl);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        using var replacement = await client.PostAsJsonAsync("/api/guests", party);
        Assert.Equal(HttpStatusCode.Created, replacement.StatusCode);
    }

    [Theory]
    [InlineData(999, 1, 17)]
    [InlineData(7, 999, 17)]
    [InlineData(7, 1, 999)]
    public async Task InvalidLookupSelectionsCannotCreateGuests(int relationId, int attendanceStatusId, int tableNumber)
    {
        using var factory = new GuestFactory();
        using var client = factory.Admin();
        var result = await client.PostAsJsonAsync("/api/guests", new { guestName = "Invalid Guest", relationId, weddingSide = 1, guestNum = 1, attendanceStatusId, tableNumber });
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
        Assert.Equal(0, (await client.GetFromJsonAsync<JsonElement>("/api/guests")).GetProperty("totalCount").GetInt32());
    }

    private sealed class GuestFactory : WebApplicationFactory<Program>
    {
        public string ArrivedStatusId { get; init; } = "2";

        private readonly SqliteConnection connection = new("Data Source=:memory:");
        private readonly Guid adminId = Guid.NewGuid();
        public GuestFactory()
        {
            connection.Open();
            connection.CreateFunction("now", () => DateTime.UtcNow.ToString("O"));
            using var db = Context();
            db.Database.EnsureCreated();
            db.Users.Add(new() { Id = adminId, Email = "admin@example.com", Username = "Admin", Type = 1 });
            db.AttendanceStatuses.AddRange(new() { Id = 1, Status = "Not arrived", CreatedDate = DateTime.UtcNow }, new() { Id = 2, Status = "Arrived", CreatedDate = DateTime.UtcNow });
            db.GuestTags.AddRange(new() { Id = 7, TagName = "Family", CreatedDate = DateTime.UtcNow }, new() { Id = 8, TagName = "Friends", CreatedDate = DateTime.UtcNow });
            db.SeatingTables.Add(new() { TableNumber = 17, Capacity = 10 });
            db.SaveChanges();
        }
        private WeddingDbContext Context() => new(new DbContextOptionsBuilder<WeddingDbContext>().UseSqlite(connection).Options);

        public async Task<int> AddGuestWithoutRelationshipAsync()
        {
            await using var db = Context();
            var guest = new WeddingSystem.Models.Entities.GuestEntity
            {
                GuestName = "Imported Guest",
                WeddingSide = 1,
                GuestNum = 1,
                AttendanceStatusId = 1
            };
            db.Guests.Add(guest);
            await db.SaveChangesAsync();
            return guest.Id;
        }

        public HttpClient Admin()
        {
            var token = new JwtSecurityToken(LoginTokens.Issuer, LoginTokens.Audience, [new Claim("sub", adminId.ToString())], expires: DateTime.UtcNow.AddMinutes(5),
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(RegistrationTests.Key)), SecurityAlgorithms.HmacSha256));
            var client = CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", new JwtSecurityTokenHandler().WriteToken(token));
            return client;
        }
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Authentication:SigningKey"] = RegistrationTests.Key,
                ["Attendance:ArrivedStatusId"] = ArrivedStatusId,
                ["Supabase:Url"] = "https://tests.invalid", ["Supabase:Key"] = "test-key"
            }));
            builder.ConfigureServices(services => services.AddScoped(_ => Context()));
        }
        protected override void Dispose(bool disposing) { base.Dispose(disposing); if (disposing) connection.Dispose(); }
    }
}
