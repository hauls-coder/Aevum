import { useEffect, useState, type FormEvent } from 'react'
import TaskForm from '../components/tasks/TaskForm'
import TaskList from '../components/tasks/TaskList'
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '../api/tasksApi'
import type { Task } from '../types/task'
import '../App.css'


function TasksPage() {
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
  const completedCount = tasks.filter(
    (task) => task.isCompleted,
  ).length
  if (isLoading) {
    return <p>Загрузка задач...</p>
  }

  return (
    <main className="app">
      <header className="tasks-heading">
        <div>
          <span className="brand-label">AEVUM</span>
          <h1>Задачи</h1>
        </div>
        <p>
          {completedCount} из {tasks.length} выполнено
        </p>
      </header>

      <TaskForm
        title={title}
        isCreating={isCreating}
        onTitleChange={setTitle}
        onSubmit={handleSubmit}
      />

      {error && <p>{error}</p>}

      <TaskList
        tasks={tasks}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </main>
  )
}

export default TasksPage