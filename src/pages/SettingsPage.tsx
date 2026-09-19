import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSyncStore } from '@/stores/useSyncStore'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { online, syncing, lastSync, pendingCount } = useSyncStore()

  return (
    <div>
      <PageHeader
        title="Ajustes"
        description="Cuenta, tema y sincronización."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cuenta</CardTitle>
            <CardDescription>Tu identidad en la nube.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{user?.email}</p>
            <p className="text-muted-foreground">
              {user?.user_metadata?.display_name ?? 'Sin nombre'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sincronización</CardTitle>
            <CardDescription>
              Estado de la conexión con Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              Conexión:{' '}
              <span className="font-medium">
                {online ? 'en línea' : 'sin conexión'}
              </span>
            </p>
            <p>
              Pendientes por subir:{' '}
              <span className="font-medium">{pendingCount}</span>
            </p>
            <p>
              Última sincronización:{' '}
              <span className="font-medium">
                {lastSync ? new Date(lastSync).toLocaleString() : 'nunca'}
              </span>
            </p>
            <p>
              En curso:{' '}
              <span className="font-medium">{syncing ? 'sí' : 'no'}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
