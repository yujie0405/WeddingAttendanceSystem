namespace WeddingSystem.Models.Entities;

public sealed class AttendanceStatusEntity
{
    public int Id { get; set; }
    public string Status { get; set; } = "";
    public DateTime CreatedDate { get; set; }
}

public sealed class GuestTagEntity
{
    public int Id { get; set; }
    public string TagName { get; set; } = "";
    public DateTime CreatedDate { get; set; }
}

public sealed class GuestEntity
{
    public int Id { get; set; }
    public string GuestName { get; set; } = "";
    public int RelationId { get; set; }
    public int WeddingSide { get; set; }
    public int GuestNum { get; set; }
    public int AttendanceStatusId { get; set; }
    public int? TableNumber { get; set; }
    public decimal? Angpau { get; set; }
    public DateTime CreatedDate { get; set; }
    public GuestTagEntity Relation { get; set; } = null!;
    public AttendanceStatusEntity Attendance { get; set; } = null!;
}
