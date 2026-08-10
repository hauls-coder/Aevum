import type { FormEvent } from 'react'

interface TaskFormProps {
  title: string
  description: string
  isCreating: boolean
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function TaskForm({
  title,
  description,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
}: TaskFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Название задачи"
      />

      <textarea
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Описание (необязательно)"
        rows={3}
      />

      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Создание...' : 'Добавить'}
      </button>
    </form>
  )
}

export default TaskForm
