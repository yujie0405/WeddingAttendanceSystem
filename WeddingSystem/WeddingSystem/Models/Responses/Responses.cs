namespace WeddingSystem.Models.Responses;

// Financial amounts intentionally excluded from all regular guest DTOs.
public sealed record GuestResponse(int Id, string GuestName, int RelationId,
    string Relationship, int WeddingSide, int GuestNum, int AttendanceStatusId,
    string AttendanceStatus, int? TableNumber, DateTime CreatedDate);
public sealed record LookupResponse(int Id, string Name);
public sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);
public sealed record AngpauResponse(int GuestId, decimal Amount);
public sealed record AttendanceSummary(int TotalRecords, long TotalPeople, int ArrivedRecords, long ArrivedPeople);
