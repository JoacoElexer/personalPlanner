import { CheckCheck, ChevronDown, Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BUCKET_LABELS,
  BUCKET_ORDER,
  bucketOf,
  sortTasksByDue,
  toDateKey,
  visibleTasks,
  type TaskBucket,
} from '@/lib/taskUtils'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/stores/useDataStore'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
} from '@/types'

function FilterSelect({
  value,
  onValueChange,
  allLabel,
  options,
}: {
  value: string
  onValueChange: (value: string) => void
  allLabel: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full lg:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function BucketSection({ label, tasks }: { label: string; tasks: Task[] }) {
  if (tasks.length === 0) return null
  return (
    <section>
      <h2 className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-muted-foreground">
        {label}
        <span className="text-xs font-normal">{tasks.length}</span>
      </h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  )
}

export function TasksPage() {
  const tasks = useDataStore((s) => s.tasks)
  const categories = useDataStore((s) =>
    s.categories.filter((c) => !c.deleted),
  )
  const addTask = useDataStore((s) => s.addTask)

  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [quickTitle, setQuickTitle] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return visibleTasks(tasks)
      .filter((t) => t.parent_id === null)
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q),
      )
      .filter((t) => categoryId === 'all' || t.category_id === categoryId)
      .filter((t) => status === 'all' || t.status === status)
      .filter((t) => priority === 'all' || t.priority === priority)
  }, [tasks, query, categoryId, status, priority])

  const groups = useMemo(() => {
    const buckets = Object.fromEntries(
      BUCKET_ORDER.map((b) => [b, [] as Task[]]),
    ) as Record<TaskBucket, Task[]>
    const done: Task[] = []
    for (const task of filtered) {
      const bucket = bucketOf(task)
      if (bucket === 'done') done.push(task)
      else buckets[bucket].push(task)
    }
    for (const key of BUCKET_ORDER) buckets[key].sort(sortTasksByDue)
    return { buckets, done: done.sort(sortTasksByDue) }
  }, [filtered])

  const handleQuickAdd = (event: FormEvent) => {
    event.preventDefault()
    const title = quickTitle.trim()
    if (!title) return
    addTask({ title, due_date: toDateKey(new Date()) })
    setQuickTitle('')
    toast.success('Tarea creada para hoy')
  }

  return (
    <div>
      <PageHeader
        title="Tareas"
        description="Responsabilidades, estados, prioridades y sub-tareas."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nueva tarea
          </Button>
        }
      />

      <form onSubmit={handleQuickAdd} className="mb-4 flex gap-2">
        <Input
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Agregá una tarea rápida para hoy…"
          aria-label="Nueva tarea rápida"
        />
        <Button type="submit" variant="secondary">
          Agregar
        </Button>
      </form>

      <Card className="mb-5 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tareas…"
            className="pl-9"
          />
        </div>
        <FilterSelect
          value={categoryId}
          onValueChange={setCategoryId}
          allLabel="Todas las categorías"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <FilterSelect
          value={status}
          onValueChange={setStatus}
          allLabel="Todos los estados"
          options={TASK_STATUSES.map((s) => ({
            value: s,
            label: STATUS_LABELS[s],
          }))}
        />
        <FilterSelect
          value={priority}
          onValueChange={setPriority}
          allLabel="Todas las prioridades"
          options={TASK_PRIORITIES.map((p) => ({
            value: p,
            label: PRIORITY_LABELS[p],
          }))}
        />
      </Card>

      <div className="space-y-6">
        {BUCKET_ORDER.filter((b) => b !== 'done').map((bucket) => (
          <BucketSection
            key={bucket}
            label={BUCKET_LABELS[bucket]}
            tasks={groups.buckets[bucket]}
          />
        ))}

        {groups.done.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setShowDone((v) => !v)}
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground"
            >
              <CheckCheck className="size-4" />
              {BUCKET_LABELS.done}
              <span className="text-xs font-normal">{groups.done.length}</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  showDone && 'rotate-180',
                )}
              />
            </button>
            {showDone && (
              <div className="space-y-2">
                {groups.done.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>
        )}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No hay tareas que coincidan con los filtros.
          </p>
        )}
      </div>

      <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default TasksPage