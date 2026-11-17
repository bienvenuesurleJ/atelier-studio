import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Project, Quote } from '@/domain/types'
import { emptyState } from '@/storage/backup'
import { emptyLibrary } from '@/video/model'
import { createMemoryBackend } from './memoryBackend'
import { explainConfig, authRedirectTo, readSupabaseConfig } from './config'
import { synchronize } from './engine'
import { absorbSide, canonicalJson, emptyMeta, emptySide } from './memory'
import { extractMedia, restoreMedia } from './media'
import { mergeStudio } from './merge'
import { studioItems } from './items'

function jwt(role: string): string {
  const body = Buffer.from(JSON.stringify({ role })).toString('base64url')
  return `aaa.${body}.sig`
}

function project(id: string, updatedAt: string, name: string, logo = ''): Project {
  return { id, updatedAt, name, logo, createdAt: updatedAt } as Project
}

describe('configuration Supabase', () => {
  it('accepte la clé anon et refuse la clé secrète', () => {
    expect(explainConfig('https://abcd.supabase.co', jwt('anon'))).toBeNull()
    expect(explainConfig('https://abcd.supabase.co', jwt('service_role'))).toMatch(/secrète/)
    expect(explainConfig('http://exemple.fr', jwt('anon'))).toMatch(/https/)
    expect(readSupabaseConfig({
      local: { url: 'https://local.supabase.co', anonKey: jwt('anon') },
      env: { url: 'https://build.supabase.co', anonKey: jwt('anon') },
    })?.url).toBe('https://local.supabase.co')
    expect(readSupabaseConfig({ env: { url: '', anonKey: '' } })).toBeNull()
  })

  it('fabrique l’adresse de retour sans dièse', () => {
    expect(authRedirectTo('https://bienvenuesurleJ.github.io', '/atelier-studio/')).toBe('https://bienvenuesurlej.github.io/atelier-studio/')
    expect(authRedirectTo('http://127.0.0.1:43123', '/atelier-studio')).toBe('http://127.0.0.1:43123/atelier-studio/')
  })

  it('le SQL est idempotent et limité au propriétaire', () => {
    const sql = readFileSync(new URL('../../supabase/setup.sql', import.meta.url), 'utf8')
    expect(sql).toContain('create table if not exists public.documents')
    expect(sql).toContain('create table if not exists public.files')
    expect(sql).toContain('enable row level security')
    expect(sql).toContain('auth.uid()')
    expect(sql).toContain('drop policy if exists')
    expect(sql).toContain('create or replace function public.atelier_touch_updated_at')
    expect(sql).toContain("values ('atelier-files', 'atelier-files', false, 52428800)")
    expect(sql).toContain('on conflict (id) do update')
    expect(sql).toContain('storage.foldername(name)')
    expect(sql.toLowerCase()).not.toContain('service_role')
  })
})

