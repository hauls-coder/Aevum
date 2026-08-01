import { useState, type FormEvent } from 'react'
import { login } from '../api/authApi'

interface LoginPageProps {
    onLogin: () => void
    onRegister: () => void
}

function LoginPage({ onLogin, onRegister }: LoginPageProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        try {
            setIsSubmitting(true)
            setError('')

            await login(email.trim(), password)
            onLogin()
        } catch {
            setError('Неверный email или пароль')
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <main className="app auth-page">
            <header className="tasks-heading">
                <div>
                    <span className="brand-label">AEVUM</span>
                    <h1>Вход</h1>
                </div>
            </header>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    required
                />
                
                <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Пароль"
                autoComplete="current-password"
                required
                />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Вход...' : 'Войти'}
                </button>
            </form>

            <button type="button" onClick={onRegister}>
                Создать аккаунт
            </button>

            {error && (
                <p className="status-message status-message--error">
                    {error}
                </p>
            )}
        </main>
    )
}

export default LoginPage