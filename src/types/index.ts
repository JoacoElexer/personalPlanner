export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export type TableName = 'tasks' | 'categories'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  sort_order: number
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface Task {
  id: string
  user_id: string
  parent_id: string | null
  category_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  due_time: string | null
  scheduled_date: string | null
  scheduled_start: string | null
  scheduled_end: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface NewTaskInput {
  title: string
  description?: string
  parent_id?: string | null
  category_id?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
  due_time?: string | null
  scheduled_date?: string | null
  scheduled_start?: string | null
  scheduled_end?: string | null
}

export interface NewCategoryInput {
  name: string
  color?: string
  icon?: string
  sort_order?: number
}

export interface PendingOp {
  id: string
  table: TableName
  row: Task | Category
  createdAt: number
}

export interface LocalData {
  tasks: Task[]
  categories: Category[]
}

export const TASK_STATUSES: readonly TaskStatus[] = [
  'todo',
  'in_progress',
  'blocked',
  'done',
]

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  'low',
  'medium',
  'high',
]

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  blocked: 'Bloqueada',
  done: 'Completada',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export const DEFAULT_CATEGORY_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#10b981',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#64748b',
]

export const CATEGORY_ICONS = [
  'tag',
  'star',
  'heart',
  'home',
  'briefcase',
  'book',
  'dumbbell',
  'shopping-cart',
  'car',
  'plane',
  'music',
  'code',
  'graduation-cap',
  'utensils',
  'wrench',
  'paw-print',
]
