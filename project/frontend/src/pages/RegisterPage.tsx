import { useState, type FormEvent } from 'react'
import { register } from '../api/authApi'

interface RegisterPageProps {
    onLogin: () => void
}

function RegisterPage({ onLogin }: RegisterPageProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event?.preventDefault()

        try {
            setIsSubmitting(true)
            setError('')
            setMessage('')

            await register(email.trim(), password)
            onLogin()
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось зарегистрироваться'
                )
    } finally {
        setIsSubmitting(false)
    }
}
return (
    <main className="app auth-page">
        <header className="tasks-heading">
            <div>
                <span className="brand-label">AEVUM</span>
                <h1>Регистрация</h1>
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
                autoComplete="new-password"
                required
                minLength={6}
            />

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Регистрация...' : 'Создать аккаунт'}
            </button>
        </form>

        <button type="button" onClick={onLogin}>
            Вернуться ко входу
        </button>

        {error && (
            <p className="status-message status-message--error">
                {error}
            </p>

        )}
        {message && (
            <p className="status-message">{message}</p>
        )}
    </main>
)
}

export default RegisterPage