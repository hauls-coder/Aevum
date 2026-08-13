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

interface HomePageProps {
  onLogout: () => void
  onProfile: () => void
  onCalendar: () => void
  onTasks: () => void
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
  onLogout,
  onProfile,
  onCalendar,
  onTasks,
}: HomePageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [now, setNow] = useState(() => new Date())
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

  return (
    <main className="app">
      <header className="tasks-header">
        <div className="tasks-topbar">
          <div className="brand-navigation">
            <span className="brand-label">AEVUM</span>

            <button
              type="button"
              className="profile-button"
              onClick={onProfile}
            >
              <span className="user-display-name">
                Профиль: {displayName || 'Пользователь'}
              </span>
            </button>
          </div>

          <button type="button" className="logout-button" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </header>

      <section className="focus-panel">
        <div className="focus-panel-header">
          <div className="focus-panel-title">
            <svg
              className="focus-icon"
              viewBox="0 0 40 40"
              width="40"
              height="40"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="focus-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--hot)" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="var(--gold)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="20" cy="20" r="5" fill="url(#focus-glow)" />

              <g className="focus-icon-outer">
                <circle
                  cx="20"
                  cy="20"
                  r="20"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="1"
                  opacity="0.35"
                />
                <circle cx="20" cy="40" r="1.6" fill="var(--gold)" />
              </g>

              <g className="focus-icon-middle">
                <circle
                  cx="20"
                  cy="20"
                  r="14"
                  fill="none"
                  stroke="var(--gold-light)"
                  strokeWidth="1"
                  opacity="0.45"
                />
                <circle cx="20" cy="34" r="1.6" fill="var(--gold-light)" />
              </g>

              <g className="focus-icon-inner">
                <circle
                  cx="20"
                  cy="20"
                  r="8"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="1"
                  opacity="0.55"
                />
                <circle cx="20" cy="28" r="1.6" fill="var(--gold)" />
              </g>

              <circle cx="20" cy="20" r="3.5" fill="var(--hot)" />
            </svg>

            <h2 className="focus-panel-heading">Фокус дня</h2>
          </div>

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
                  className="focus-card-remove focus-card-remove--link"
                  onClick={() => handleClearFocus(focusTask.id)}
                >
                  Убрать из фокуса
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="focus-empty">
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

      {error && (
        <p className="status-message status-message--error">{error}</p>
      )}

      <nav className="home-nav">
        <button type="button" onClick={onTasks}>
          Задачи
        </button>
        <button type="button" onClick={onCalendar}>
          Календарь
        </button>
      </nav>
    </main>
  )
}

export default HomePage