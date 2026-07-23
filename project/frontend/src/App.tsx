import { useEffect, useState, type FormEvent } from 'react'
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from './api/tasksApi'
import type { Task } from './types/task'
import './App.css'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => setError('Не удалось загрузить задачи'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    try {
      setIsCreating(true)
      setError('')

      await createTask(trimmedTitle)

      const updatedTasks = await getTasks()
      setTasks(updatedTasks)
      setTitle('')
    } catch {
      setError('Не удалось создать задачу')
    } finally {
      setIsCreating(false)
    }
  }
  async function handleToggle(task: Task) {
  const updatedTask = {
    ...task,
    isCompleted: !task.isCompleted,
  }

  try {
    setError('')
    await updateTask(updatedTask)

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id ? updatedTask : currentTask,
      ),
    )
  } catch {
    setError('Не удалось изменить задачу')
  }
}

async function handleDelete(id: number) {
  try {
    setError('')
    await deleteTask(id)

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id),
    )
  } catch {
    setError('Не удалось удалить задачу')
  }
}
async function handleEdit(task: Task) {
  const newTitle = window.prompt(
    'Новое название задачи',
    task.title,
  )?.trim()

  if (!newTitle || newTitle === task.title) {
    return
  }

  const updatedTask = {
    ...task,
    title: newTitle,
  }

  try {
    setError('')
    await updateTask(updatedTask)

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id ? updatedTask : currentTask,
      ),
    )
  } catch {
    setError('Не удалось изменить название задачи')
  }
}
  if (isLoading) {
    return <p>Загрузка задач...</p>
  }

  return (
    <main className="app">
      <h1>Задачи</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Название задачи"
        />

        <button type="submit" disabled={isCreating}>
          {isCreating ? 'Создание...' : 'Добавить'}
        </button>
      </form>

      {error && <p>{error}</p>}

      {tasks.length === 0 ? (
        <p>Задач пока нет.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <label>
                <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => handleToggle(task)}
                />
                <span
                style={{
                  textDecoration: task.isCompleted ? 'line-through' : 'none',
                }}
                >
                  {task.title}
                </span>
              </label>
              <button type="button" onClick={() => handleEdit(task)}>
                Изменить
              </button>
              <button type="button" onClick={() => handleDelete(task.id)}>
                удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App