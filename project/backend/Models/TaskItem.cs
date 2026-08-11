using System.Text.Json.Serialization;
namespace backend.Models;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = "";

    public string? Description { get; set; }

    // Запланированное время выполнения задачи
    public DateTimeOffset? StartsAt { get; set; }

    public DateTimeOffset? EndsAt { get; set; }

    public bool IsCompleted { get; set; } 

    public string? UserId { get; set; }

    [JsonIgnore]
    public AppUser? User { get; set; }

}
