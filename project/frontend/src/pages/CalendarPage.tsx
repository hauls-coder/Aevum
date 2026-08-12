import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    createCalendarEvent,
    getCalendarEvents,
} from '../api/calendarApi'
import { getTasks } from '../api/tasksApi'
import type {
    CalendarEvent,
} from '../types/calendarEvent'
import type { Task } from '../types/task'

interface CalendarPageProps {
    onBack: () => void
}

interface DayItem {
    key: string
    time: string
    sortValue: number
    title: string
    kind: 'task' | 'event'
    isCompleted: boolean
}

// Проверяет, что даты приходятся на один и тот же день
function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

// Форматирует время в вид ЧЧ:ММ
function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Находит понедельник недели, в которую входит дата
function getWeekStart(date: Date): Date {
    const result = new Date(date)
    const day = result.getDay()
    const diff = day === 0 ? -6 : 1 - day

    result.setDate(result.getDate() + diff)
    result.setHours(0, 0, 0, 0)

    return result
}

// Строит сетку дней месяца (полными неделями, с хвостами соседних месяцев)
function getMonthGridDays(date: Date): Date[] {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const lastOfMonth = new Date(year, month + 1, 0)

    const gridStart = getWeekStart(firstOfMonth)
    const gridEnd = getWeekStart(lastOfMonth)
    gridEnd.setDate(gridEnd.getDate() + 6)

    const days: Date[] = []
    const cursor = new Date(gridStart)

    while (cursor <= gridEnd) {
        days.push(new Date(cursor))
        cursor.setDate(cursor.getDate() + 1)
    }

    return days
}

