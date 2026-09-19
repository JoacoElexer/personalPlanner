import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'

export function CategoriesPage() {
  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Organiza tus tareas por áreas con color e icono."
      />
      <Card className="flex flex-col items-center justify-center gap-3 p-16 text-muted-foreground">
        <Construction className="size-8" />
        <p className="text-sm">
          La gestión de categorías llega en una fase próxima.
        </p>
      </Card>
    </div>
  )
}

export default CategoriesPage
