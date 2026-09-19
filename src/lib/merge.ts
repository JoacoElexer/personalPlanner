import { isAfter, parseISO } from 'date-fns'

export interface Mergeable {
  id: string
  updated_at: string
}

export function mergeRows<T extends Mergeable>(locals: T[], remotes: T[]): T[] {
  const byId = new Map(locals.map((row) => [row.id, row]))
  for (const remote of remotes) {
    const local = byId.get(remote.id)
    if (
      !local ||
      isAfter(parseISO(remote.updated_at), parseISO(local.updated_at))
    ) {
      byId.set(remote.id, remote)
    }
  }
  return Array.from(byId.values())
}
