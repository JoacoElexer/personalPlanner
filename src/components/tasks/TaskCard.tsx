import { AlarmClock, ChevronDown, MoreHorizontal, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SubtaskList } from '@/components/tasks/SubtaskList'
import { PriorityBadge, StatusBadge } from '@/components/tasks/statusBadges'
import { ConfirmDialog } from '@/components/tasks/ConfirmDialog'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { formatDueWithTime } from '@/lib/dateUtils'
import { isOverdue, subtaskProgress } from '@/lib/taskUtils'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/stores/useDataStore'
import type { Task } from '@/types'

export function TaskCard({ task }: { task: Task }) {
  const tasks = useDataStore((s) => s.tasks)
  const categories = useDataStore((s) => s.categories)
  const toggleTaskDone = useDataStore((s) => s.toggleTaskDone)
  const removeTask = useDataStore((s) => s.removeTask)

  const [editOpen, setEditOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const category = categories.find((c) => c.id === task.category_id)
  const done = task.status === 'done'
  const overdue = isOverdue(task)
  const progress = subtaskProgress(tasks, task.id)
  const hasSubtasks = progress.total > 0

  return (
    <Card
      className={cn(
        'group p-3 transition-colors',
        done && 'opacity-70',
        overdue && 'border-red-400/60',
      )}
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          className="mt-0.5"
          checked={done}
          aria-label={`Completar ${task.title}`}
          onCheckedChange={() => {
            toggleTaskDone(task.id)
            toast.success(done ? 'Tarea reactivada' : '¡Tarea completada!')
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className={cn(
                'min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline',
                done && 'text-muted-foreground line-through',
              )}
            >
              {task.title}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                  aria-label={`Acciones de ${task.title}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSubOpen(true)}>
                  Agregar sub-tarea
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {category && (
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="max-w-32 truncate">{category.name}</span>
              </span>
            )}
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.due_date && (
              <span
                className={cn(
                  'flex items-center gap-1',
                  overdue && 'font-medium text-red-600 dark:text-red-400',
                )}
              >
                <AlarmClock className="size-3" />
                {formatDueWithTime(task)}
              </span>
            )}
          </div>

          {(hasSubtasks || task.scheduled_date) && (
            <div className="mt-2">
              {task.scheduled_date && (
                <p className="text-xs text-muted-foreground">
                  Agenda: {task.scheduled_date}
                  {task.scheduled_start && ` ${task.scheduled_start}`}
                  {task.scheduled_end && `–${task.scheduled_end}`}
                </p>
              )}
              {hasSubtasks && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 flex w-full items-center gap-2 text-left"
                >
                  <span className="text-xs text-muted-foreground">
                    {progress.done}/{progress.total} sub-tareas
                  </span>
                  <Progress
                    value={(progress.done / progress.total) * 100}
                    className="h-1.5 flex-1"
                  />
                  <ChevronDown
                    className={cn(
                      'size-4 text-muted-foreground transition-transform',
                      expanded && 'rotate-180',
                    )}
                  />
                </button>
              )}
            </div>
          )}

          {expanded && (
            <div className="mt-2">
              <SubtaskList parentId={task.id} />
              <Button
                variant="ghost"
                size="sm"
                className="ml-7 mt-1 h-7 text-xs"
                onClick={() => setSubOpen(true)}
              >
                <Plus className="size-3.5" />
                Añadir sub-tarea
              </Button>
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <TaskFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          task={task}
        />
      )}
      {subOpen && (
        <TaskFormDialog
          open={subOpen}
          onOpenChange={setSubOpen}
          parentTask={task}
        />
      )}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar tarea?"
        description={`Se eliminará "${task.title}" junto con sus sub-tareas.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          removeTask(task.id)
          toast.success('Tarea eliminada')
        }}
      />
    </Card>
  )
}