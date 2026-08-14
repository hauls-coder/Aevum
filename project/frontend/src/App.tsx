import { useEffect, useState } from 'react'
import { getCurrentUser, logout } from './api/authApi'
import { getTasks } from './api/tasksApi'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import './App.css'
import CalendarPage from './pages/CalendarPage'

type AppPage = 'home' | 'tasks' | 'profile' | 'calendar'

const APP_PAGE_STORAGE_KEY = 'aevum-app-page'

// Достаёт последнюю открытую страницу, чтобы обновление вкладки не сбрасывало на главную
function readStoredAppPage(): AppPage {
  const stored = localStorage.getItem(APP_PAGE_STORAGE_KEY)

  if (
    stored === 'home' ||
    stored === 'tasks' ||
    stored === 'profile' ||
    stored === 'calendar'
  ) {
    return stored
  }

  return 'home'
}

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null)
  const [authPage, setAuthPage] =
    useState<'login' | 'register'>('login')
  const [appPage, setAppPage] =
    useState<AppPage>(readStoredAppPage)

  useEffect(() => {
    localStorage.setItem(APP_PAGE_STORAGE_KEY, appPage)
  }, [appPage])

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setIsAuthenticated(user !== null)
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
  }, [])

  // Планирует браузерные напоминания о задачах, пока вкладка открыта
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    if (
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission()
    }

    let cancelled = false
    const timers: number[] = []

    async function scheduleReminders() {
      try {
        const tasks = await getTasks()

        if (cancelled) {
          return
        }

        timers.forEach((timerId) => window.clearTimeout(timerId))
        timers.length = 0

        const now = Date.now()

        tasks.forEach((task) => {
          if (
            task.isCompleted ||
            !task.startsAt ||
            task.reminderMinutesBefore == null
          ) {
            return
          }

          const remindAt =
            new Date(task.startsAt).getTime() -
            task.reminderMinutesBefore * 60 * 1000
          const delay = remindAt - now

          if (delay <= 0 || delay > 24 * 60 * 60 * 1000) {
            return
          }

          const timerId = window.setTimeout(() => {
            if (
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification('Aevum — напоминание', {
                body: task.title,
              })
            }
          }, delay)

          timers.push(timerId)
        })
      } catch {
        // напоминания не критичны — молча пропускаем ошибку загрузки
      }
    }

    scheduleReminders()
    const intervalId = window.setInterval(scheduleReminders, 60000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      timers.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [isAuthenticated])

  async function handleLogout() {
    await logout()
    setIsAuthenticated(false)
  }

  if (isAuthenticated === null) {
    return (
      <main className="app">
        <p className="status-message">
          Проверка авторизации...
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    if (authPage === 'register') {
      return (
        <RegisterPage
          onLogin={() => setAuthPage('login')}
        />
      )
    }

    return (
      <LoginPage
        onLogin={() => setIsAuthenticated(true)}
        onRegister={() => setAuthPage('register')}
      />
    )
  }

  if (appPage === 'calendar') {
    return (
      <CalendarPage
        onBack={() => setAppPage('home')}
        onTasks={() => setAppPage('tasks')}
        onProfile={() => setAppPage('profile')}
      />
    )
  }

  if (appPage === 'profile') {
    return (
      <ProfilePage
        onBack={() => setAppPage('home')}
        onTasks={() => setAppPage('tasks')}
        onCalendar={() => setAppPage('calendar')}
      />
    )
  }

  if (appPage === 'tasks') {
    return (
      <TasksPage
        onLogout={handleLogout}
        onProfile={() => setAppPage('profile')}
        onCalendar={() => setAppPage('calendar')}
        onHome={() => setAppPage('home')}
      />
    )
  }

  return (
    <HomePage
      onProfile={() => setAppPage('profile')}
      onCalendar={() => setAppPage('calendar')}
      onTasks={() => setAppPage('tasks')}
    />
  )
}

export default App