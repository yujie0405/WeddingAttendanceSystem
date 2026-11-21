namespace WeddingSystem.Models.Entities;

public sealed class UserEntity
{
    public const int AdminType = 1;
    public const int GuestType = 2;

    public Guid Id { get; set; }
    public Guid? AuthUserId { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public string? Password { get; set; }
    public string Email { get; set; } = "";
    public string Username { get; set; } = "";
    public int? Type { get; set; } = GuestType;
    public DateTimeOffset CreatedDate { get; set; }
}
