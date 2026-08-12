import type { SubTask, Task } from '../../types/task'
import TaskItem from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onCompleteAll: (task: Task) => void
  onAddSubTask: (taskId: number, title: string) => void
  onToggleSubTask: (taskId: number, subTask: SubTask) => void
  onDeleteSubTask: (taskId: number, subTaskId: number) => void
}

function TaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onCompleteAll,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="status-message">
        Задач пока нет. Создай первую задачу выше.
      </p>
    )
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onCompleteAll={onCompleteAll}
          onAddSubTask={onAddSubTask}
          onToggleSubTask={onToggleSubTask}
          onDeleteSubTask={onDeleteSubTask}
        />
      ))}
    </ul>
  )
}

export default TaskList
