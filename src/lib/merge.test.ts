import { describe, expect, it } from 'vitest'
import { mergeRows } from './merge'

function row(id: string, updatedAt: string) {
  return { id, updated_at: updatedAt }
}

describe('mergeRows (last-write-wins)', () => {
  it('agrega filas remotas nuevas', () => {
    const merged = mergeRows([], [row('a', '2026-01-02T00:00:00.000Z')])
    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({ id: 'a' })
  })

  it('remoto más nuevo reemplaza al local', () => {
    const merged = mergeRows(
      [row('a', '2026-01-01T00:00:00.000Z')],
      [row('a', '2026-01-02T00:00:00.000Z')],
    )
    expect(merged[0].updated_at).toBe('2026-01-02T00:00:00.000Z')
  })

  it('local más nuevo se conserva', () => {
    const merged = mergeRows(
      [row('a', '2026-01-03T00:00:00.000Z')],
      [row('a', '2026-01-02T00:00:00.000Z')],
    )
    expect(merged[0]).toMatchObject({
      id: 'a',
      updated_at: '2026-01-03T00:00:00.000Z',
    })
  })

  it('no pierde filas locales no tocadas remoto', () => {
    const merged = mergeRows(
      [row('local', '2026-01-01T00:00:00.000Z')],
      [row('remote', '2026-01-02T00:00:00.000Z')],
    )
    expect(merged.map((r) => r.id).sort()).toEqual(['local', 'remote'])
  })
})
