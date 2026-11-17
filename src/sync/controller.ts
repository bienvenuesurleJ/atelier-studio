import { toast } from 'sonner'
import type { StudioState } from '@/domain/types'
import { loadState } from '@/storage/db'
import { loadFilms } from '@/video/db'
import type { FilmLibrary } from '@/video/model'
import type { SyncBackend } from './backend'
import { authRedirectTo, browserConfigSource, clearStoredConfig, explainConfig, readSupabaseConfig, writeStoredConfig } from './config'
import { synchronize } from './engine'
import { loadMeta, saveMeta } from './store'
import { createSupabaseBackend } from './supabaseBackend'

export interface SyncFileInfo {
  hash: string
  name: string
  mime: string
  bytes: number
}

export type SyncPhase = 'local' | 'signed-out' | 'offline' | 'syncing' | 'synced' | 'error' | 'preview'

export interface SyncStatus {
  phase: SyncPhase
  detail: string
  email: string
  lastSyncAt: string | null
  storageBytes: number
  fileCount: number
  files: SyncFileInfo[]
  configured: boolean
  online: boolean
}

type SyncEvent =
  | { type: 'studio'; studio: StudioState }
  | { type: 'films'; films: FilmLibrary }
  | { type: 'status'; status: SyncStatus }

const listeners = new Set<(event: SyncEvent) => void>()
let status: SyncStatus = localStatus()
let backend: SyncBackend | null = null
let backendKey = ''
let timer = 0
let running = false
let again = false
let started = false

export function subscribeSync(listener: (event: SyncEvent) => void): () => void {
  listeners.add(listener)
  listener({ type: 'status', status })
  return () => listeners.delete(listener)
}

export function syncStatus(): SyncStatus {
  return status
}

export function startSync(): void {
  if (started || typeof window === 'undefined') return
  started = true
  if (previewRequested()) {
    publish(previewStatus())
    return
  }
  window.addEventListener('online', () => queueSync())
  window.addEventListener('offline', () => queueSync())
  window.addEventListener('focus', () => queueSync())
  const config = readSupabaseConfig(browserConfigSource())
  if (config) ensureBackend(config)
  queueSync()
}

export function queueSync(): void {
  if (typeof window === 'undefined' || previewRequested()) return
  window.clearTimeout(timer)
  timer = window.setTimeout(() => void run(), 700)
}

export async function syncNow(): Promise<void> {
  if (previewRequested()) return
  window.clearTimeout(timer)
  await run()
}

export function saveSyncConfig(url: string, anonKey: string): void {
  const problem = explainConfig(url, anonKey)
  if (problem) throw new Error(problem)
  writeStoredConfig(url, anonKey)
  backend = null
  backendKey = ''
  if (!previewRequested()) ensureBackend(readSupabaseConfig(browserConfigSource())!)
  queueSync()
}

export function forgetSyncConfig(): void {
  clearStoredConfig()
  backend = null
  backendKey = ''
  queueSync()
}

export async function signIn(email: string, password: string): Promise<void> {
  await requiredBackend().signInPassword(email.trim(), password)
  await syncNow()
}

export async function signUp(email: string, password: string): Promise<string> {
  const message = await requiredBackend().signUpPassword(email.trim(), password)
  if (!message) await syncNow()
  return message
}

export async function sendMagicLink(email: string): Promise<void> {
  const redirectTo = authRedirectTo(window.location.origin, import.meta.env.BASE_URL)
  await requiredBackend().sendMagicLink(email.trim(), redirectTo)
}

export async function signOut(): Promise<void> {
  if (!backend) return
  await backend.signOut()
  publish({ ...status, phase: 'signed-out', email: '', detail: 'Déconnecté. Les fichiers restent sur cet appareil.' })
}

function requiredBackend(): SyncBackend {
  const config = readSupabaseConfig(browserConfigSource())
  if (!config) throw new Error('Indiquez d’abord l’adresse du projet et la clé anon.')
  return ensureBackend(config)
}

