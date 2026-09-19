import type { Category, LocalData, PendingOp, TableName, Task } from '@/types'

const dataKey = (user: string) => `pp:data:${user}`
const outboxKey = (user: string) => `pp:outbox:${user}`
const checkpointKey = (user: string, table: string) =>
  `pp:checkpoint:${user}:${table}`

export function saveLocal(userId: string, data: LocalData): void {
  localStorage.setItem(dataKey(userId), JSON.stringify(data))
}

export function loadLocal(userId: string): LocalData | null {
  const raw = localStorage.getItem(dataKey(userId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as LocalData
  } catch {
    return null
  }
}

export function clearLocal(userId: string): void {
  localStorage.removeItem(dataKey(userId))
}

export function readOutbox(userId: string): PendingOp[] {
  const raw = localStorage.getItem(outboxKey(userId))
  if (!raw) return []
  try {
    return JSON.parse(raw) as PendingOp[]
  } catch {
    return []
  }
}

export function enqueueRows(
  userId: string,
  table: TableName,
  rows: Array<Task | Category>,
): void {
  const pending = readOutbox(userId).filter(
    (op) => op.table !== table || !rows.some((r) => r.id === op.id),
  )
  for (const row of rows) {
    pending.push({ id: row.id, table, row, createdAt: Date.now() })
  }
  localStorage.setItem(outboxKey(userId), JSON.stringify(pending))
}

export function dropOutboxOp(userId: string, opId: string): void {
  localStorage.setItem(
    outboxKey(userId),
    JSON.stringify(readOutbox(userId).filter((op) => op.id !== opId)),
  )
}

export function outboxCount(userId: string): number {
  return readOutbox(userId).length
}

export function clearOutbox(userId: string): void {
  localStorage.removeItem(outboxKey(userId))
}

export function saveCheckpoint(
  userId: string,
  table: string,
  iso: string,
): void {
  localStorage.setItem(checkpointKey(userId, table), iso)
}

export function loadCheckpoint(userId: string, table: string): string | null {
  return localStorage.getItem(checkpointKey(userId, table))
}

export function clearCheckpoints(userId: string): void {
  for (const table of ['tasks', 'categories']) {
    localStorage.removeItem(checkpointKey(userId, table))
  }
}
