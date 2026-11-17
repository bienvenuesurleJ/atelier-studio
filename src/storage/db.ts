import type { StudioState } from '../domain/types'
import { emptyState, normalizeState } from './backup'

const DB_NAME = 'atelier-local'
const STORE = 'kv'
const KEY = 'state'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function idbGet(): Promise<StudioState | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const request = tx.objectStore(STORE).get(KEY)
    request.onsuccess = () => resolve((request.result as StudioState | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
}

async function idbSet(state: StudioState): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(state, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadState(): Promise<StudioState> {
  try {
    const stored = await idbGet()
    if (stored) return normalizeState(stored)
  } catch {
    /* IndexedDB indisponible : on repart d’un état vide plutôt que d’inventer une sauvegarde. */
  }
  return emptyState()
}

export async function saveState(state: StudioState): Promise<void> {
  await idbSet(state)
}
