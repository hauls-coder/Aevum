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
        <h2 className="focus-panel-heading">Фокус дня</h2>

        {focusTask ? (
          <div className="focus-card">
            <div className="focus-card-title">{focusTask.title}</div>

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
                onClick={() => handleClearFocus(focusTask.id)}
              >
                Убрать из фокуса
              </button>
            </div>
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