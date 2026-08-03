using System.Text.Json.Serialization;

namespace backend.Models;

public class CalendarEvent
{
    public int Id { get; set; }
    
    public string Title { get; set; } = "";

    public DateTimeOffset StartsAt { get; set; }

    public DateTimeOffset? EndsAt { get; set; }

    public bool IsAllDay { get; set; }

    public string UserId { get; set; } = "";


    [JsonIgnore]
    public AppUser? User { get; set; }
}