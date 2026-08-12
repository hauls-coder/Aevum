using System.Text.Json.Serialization;

namespace backend.Models;

public class SubTask
{
    public int Id { get; set; }

    public string Title { get; set; } = "";

    public bool IsCompleted { get; set; }

    public int TaskItemId { get; set; }

    [JsonIgnore]
    public TaskItem? TaskItem { get; set; }
}