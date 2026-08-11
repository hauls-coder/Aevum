import type { FormEvent } from 'react'

interface TaskFormProps {
  title: string
  description: string
  startTime: string
  endTime: string
  isCreating: boolean
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function TaskForm({
  title,
  description,
  startTime,
  endTime,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onStartTimeChange,
  onEndTimeChange,
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

      <div className="task-form-time-row">
        <label>
          Начало
          <input
            type="time"
            value={startTime}
            onChange={(event) => onStartTimeChange(event.target.value)}
          />
        </label>

        <label>
          Окончание
          <input
            type="time"
            value={endTime}
            onChange={(event) => onEndTimeChange(event.target.value)}
          />
        </label>
      </div>

      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Создание...' : 'Добавить'}
      </button>
    </form>
  )
}

export default TaskForm
