import { useEffect, useState } from 'react'
import {
  clearFocus,
  getTasks,
  setFocus,
  updateTask,
} from '../api/tasksApi'
import type { Task } from '../types/task'
import '../App.css'
import { getProfile } from '../api/profileApi'
import BottomNav from '../components/nav/BottomNav'
import FocusIcon from '../components/focus/FocusIcon'
import quoteMountains from '../assets/quote-mountains.png'

interface HomePageProps {
  onProfile: () => void
  onCalendar: () => void
  onTasks: () => void
}

// Подбирает приветствие и значок (солнце/луна) под текущее время суток
function getGreeting(date: Date): { text: string; icon: 'sun' | 'moon' } {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) {
    return { text: 'Доброе утро', icon: 'sun' }
  }
  if (hour >= 12 && hour < 17) {
    return { text: 'Добрый день', icon: 'sun' }
  }
  if (hour >= 17 && hour < 23) {
    return { text: 'Добрый вечер', icon: 'moon' }
  }
  return { text: 'Доброй ночи', icon: 'moon' }
}

// Делает первую букву заглавной (для дня недели из toLocaleDateString)
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Форматирует время в вид ЧЧ:ММ
function formatTime(iso: string | null): string {
  if (!iso) {
    return ''
  }

  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Форматирует оставшееся время в вид ЧЧ:ММ:СС
function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (value: number) => String(value).padStart(2, '0')

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

// Достаёт ЧЧ:ММ из ISO-строки для поля <input type="time">
function toTimeInputValue(iso: string | null): string {
  if (!iso) {
    return ''
  }

  const date = new Date(iso)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

// Берёт дату из существующего времени задачи (или сегодня) и подставляет новое ЧЧ:ММ
function combineWithTime(baseIso: string | null, time: string): string | null {
  if (!time) {
    return null
  }

  const [hours, minutes] = time.split(':').map(Number)
  const date = baseIso ? new Date(baseIso) : new Date()

  date.setHours(hours, minutes, 0, 0)

  return date.toISOString()
}

function HomePage({
  onProfile,
  onCalendar,
  onTasks,
}: HomePageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [notificationsGranted, setNotificationsGranted] = useState(
    () => 'Notification' in window && Notification.permission === 'granted',
  )
  const [isAdjustingProgress, setIsAdjustingProgress] = useState(false)
  const [progressDraft, setProgressDraft] = useState(0)
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const [editTimeError, setEditTimeError] = useState('')

  const focusTask = tasks.find((task) => task.isFocus)

  useEffect(() => {
    loadTasks()
    getProfile()
      .then((profile) => setDisplayName(profile.displayName))
      .catch(() => setDisplayName(''))
  }, [])

  // Тикающий таймер фокуса дня — обновляется раз в секунду, пока есть окончание времени
  useEffect(() => {
    if (!focusTask?.endsAt) {
      return
    }

    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [focusTask?.endsAt])

  async function loadTasks() {
    try {
      setIsLoading(true)
      const data = await getTasks()
      setTasks(data)
    } catch {
      setError('Не удалось загрузить задачи')
    } finally {
      setIsLoading(false)
    }
  }

  const availableTasks = tasks.filter(
    (task) => !task.isFocus && !task.isCompleted,
  )

  const remainingMs = focusTask?.endsAt
    ? new Date(focusTask.endsAt).getTime() - now.getTime()
    : null

  const isTimeUp = remainingMs !== null && remainingMs <= 0

  async function handleSetFocus(id: number) {
    try {
      setError('')
      await setFocus(id)
      await loadTasks()
    } catch {
      setError('Не удалось установить фокус дня')
    }
  }

  async function handleClearFocus(id: number) {
    try {
      setError('')
      await clearFocus(id)
      await loadTasks()
    } catch {
      setError('Не удалось снять фокус дня')
    }
  }

  async function handleCompleteFocus(task: Task) {
    try {
      setError('')
      await updateTask({ ...task, isCompleted: true })
      await clearFocus(task.id)
      await loadTasks()
    } catch {
      setError('Не удалось завершить задачу')
    }
  }

  function toggleProgressEditor(task: Task) {
    setProgressDraft(task.progressPercent)
    setIsAdjustingProgress((current) => !current)
  }

  async function handleCommitProgress(task: Task, percent: number) {
    try {
      setError('')
      await updateTask({ ...task, progressPercent: percent })
      await loadTasks()
    } catch {
      setError('Не удалось обновить прогресс')
    }
  }

  async function handleNotificationClick() {
    if (!('Notification' in window) || Notification.permission !== 'default') {
      return
    }

    const permission = await Notification.requestPermission()
    setNotificationsGranted(permission === 'granted')
  }

  function openTimeEditor(task: Task) {
    setEditStartTime(toTimeInputValue(task.startsAt))
    setEditEndTime(toTimeInputValue(task.endsAt))
    setEditTimeError('')
    setIsEditingTime(true)
  }

  async function handleSaveTime(task: Task) {
    const startsAt = combineWithTime(task.startsAt, editStartTime)
    const endsAt = combineWithTime(task.startsAt, editEndTime)

    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setEditTimeError('Время окончания должно быть позже времени начала')
      return
    }

    try {
      setError('')
      await updateTask({ ...task, startsAt, endsAt })
      setIsEditingTime(false)
      await loadTasks()
    } catch {
      setError('Не удалось перенести время')
    }
  }

  if (isLoading) {
    return (
      <main className="app">
        <p className="status-message">Загрузка...</p>
      </main>
    )
  }

  const greeting = getGreeting(now)
  const todayLabel = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
  const weekdayLabel = capitalize(
    now.toLocaleDateString('ru-RU', { weekday: 'long' }),
  )
  const openTasksCount = tasks.filter((task) => !task.isCompleted).length

  return (
    <main className="app app--with-nav app--compact">
      <header className="home-topbar">
        <button
          type="button"
          className="home-menu-button"
          aria-label="Меню"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 7h18M3 12h12M3 17h18"
              stroke="var(--gold)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="home-brand">
          <svg
            className="brand-logo-icon"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <circle cx="20" cy="20" r="5" fill="url(#focus-glow)" />

            <path
              d="M5.858,34.142 A20,20 0 1,1 20,40"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.35"
            />
            <circle cx="5.858" cy="34.142" r="1.6" fill="var(--gold)" />

            <path
              d="M10.1,29.9 A14,14 0 1,1 20,34"
              fill="none"
              stroke="var(--gold-light)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.45"
            />
            <circle cx="10.1" cy="29.9" r="1.6" fill="var(--gold-light)" />

            <path
              d="M14.343,25.657 A8,8 0 1,1 20,28"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.55"
            />
            <circle cx="14.343" cy="25.657" r="1.6" fill="var(--gold)" />

            <circle cx="20" cy="20" r="3.5" fill="var(--hot)" />
          </svg>

          <span className="home-brand-label">AEVUM</span>
        </div>

        <button
          type="button"
          className="home-notification-button"
          onClick={handleNotificationClick}
          aria-label="Уведомления"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 10a6 6 0 1 1 12 0v4.2l1.6 2.6a1 1 0 0 1-.85 1.5H5.25a1 1 0 0 1-.85-1.5L6 14.2V10Z"
              fill="none"
              stroke="var(--gold-light)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 20a2.5 2.5 0 0 0 5 0"
              fill="none"
              stroke="var(--gold-light)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          {!notificationsGranted && (
            <span className="home-notification-dot" aria-hidden="true" />
          )}
        </button>
      </header>

      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <radialGradient id="focus-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--hot)" stopOpacity="0.85" />
            <stop offset="45%" stopColor="var(--gold)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <div className="home-greeting">
        <h1 className="home-greeting-heading">
          {greeting.text}, {displayName || 'Пользователь'}
          {greeting.icon === 'sun' ? (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                cx="12"
                cy="12"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </h1>
        <p className="home-tagline">Каждый день — шаг к твоей лучшей жизни.</p>
      </div>

      <section className="focus-panel">
        <div className="focus-panel-header">
          <h2 className="focus-panel-heading">Фокус дня</h2>

          {focusTask && (
            <button
              type="button"
              className="focus-edit-button"
              onClick={() => openTimeEditor(focusTask)}
              aria-label="Изменить время"
            >
              ✎
            </button>
          )}
        </div>

        {focusTask ? (
          <div className="focus-card">
            <div className="focus-card-body">
              <div className="focus-card-icon">
                <FocusIcon active size={58} />
              </div>

              <div className="focus-card-content">
                <div className="focus-card-title">{focusTask.title}</div>

            {isEditingTime ? (
              <div className="focus-time-editor">
                <div className="task-form-time-row">
                  <label>
                    Начало
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(event) => setEditStartTime(event.target.value)}
                    />
                  </label>
                  <label>
                    Окончание
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(event) => setEditEndTime(event.target.value)}
                    />
                  </label>
                </div>

                {editTimeError && (
                  <p className="edit-time-error">{editTimeError}</p>
                )}

                <div className="focus-time-editor-actions">
                  <button
                    type="button"
                    className="focus-complete-button"
                    onClick={() => handleSaveTime(focusTask)}
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    className="focus-card-remove"
                    onClick={() => setIsEditingTime(false)}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                {focusTask.startsAt && (
                  <div className="focus-card-time">
                    Начало {formatTime(focusTask.startsAt)}
                  </div>
                )}

                {focusTask.endsAt && (
                  <div
                    className={
                      isTimeUp
                        ? 'focus-card-timer focus-card-timer--done'
                        : 'focus-card-timer'
                    }
                  >
                    {isTimeUp ? 'Время вышло' : formatCountdown(remainingMs ?? 0)}
                  </div>
                )}

                {focusTask.progressPercent > 0 && (
                  <div className="focus-progress-summary">
                    <div className="focus-progress-bar">
                      <span style={{ width: `${focusTask.progressPercent}%` }} />
                    </div>
                    <span className="focus-progress-label">
                      {focusTask.progressPercent}%
                    </span>
                  </div>
                )}

                <div className="focus-card-actions">
                  <button
                    type="button"
                    className={
                      isTimeUp
                        ? 'focus-complete-button focus-complete-button--pulse'
                        : 'focus-complete-button'
                    }
                    onClick={() => handleCompleteFocus(focusTask)}
                  >
                    Выполнена
                  </button>
                  <button
                    type="button"
                    className="focus-card-remove"
                    onClick={() => toggleProgressEditor(focusTask)}
                  >
                    В процессе
                  </button>
                </div>

                {isAdjustingProgress && (
                  <div className="focus-progress-editor">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressDraft}
                      onChange={(event) =>
                        setProgressDraft(Number(event.target.value))
                      }
                      onMouseUp={() =>
                        handleCommitProgress(focusTask, progressDraft)
                      }
                      onTouchEnd={() =>
                        handleCommitProgress(focusTask, progressDraft)
                      }
                    />
                    <span className="focus-progress-editor-value">
                      {progressDraft}%
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className="focus-card-remove focus-card-remove-standalone"
                  onClick={() => handleClearFocus(focusTask.id)}
                >
                  Убрать из фокуса
                </button>
              </>
            )}
              </div>
            </div>
          </div>
        ) : (
          <div className="focus-empty">
            <div className="focus-card-icon focus-card-icon--idle">
              <FocusIcon active={false} size={58} />
            </div>

            <p>Выбери главную задачу на сегодня</p>

            {availableTasks.length === 0 ? (
              <p className="status-message">
                Нет доступных задач — сначала создай задачу в разделе «Задачи».
              </p>
            ) : (
              <ul className="focus-picker-list">
                {availableTasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.title}</span>
                    <button type="button" onClick={() => handleSetFocus(task.id)}>
                      Выбрать
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <div className="home-stats-row">
        <button
          type="button"
          className="stat-card"
          onClick={onTasks}
        >
          <div className="stat-card-inner">
            <span className="stat-card-label">Задачи</span>
            <div className="stat-card-body">
              <span className="stat-card-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M8 10.5l2 2 3.5-4M8 16h6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                <span className="stat-card-value">{openTasksCount}</span>
                <span className="stat-card-caption">на сегодня</span>
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          className="stat-card"
          onClick={onCalendar}
        >
          <div className="stat-card-inner">
            <span className="stat-card-label">Календарь</span>
            <div className="stat-card-body">
              <span className="stat-card-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="4"
                    y="5"
                    width="16"
                    height="15"
                    rx="3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M4 9.5h16M8 3v3.5M16 3v3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>
                <span className="stat-card-value">{todayLabel}</span>
                <span className="stat-card-caption">{weekdayLabel}</span>
              </span>
            </div>
          </div>
        </button>
      </div>

      <div className="quote-card">
        <div className="quote-card-art">
          <img src={quoteMountains} alt="" aria-hidden="true" />
        </div>

        <div className="quote-card-content">
          <span className="quote-mark">"</span>
          <p className="quote-text">
            Будущее не случается само.
            <br />
            Его создают каждый день.
          </p>
        </div>
      </div>

      {error && (
        <p className="status-message status-message--error">{error}</p>
      )}

      <BottomNav
        active="home"
        onHome={() => {}}
        onTasks={onTasks}
        onCalendar={onCalendar}
        onProfile={onProfile}
        onAdd={onTasks}
      />
    </main>
  )
}

export default HomePage