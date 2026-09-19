import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  dropOutboxOp,
  loadCheckpoint,
  readOutbox,
  saveCheckpoint,
} from '@/lib/persistence'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDataStore } from '@/stores/useDataStore'
import { useSyncStore } from '@/stores/useSyncStore'
import type { Category, TableName, Task } from '@/types'

const TABLES: readonly TableName[] = ['tasks', 'categories']

export async function pushPending(): Promise<void> {
  const user = useAuthStore.getState().user
  if (!user || !isSupabaseConfigured) return
  const pending = readOutbox(user.id)
  if (pending.length === 0) return

  const sync = useSyncStore.getState()
  sync.setSyncing(true)
  try {
    for (const op of pending) {
      const { error } =
        op.table === 'tasks'
          ? await supabase.from('tasks').upsert(op.row as Task)
          : await supabase.from('categories').upsert(op.row as Category)
      if (error) {
        sync.setError(`Error al sincronizar: ${error.message}`)
        return
      }
      dropOutboxOp(user.id, op.id)
    }
    sync.setError(null)
  } finally {
    useSyncStore.getState().setSyncing(false)
    useSyncStore.getState().refreshPending()
  }
}

export async function pullChanges(): Promise<void> {
  const user = useAuthStore.getState().user
  if (!user || !isSupabaseConfigured) return

  const sync = useSyncStore.getState()
  sync.setSyncing(true)
  try {
    for (const table of TABLES) {
      const since = loadCheckpoint(user.id, table)
      let query = supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: true })
      if (since) query = query.gt('updated_at', since)

      const { data, error } = await query
      if (error) {
        sync.setError(`Error al bajar cambios: ${error.message}`)
        continue
      }
      if (!data || data.length === 0) continue

      if (table === 'tasks') {
        useDataStore.getState().applyRemoteTasks(data as Task[])
      } else {
        useDataStore.getState().applyRemoteCategories(data as Category[])
      }
      const last = data[data.length - 1] as { updated_at: string }
      saveCheckpoint(user.id, table, last.updated_at)
    }
    sync.setError(null)
    sync.setLastSync(new Date().toISOString())
  } finally {
    useSyncStore.getState().setSyncing(false)
  }
}

export async function syncNow(): Promise<void> {
  await pushPending()
  await pullChanges()
}

let cleanup: Array<() => void> = []

export function startSync(): void {
  stopSync()
  const user = useAuthStore.getState().user
  const sync = useSyncStore.getState()
  sync.setOnline(navigator.onLine)

  if (!user || !isSupabaseConfigured) return

  const onOnline = () => {
    useSyncStore.getState().setOnline(true)
    void syncNow()
  }
  const onOffline = () => useSyncStore.getState().setOnline(false)
  const onFocus = () => {
    if (navigator.onLine) void syncNow()
  }
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  window.addEventListener('focus', onFocus)

  const interval = window.setInterval(() => {
    const store = useSyncStore.getState()
    if (navigator.onLine && document.visibilityState === 'visible') {
      store.setOnline(true)
      void syncNow()
    } else {
      store.setOnline(navigator.onLine)
    }
  }, 60_000)

  const channel = supabase
    .channel(`sync-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      },
      () => void pullChanges(),
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
        filter: `user_id=eq.${user.id}`,
      },
      () => void pullChanges(),
    )
    .subscribe()

  cleanup = [
    () => window.removeEventListener('online', onOnline),
    () => window.removeEventListener('offline', onOffline),
    () => window.removeEventListener('focus', onFocus),
    () => window.clearInterval(interval),
    () => void supabase.removeChannel(channel),
  ]

  void syncNow()
}

export function stopSync(): void {
  cleanup.forEach((fn) => fn())
  cleanup = []
}
