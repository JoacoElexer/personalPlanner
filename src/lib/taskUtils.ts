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
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return visibleTasks(tasks).filter((t) => t.due_date === key)
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function startOfToday(): Date {
  return startOfDay(new Date())
}
