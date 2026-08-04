using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/calendar")]
public class CalendarController : ControllerBase
{
    private readonly CalendarService calendarService;

    public CalendarController(
        CalendarService calendarService
    )
    {
        this.calendarService = calendarService;
    }

    [HttpGet]
    public List<CalendarEvent> Get()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return calendarService.Get(userId);
    }
    [HttpPost]
    public ActionResult<CalendarEvent> Create(
        CalendarEvent calendarEvent
    )
    {
        if (string.IsNullOrWhiteSpace(
            calendarEvent.Title
        ))
        {
            return BadRequest(
                "Название собития не может быть пустым"
            );
        }

        if (calendarEvent.StartsAt == default)
        {
            return BadRequest(
                "Необходимо указать начало события"
            );
        }

        if (
            calendarEvent.EndsAt.HasValue &&
            calendarEvent.EndsAt < calendarEvent.StartsAt
        )
        {
            return BadRequest(
                "Окончание не может быть раньше начала"
            );
        }

        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        var createdEvent = calendarService.Create(
            calendarEvent,
            userId
        );

        return Ok(createdEvent);
    }
}