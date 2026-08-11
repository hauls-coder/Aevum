import { useEffect, useState } from 'react'
import { getCurrentUser, logout } from './api/authApi'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import './App.css'
import CalendarPage from './pages/CalendarPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null)
  const [authPage, setAuthPage] =
    useState<'login' | 'register'>('login')
  const [appPage, setAppPage] =
    useState<
        'home' | 'tasks' | 'profile' | 'calendar'
    >('home')

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setIsAuthenticated(user !== null)
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
  }, [])

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
      />
    )
  }

  if (appPage === 'profile') {
    return (
      <ProfilePage
      onBack={() => setAppPage('home')}
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
      onLogout={handleLogout}
      onProfile={() => setAppPage('profile')}
      onCalendar={() => setAppPage('calendar')}
      onTasks={() => setAppPage('tasks')}
    />
  )
}

export default App