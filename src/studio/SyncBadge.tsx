import { useEffect, useState } from 'react'
import { subscribeSync, syncStatus, type SyncPhase } from '@/sync/controller'

const label: Record<SyncPhase, string> = {
  local: 'Cet appareil',
  'signed-out': 'Compte',
  offline: 'Hors ligne',
  syncing: 'Synchronisation…',
  synced: 'Synchronisé',
  error: 'À vérifier',
  preview: 'Aperçu',
}

const tone: Record<SyncPhase, string> = {
  local: 'bg-muted',
  'signed-out': 'bg-brass',
  offline: 'bg-muted',
  syncing: 'bg-brass',
  synced: 'bg-forest',
  error: 'bg-danger',
  preview: 'bg-brass',
}

export function SyncBadge() {
  const [status, setStatus] = useState(() => syncStatus())
  useEffect(() => subscribeSync((event) => {
    if (event.type === 'status') setStatus(event.status)
  }), [])
  return (
    <button
      type="button"
      onClick={() => { window.location.hash = '/admin' }}
      className="fixed bottom-3 left-3 z-30 inline-flex items-center gap-2 rounded-full border border-line bg-paper/95 px-3 py-1.5 text-xs text-ink shadow-lg backdrop-blur"
    >
      <span className={`h-2 w-2 rounded-full ${tone[status.phase]} ${status.phase === 'syncing' ? 'animate-pulse' : ''}`} />
      {label[status.phase]}
    </button>
  )
}
