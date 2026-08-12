import type { FormEvent } from 'react'

interface TaskFormProps {
  title: string
  description: string
  startTime: string
  endTime: string
  isRecurring: boolean
  isCreating: boolean
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  onIsRecurringChange: (isRecurring: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function TaskForm({
  title,
  description,
  startTime,
  endTime,
  isRecurring,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onStartTimeChange,
  onEndTimeChange,
  onIsRecurringChange,
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

      <label className="task-form-recurring">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(event) => onIsRecurringChange(event.target.checked)}
        />
        Повторять каждый день
      </label>

      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Создание...' : 'Добавить'}
      </button>
    </form>
  )
}

export default TaskForm