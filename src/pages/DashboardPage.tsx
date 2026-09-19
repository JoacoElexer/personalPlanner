import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen de tus tareas y gráficos personalizables."
      />
      <Card className="flex flex-col items-center justify-center gap-3 p-16 text-muted-foreground">
        <Construction className="size-8" />
        <p className="text-sm">
          El dashboard con widgets y gráficos llega en una fase próxima.
        </p>
      </Card>
    </div>
  )
}

export default DashboardPage
