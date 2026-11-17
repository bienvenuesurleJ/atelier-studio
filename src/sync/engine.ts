import type { StudioState } from '@/domain/types'
import { emptyState } from '@/storage/backup'
import type { FilmLibrary } from '@/video/model'
import { absorbSide, canonicalJson, emptyMeta, type SyncMeta } from './memory'
import { collectRefs, extractMedia, restoreMedia, type ExtractedFile } from './media'
import { filmItems, studioItems } from './items'
import { mergeFilms, mergeStudio, parseFilmsEnvelope, parseStudioEnvelope, type FileCatalogEntry, type FilmsEnvelope, type StudioEnvelope } from './merge'
import type { SyncBackend } from './backend'

export interface SyncInput {
  backend: SyncBackend
  userId: string
  studio: StudioState
  films: FilmLibrary
  meta: SyncMeta
  online: boolean
}

export interface SyncOutput {
  studio: StudioState
  films: FilmLibrary
  meta: SyncMeta
  changedStudio: boolean
  changedFilms: boolean
  replacedAccount: boolean
  files: { hash: string; name: string; mime: string; bytes: number }[]
  storageBytes: number
  remoteUpdatedAt: string | null
  offline: boolean
}

export async function synchronize(input: SyncInput): Promise<SyncOutput> {
  const base = {
    studio: input.studio,
    films: input.films,
    meta: input.meta,
    changedStudio: false,
    changedFilms: false,
    replacedAccount: false,
    files: [] as SyncOutput['files'],
    storageBytes: 0,
    remoteUpdatedAt: null as string | null,
    offline: !input.online,
  }
  if (!input.online) return base
  const remoteStudioDoc = await input.backend.fetchDocument('studio')
  const remoteFilmsDoc = await input.backend.fetchDocument('films')
  const remoteStudio = remoteStudioDoc ? parseStudioEnvelope(remoteStudioDoc.payload) : null
  const remoteFilms = remoteFilmsDoc ? parseFilmsEnvelope(remoteFilmsDoc.payload) : null
  const now = new Date().toISOString()
  const switched = Boolean(input.meta.boundUserId && input.meta.boundUserId !== input.userId)
  const localStudio = switched ? emptyState() : input.studio
  const localFilms = switched ? { version: 1 as const, films: [] } : input.films
  const localMeta = switched ? { ...emptyMeta(), boundUserId: input.userId } : input.meta
  const studioSide = absorbSide(localMeta.studio, studioItems(localStudio), now)
  const filmsSide = absorbSide(localMeta.films, filmItems(localFilms), now)
  const mergedStudio = mergeStudio(localStudio, studioSide, remoteStudio)
  const mergedFilms = mergeFilms(localFilms, filmsSide, remoteFilms)
  const studioMedia = await extractMedia(mergedStudio.state)
  const filmsMedia = await extractMedia(mergedFilms.library)
  const uploads = new Map<string, ExtractedFile>()
  for (const file of [...studioMedia.files, ...filmsMedia.files]) uploads.set(file.hash, file)
  const catalog = { ...(remoteStudio?.files ?? {}), ...(remoteFilms?.files ?? {}) }
  for (const file of uploads.values()) {
    if (catalog[file.hash]) continue
    await input.backend.uploadFile(file)
    catalog[file.hash] = { mime: file.mime, name: file.name, bytes: file.bytes.byteLength }
  }
  const owned = new Map<string, { mime: string; bytes: Uint8Array }>()
  for (const file of uploads.values()) owned.set(file.hash, file)
  const needed = new Set<string>([...collectRefs(studioMedia.value), ...collectRefs(filmsMedia.value)])
  for (const hash of needed) {
    if (owned.has(hash)) continue
    const bytes = await input.backend.downloadFile(hash)
    if (!bytes) continue
    owned.set(hash, { mime: catalog[hash]?.mime ?? 'application/octet-stream', bytes })
  }
  const studio = restoreMedia(studioMedia.value, owned) as StudioState
  const films = restoreMedia(filmsMedia.value, owned) as FilmLibrary
  const studioEnvelope: StudioEnvelope = {
    version: 1,
    state: studioMedia.value as StudioState,
    stamps: mergedStudio.side.stamps,
    tombstones: mergedStudio.side.tombstones,
    files: catalogFor(studioMedia.value, catalog),
  }
  const filmsEnvelope: FilmsEnvelope = {
    version: 1,
    library: filmsMedia.value as FilmLibrary,
    stamps: mergedFilms.side.stamps,
    tombstones: mergedFilms.side.tombstones,
    files: catalogFor(filmsMedia.value, catalog),
  }
  let remoteUpdatedAt = remoteStudioDoc?.updatedAt ?? remoteFilmsDoc?.updatedAt ?? null
  if (!samePayload(remoteStudio, studioEnvelope)) remoteUpdatedAt = await input.backend.saveDocument('studio', studioEnvelope)
  if (!samePayload(remoteFilms, filmsEnvelope)) {
    const written = await input.backend.saveDocument('films', filmsEnvelope)
    if (!remoteUpdatedAt || written > remoteUpdatedAt) remoteUpdatedAt = written
  }
  const files = await input.backend.listFiles()
  return {
    studio,
    films,
    meta: {
      boundUserId: input.userId,
      studio: { ...mergedStudio.side, seen: itemSeen(studio) },
      films: { ...mergedFilms.side, seen: filmSeen(films) },
      lastSyncAt: new Date().toISOString(),
    },
    changedStudio: canonicalJson(studio) !== canonicalJson(input.studio),
    changedFilms: canonicalJson(films) !== canonicalJson(input.films),
    replacedAccount: switched,
    files: files.map((file) => ({ hash: file.hash, name: file.name, mime: file.mime, bytes: file.bytes })),
    storageBytes: files.reduce((sum, file) => sum + file.bytes, 0),
    remoteUpdatedAt,
    offline: false,
  }
}

function samePayload(remote: { stamps: Record<string, string>; tombstones: Record<string, string> } | null, next: unknown): boolean {
  if (!remote) return false
  return canonicalJson(remote) === canonicalJson(next)
}

function catalogFor(value: unknown, catalog: Record<string, FileCatalogEntry>): Record<string, FileCatalogEntry> {
  const next: Record<string, FileCatalogEntry> = {}
  for (const hash of collectRefs(value)) {
    if (catalog[hash]) next[hash] = catalog[hash]
  }
  return next
}

function itemSeen(state: StudioState): Record<string, string> {
  const seen: Record<string, string> = {}
  for (const project of state.projects) seen[`project:${project.id}`] = canonicalJson(project)
  for (const prospect of state.prospects) seen[`prospect:${prospect.id}`] = canonicalJson(prospect)
  for (const quote of state.quotes) seen[`quote:${quote.id}`] = canonicalJson(quote)
  for (const plan of state.plans) seen[`plan:${plan.id}`] = canonicalJson(plan)
  seen.settings = canonicalJson({ agency: state.agency, rates: state.rates, checklist: state.checklist })
  return seen
}

function filmSeen(library: FilmLibrary): Record<string, string> {
  return Object.fromEntries(library.films.map((film) => [`film:${film.id}`, canonicalJson(film)]))
}
