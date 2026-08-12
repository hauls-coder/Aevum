import type { FormEvent } from 'react'

interface TaskFormProps {
  title: string
  description: string
  startTime: string
  endTime: string
  isRecurring: boolean
  reminderOption: string
  customReminderMinutes: string
  isCreating: boolean
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  onIsRecurringChange: (isRecurring: boolean) => void
  onReminderOptionChange: (option: string) => void
  onCustomReminderMinutesChange: (minutes: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function TaskForm({
  title,
  description,
  startTime,
  endTime,
  isRecurring,
  reminderOption,
  customReminderMinutes,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onStartTimeChange,
  onEndTimeChange,
  onIsRecurringChange,
  onReminderOptionChange,
  onCustomReminderMinutesChange,
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

      <label className="task-form-reminder">
        Напоминание
        <select
          value={reminderOption}
          onChange={(event) => onReminderOptionChange(event.target.value)}
        >
          <option value="">Без напоминания</option>
          <option value="5">За 5 минут</option>
          <option value="30">За 30 минут</option>
          <option value="60">За 1 час</option>
          <option value="custom">Своё время</option>
        </select>
      </label>

      {reminderOption === 'custom' && (
        <input
          type="number"
          min="1"
          value={customReminderMinutes}
          onChange={(event) =>
            onCustomReminderMinutesChange(event.target.value)
          }
          placeholder="За сколько минут напомнить"
        />
      )}

      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Создание...' : 'Добавить'}
      </button>
    </form>
  )
}

export default TaskForm
