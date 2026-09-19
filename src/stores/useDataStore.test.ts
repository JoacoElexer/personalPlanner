import type { User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it } from 'vitest'
import { readOutbox } from '@/lib/persistence'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDataStore } from '@/stores/useDataStore'

const fakeUser = { id: 'u1', email: 'a@b.c' } as unknown as User

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({
    user: fakeUser,
    session: null,
    initialized: true,
  })
  useDataStore.setState({ tasks: [], categories: [] })
})

describe('useDataStore', () => {
  it('crea una tarea con usuario y la encola para sincronizar', () => {
    const store = useDataStore.getState()
    const task = store.addTask({ title: 'Comprar pan' })

    expect(task).not.toBeNull()
    expect(task).toMatchObject({
      title: 'Comprar pan',
      user_id: 'u1',
      status: 'todo',
      priority: 'medium',
    })

    const outbox = readOutbox('u1')
    expect(outbox).toHaveLength(1)
    expect(outbox[0]).toMatchObject({ table: 'tasks', id: task!.id })
  })

  it('alterna una tarea entre completada y pendiente', () => {
    const task = useDataStore.getState().addTask({ title: 'Estudiar' })!

    useDataStore.getState().toggleTaskDone(task.id)
    let current = useDataStore.getState().tasks[0]
    expect(current.status).toBe('done')
    expect(current.completed_at).not.toBeNull()

    useDataStore.getState().toggleTaskDone(task.id)
    current = useDataStore.getState().tasks[0]
    expect(current.status).toBe('todo')
    expect(current.completed_at).toBeNull()
  })

  it('agrega sub-tareas y las elimina en cascada', () => {
    const parent = useDataStore.getState().addTask({ title: 'Proyecto' })!
    const child = useDataStore
      .getState()
      .addTask({ title: 'Sub-paso', parent_id: parent.id })!

    let tasks = useDataStore.getState().tasks
    expect(tasks.find((t) => t.id === child.id)?.parent_id).toBe(parent.id)

    useDataStore.getState().removeTask(parent.id)
    tasks = useDataStore.getState().tasks
    expect(tasks.find((t) => t.id === parent.id)?.deleted).toBe(true)
    expect(tasks.find((t) => t.id === child.id)?.deleted).toBe(true)
  })

  it('el outbox coalesce actualizaciones de la misma tarea', () => {
    const task = useDataStore.getState().addTask({ title: 'Tarea' })!
    useDataStore.getState().updateTask(task.id, { priority: 'high' })

    const outbox = readOutbox('u1')
    expect(outbox).toHaveLength(1)
    expect(outbox[0].row).toMatchObject({ id: task.id, priority: 'high' })
  })

  it('persiste localmente y revive los datos al hidratar', () => {
    useDataStore.getState().addTask({ title: 'Tarea persistida' })

    useDataStore.setState({ tasks: [], categories: [] })
    useDataStore.getState().hydrate('u1')

    const tasks = useDataStore.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Tarea persistida')
  })
})
