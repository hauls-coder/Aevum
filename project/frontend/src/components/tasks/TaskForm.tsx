import type { FormEvent } from 'react'

interface TaskFormProps {
  title: string
  isCreating: boolean
  onTitleChange: (title: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function TaskForm({
  title,
  isCreating,
  onTitleChange,
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

      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Создание...' : 'Добавить'}
      </button>
    </form>
  )
}

export default TaskForm