import { emptyLibrary, type Film, type FilmLibrary } from './model'

const DB = 'atelier-video'
const STORE = 'kv'
const KEY = 'library'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadFilms(): Promise<FilmLibrary> {
  try {
    const db = await openDb()
    const stored = await new Promise<FilmLibrary | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const request = tx.objectStore(STORE).get(KEY)
      request.onsuccess = () => resolve(request.result as FilmLibrary | undefined)
      request.onerror = () => reject(request.error)
    })
    if (stored && Array.isArray(stored.films)) return { version: 1, films: stored.films }
  } catch {
    /* base vide si IndexedDB est indisponible */
  }
  return emptyLibrary()
}

export async function saveFilms(library: FilmLibrary): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(library, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export function touchFilm(film: Film): Film {
  return { ...film, updatedAt: new Date().toISOString() }
}
