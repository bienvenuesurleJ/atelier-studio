import type { FilmLibrary } from '@/video/model'
import { emptyLibrary } from '@/video/model'
import type { StudioState } from '@/domain/types'
import { normalizeState } from '@/storage/backup'
import { canonicalJson, type MemorySide } from './memory'

export interface FileCatalogEntry {
  mime: string
  name: string
  bytes: number
}

export interface StudioEnvelope {
  version: 1
  state: StudioState
  stamps: Record<string, string>
  tombstones: Record<string, string>
  files: Record<string, FileCatalogEntry>
}

export interface FilmsEnvelope {
  version: 1
  library: FilmLibrary
  stamps: Record<string, string>
  tombstones: Record<string, string>
  files: Record<string, FileCatalogEntry>
}

interface Listed<T> {
  id: string
  stamp: string
  item: T
}

export function mergeStudio(
  local: StudioState,
  localSide: MemorySide,
  remote: StudioEnvelope | null,
): { state: StudioState; side: MemorySide } {
  const remoteSide = remote?.stamps ? { stamps: remote.stamps, tombstones: remote.tombstones, seen: {} } : { stamps: {}, tombstones: {}, seen: {} }
  const tombstones = mergeTombstones(localSide.tombstones, remoteSide.tombstones)
  const projects = mergeList(local.projects, remote?.state.projects ?? [], 'project', localSide.stamps, remoteSide.stamps, tombstones, (item) => item.updatedAt)
  const prospects = mergeList(local.prospects, remote?.state.prospects ?? [], 'prospect', localSide.stamps, remoteSide.stamps, tombstones, (item) => item.updatedAt)
  const quotes = mergeList(local.quotes, remote?.state.quotes ?? [], 'quote', localSide.stamps, remoteSide.stamps, tombstones)
  const plans = mergeList(local.plans, remote?.state.plans ?? [], 'plan', localSide.stamps, remoteSide.stamps, tombstones)
  const settings = pickSettings(local, localSide, remote)
  const stamps = { ...projects.stamps, ...prospects.stamps, ...quotes.stamps, ...plans.stamps, settings: settings.stamp }
  const state = normalizeState({
    ...local,
    projects: projects.items,
    prospects: prospects.items,
    quotes: quotes.items,
    plans: plans.items,
    agency: settings.agency,
    rates: settings.rates,
    checklist: settings.checklist,
  })
  return { state, side: { stamps, tombstones, seen: localSide.seen } }
}

export function mergeFilms(
  local: FilmLibrary,
  localSide: MemorySide,
  remote: FilmsEnvelope | null,
): { library: FilmLibrary; side: MemorySide } {
  const remoteSide = remote ? { stamps: remote.stamps, tombstones: remote.tombstones } : { stamps: {}, tombstones: {} }
  const tombstones = mergeTombstones(localSide.tombstones, remoteSide.tombstones)
  const films = mergeList(local.films ?? [], remote?.library.films ?? [], 'film', localSide.stamps, remoteSide.stamps, tombstones, (item) => item.updatedAt)
  return {
    library: { version: 1, films: films.items },
    side: { stamps: films.stamps, tombstones, seen: localSide.seen },
  }
}

export function parseStudioEnvelope(payload: unknown): StudioEnvelope | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Partial<StudioEnvelope> & { projects?: unknown }
  const state = record.state && typeof record.state === 'object' ? record.state : (Array.isArray(record.projects) ? (payload as StudioState) : null)
  if (!state) return null
  return {
    version: 1,
    state: normalizeState(state),
    stamps: record.stamps && typeof record.stamps === 'object' ? record.stamps : {},
    tombstones: record.tombstones && typeof record.tombstones === 'object' ? record.tombstones : {},
    files: record.files && typeof record.files === 'object' ? record.files : {},
  }
}

export function parseFilmsEnvelope(payload: unknown): FilmsEnvelope | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Partial<FilmsEnvelope> & { films?: unknown }
  const library = record.library && typeof record.library === 'object' ? record.library : (Array.isArray(record.films) ? (payload as FilmLibrary) : null)
  if (!library || !Array.isArray(library.films)) return null
  return {
    version: 1,
    library: { version: 1, films: library.films },
    stamps: record.stamps && typeof record.stamps === 'object' ? record.stamps : {},
    tombstones: record.tombstones && typeof record.tombstones === 'object' ? record.tombstones : {},
    files: record.files && typeof record.files === 'object' ? record.files : {},
  }
}

export function emptyFilmsEnvelope(): FilmsEnvelope {
  return { version: 1, library: emptyLibrary(), stamps: {}, tombstones: {}, files: {} }
}

function mergeList<T extends { id: string }>(
  local: T[],
  remote: T[],
  prefix: string,
  localStamps: Record<string, string>,
  remoteStamps: Record<string, string>,
  tombstones: Record<string, string>,
  updatedAt?: (item: T) => string | undefined,
): { items: T[]; stamps: Record<string, string> } {
  const localMap = new Map(local.map((item) => [item.id, item]))
  const remoteMap = new Map(remote.map((item) => [item.id, item]))
  const order = [...local.map((item) => item.id), ...remote.map((item) => item.id).filter((id) => !localMap.has(id))]
  const items: T[] = []
  const stamps: Record<string, string> = {}
  for (const id of order) {
    const key = `${prefix}:${id}`
    const left = listed(localMap.get(id), key, localStamps, updatedAt)
    const right = listed(remoteMap.get(id), key, remoteStamps, updatedAt)
    const winner = later(left, right)
    const buried = tombstones[key]
    if (!winner || (buried && winner.stamp <= buried)) continue
    items.push(winner.item)
    stamps[key] = winner.stamp
  }
  return { items, stamps }
}

function listed<T>(item: T | undefined, key: string, stamps: Record<string, string>, updatedAt?: (item: T) => string | undefined): Listed<T> | null {
  if (!item) return null
  return { id: key, stamp: updatedAt?.(item) || stamps[key] || '', item }
}

function later<T>(left: Listed<T> | null, right: Listed<T> | null): Listed<T> | null {
  if (!left) return right
  if (!right) return left
  return right.stamp > left.stamp ? right : left
}

function mergeTombstones(local: Record<string, string>, remote: Record<string, string>): Record<string, string> {
  const keys = new Set([...Object.keys(local), ...Object.keys(remote)])
  const next: Record<string, string> = {}
  for (const key of keys) next[key] = (local[key] || '') > (remote[key] || '') ? local[key] : remote[key] || local[key]
  return next
}

function pickSettings(local: StudioState, localSide: MemorySide, remote: StudioEnvelope | null): { agency: StudioState['agency']; rates: StudioState['rates']; checklist: StudioState['checklist']; stamp: string } {
  const localStamp = localSide.stamps.settings || ''
  const remoteStamp = remote?.stamps.settings || ''
  const chosen = remote && remoteStamp > localStamp ? remote.state : local
  return { agency: chosen.agency, rates: chosen.rates, checklist: chosen.checklist, stamp: remoteStamp > localStamp ? remoteStamp : localStamp }
}

export function settingsSnapshot(state: StudioState): string {
  return canonicalJson({ agency: state.agency, rates: state.rates, checklist: state.checklist })
}
