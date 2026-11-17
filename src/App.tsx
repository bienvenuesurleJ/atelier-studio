import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { LayoutDashboard, FolderKanban, Briefcase, Settings, Shield } from 'lucide-react'
import { canonicalJson } from '@/sync/memory'
import { queueSync, startSync, subscribeSync } from '@/sync/controller'
import { recordStudio } from '@/sync/store'
import { loadState, saveState } from '@/storage/db'
import { emptyState } from '@/storage/backup'
import type { StudioState } from '@/domain/types'
import { parseHash, toHash, type Route } from '@/studio/router'
import { Dashboard } from '@/studio/Dashboard'
import { Projects } from '@/studio/Projects'
import { Wizard } from '@/studio/Wizard'
import { Editor } from '@/studio/Editor'
import { FilmApp } from '@/video/FilmApp'
import { Business } from '@/studio/Business'
import { SettingsScreen } from '@/studio/Settings'
import { AdminScreen } from '@/studio/Admin'
import { SyncBadge } from '@/studio/SyncBadge'
import { cn } from '@/lib/utils'

export default function App() {
  const [state, setState] = useState<StudioState | null>(null)
  const [saveError, setSaveError] = useState('')
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  const applied = useRef<StudioState | null>(null)

  useEffect(() => {
    startSync()
    return subscribeSync((event) => {
      if (event.type !== 'studio') return
      setState((current) => {
        if (current && canonicalJson(current) === canonicalJson(event.studio)) return current
        applied.current = event.studio
        return event.studio
      })
    })
  }, [])

  useEffect(() => {
    loadState()
      .then(setState)
      .catch(() => setState(emptyState()))
  }, [])

  useEffect(() => {
    if (!state) return
    const fromRemote = applied.current === state
    applied.current = null
    const timer = window.setTimeout(() => {
      saveState(state)
        .then(() => recordStudio(state))
        .then(() => {
          setSaveError('')
          if (!fromRemote) queueSync()
        })
        .catch(() => setSaveError('La sauvegarde IndexedDB a échoué. Exportez une copie JSON.'))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [state])

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (next: Route) => {
    window.location.hash = toHash(next)
  }

  if (!state) {
    return <div className="grid h-full place-items-center text-muted">Ouverture de l’atelier…</div>
  }

  const inEditor = route.name === 'editor'
  const project = route.name === 'editor' ? state.projects.find((item) => item.id === route.id) : undefined

  return (
    <div className="flex h-full min-h-0 flex-col">
      {saveError ? <p className="bg-danger/20 px-4 py-2 text-sm text-danger">{saveError}</p> : null}
      <SyncBadge />
      {route.name !== 'films' && !inEditor ? (
        <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-6">
          <button type="button" className="text-left" onClick={() => go({ name: 'dashboard' })}>
            <span className="font-serif text-2xl tracking-tight">Atelier</span>
            <span className="ml-2 text-xs uppercase tracking-[0.18em] text-brass">Local</span>
          </button>
          <button type="button" className="rounded-full border border-line px-3 py-1 text-sm text-brass" onClick={() => go({ name: 'films' })}>Studio Vidéo</button>
          <nav className="flex flex-wrap gap-1">
            <Nav icon={<LayoutDashboard size={16} />} active={route.name === 'dashboard'} onClick={() => go({ name: 'dashboard' })}>
              Tableau
            </Nav>
            <Nav icon={<FolderKanban size={16} />} active={route.name === 'projects' || route.name === 'new'} onClick={() => go({ name: 'projects' })}>
              Projets
            </Nav>
            <Nav icon={<Briefcase size={16} />} active={route.name === 'business'} onClick={() => go({ name: 'business' })}>
              Activité
            </Nav>
            <Nav icon={<Settings size={16} />} active={route.name === 'settings'} onClick={() => go({ name: 'settings' })}>
              Réglages
            </Nav>
            <Nav icon={<Shield size={16} />} active={route.name === 'admin'} onClick={() => go({ name: 'admin' })}>
              Admin
            </Nav>
          </nav>
        </header>
      ) : null}
      <motion.main
        key={route.name === 'editor' ? route.id : route.name}
        className="min-h-0 flex-1"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {route.name === 'dashboard' ? <Dashboard state={state} go={go} /> : null}
        {route.name === 'projects' ? <Projects state={state} setState={setState} go={go} /> : null}
        {route.name === 'new' ? (
          <Wizard
            onCancel={() => go({ name: 'projects' })}
            onCreate={(project) => {
              setState({ ...state, projects: [project, ...state.projects] })
              go({ name: 'editor', id: project.id })
            }}
          />
        ) : null}
        {route.name === 'business' ? <Business state={state} setState={setState} /> : null}
        {route.name === 'settings' ? <SettingsScreen state={state} setState={setState} /> : null}
        {route.name === 'admin' ? <AdminScreen /> : null}
        {route.name === 'films' ? <FilmApp onSites={() => go({ name: 'dashboard' })} /> : null}
        {route.name === 'editor' && project ? (
          <Editor
            project={project}
            onChange={(next) => setState({ ...state, projects: state.projects.map((item) => (item.id === next.id ? next : item)) })}
            onBack={() => go({ name: 'projects' })}
          />
        ) : null}
        {route.name === 'editor' && !project ? (
          <div className="grid h-full place-items-center gap-3 text-center">
            <p>Ce projet n’est plus dans ce navigateur.</p>
            <button type="button" className="text-brass" onClick={() => go({ name: 'projects' })}>
              Retour aux projets
            </button>
          </div>
        ) : null}
      </motion.main>
    </div>
  )
}

function Nav({
  children,
  icon,
  active,
  onClick,
}: {
  children: string
  icon: ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm',
        active ? 'bg-paper-2 text-ink' : 'text-muted hover:text-ink',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  )
}
