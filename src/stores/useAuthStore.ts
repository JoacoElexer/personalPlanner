import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  initialized: boolean
  loading: boolean
  error: string | null
  init: () => void
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

let subscriptionStarted = false

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  loading: false,
  error: null,

  init: () => {
    if (subscriptionStarted || !isSupabaseConfigured) {
      set({ initialized: true })
      return
    }
    subscriptionStarted = true

    void supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        initialized: true,
      })
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    set({ loading: false })
    if (error) {
      set({ error: error.message })
      return false
    }
    return true
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    set({ loading: false })
    if (error) {
      set({ error: error.message })
      return false
    }
    if (!data.session) {
      set({
        error:
          'Revisá tu correo electrónico y confirmá la cuenta antes de entrar.',
      })
    }
    return !!data.session
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },

  clearError: () => set({ error: null }),
}))

export function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null
}
