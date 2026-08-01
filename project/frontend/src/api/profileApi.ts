export interface Profile {
    email: string
    displayName: string
}

const PROFILE_API_URL =
    'http://127.0.0.1:5037/api/profile'

export async function getProfile(): Promise<Profile> {
    const response = await fetch(PROFILE_API_URL, {
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error('Не удалось загрузить профиль')
    }

    return response.json()
}

export async function updateProfile(
    displayName: string,
): Promise<void> {
    const response = await fetch(PROFILE_API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            displayName,
        })
    })

    if (!response.ok) {
        throw new Error('Не удалось сохранить профиль')
    }
}