function CalendarPage({ onBack }: CalendarPageProps) {
    const [events, setEvents] =
        useState<CalendarEvent[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedDate, setSelectedDate] = useState(
        () => new Date(),
    )
    const [viewMode, setViewMode] = useState<'week' | 'month'>(
        'week',
    )
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [title, setTitle] = useState('')
    const [startsAt, setStartsAt] = useState('')
    const [endsAt, setEndsAt] = useState('')
    const [isAllDay, setIsAllDay] = useState(false)
    const [isCreating, setIsCreating] = useState(false)


    useEffect(() => {
        Promise.all([getCalendarEvents(), getTasks()])
            .then(([loadedEvents, loadedTasks]) => {
                setEvents(loadedEvents)
                setTasks(loadedTasks)
            })
            .catch(() => {
                setError(
                    'Не удалось загрузить календарь',
                )
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [])

    function shiftDay(days: number) {
        setSelectedDate((current) => {
            const next = new Date(current)
            next.setDate(next.getDate() + days)
            return next
        })
    }

    function shiftMonth(months: number) {
        setSelectedDate(
            (current) =>
                new Date(
                    current.getFullYear(),
                    current.getMonth() + months,
                    1,
                ),
        )
    }

    const isToday = isSameDay(selectedDate, new Date())

    const weekStart = getWeekStart(selectedDate)
    const weekDays = Array.from({ length: 7 }, (_, index) => {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + index)
        return day
    })

    const monthDays = getMonthGridDays(selectedDate)

    function hasItemsOnDay(date: Date): boolean {
        const hasEvent = events.some((event) =>
            isSameDay(new Date(event.startsAt), date),
        )
        const hasTask =
            isSameDay(date, new Date()) &&
            tasks.some((task) => task.startsAt)

        return hasEvent || hasTask
    }

    const dayEvents = events.filter((event) =>
        isSameDay(new Date(event.startsAt), selectedDate),
    )

    // Задачи пока привязаны только к сегодняшнему дню
    const dayTasks = isToday
        ? tasks.filter((task) => task.startsAt)
        : []

    const dayItems: DayItem[] = [
        ...dayEvents.map((event) => ({
            key: `event-${event.id}`,
            time: event.isAllDay
                ? 'Весь день'
                : formatTime(event.startsAt),
            sortValue: event.isAllDay
                ? -1
                : new Date(event.startsAt).getTime(),
            title: event.title,
            kind: 'event' as const,
            isCompleted: false,
        })),
        ...dayTasks.map((task) => ({
            key: `task-${task.id}`,
            time: formatTime(task.startsAt as string),
            sortValue: new Date(
                task.startsAt as string,
            ).getTime(),
            title: task.title,
            kind: 'task' as const,
            isCompleted: task.isCompleted,
        })),
    ].sort((a, b) => a.sortValue - b.sortValue)

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
                    Главная
                </button>
            </header>

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

            {!isLoading && (
                <>
                    <div className="calendar-view-toggle">
                        <button
                            type="button"
                            className={
                                viewMode === 'week'
                                    ? 'calendar-view-toggle-button calendar-view-toggle-button--active'
                                    : 'calendar-view-toggle-button'
                            }
                            onClick={() => setViewMode('week')}
                        >
                            Неделя
                        </button>
                        <button
                            type="button"
                            className={
                                viewMode === 'month'
                                    ? 'calendar-view-toggle-button calendar-view-toggle-button--active'
                                    : 'calendar-view-toggle-button'
                            }
                            onClick={() => setViewMode('month')}
                        >
                            Месяц
                        </button>
                    </div>

                    {viewMode === 'week' ? (
                        <div className="calendar-week-nav">
                            <button
                                type="button"
                                onClick={() => shiftDay(-7)}
                            >
                                ‹
                            </button>

                            <div className="calendar-week-strip">
                                {weekDays.map((day) => (
                                    <button
                                        key={day.toISOString()}
                                        type="button"
                                        className={
                                            isSameDay(day, selectedDate)
                                                ? 'calendar-week-day calendar-week-day--selected'
                                                : 'calendar-week-day'
                                        }
                                        onClick={() =>
                                            setSelectedDate(day)
                                        }
                                    >
                                        <span className="calendar-week-day-label">
                                            {day.toLocaleDateString(
                                                'ru-RU',
                                                { weekday: 'short' },
                                            )}
                                        </span>
                                        <span className="calendar-week-day-number">
                                            {day.getDate()}
                                        </span>
                                        {hasItemsOnDay(day) && (
                                            <span className="calendar-week-day-dot" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => shiftDay(7)}
                            >
                                ›
                            </button>
                        </div>
                    ) : (
                        <div className="calendar-month">
                            <div className="calendar-month-nav">
                                <button
                                    type="button"
                                    onClick={() => shiftMonth(-1)}
                                >
                                    ‹
                                </button>
                                <div className="calendar-month-label">
                                    {selectedDate.toLocaleDateString(
                                        'ru-RU',
                                        { month: 'long', year: 'numeric' },
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => shiftMonth(1)}
                                >
                                    ›
                                </button>
                            </div>

                            <div className="calendar-month-weekdays">
                                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(
                                    (label) => (
                                        <span key={label}>{label}</span>
                                    ),
                                )}
                            </div>

                            <div className="calendar-month-grid">
                                {monthDays.map((day) => {
                                    const inMonth =
                                        day.getMonth() ===
                                        selectedDate.getMonth()
                                    const classNames = [
                                        'calendar-month-day',
                                        !inMonth &&
                                            'calendar-month-day--muted',
                                        isSameDay(day, new Date()) &&
                                            'calendar-month-day--today',
                                        isSameDay(day, selectedDate) &&
                                            'calendar-month-day--selected',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            type="button"
                                            className={classNames}
                                            onClick={() =>
                                                setSelectedDate(day)
                                            }
                                        >
                                            <span>{day.getDate()}</span>
                                            {hasItemsOnDay(day) && (
                                                <span className="calendar-month-day-dot" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="calendar-day-label--full">
                        {selectedDate.toLocaleDateString(
                            'ru-RU',
                            {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            },
                        )}
                    </div>

                    {!isToday && (
                        <button
                            type="button"
                            className="calendar-today-button"
                            onClick={() =>
                                setSelectedDate(new Date())
                            }
                        >
                            Сегодня
                        </button>
                    )}

                    {dayItems.length === 0 ? (
                        <p className="status-message">
                            На этот день пока ничего не запланировано
                        </p>
                    ) : (
                        <ul className="calendar-day-list">
                            {dayItems.map((item) => (
                                <li
                                    key={item.key}
                                    className={`calendar-day-item calendar-day-item--${item.kind}`}
                                >
                                    <span className="calendar-day-item-time">
                                        {item.time}
                                    </span>
                                    <span
                                        className={
                                            item.isCompleted
                                                ? 'calendar-day-item-title calendar-day-item-title--done'
                                                : 'calendar-day-item-title'
                                        }
                                    >
                                        {item.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

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
        </main>
    )
}

export default CalendarPage