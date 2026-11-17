import { DATA_VERSION, type StudioState } from '../domain/types'
import { DEFAULT_RATES } from '../domain/commerce'

export interface BackupFile {
  kind: 'atelier-local-backup'
  version: number
  exportedAt: string
  state: StudioState
}

export function emptyState(): StudioState {
  return {
    version: DATA_VERSION,
    projects: [],
    prospects: [],
    quotes: [],
    plans: [],
    checklist: {},
    agency: { name: '', owner: '', email: '', phone: '', address: '', siret: '' },
    rates: { ...DEFAULT_RATES },
  }
}

export function serializeBackup(state: StudioState): string {
  const file: BackupFile = {
    kind: 'atelier-local-backup',
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  }
  return JSON.stringify(file, null, 2)
}

export function parseBackup(raw: string): StudioState {
  const parsed = JSON.parse(raw) as unknown
  if (!parsed || typeof parsed !== 'object') throw new Error('Fichier illisible.')
  const record = parsed as Partial<BackupFile> & { projects?: unknown }
  const state = record.kind === 'atelier-local-backup' ? record.state : (parsed as StudioState)
  if (!state || !Array.isArray(state.projects)) throw new Error('Ce JSON ne contient pas de projets Atelier Local.')
  return normalizeState(state)
}

export function normalizeState(input: Partial<StudioState>): StudioState {
  const base = emptyState()
  return {
    ...base,
    ...input,
    version: DATA_VERSION,
    projects: Array.isArray(input.projects) ? input.projects : [],
    prospects: Array.isArray(input.prospects) ? input.prospects : [],
    quotes: Array.isArray(input.quotes) ? input.quotes : [],
    plans: Array.isArray(input.plans) ? input.plans : [],
    checklist: input.checklist && typeof input.checklist === 'object' ? input.checklist : {},
    agency: { ...base.agency, ...(input.agency ?? {}) },
    rates: { ...base.rates, ...(input.rates ?? {}) },
  }
}
