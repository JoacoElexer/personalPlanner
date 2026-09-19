import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormSelect } from '@/components/form/FormSelect'
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
import { Textarea } from '@/components/ui/textarea'
import { useDataStore } from '@/stores/useDataStore'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type NewTaskInput,
  type Task,
} from '@/types'

const nullable = (value: string) => (value ? value : null)

const NO_CATEGORY = '__none__'

const taskSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string(),
  category_id: z.string(),
  status: z.enum([...TASK_STATUSES] as [typeof TASK_STATUSES[number], ...typeof TASK_STATUSES[number][]]),
  priority: z.enum([...TASK_PRIORITIES] as [typeof TASK_PRIORITIES[number], ...typeof TASK_PRIORITIES[number][]]),
  due_date: z.string(),
  due_time: z.string(),
  scheduled_date: z.string(),
  scheduled_start: z.string(),
  scheduled_end: z.string(),
})

type TaskFormValues = z.infer<typeof taskSchema>

function toFormValues(task?: Task | null): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    category_id: task?.category_id ?? NO_CATEGORY,
    status: task?.status ?? 'todo',
    priority: task?.priority ?? 'medium',
    due_date: task?.due_date ?? '',
    due_time: task?.due_time ?? '',
    scheduled_date: task?.scheduled_date ?? '',
    scheduled_start: task?.scheduled_start ?? '',
    scheduled_end: task?.scheduled_end ?? '',
  }
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  parentTask,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  parentTask?: Task | null
}) {
  const categories = useDataStore((s) =>
    s.categories.filter((c) => !c.deleted).sort((a, b) => a.sort_order - b.sort_order),
  )
  const addTask = useDataStore((s) => s.addTask)
  const updateTask = useDataStore((s) => s.updateTask)
  const isEdit = Boolean(task)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: toFormValues(task),
    mode: 'onSubmit',
  })

  const handleSubmit = form.handleSubmit((values: TaskFormValues) => {
    const payload: NewTaskInput = {
      title: values.title,
      description: values.description || undefined,
      category_id:
        values.category_id && values.category_id !== NO_CATEGORY
          ? values.category_id
          : null,
      status: values.status,
      priority: values.priority,
      due_date: nullable(values.due_date),
      due_time: nullable(values.due_time),
      scheduled_date: nullable(values.scheduled_date),
      scheduled_start: nullable(values.scheduled_start),
      scheduled_end: nullable(values.scheduled_end),
    }

    if (isEdit && task) {
      updateTask(task.id, payload)
      toast.success('Tarea actualizada')
    } else {
      addTask({ ...payload, parent_id: parentTask?.id ?? null })
      toast.success(parentTask ? 'Sub-tarea creada' : 'Tarea creada')
    }
    onOpenChange(false)
    form.reset()
  })

  const categoryOptions = [
    { value: NO_CATEGORY, label: 'Sin categoría' },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {parentTask
              ? `Nueva sub-tarea de "${parentTask.title}"`
              : isEdit
                ? 'Editar tarea'
                : 'Nueva tarea'}
          </DialogTitle>
          <DialogDescription>
            Completá los datos de la tarea. Todo se guarda localmente y se
            sincroniza en la nube.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Formulario de tarea"
        >
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              autoFocus
              placeholder="¿Qué tenés que hacer?"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Descripción</Label>
            <Textarea
              id="task-description"
              rows={3}
              placeholder="Detalles, notas, contexto…"
              {...form.register('description')}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormSelect
              name="category_id"
              control={form.control}
              label="Categoría"
              options={categoryOptions}
            />
            <FormSelect
              name="status"
              control={form.control}
              label="Estado"
              options={TASK_STATUSES.map((s) => ({
                value: s,
                label: STATUS_LABELS[s],
              }))}
            />
            <FormSelect
              name="priority"
              control={form.control}
              label="Prioridad"
              options={TASK_PRIORITIES.map((p) => ({
                value: p,
                label: PRIORITY_LABELS[p],
              }))}
            />
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="mb-3 text-sm font-medium">Vencimiento</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-due-date">Fecha</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  {...form.register('due_date')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due-time">Hora</Label>
                <Input
                  id="task-due-time"
                  type="time"
                  {...form.register('due_time')}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="mb-3 text-sm font-medium">Agenda (semana / mes)</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-scheduled-date">Día</Label>
                <Input
                  id="task-scheduled-date"
                  type="date"
                  {...form.register('scheduled_date')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-scheduled-start">Desde</Label>
                <Input
                  id="task-scheduled-start"
                  type="time"
                  {...form.register('scheduled_start')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-scheduled-end">Hasta</Label>
                <Input
                  id="task-scheduled-end"
                  type="time"
                  {...form.register('scheduled_end')}
                />
              </div>
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
              {isEdit ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}