import type { SubTask, Task } from '../types/task'

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
  startsAt: string | null = null,
  endsAt: string | null = null,
  isRecurring: boolean = false,
  reminderMinutesBefore: number | null = null,
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
      startsAt,
      endsAt,
      isCompleted: false,
      isRecurring,
      reminderMinutesBefore,
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

export async function setFocus(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}/focus`,{
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Не удалось установить фокус дня')
  }
}

export async function clearFocus(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}/unfocus`,{
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Не удалось снять фокус дня')
  }
}

export async function addSubTask(
  taskId: number,
  title: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/${taskId}/subtasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ title, isCompleted: false }),
  })

  if (!response.ok) {
    throw new Error('Не удалось добавить подзадачу')
  }
}

export async function updateSubTask(
  taskId: number,
  subTask: SubTask,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/${taskId}/subtasks/${subTask.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(subTask),
    },
  )

  if (!response.ok) {
    throw new Error('Не удалось изменить подзадачу')
  }
}

export async function deleteSubTask(
  taskId: number,
  subTaskId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/${taskId}/subtasks/${subTaskId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error('Не удалось удалить подзадачу')
  }
}
