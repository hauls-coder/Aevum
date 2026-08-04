import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    createCalendarEvent,
    getCalendarEvents,
} from '../api/calendarApi'
import type {
    CalendarEvent,
} from '../types/calendarEvent'

interface CalendarPageProps {
    onBack: () => void
}

function CalendarPage({ onBack }: CalendarPageProps) {
    const [events, setEvents] =
        useState<CalendarEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [title, setTitle] = useState('')
    const [startsAt, setStartsAt] = useState('')
    const [endsAt, setEndsAt] = useState('')
    const [isAllDay, setIsAllDay] = useState(false)
    const [isCreating, setIsCreating] = useState(false)


    useEffect(() => {
        getCalendarEvents()
            .then(setEvents)
            .catch(() => {
                setError(
                    'Не удалось загрузить события календаря',
                )
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [])
    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        if (!title.trim() || !startsAt) {
            return
        }

        try {
            setIsCreating(true)
            setError('')

            const createdEvent = await createCalendarEvent(
                title.trim(),
                new Date(startsAt).toISOString(),
                endsAt
                    ? new Date(endsAt).toISOString()
                    : null,
                isAllDay,
            )

            setEvents((currentEvents) => [
                ...currentEvents,
                createdEvent,
            ])

            setTitle('')
            setStartsAt('')
            setEndsAt('')
            setIsAllDay(false)
        } catch {
            setError('Не удалось создать событие')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <main className="app">
            <header className="tasks-heading">
                <h1>Календарь</h1>

                <button type="button" onClick={onBack}>
                    К задачам
                </button>
            </header>

            <form
                className="calendar-form"
                onSubmit={handleSubmit}
            >
                <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                        setTitle(event.target.value)
                    }
                    placeholder="Название события"
                    required
                />

                <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) =>
                        setStartsAt(event.target.value)
                    }
                    required
                />

                <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(event) =>
                        setEndsAt(event.target.value)
                    }
                />

                <label>
                    <input
                        type="checkbox"
                        checked={isAllDay}
                        onChange={(event) =>
                            setIsAllDay(event.target.checked)
                        }
                    />
                    Весь день
                </label>

                <button type="submit" disabled={isCreating}>
                    {isCreating ? 'Создание...' : 'Создать'}
                </button>
            </form>

            {isLoading && (
                <p className="status-message">
                    Загрузка календаря...
                </p>
            )}

            {error && (
                <p className="status-message status-message--error">
                    {error}
                </p>
            )}

            {!isLoading && !error && events.length === 0 && (
                <p className="status-message">
                    Событий пока нет
                </p>
            )}

            {events.length > 0 && (
                <ul>
                    {events.map((calendarEvent) => (
                        <li key={calendarEvent.id}>
                            <span>{calendarEvent.title}</span>
                            <time>
                                {new Date(
                                    calendarEvent.startsAt,
                                ).toLocaleString('ru-RU')}
                            </time>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    )
}

export default CalendarPage