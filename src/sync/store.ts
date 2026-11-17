import type { StudioState } from '@/domain/types'
import type { FilmLibrary } from '@/video/model'
import { filmItems, studioItems } from './items'
import { absorbSide, emptyMeta, type SyncMeta } from './memory'

const DB_NAME = 'atelier-local'
const STORE = 'kv'
const KEY = 'sync-meta'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadMeta(): Promise<SyncMeta> {
  try {
    const db = await openDb()
    const stored = await new Promise<SyncMeta | undefined>((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY)
      request.onsuccess = () => resolve(request.result as SyncMeta | undefined)
      request.onerror = () => reject(request.error)
    })
    if (stored?.studio && stored.films) return stored
  } catch {
    /* on continue avec une mémoire vide */
  }
  return emptyMeta()
}

export async function saveMeta(meta: SyncMeta): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(meta, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

let chain: Promise<unknown> = Promise.resolve()

function enqueue(task: () => Promise<void>): Promise<void> {
  const run = chain.then(task, task)
  chain = run.then(() => undefined, () => undefined)
  return run
}

export function recordStudio(state: StudioState): Promise<void> {
  return enqueue(async () => {
    const meta = await loadMeta()
    meta.studio = absorbSide(meta.studio, studioItems(state), new Date().toISOString())
    await saveMeta(meta)
  })
}

export function recordFilms(library: FilmLibrary): Promise<void> {
  return enqueue(async () => {
    const meta = await loadMeta()
    meta.films = absorbSide(meta.films, filmItems(library), new Date().toISOString())
    await saveMeta(meta)
  })
}