function ensureBackend(config: { url: string; anonKey: string }): SyncBackend {
  const key = `${config.url} ${config.anonKey}`
  if (!backend || backendKey !== key) {
    const redirectTo = authRedirectTo(window.location.origin, import.meta.env.BASE_URL)
    backend = createSupabaseBackend(config.url, config.anonKey, redirectTo)
    backendKey = key
    stripAuthQuery()
  }
  return backend
}

async function run(): Promise<void> {
  if (running) {
    again = true
    return
  }
  running = true
  try {
    await perform()
  } finally {
    running = false
    if (again) {
      again = false
      queueSync()
    }
  }
}

async function perform(): Promise<void> {
  const config = readSupabaseConfig(browserConfigSource())
  if (!config) {
    publish(localStatus())
    return
  }
  const online = navigator.onLine
  if (!online) {
    publish({ ...status, phase: 'offline', configured: true, online: false, detail: 'Hors ligne. Les modifications restent dans ce navigateur.' })
    return
  }
  const active = ensureBackend(config)
  const user = await active.currentUser()
  if (!user) {
    publish({ ...status, phase: 'signed-out', configured: true, online: true, email: '', detail: 'Connectez-vous pour envoyer les données vers vos autres appareils.' })
    return
  }
  publish({ ...status, phase: 'syncing', configured: true, online: true, email: user.email, detail: 'Envoi et réception en cours.' })
  try {
    const outcome = await synchronize({
      backend: active,
      userId: user.id,
      studio: await loadState(),
      films: await loadFilms(),
      meta: await loadMeta(),
      online: true,
    })
    await saveMeta(outcome.meta)
    if (outcome.changedStudio) emit({ type: 'studio', studio: outcome.studio })
    if (outcome.changedFilms) emit({ type: 'films', films: outcome.films })
    if (outcome.replacedAccount) toast.message('Ce navigateur était lié à un autre compte. Les données affichées sont celles du compte connecté.')
    publish({
      phase: 'synced',
      detail: 'À jour.',
      email: user.email,
      lastSyncAt: outcome.meta.lastSyncAt,
      storageBytes: outcome.storageBytes,
      fileCount: outcome.files.length,
      files: outcome.files,
      configured: true,
      online: true,
    })
  } catch (error) {
    publish({
      ...status,
      phase: 'error',
      configured: true,
      online: true,
      email: user.email,
      detail: error instanceof Error ? error.message : 'La synchronisation a échoué. Les données locales sont intactes.',
    })
  }
}

function emit(event: SyncEvent): void {
  if (event.type === 'status') status = event.status
  for (const listener of listeners) listener(event)
}

function publish(next: SyncStatus): void {
  emit({ type: 'status', status: next })
}

function localStatus(): SyncStatus {
  return {
    phase: 'local',
    detail: 'Rien n’est envoyé. L’atelier reste dans ce navigateur.',
    email: '',
    lastSyncAt: null,
    storageBytes: 0,
    fileCount: 0,
    files: [],
    configured: false,
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
  }
}

function previewRequested(): boolean {
  if (!import.meta.env.DEV) return false
  try {
    return sessionStorage.getItem('atelier-sync-preview') === '1'
  } catch {
    return false
  }
}

function previewStatus(): SyncStatus {
  return {
    phase: 'preview',
    detail: 'Aperçu local : aucun projet Supabase n’est connecté.',
    email: 'demo@atelier.local',
    lastSyncAt: '2026-11-17T16:40:00.000Z',
    storageBytes: 2_520_000,
    fileCount: 2,
    files: [
      { hash: 'a'.repeat(64), name: 'logo.png', mime: 'image/png', bytes: 120_000 },
      { hash: 'b'.repeat(64), name: 'clip.mp4', mime: 'video/mp4', bytes: 2_400_000 },
    ],
    configured: true,
    online: true,
  }
}

function stripAuthQuery(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('code') && !url.searchParams.has('error_description')) return
  url.searchParams.delete('code')
  const query = url.searchParams.toString()
  window.history.replaceState({}, '', `${url.pathname}${query ? `?${query}` : ''}${url.hash}`)
}
