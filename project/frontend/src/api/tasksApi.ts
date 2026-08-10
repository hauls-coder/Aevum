import type { Task } from '../types/task'

const API_URL = 'http://127.0.0.1:5037/api/tasks'

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(API_URL, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Не удалось загрузить задачи')
  }

  return response.json()
}

export async function createTask(
  title: string,
  description: string,
): Promise<void> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      title,
      description: description || null,
      isCompleted: false,
    }),
  })

  if (!response.ok) {
    throw new Error('Не удалось создать задачу')
  }
}
export async function updateTask(task: Task): Promise<void> {
  const response = await fetch(`${API_URL}/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error('Не удалось изменить задачу')
  }
}
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить задачу')
  }
}
