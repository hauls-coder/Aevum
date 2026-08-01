import { useEffect, useState } from 'react'
import {
    getProfile,
    updateProfile,
    type Profile,
} from '../api/profileApi'

interface ProfilePageProps {
    onBack: () => void
}

function ProfilePage({ onBack }: ProfilePageProps) {
    const [profile, setProfile] =
        useState<Profile | null>(null)
    const [displayName, setDisplayName] = useState('')
    const [error, setError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        getProfile()
            .then((loadedProfile) => {
                setProfile(loadedProfile)
                setDisplayName(loadedProfile.displayName)
            })
            .catch(() => {
                setError('Не удалось загрузить профиль')
            })
    }, [])

    async function handleSave() {
        try {
            setIsSaving(true)
            setError('')
            setMessage('')

            const newName = displayName.trim()

            await updateProfile(newName)

            setProfile((currentProfile) =>
                currentProfile
                    ? {
                        ...currentProfile,
                        displayName: newName,
                    }
                    : currentProfile,
            )

            setMessage('Профиль сохранён')
        } catch {
            setError('Не удалось сохранить профиль')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <main className="app auth-page">
            <header className="tasks-heading">
                <div>
                    <span className="brand-label">AEVUM</span>
                    <h1>Профиль</h1>
                </div>
                <button type="button" onClick={onBack}>
                    К задачам
                </button>
            </header>

            {error && (
                <p className="status-message status-message--error">
                    {error}
                </p>
            )}

            {!error && !profile && (
                <p className="status-message">
                    Загрузка профиля...
                </p>
            )}

            {profile && (
                <div>
                    <p>Email: {profile.email}</p>
                    <label>
                        Имя
                        <input
                            type="text"
                            value={displayName}
                            onChange={(event) =>
                                setDisplayName(event.target.value)
                            }
                            maxLength={50}
                        />
                    </label>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>

                    {message && (
                        <p className="status-message">
                            {message}
                        </p>
                    )}
                </div>
            )}
        </main>
    )
}

export default ProfilePage