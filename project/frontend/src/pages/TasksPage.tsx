import { useEffect, useState, type FormEvent } from 'react'
import TaskForm from '../components/tasks/TaskForm'
import TaskList from '../components/tasks/TaskList'
import {
  addSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTasks,
  updateSubTask,
  updateTask,
} from '../api/tasksApi'
import type { SubTask, Task } from '../types/task'
import '../App.css'
import { getProfile } from '../api/profileApi'
import BottomNav from '../components/nav/BottomNav'

interface TasksPageProps {
  onLogout: () => void
  onProfile: () => void
  onCalendar: () => void
  onHome: () => void
}

// Объединяет сегодняшнюю дату с выбранным временем
function combineTodayWithTime(time: string): string | null {
  if (!time) {
    return null
  }

  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()

  date.setHours(hours, minutes, 0, 0)

  return date.toISOString()
}

function TasksPage({
  onLogout,
  onProfile,
  onCalendar,
  onHome,
}: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [reminderOption, setReminderOption] = useState('')
  const [customReminderMinutes, setCustomReminderMinutes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => setError('Не удалось загрузить задачи'))
      .finally(() => setIsLoading(false))
    getProfile()
      .then((profile) => {
        setDisplayName(profile.displayName)
      })
      .catch(() => {
        setDisplayName('')
      })
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    const startsAt = combineTodayWithTime(startTime)
    const endsAt = combineTodayWithTime(endTime)

    if (
      startsAt &&
      endsAt &&
      new Date(endsAt) <= new Date(startsAt)
    ) {
      setError('Время окончания должно быть позже времени начала')
      return
    }

    const reminderMinutesBefore =
      reminderOption === 'custom'
        ? customReminderMinutes
          ? Number(customReminderMinutes)
          : null
        : reminderOption
          ? Number(reminderOption)
          : null

    try {
      setIsCreating(true)
      setError('')

      await createTask(
        trimmedTitle,
        description.trim(),
        startsAt,
        endsAt,
        isRecurring,
        reminderMinutesBefore,
      )

      const updatedTasks = await getTasks()
      setTasks(updatedTasks)
      setTitle('')
      setDescription('')
      setStartTime('')
      setEndTime('')
      setIsRecurring(false)
      setReminderOption('')
      setCustomReminderMinutes('')
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

      const updatedTasks = await getTasks()
      setTasks(updatedTasks)
    } catch {
      setError('Не удалось изменить задачу')
    }
  }

  async function handleDelete(id: number) {
    const task = tasks.find((currentTask) => currentTask.id === id)

    if (task?.isFocus) {
      const confirmed = window.confirm(
        'Эта задача сейчас в фокусе дня. Удалить её и остановить фокус?',
      )

      if (!confirmed) {
        return
      }
    }

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
  
  async function handleEdit(updatedTask: Task) {
    try {
      setError('')
      await updateTask(updatedTask)

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id
            ? updatedTask
            : currentTask,
        ),
      )
    } catch {
      setError('Не удалось изменить название задачи')
    }
  }

    async function handleCompleteAll(task: Task) {
    try {
      setError('')

      await Promise.all(
        task.subTasks
          .filter((subTask) => !subTask.isCompleted)
          .map((subTask) =>
            updateSubTask(task.id, { ...subTask, isCompleted: true }),
          ),
      )
      await updateTask({ ...task, isCompleted: true })

      const updatedTasks = await getTasks()
      setTasks(updatedTasks)
    } catch {
      setError('Не удалось завершить задачу и подзадачи')
    }
  }

  async function handleAddSubTask(taskId: number, title: string) {
    try {
      setError('')
      await addSubTask(taskId, title)

      const updatedTasks = await getTasks()
      setTasks(updatedTasks)
    } catch {
      setError('Не удалось добавить подзадачу')
    }
  }

  async function handleToggleSubTask(taskId: number, subTask: SubTask) {
    try {
      setError('')
      await updateSubTask(taskId, {
        ...subTask,
        isCompleted: !subTask.isCompleted,
      })

      const updatedTasks = await getTasks()
      setTasks(updatedTasks)
    } catch {
      setError('Не удалось изменить подзадачу')
    }
  }

  async function handleDeleteSubTask(taskId: number, subTaskId: number) {
    try {
      setError('')
      await deleteSubTask(taskId, subTaskId)

      const updatedTasks = await getTasks()
      setTasks(updatedTasks)
    } catch {
      setError('Не удалось удалить подзадачу')
    }
  }

  const completedCount = tasks.filter(
    (task) => task.isCompleted,
  ).length
  if (isLoading) {
    return (
      <main className="app">
        <p className="status-message">Загрузка задач...</p>
      </main>
    )
  }

  return (
    <main className="app app--with-nav">
      <header className="tasks-header">
        <div className="tasks-topbar">
          <div className="brand-navigation">
            <span className="brand-label">AEVUM</span>

            <button
              type="button"
              className="profile-button"
              onClick={onProfile}
            >
              <span className="user-display-name">
                Профиль: {displayName || 'Пользователь'}
              </span>
            </button>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
          >
            Выйти
          </button>
        </div>

        <div className="tasks-heading">
          <h1>Задачи</h1>

          <div className="tasks-heading-meta">
            <p>
              {completedCount} из {tasks.length} выполнено
            </p>
          </div>
        </div>
      </header>

      <TaskForm
        title={title}
        description={description}
        startTime={startTime}
        endTime={endTime}
        isRecurring={isRecurring}
        reminderOption={reminderOption}
        customReminderMinutes={customReminderMinutes}
        isCreating={isCreating}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        onIsRecurringChange={setIsRecurring}
        onReminderOptionChange={setReminderOption}
        onCustomReminderMinutesChange={setCustomReminderMinutes}
        onSubmit={handleSubmit}
      />

      {error && (
        <p className="status-message status-message--error">
          {error}
        </p>
      )}

      <TaskList
        tasks={tasks}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCompleteAll={handleCompleteAll}
        onAddSubTask={handleAddSubTask}
        onToggleSubTask={handleToggleSubTask}
        onDeleteSubTask={handleDeleteSubTask}
      />

      <BottomNav
        active="tasks"
        onHome={onHome}
        onTasks={() => {}}
        onCalendar={onCalendar}
        onProfile={onProfile}
        onAdd={() => {}}
      />
    </main>
  )
}

export default TasksPage
