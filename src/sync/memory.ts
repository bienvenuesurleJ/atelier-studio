export interface MemorySide {
  stamps: Record<string, string>
  tombstones: Record<string, string>
  seen: Record<string, string>
}

export interface SyncMeta {
  boundUserId: string | null
  studio: MemorySide
  films: MemorySide
  lastSyncAt: string | null
}

export interface StampItem {
  key: string
  updatedAt?: string
  json: string
}

export function emptySide(): MemorySide {
  return { stamps: {}, tombstones: {}, seen: {} }
}

export function emptyMeta(): SyncMeta {
  return { boundUserId: null, studio: emptySide(), films: emptySide(), lastSyncAt: null }
}

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

export function absorbSide(previous: MemorySide, items: StampItem[], now: string): MemorySide {
  const stamps: Record<string, string> = {}
  const seen: Record<string, string> = {}
  const tombstones: Record<string, string> = { ...previous.tombstones }
  for (const item of items) {
    seen[item.key] = item.json
    const known = Object.prototype.hasOwnProperty.call(previous.seen, item.key)
    const unchanged = known && previous.seen[item.key] === item.json
    const stamp = item.updatedAt || (unchanged || !known ? previous.stamps[item.key] || '' : now)
    stamps[item.key] = stamp
    const buried = tombstones[item.key]
    if (buried && stamp > buried) delete tombstones[item.key]
  }
  for (const key of Object.keys(previous.seen)) {
    if (key === 'settings' || seen[key]) continue
    tombstones[key] = previous.tombstones[key] || now
  }
  return { stamps, tombstones, seen }
}
