import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { subtasksOf } from '@/lib/taskUtils'
import { useDataStore } from '@/stores/useDataStore'

export function SubtaskList({ parentId }: { parentId: string }) {
  const tasks = useDataStore((s) => s.tasks)
  const toggleSubtaskDone = useDataStore((s) => s.toggleSubtaskDone)
  const removeTask = useDataStore((s) => s.removeTask)
  const subtasks = subtasksOf(tasks, parentId)

  if (subtasks.length === 0) return null

  return (
    <ul className="space-y-1.5 pl-7 pt-1">
      {subtasks.map((sub) => {
        const done = sub.status === 'done'
        return (
          <li key={sub.id} className="group flex items-center gap-2.5">
            <Checkbox
              id={`sub-${sub.id}`}
              checked={done}
              onCheckedChange={() => toggleSubtaskDone(parentId, sub.id)}
            />
            <label
              htmlFor={`sub-${sub.id}`}
              className={cn(
                'flex-1 cursor-pointer text-sm',
                done && 'text-muted-foreground line-through',
              )}
            >
              {sub.title}
            </label>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 sm:opacity-0"
              onClick={() => {
                removeTask(sub.id)
                toast.success('Sub-tarea eliminada')
              }}
              aria-label={`Eliminar sub-tarea ${sub.title}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        )
      })}
    </ul>
  )
}