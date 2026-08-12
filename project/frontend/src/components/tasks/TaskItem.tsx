import { useState, type FormEvent } from 'react'
import type { SubTask, Task } from '../../types/task'

// Форматирует время задачи в вид ЧЧ:ММ
function formatTime(iso: string | null): string {
  if (!iso) {
    return ''
  }

  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Достаёт ЧЧ:ММ из ISO-строки для поля <input type="time">
function toTimeInputValue(iso: string | null): string {
  if (!iso) {
    return ''
  }

  const date = new Date(iso)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

// Берёт дату из существующего времени задачи (или сегодня) и подставляет новое ЧЧ:ММ
function combineWithTime(baseIso: string | null, time: string): string | null {
  if (!time) {
    return null
  }

  const [hours, minutes] = time.split(':').map(Number)
  const date = baseIso ? new Date(baseIso) : new Date()

  date.setHours(hours, minutes, 0, 0)

  return date.toISOString()
}

interface TaskItemProps {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onCompleteAll: (task: Task) => void
  onAddSubTask: (taskId: number, title: string) => void
  onToggleSubTask: (taskId: number, subTask: SubTask) => void
  onDeleteSubTask: (taskId: number, subTaskId: number) => void
}

function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onCompleteAll,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(
    task.description ?? '',
  )
  const [editStartTime, setEditStartTime] = useState(
    toTimeInputValue(task.startsAt),
  )
  const [editEndTime, setEditEndTime] = useState(
    toTimeInputValue(task.endsAt),
  )
  const [editError, setEditError] = useState('')
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = editTitle.trim()

    if (!trimmedTitle) {
      return
    }

    const startsAt = combineWithTime(task.startsAt, editStartTime)
    const endsAt = combineWithTime(task.startsAt, editEndTime)

    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setEditError('Время окончания должно быть позже времени начала')
      return
    }

    setEditError('')

    onEdit({
      ...task,
      title: trimmedTitle,
      description: editDescription.trim() || null,
      startsAt,
      endsAt,
    })

    setIsEditing(false)
  }

  function handleCancel() {
    setEditTitle(task.title)
    setEditDescription(task.description ?? '')
    setEditStartTime(toTimeInputValue(task.startsAt))
    setEditEndTime(toTimeInputValue(task.endsAt))
    setEditError('')
    setIsEditing(false)
  }

  // Если у задачи есть незавершённые подзадачи, спрашиваем перед завершением
  function handleToggle() {
    const incompleteSubTasks = task.subTasks.filter(
      (subTask) => !subTask.isCompleted,
    )

    if (!task.isCompleted && incompleteSubTasks.length > 0) {
      const confirmed = window.confirm(
        'У задачи есть невыполненные подзадачи. Отметить их все выполненными?',
      )

      if (!confirmed) {
        return
      }

      onCompleteAll(task)
      return
    }

    onToggle(task)
  }

  function handleAddSubTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = newSubTaskTitle.trim()

    if (!trimmedTitle) {
      return
    }

    onAddSubTask(task.id, trimmedTitle)
    setNewSubTaskTitle('')
  }

  if (isEditing) {
    return (
      <li>
        <form className="task-edit-form" onSubmit={handleEditSubmit}>
          <input
            type="text"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            placeholder="Описание (необязательно)"
            rows={3}
          />

          <div className="task-form-time-row">
            <label>
              Начало
              <input
                type="time"
                value={editStartTime}
                onChange={(event) => setEditStartTime(event.target.value)}
              />
            </label>
            <label>
              Окончание
              <input
                type="time"
                value={editEndTime}
                onChange={(event) => setEditEndTime(event.target.value)}
              />
            </label>
          </div>

          {editError && <p className="edit-time-error">{editError}</p>}

          <button type="submit">Сохранить</button>
          <button
            className="task-edit-cancel"
            type="button"
            onClick={handleCancel}
          >
            Отмена
          </button>
        </form>
      </li>
    )
  }

  const timeLabel = task.startsAt
    ? task.endsAt
      ? `${formatTime(task.startsAt)}–${formatTime(task.endsAt)}`
      : formatTime(task.startsAt)
    : ''

  const totalSubTasks = task.subTasks.length
  const completedSubTasks = task.subTasks.filter(
    (subTask) => subTask.isCompleted,
  ).length
  const progressPercent =
    totalSubTasks > 0
      ? Math.round((completedSubTasks / totalSubTasks) * 100)
      : 0

  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={handleToggle}
        />

        <span className="task-text">
          <span
            style={{
              textDecoration: task.isCompleted ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>

          {timeLabel && <span className="task-time">{timeLabel}</span>}

          {task.isRecurring && (
            <span className="task-recurring-badge">Повторяется</span>
          )}

          {task.reminderMinutesBefore != null && (
            <span className="task-reminder-badge">
              Напомнить за {task.reminderMinutesBefore} мин
            </span>
          )}

          {task.description && (

            <small className="task-description">{task.description}</small>
          )}
        </span>
      </label>

      <button type="button" onClick={() => setIsEditing(true)}>
        Изменить
      </button>

      <button type="button" onClick={() => onDelete(task.id)}>
        Удалить
      </button>

      <div className="subtask-section">
        {totalSubTasks > 0 && (
          <div className="subtask-progress">
            <div className="subtask-progress-bar">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="subtask-progress-label">
              {completedSubTasks} из {totalSubTasks}
            </span>
          </div>
        )}

        {totalSubTasks > 0 && (
          <ul className="subtask-list">
            {task.subTasks.map((subTask) => (
              <li key={subTask.id} className="subtask-item">
                <label>
                  <input
                    type="checkbox"
                    checked={subTask.isCompleted}
                    onChange={() => onToggleSubTask(task.id, subTask)}
                  />
                  <span
                    style={{
                      textDecoration: subTask.isCompleted
                        ? 'line-through'
                        : 'none',
                    }}
                  >
                    {subTask.title}
                  </span>
                </label>
                <button
                  type="button"
                  className="subtask-delete"
                  onClick={() => onDeleteSubTask(task.id, subTask.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          className="subtask-add-form"
          onSubmit={handleAddSubTaskSubmit}
        >
          <input
            type="text"
            value={newSubTaskTitle}
            onChange={(event) => setNewSubTaskTitle(event.target.value)}
            placeholder="Добавить подзадачу"
          />
          <button type="submit">+</button>
        </form>
      </div>
    </li>
  )
}

export default TaskItem