describe('fichiers et fusion', () => {
  it('retire une image du JSON et la remet à l’identique', async () => {
    const logo = `data:image/png;base64,${btoa('logo')}`
    const extracted = await extractMedia({ logo, note: 'reste' })
    expect(extracted.value).toMatchObject({ note: 'reste' })
    expect(String((extracted.value as { logo: string }).logo)).toMatch(/^atelier-file:\/\/[a-f0-9]{64}$/)
    const file = extracted.files[0]
    const restored = restoreMedia(extracted.value, new Map([[file.hash, { mime: file.mime, bytes: file.bytes }]]))
    expect(restored).toEqual({ logo, note: 'reste' })
  })

  it('garde les deux projets et fait gagner la date la plus récente', () => {
    const local = emptyState()
    local.projects = [project('p1', '2026-01-01T00:00:00.000Z', 'Ancien'), project('p2', '2026-01-01T00:00:00.000Z', 'Local')]
    const remoteState = emptyState()
    remoteState.projects = [project('p1', '2026-06-01T00:00:00.000Z', 'Récent')]
    remoteState.agency = { ...remoteState.agency, name: 'Agence' }
    const side = absorbSide(emptySide(), studioItems(local), '2026-01-01T00:00:00.000Z')
    side.stamps.settings = '2026-01-01T00:00:00.000Z'
    const merged = mergeStudio(local, side, {
      version: 1,
      state: remoteState,
      stamps: { settings: '2026-02-01T00:00:00.000Z' },
      tombstones: {},
      files: {},
    })
    expect(merged.state.projects.map((item) => item.name).sort()).toEqual(['Local', 'Récent'])
    expect(merged.state.agency.name).toBe('Agence')
  })

  it('une suppression l’emporte, sauf édition plus récente', () => {
    const kept = project('p1', '2026-01-01T00:00:00.000Z', 'Là')
    const local = emptyState()
    const side = emptySide()
    side.seen[`project:${kept.id}`] = canonicalJson(kept)
    side.tombstones['project:p1'] = '2026-03-01T00:00:00.000Z'
    const remote = emptyState()
    remote.projects = [kept]
    const removed = mergeStudio(local, side, { version: 1, state: remote, stamps: {}, tombstones: {}, files: {} })
    expect(removed.state.projects).toEqual([])
    const newer = project('p1', '2026-04-01T00:00:00.000Z', 'Revenu')
    remote.projects = [newer]
    const back = mergeStudio(local, side, { version: 1, state: remote, stamps: {}, tombstones: {}, files: {} })
    expect(back.state.projects[0].name).toBe('Revenu')
  })

  it('un fichier envoyé sur un appareil revient sur l’autre', async () => {
    const backend = createMemoryBackend()
    const logo = `data:image/png;base64,${btoa('png')}`
    const phone = emptyState()
    phone.projects = [project('p1', '2026-01-01T00:00:00.000Z', 'Téléphone', logo)]
    const sent = await synchronize({ backend, userId: 'user-1', studio: phone, films: emptyLibrary(), meta: emptyMeta(), online: true })
    expect(sent.studio.projects[0].logo).toBe(logo)
    const received = await synchronize({ backend, userId: 'user-1', studio: emptyState(), films: emptyLibrary(), meta: emptyMeta(), online: true })
    expect(received.studio.projects[0].logo).toBe(logo)
    expect(received.storageBytes).toBeGreaterThan(0)
  })

  it('ne mélange pas deux comptes et reste local hors ligne', async () => {
    const backend = createMemoryBackend()
    const secret = emptyState()
    secret.projects = [project('secret', '2026-01-01T00:00:00.000Z', 'Secret')]
    const first = await synchronize({ backend, userId: 'user-1', studio: secret, films: emptyLibrary(), meta: emptyMeta(), online: true })
    await backend.signInPassword('user-2', 'secret')
    const other = await synchronize({
      backend,
      userId: 'user-2',
      studio: secret,
      films: emptyLibrary(),
      meta: { ...first.meta, boundUserId: 'user-1' },
      online: true,
    })
    expect(other.replacedAccount).toBe(true)
    expect(other.studio.projects).toEqual([])
    await backend.signInPassword('user-1', 'secret')
    const still = await synchronize({
      backend,
      userId: 'user-1',
      studio: emptyState(),
      films: emptyLibrary(),
      meta: { ...emptyMeta(), boundUserId: 'user-1' },
      online: true,
    })
    expect(still.studio.projects.map((item) => item.name)).toEqual(['Secret'])
    const offline = await synchronize({ backend, userId: 'user-1', studio: secret, films: emptyLibrary(), meta: emptyMeta(), online: false })
    expect(offline.offline).toBe(true)
    expect(offline.changedStudio).toBe(false)
  })

  it('fusionne un devis sans date propre', () => {
    const older = emptyState()
    older.quotes = [{ id: 'q1', title: 'Ancien' } as Quote]
    const newer = emptyState()
    newer.quotes = [{ id: 'q1', title: 'Nouveau' } as Quote]
    const side = absorbSide(absorbSide(emptySide(), studioItems(older), '2026-01-01T00:00:00.000Z'), studioItems(newer), '2026-05-01T00:00:00.000Z')
    const remote = emptyState()
    remote.quotes = [{ id: 'q1', title: 'Ancien' } as Quote]
    const merged = mergeStudio(newer, side, {
      version: 1,
      state: remote,
      stamps: { 'quote:q1': '2026-02-01T00:00:00.000Z' },
      tombstones: {},
      files: {},
    })
    expect(merged.state.quotes[0].title).toBe('Nouveau')
  })
})
