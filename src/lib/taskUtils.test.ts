import { describe, expect, it } from 'vitest'
import {
  bucketOf,
  descendantsTaskIds,
  isOverdue,
  sortTasksByDue,
  subtaskProgress,
  subtasksOf,
  toDateKey,
} from '@/lib/taskUtils'
import type { Task } from '@/types'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    user_id: 'user-1',
    parent_id: null,
    category_id: null,
    title: 'Tarea',
    description: null,
    status: 'todo',
    priority: 'medium',
    due_date: null,
    due_time: null,
    scheduled_date: null,
    scheduled_start: null,
    scheduled_end: null,
    completed_at: null,
    created_at: '2026-09-18T10:00:00.000Z',
    updated_at: '2026-09-18T10:00:00.000Z',
    deleted: false,
    ...overrides,
  }
}

const ref = new Date(2026, 8, 18, 12, 0, 0)

describe('bucketOf', () => {
  it('marca done las tareas completadas', () => {
    expect(bucketOf(makeTask({ status: 'done', due_date: '2026-09-10' }), ref)).toBe('done')
  })

  it('quiebra en overdue / today / upcoming / later / no_date', () => {
    expect(bucketOf(makeTask({ due_date: '2026-09-17' }), ref)).toBe('overdue')
    expect(bucketOf(makeTask({ due_date: '2026-09-18' }), ref)).toBe('today')
    expect(bucketOf(makeTask({ due_date: '2026-09-25' }), ref)).toBe('upcoming')
    expect(bucketOf(makeTask({ due_date: '2026-10-19' }), ref)).toBe('later')
    expect(bucketOf(makeTask({}), ref)).toBe('no_date')
  })
})

describe('toDateKey', () => {
  it('formatea la fecha con ceros', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('isOverdue', () => {
  it('negativo sin fecha o completada', () => {
    expect(isOverdue(makeTask({}), ref)).toBe(false)
    expect(isOverdue(makeTask({ status: 'done', due_date: '2026-09-10' }), ref)).toBe(false)
  })

  it('toma el final del día sin hora', () => {
    expect(isOverdue(makeTask({ due_date: '2026-09-18' }), ref)).toBe(false)
  })

  it('respeta la hora cuando existe', () => {
    expect(
      isOverdue(makeTask({ due_date: '2026-09-18', due_time: '09:00' }), ref),
    ).toBe(true)
  })
})

describe('subtasks', () => {
  const parent = makeTask({ id: 'p1', title: 'Padre' })
  const sub1 = makeTask({
    id: 's1',
    parent_id: 'p1',
    title: 'Sub 1',
    status: 'done',
  })
  const sub2 = makeTask({ id: 's2', parent_id: 'p1', title: 'Sub 2' })
  const nested = makeTask({
    id: 's3',
    parent_id: 's1',
    title: 'Sub 3',
    deleted: true,
  })

  it('solo lista sub-tareas activas', () => {
    expect(subtasksOf([parent, sub1, sub2, nested], 'p1').map((t) => t.id)).toEqual([
      's1',
      's2',
    ])
  })

  it('calcula progreso de sub-tareas', () => {
    expect(subtaskProgress([parent, sub1, sub2], 'p1')).toEqual({
      total: 2,
      done: 1,
    })
  })

  it('recorre descendientes hasta la raíz', () => {
    expect(descendantsTaskIds([parent, sub1, sub2, nested], 'p1').sort()).toEqual([
      's1',
      's2',
      's3',
    ])
  })
})

describe('sortTasksByDue', () => {
  it('ordena por fecha y luego por título', () => {
    const a = makeTask({ id: 'a', due_date: '2026-09-19', title: 'Beta' })
    const b = makeTask({ id: 'b', due_date: '2026-09-18', title: 'Alfa' })
    const c = makeTask({ id: 'c', due_date: '2026-09-19', title: 'Alfa' })
    expect([a, b].sort(sortTasksByDue).map((t) => t.id)).toEqual(['b', 'a'])
    expect([a, c].sort(sortTasksByDue).map((t) => t.id)).toEqual(['c', 'a'])
  })

  it('deja las tareas sin fecha al final', () => {
    const a = makeTask({ id: 'a', title: 'Sin fecha' })
    const b = makeTask({ id: 'b', due_date: '2026-09-18', title: 'Con fecha' })
    expect([a, b].sort(sortTasksByDue).map((t) => t.id)).toEqual(['b', 'a'])
  })
})