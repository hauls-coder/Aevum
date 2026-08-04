import type {
    CalendarEvent,
} from '../types/calendarEvent'

const CALENDAR_API_URL =
    'http://127.0.0.1:5037/api/calendar'


export async function getCalendarEvents():
    Promise<CalendarEvent[]> {
    const response = await fetch(CALENDAR_API_URL, {
        credentials: 'include',
    })

    if(!response.ok) {
        throw new Error(
            'Не удалось загрузить события календаря',
        )
    }

    return response.json()
}

export async function createCalendarEvent(
    title: string,
    startsAt: string,
    endsAt: string | null,
    isAllDay: boolean,
): Promise<CalendarEvent> {
    const response = await fetch(CALENDAR_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            title,
            startsAt,
            endsAt,
            isAllDay,
        }),
    })

    if (!response.ok) {
        throw new Error(
            'Не удалось создать событие календаря',
        )
    }

    return response.json()
}