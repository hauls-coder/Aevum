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

    // Является ли задача фокусом дня (только одна задача может быть фокусом)
    public bool IsFocus { get; set; }

    // Подзадачи этой задачи
    public List<SubTask> SubTasks { get; set; } = new();

    // Повторяется ли задача каждый день
    public bool IsRecurring { get; set; }

    public string? UserId { get; set; }

    [JsonIgnore]
    public AppUser? User { get; set; }

}
