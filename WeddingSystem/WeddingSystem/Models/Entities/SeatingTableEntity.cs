namespace WeddingSystem.Models.Entities;

public sealed class SeatingTableEntity
{
    public long Id { get; set; }
    public int TableNumber { get; set; }
    public int Capacity { get; set; }
    public int? GuestTagId { get; set; }
}
