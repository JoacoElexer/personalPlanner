import { es } from 'date-fns/locale'
import { format, isTomorrow, isToday, parseISO } from 'date-fns'
import type { Task } from '@/types'

export function formatDueDate(dateKey: string | null | undefined): string {
  if (!dateKey) return ''
  const date = parseISO(dateKey)
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, 'EEE d MMM', { locale: es })
}

export function formatDueWithTime(task: Pick<Task, 'due_date' | 'due_time'>) {
  const day = formatDueDate(task.due_date)
  if (!task.due_time) return day
  return `${day} · ${task.due_time}`
}

export function formatWeekdayLong(date: Date): string {
  return format(date, 'EEEE d', { locale: es })
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: es })
}

export function formatDayShort(date: Date): string {
  return format(date, 'EEE d', { locale: es })
}