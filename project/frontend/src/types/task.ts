export interface SubTask {
  id: number
  title: string
  isCompleted: boolean
}

export interface Task {
  id: number
  title: string
  description: string | null
  startsAt: string | null
  endsAt: string | null
  isCompleted: boolean
  isFocus: boolean
  isRecurring: boolean
  reminderMinutesBefore: number | null
  progressPercent: number
  subTasks: SubTask[]
}