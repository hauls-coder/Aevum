export interface CalendarEvent {
    id: number
    title: string
    startsAt: string
    endsAt: string | null
    isAllDay: boolean
}