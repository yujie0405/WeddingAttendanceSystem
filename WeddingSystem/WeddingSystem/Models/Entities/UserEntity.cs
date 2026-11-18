namespace WeddingSystem.Models.Entities;

public sealed class UserEntity
{
    public Guid Id { get; set; }
    public Guid? AuthUserId { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public string? Password { get; set; }
    public string Email { get; set; } = "";
    public string Username { get; set; } = "";
    public DateTimeOffset CreatedDate { get; set; }
}
