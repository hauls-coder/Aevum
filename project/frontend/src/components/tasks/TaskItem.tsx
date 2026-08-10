import { useState, type FormEvent } from 'react'
import type { Task } from '../../types/task'

interface TaskItemProps {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
}

function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(
    task.description ?? '',
  )

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = editTitle.trim()

    if (!trimmedTitle) {
      return
    }

    onEdit({
      ...task,
      title: trimmedTitle,
      description: editDescription.trim() || null,
    })

    setIsEditing(false)
  }

  function handleCancel() {
    setEditTitle(task.title)
    setEditDescription(task.description ?? '')
    setIsEditing(false)
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

  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => onToggle(task)}
        />

        <span
          style={{
            textDecoration: task.isCompleted ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </span>

        {task.description && (
          <small className="task-description">{task.description}</small>
        )}
      </label>

      <button type="button" onClick={() => setIsEditing(true)}>
        Изменить
      </button>

      <button type="button" onClick={() => onDelete(task.id)}>
        Удалить
      </button>
    </li>
  )
}

export default TaskItem
