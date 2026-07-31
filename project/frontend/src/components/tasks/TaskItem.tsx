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
      </label>

      <button type="button" onClick={() => onEdit(task)}>
        Изменить
      </button>

      <button type="button" onClick={() => onDelete(task.id)}>
        Удалить
      </button>
    </li>
  )
}

export default TaskItem