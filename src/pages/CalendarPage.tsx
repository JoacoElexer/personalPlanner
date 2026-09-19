import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'

export function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Calendario"
        description="Tus tareas por semana y por mes."
      />
      <Card className="flex flex-col items-center justify-center gap-3 p-16 text-muted-foreground">
        <Construction className="size-8" />
        <p className="text-sm">
          Las vistas de mes y semana llegan en una fase próxima.
        </p>
      </Card>
    </div>
  )
}

export default CalendarPage
