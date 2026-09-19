import { isBefore, startOfDay, parseISO } from 'date-fns'
import type { Task } from '@/types'

export function visibleTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.deleted)
}

export function subtasksOf(tasks: Task[], parentId: string): Task[] {
  return visibleTasks(tasks).filter((t) => t.parent_id === parentId)
}

export function descendantsTaskIds(tasks: Task[], parentId: string): string[] {
  const result: string[] = []
  const visit = (id: string) => {
    for (const t of tasks) {
      if (t.parent_id === id) {
        result.push(t.id)
        visit(t.id)
      }
    }
  }
  visit(parentId)
  return result
}

export function isOverdue(task: Task, ref = new Date()): boolean {
  if (task.status === 'done' || !task.due_date) return false
  const due = parseISO(task.due_date)
  if (task.due_time) {
    const [h, m] = task.due_time.split(':').map(Number)
    due.setHours(h ?? 0, m ?? 0, 0, 0)
  } else {
    due.setHours(23, 59, 59, 999)
  }
  return isBefore(due, ref)
}

export function tasksOnDate(tasks: Task[], date: Date): Task[] {
  return visibleTasks(tasks).filter((t) => t.due_date === toDateKey(date))
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export type TaskBucket =
  | 'overdue'
  | 'today'
  | 'upcoming'
  | 'later'
  | 'no_date'
  | 'done'

export const BUCKET_ORDER: readonly TaskBucket[] = [
  'overdue',
  'today',
  'upcoming',
  'later',
  'no_date',
  'done',
]

export const BUCKET_LABELS: Record<TaskBucket, string> = {
  overdue: 'Vencidas',
  today: 'Hoy',
  upcoming: 'Próximas',
  later: 'Más adelante',
  no_date: 'Sin fecha',
  done: 'Completadas',
}

export function bucketOf(task: Task, ref = new Date()): TaskBucket {
  if (task.status === 'done') return 'done'
  if (!task.due_date) return 'no_date'
  const start = startOfDay(ref)
  const due = parseISO(task.due_date)
  if (isBefore(due, start)) return 'overdue'
  if (due.getTime() === start.getTime()) return 'today'
  const limit = new Date(start)
  limit.setDate(limit.getDate() + 30)
  if (isBefore(due, limit) || due.getTime() === limit.getTime()) return 'upcoming'
  return 'later'
}

export function sortTasksByDue(a: Task, b: Task): number {
  const aKey = `${a.due_date ?? '9999-99-99'} ${a.due_time ?? '99:99'}`
  const bKey = `${b.due_date ?? '9999-99-99'} ${b.due_time ?? '99:99'}`
  if (aKey < bKey) return -1
  if (aKey > bKey) return 1
  return a.title.localeCompare(b.title)
}

export function subtaskProgress(tasks: Task[], parentId: string) {
  const subs = subtasksOf(tasks, parentId)
  const done = subs.filter((t) => t.status === 'done').length
  return { total: subs.length, done }
}