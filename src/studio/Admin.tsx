import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { authRedirectTo, readStoredConfig } from '@/sync/config'
import { forgetSyncConfig, saveSyncConfig, sendMagicLink, signIn, signOut, signUp, subscribeSync, syncNow, syncStatus, type SyncStatus } from '@/sync/controller'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'

export function AdminScreen() {
  const [status, setStatus] = useState<SyncStatus>(() => syncStatus())
  const stored = readStoredConfig()
  const [url, setUrl] = useState(stored?.url ?? '')
  const [anonKey, setAnonKey] = useState(stored?.anonKey ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => subscribeSync((event) => {
    if (event.type === 'status') setStatus(event.status)
  }), [])
  const redirect = authRedirectTo(window.location.origin, import.meta.env.BASE_URL)
  const connected = status.phase === 'preview' || Boolean(status.email)
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-6 pb-24 md:px-6">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-brass">Compte</p>
        <h1 className="font-serif text-4xl">Espace admin</h1>
        <p className="max-w-xl text-sm text-muted">Les sites, les films, les prospects, les réglages et les fichiers envoyés (images, vidéos, polices, musiques) peuvent suivre le compte d’un appareil à l’autre. Sans ces réglages, tout reste dans ce navigateur.</p>
      </header>
      {status.phase === 'preview' ? (
        <p className="rounded-xl border border-brass/50 bg-brass/10 px-3 py-2 text-sm">Aperçu local : aucun projet Supabase n’est connecté. Les chiffres et les fichiers ci-dessous sont un exemple dans cette page.</p>
      ) : null}
      <section className="grid gap-3 rounded-2xl border border-line p-4">
        <h2 className="font-serif text-2xl">Projet Supabase</h2>
        <p className="text-sm text-muted">Collez l’adresse du projet et la clé anon, publique. Elle est gardée dans ce navigateur seulement. Ne collez jamais la clé service_role.</p>
        <label className="grid gap-1 text-xs text-muted">Adresse du projet
          <Input value={url} autoComplete="off" placeholder="https://xxxx.supabase.co" onChange={(event) => setUrl(event.target.value)} />
        </label>
        <label className="grid gap-1 text-xs text-muted">Clé anon
          <Input value={anonKey} autoComplete="off" placeholder="eyJ…" onChange={(event) => setAnonKey(event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => {
            try {
              saveSyncConfig(url, anonKey)
              toast.success('Adresse enregistrée sur cet appareil')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Adresse refusée')
            }
          }}>Enregistrer ici</Button>
          <Button variant="quiet" onClick={() => { forgetSyncConfig(); setUrl(''); setAnonKey(''); toast.success('Adresse locale effacée') }}>Effacer</Button>
        </div>
        <p className="text-xs text-muted">Adresse de retour à autoriser dans Supabase, sans dièse : {redirect}</p>
      </section>
      <section className="grid gap-3 rounded-2xl border border-line p-4">
        <h2 className="font-serif text-2xl">Connexion</h2>
        {connected ? (
          <div className="grid gap-3">
            <p className="text-sm">{status.email}</p>
            <p className="text-sm text-muted">{status.detail}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="quiet" disabled={status.phase === 'preview' || status.phase === 'syncing'} onClick={() => void syncNow().catch((error) => toast.error(error instanceof Error ? error.message : 'Sync impossible'))}>Synchroniser</Button>
              <Button variant="danger" disabled={status.phase === 'preview'} onClick={() => void signOut().then(() => toast.success('Déconnecté')).catch((error) => toast.error(error instanceof Error ? error.message : 'Déconnexion impossible'))}>Se déconnecter</Button>
            </div>
          </div>
        ) : (
          <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
            <label className="grid gap-1 text-xs text-muted">E-mail
              <Input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="grid gap-1 text-xs text-muted">Mot de passe
              <Input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button disabled={busy} onClick={() => void run(async () => { await signIn(email, password); toast.success('Connecté') })}>Se connecter</Button>
              <Button variant="quiet" disabled={busy} onClick={() => void run(async () => setNotice(await signUp(email, password) || 'Compte ouvert.'))}>Créer un compte</Button>
              <Button variant="quiet" disabled={busy} onClick={() => void run(async () => { await sendMagicLink(email); setNotice('Le lien a été envoyé. Ouvrez-le sur cet appareil.') })}>Recevoir un lien</Button>
            </div>
            {notice ? <p className="text-sm text-brass">{notice}</p> : null}
          </form>
        )}
      </section>
      <section className="grid gap-3 rounded-2xl border border-line p-4">
        <h2 className="font-serif text-2xl">Synchronisation</h2>
        <p className="text-sm">{status.detail}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted">État</dt><dd>{statusLabel(status.phase)}</dd></div>
          <div><dt className="text-muted">Dernier passage</dt><dd>{status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString('fr-FR') : 'Pas encore'}</dd></div>
          <div><dt className="text-muted">Fichiers</dt><dd>{status.fileCount}</dd></div>
          <div><dt className="text-muted">Volume</dt><dd>{formatBytes(status.storageBytes)}</dd></div>
        </dl>
        <p className="text-xs text-muted">En cas de modification des deux côtés, la date la plus récente gagne pour un même projet, prospect ou film. Une suppression est conservée, sauf si l’autre appareil a modifié l’élément après. Les réglages du studio suivent la dernière édition.</p>
      </section>
      <section className="grid gap-3 rounded-2xl border border-line p-4">
        <h2 className="font-serif text-2xl">Fichiers</h2>
        {status.files.length === 0 ? <p className="text-sm text-muted">Aucun fichier envoyé pour ce compte.</p> : (
          <ul className="grid gap-2">
            {status.files.map((file) => (
              <li key={file.hash} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted">{file.mime} · {formatBytes(file.bytes)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action impossible')
    } finally {
      setBusy(false)
    }
  }
}

function statusLabel(phase: SyncStatus['phase']): string {
  if (phase === 'synced') return 'À jour'
  if (phase === 'syncing') return 'En cours'
  if (phase === 'offline') return 'Hors ligne'
  if (phase === 'error') return 'Interrompue'
  if (phase === 'signed-out') return 'Déconnecté'
  if (phase === 'preview') return 'Aperçu'
  return 'Local seulement'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}
