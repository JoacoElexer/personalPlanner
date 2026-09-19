import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/stores/useDataStore'
import {
  DEFAULT_CATEGORY_COLORS,
  CATEGORY_ICONS,
  type Category,
} from '@/types'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  color: z.string(),
  icon: z.string(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export function CategoryEditorDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
}) {
  const addCategory = useDataStore((s) => s.addCategory)
  const updateCategory = useDataStore((s) => s.updateCategory)
  const isEdit = Boolean(category)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      color: category?.color ?? DEFAULT_CATEGORY_COLORS[0],
      icon: category?.icon ?? 'tag',
    },
    mode: 'onSubmit',
  })

  const handleSubmit = form.handleSubmit((values: CategoryFormValues) => {
    if (isEdit && category) {
      updateCategory(category.id, values)
      toast.success('Categoría actualizada')
    } else {
      addCategory(values)
      toast.success('Categoría creada')
    }
    onOpenChange(false)
    form.reset()
  })

  const color = form.watch('color')
  const icon = form.watch('icon')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
          <DialogDescription>
            Las categorías agrupan tus tareas con color e icono.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          aria-label="Formulario de categoría"
        >
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              autoFocus
              placeholder="Ej: Trabajo, Casa, Salud…"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  className={cn(
                    'size-8 rounded-full border-2 transition-transform',
                    color === c
                      ? 'border-ring ring-2 ring-ring/40'
                      : 'border-transparent hover:scale-110',
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => form.setValue('color', c, { shouldDirty: true })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="grid grid-cols-8 gap-2">
              {CATEGORY_ICONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-label={`Icono ${name}`}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg border transition-colors',
                    icon === name
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                  onClick={() => form.setValue('icon', name, { shouldDirty: true })}
                >
                  <CategoryIcon name={name} className="size-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <span
              className="flex size-10 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: color }}
            >
              <CategoryIcon name={icon} className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">
                {(form.watch('name') || 'Sin nombre').trim() || 'Sin nombre'}
              </p>
              <p className="text-xs text-muted-foreground">
                Vista previa de la categoría
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {isEdit ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}