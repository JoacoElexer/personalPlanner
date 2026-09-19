import { create } from 'zustand'
import { enqueueRows, loadLocal, saveLocal } from '@/lib/persistence'
import { mergeRows } from '@/lib/merge'
import { descendantsTaskIds } from '@/lib/taskUtils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSyncStore } from '@/stores/useSyncStore'
import type { Category, NewCategoryInput, NewTaskInput, Task } from '@/types'

interface DataState {
  tasks: Task[]
  categories: Category[]
  hydrate: (userId: string) => void
  clear: () => void
  addTask: (input: NewTaskInput) => Task | null
  updateTask: (id: string, patch: Partial<Task>) => void
  toggleTaskDone: (id: string) => void
  toggleSubtaskDone: (parentId: string, id: string) => void
  removeTask: (id: string) => void
  restoreTask: (id: string) => void
  addCategory: (input: NewCategoryInput) => Category | null
  updateCategory: (id: string, patch: Partial<Category>) => void
  removeCategory: (id: string) => void
  applyRemoteTasks: (rows: Task[]) => void
  applyRemoteCategories: (rows: Category[]) => void
}

const now = () => new Date().toISOString()

function persistState(userId: string, tasks: Task[], categories: Category[]) {
  saveLocal(userId, { tasks, categories })
  useSyncStore.getState().refreshPending()
}

function mergeAndSet<K extends 'tasks' | 'categories'>(
  key: K,
  remotes: K extends 'tasks' ? Task[] : Category[],
) {
  const userId = useAuthStore.getState().user?.id
  if (!userId || remotes.length === 0) return
  const state = useDataStore.getState()
  const prev = (key === 'tasks' ? state.tasks : state.categories) as Array<{
    id: string
    updated_at: string
  }>
  const merged = mergeRows(prev, remotes as typeof prev)
  useDataStore.setState({ [key]: merged } as Partial<DataState>)
  const s = useDataStore.getState()
  persistState(userId, s.tasks, s.categories)
}

export const useDataStore = create<DataState>((set, get) => ({
  tasks: [],
  categories: [],

  hydrate: (userId) => {
    const local = loadLocal(userId)
    set({
      tasks: local?.tasks ?? [],
      categories: local?.categories ?? [],
    })
    useSyncStore.getState().refreshPending()
  },

  clear: () => {
    set({ tasks: [], categories: [] })
    useSyncStore.getState().refreshPending()
  },

  addTask: (input) => {
    const user = useAuthStore.getState().user
    if (!user) return null
    const timestamp = now()
    const task: Task = {
      id: crypto.randomUUID(),
      user_id: user.id,
      parent_id: input.parent_id ?? null,
      category_id: input.category_id ?? null,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      due_date: input.due_date ?? null,
      due_time: input.due_time ?? null,
      scheduled_date: input.scheduled_date ?? null,
      scheduled_start: input.scheduled_start ?? null,
      scheduled_end: input.scheduled_end ?? null,
      completed_at: null,
      created_at: timestamp,
      updated_at: timestamp,
      deleted: false,
    }
    set((s) => ({ tasks: [...s.tasks, task] }))
    persistState(user.id, get().tasks, get().categories)
    enqueueRows(user.id, 'tasks', [task])
    return task
  },

  updateTask: (id, patch) => {
    const user = useAuthStore.getState().user
    if (!user) return
    const timestamp = now()
    let updated: Task | undefined
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== id) return t
        updated = { ...t, ...patch, id, updated_at: timestamp }
        return updated
      }),
    }))
    if (!updated) return
    persistState(user.id, get().tasks, get().categories)
    enqueueRows(user.id, 'tasks', [updated])
  },

  toggleTaskDone: (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const done = task.status === 'done'
    get().updateTask(id, {
      status: done ? 'todo' : 'done',
      completed_at: done ? null : now(),
    })
  },

  toggleSubtaskDone: (parentId, id) => {
    const sub = get().tasks.find((t) => t.id === id && t.parent_id === parentId)
    if (!sub) return
    const done = sub.status === 'done'
    get().updateTask(id, {
      status: done ? 'todo' : 'done',
      completed_at: done ? null : now(),
    })
  },

  removeTask: (id) => {
    const user = useAuthStore.getState().user
    if (!user) return
    const ids = new Set([id, ...descendantsTaskIds(get().tasks, id)])
    const timestamp = now()
    set((s) => ({
      tasks: s.tasks.map((t) =>
        ids.has(t.id)
          ? { ...t, deleted: true, updated_at: timestamp, completed_at: null }
          : t,
      ),
    }))
    const changed = get().tasks.filter((t) => ids.has(t.id))
    persistState(user.id, get().tasks, get().categories)
    enqueueRows(user.id, 'tasks', changed)
  },

  restoreTask: (id) => {
    const user = useAuthStore.getState().user
    if (!user) return
    const timestamp = now()
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, deleted: false, updated_at: timestamp } : t,
      ),
    }))
    const changed = get().tasks.find((t) => t.id === id)
    if (!changed) return
    persistState(user.id, get().tasks, get().categories)
    enqueueRows(user.id, 'tasks', [changed])
  },

  addCategory: (input) => {
    const user = useAuthStore.getState().user
    if (!user) return null
    const timestamp = now()
    const category: Category = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: input.name,
      color: input.color ?? '#6366f1',
      icon: input.icon ?? 'tag',
      sort_order: input.sort_order ?? 0,
      created_at: timestamp,
      updated_at: timestamp,
      deleted: false,
    }
    set((s) => ({ categories: [...s.categories, category] }))
    persistState(user.id, get().tasks, get().categories)
    enqueueRows(user.id, 'categories', [category])
    return category
  },

  updateCategory: (id, patch) => {
    const user = useAuthStore.getState().user
    if (!user) return
    const timestamp = now()
    let updated: Category | undefined
    set((s) => ({
      categories: s.categories.map((c) => {
        if (c.id !== id) return c
        updated = { ...c, ...patch, id, updated_at: timestamp }
        return updated
      }),
    }))
    if (!updated) return
    persistState(user.id, get().tasks, get().categories)
    enqueueRows(user.id, 'categories', [updated])
  },

  removeCategory: (id) => {
    const user = useAuthStore.getState().user
    if (!user) return
    const timestamp = now()
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, deleted: true, updated_at: timestamp } : c,
      ),
    }))
    const changed = get().categories.find((c) => c.id === id)
    if (!changed) return
    persistState(user.id, get().tasks, get().categories)
    enqueueRows(user.id, 'categories', [changed])
  },

  applyRemoteTasks: (rows) => mergeAndSet('tasks', rows),
  applyRemoteCategories: (rows) => mergeAndSet('categories', rows),
}))
