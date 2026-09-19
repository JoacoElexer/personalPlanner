import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/sonner'
import { startSync, stopSync } from '@/lib/sync'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDataStore } from '@/stores/useDataStore'

const AuthPage = lazy(() =>
  import('@/pages/auth/AuthPage').then((m) => ({ default: m.AuthPage })),
)
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const TasksPage = lazy(() => import('@/pages/TasksPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center text-muted-foreground">
      Cargando…
    </div>
  )
}

function AuthGate() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)

  if (!initialized) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    )
  }
  if (!user) return <Navigate to="/auth" replace />
  return <Outlet />
}

function DataBootstrap() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const hydrate = useDataStore((s) => s.hydrate)
  const clear = useDataStore((s) => s.clear)

  useEffect(() => {
    if (!initialized) return
    if (user) {
      hydrate(user.id)
      startSync()
    } else {
      stopSync()
      clear()
    }
  }, [user, initialized, hydrate, clear])

  return <Outlet />
}

function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <HashRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<AuthGate />}>
            <Route element={<DataBootstrap />}>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </HashRouter>
  )
}

export default App
