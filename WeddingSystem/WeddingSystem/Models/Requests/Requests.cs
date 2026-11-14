using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WeddingSystem.Models.Requests;

public sealed class GuestWriteRequest
{
    [Required, StringLength(150)] public string GuestName { get; set; } = "";
    [Range(1, int.MaxValue)] public int RelationId { get; set; }
    [Range(1, 2)] public int WeddingSide { get; set; }
    [Range(1, int.MaxValue)] public int GuestNum { get; set; } = 1;
    [Range(1, int.MaxValue)] public int AttendanceStatusId { get; set; }
    [Range(1, int.MaxValue)] public int? TableNumber { get; set; }
}
public sealed class AttendanceRequest
{
    [Range(1, int.MaxValue)] public int AttendanceStatusId { get; set; }
}
public sealed class AngpauRequest
{
    [JsonRequired] public decimal Amount { get; set; }
}
public sealed class TagRequest
{
    [Required, StringLength(100)] public string TagName { get; set; } = "";
}
public sealed class GuestQuery
{
    [StringLength(150)] public string? Search { get; set; }
    [Range(1, 2)] public int? WeddingSide { get; set; }
    [Range(1, int.MaxValue)] public int? AttendanceStatusId { get; set; }
    [Range(1, int.MaxValue)] public int? RelationId { get; set; }
    [Range(1, int.MaxValue)] public int? TableNumber { get; set; }
    [Range(1, int.MaxValue)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 20;
}
