import {
  CalendarDays,
  Cloud,
  CloudOff,
  LayoutDashboard,
  ListTodo,
  Loader2,
  LogOut,
  Settings,
  Tags,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSyncStore } from '@/stores/useSyncStore'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/tasks', label: 'Tareas', icon: ListTodo },
  { to: '/categories', label: 'Categorías', icon: Tags },
  { to: '/settings', label: 'Ajustes', icon: Settings },
]

function SyncIndicator() {
  const { online, syncing, lastSync, pendingCount } = useSyncStore()
  const Icon = online ? Cloud : CloudOff

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {syncing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Icon className="size-4" />
          )}
          <span className="hidden sm:inline">
            {pendingCount > 0
              ? `${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}`
              : lastSync
                ? new Date(lastSync).toLocaleTimeString()
                : 'sin sincronizar'}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {online ? 'En línea' : 'Sin conexión — cambios se guardan localmente'}
      </TooltipContent>
    </Tooltip>
  )
}

export function AppShell() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-svh">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r bg-muted/40 lg:flex">
          <div className="flex h-16 items-center gap-2 border-b px-5 text-lg font-bold">
            <ListTodo className="size-5" />
            Personal Planner
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="space-y-2 border-t p-3">
            <div className="flex items-center justify-between px-1">
              <SyncIndicator />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Cerrar sesión"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
            {user && (
              <p className="truncate px-1 text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
            <div className="flex items-center gap-2 font-bold">
              <ListTodo className="size-5" />
              Personal Planner
            </div>
            <SyncIndicator />
          </header>

          <main className="flex-1 p-4 pb-20 lg:p-6 lg:pb-6">
            <Outlet />
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur lg:hidden">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'flex h-full w-full items-center justify-center',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="size-5" />
            </NavLink>
          ))}
        </nav>
      </div>
    </TooltipProvider>
  )
}
