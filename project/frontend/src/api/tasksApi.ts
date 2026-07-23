import type { Task } from '../types/task'

const API_URL = 'http://localhost:5037/api/tasks'

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Не удалось загрузить задачи')
  }

  return response.json()
}
export async function createTask(title: string): Promise<void> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
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
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error('Не удалось изменить задачу')
  }
}
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить задачу')
  }
}