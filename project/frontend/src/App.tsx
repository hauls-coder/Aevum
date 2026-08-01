import { useEffect, useState } from 'react'
import { getCurrentUser, logout } from './api/authApi'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null)
  const [authPage, setAuthPage] =
    useState<'login' | 'register'>('login')

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

  return <TasksPage onLogout={handleLogout} />
}

export default App