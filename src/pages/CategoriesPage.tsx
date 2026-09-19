import { MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { CategoryEditorDialog } from '@/components/categories/CategoryEditorDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/tasks/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { visibleTasks } from '@/lib/taskUtils'
import { useDataStore } from '@/stores/useDataStore'
import type { Category } from '@/types'

export function CategoriesPage() {
  const categories = useDataStore((s) =>
    s.categories.filter((c) => !c.deleted),
  )
  const tasks = useDataStore((s) => s.tasks)
  const removeCategory = useDataStore((s) => s.removeCategory)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const task of visibleTasks(tasks)) {
      if (task.category_id) {
        counts.set(task.category_id, (counts.get(task.category_id) ?? 0) + 1)
      }
    }
    return counts
  }, [tasks])

  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Organiza tus tareas por áreas con color e icono."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setEditorOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no tenés categorías. ¡Creá la primera!
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((category) => (
            <Card
              key={category.id}
              className="group flex items-center gap-3 p-4"
            >
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: category.color }}
              >
                <CategoryIcon name={category.icon} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {taskCounts.get(category.id) ?? 0} tarea
                  {(taskCounts.get(category.id) ?? 0) === 1 ? '' : 's'}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                    aria-label={`Acciones de ${category.name}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditing(category)
                      setEditorOpen(true)
                    }}
                  >
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setDeleting(category)}
                  >
                    <Trash2 className="size-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          ))}
        </div>
      )}

      <CategoryEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        category={editing}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="¿Eliminar categoría?"
        description={
          deleting
            ? `Se eliminará "${deleting.name}". Las tareas que la usen quedarán sin categoría.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          if (!deleting) return
          removeCategory(deleting.id)
          toast.success('Categoría eliminada')
        }}
      />
    </div>
  )
}

export default CategoriesPage