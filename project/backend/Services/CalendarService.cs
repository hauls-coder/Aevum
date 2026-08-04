using backend.Data;
using backend.Models;

namespace backend.Services;

public class CalendarService
{
    private readonly AppDbContext context;

    public CalendarService(AppDbContext context)
    {
        this.context = context;
    }

    public List<CalendarEvent> Get(string userId)
    {
        return context.CalendarEvents
            .Where(calendarEvent =>
                calendarEvent.UserId == userId
        )
        .OrderBy(calendarEvent =>
            calendarEvent.StartsAt
        )
        .ToList();
    }

    public CalendarEvent Create(
        CalendarEvent calendarEvent,
        string userId
    )
    {
        calendarEvent.Id = 0;
        calendarEvent.Title =
            calendarEvent.Title.Trim();
        calendarEvent.UserId = userId;

        context.CalendarEvents.Add(calendarEvent);
        context.SaveChanges();

        return calendarEvent;
    }
}