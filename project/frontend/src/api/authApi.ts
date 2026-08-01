const AUTH_API_URL = 'http://127.0.0.1:5037/api/auth'

export async function register(
    email: string,
    password: string,
): Promise<void> {
    const response = await fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            email,
            password,
        }),
    })

    if (!response.ok) {
        const data = await response.json()

        const messages = Object.values(data.errors ?? {})
            .flat()
            .join(' ')

        throw new Error(
            messages || 'Не удалось зарегистрироваться',
        )
    }
}
export async function login(
    email: string,
    password: string,
): Promise<void> {
    const response = await fetch(
        `${AUTH_API_URL}/login?useCookies=true`,
        {
            method: `POST`,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email,
                password,
            }),
        },
    )

    if (!response.ok) {
        throw new Error('Неверный email или пароль')
    }
}

export interface AuthUser {
    email: string
    isEmailConfirmed: boolean
}

export async function getCurrentUser():
    Promise<AuthUser | null> {
    const response = await fetch(
        `${AUTH_API_URL}/manage/info`,
        {
            method: 'GET',
            credentials: 'include',
        },
    )

    if (response.status === 401) {
        return null
    }

    if (!response.ok) {
        throw new Error('Не удалось проверить авторизацию')
    }

    return response.json()
}

export async function logout(): Promise<void> {
    const response = await fetch(
        `${AUTH_API_URL}/logout`,
        {
            method: 'POST',
            credentials: 'include',
        },
    )

    if (!response.ok) {
        throw new Error('Не удалось выйти из аккаунта')
    }
}