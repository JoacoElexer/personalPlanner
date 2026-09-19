import { create } from 'zustand'
import { outboxCount } from '@/lib/persistence'
import { currentUserId } from '@/stores/useAuthStore'

interface SyncState {
  online: boolean
  syncing: boolean
  lastSync: string | null
  pendingCount: number
  error: string | null
  setOnline: (online: boolean) => void
  setSyncing: (syncing: boolean) => void
  setLastSync: (iso: string | null) => void
  setError: (error: string | null) => void
  refreshPending: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncing: false,
  lastSync: null,
  pendingCount: 0,
  error: null,

  setOnline: (online) => set({ online }),
  setSyncing: (syncing) => set({ syncing }),
  setLastSync: (lastSync) => set({ lastSync }),
  setError: (error) => set({ error }),

  refreshPending: () => {
    const userId = currentUserId()
    set({ pendingCount: userId ? outboxCount(userId) : 0 })
  },
}))
