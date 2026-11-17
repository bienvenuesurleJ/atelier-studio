import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Project, ProjectStatus, StudioState } from '@/domain/types'
import { duplicateProject } from '@/domain/projectOps'
import { exportIssues } from '@/export/generateSite'
import { zipProject } from '@/export/zip'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/field'
import { Modal } from '@/components/ui/dialog'
import { STATUS_PROJECT, kindName, when } from '@/studio/labels'
import type { Route } from '@/studio/router'

export function Projects({
  state,
  setState,
  go,
}: {
  state: StudioState
  setState: (state: StudioState) => void
  go: (route: Route) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all' | 'open'>('open')
  const [kind, setKind] = useState('all')
  const [sort, setSort] = useState<'updated' | 'name'>('updated')
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)

  const kinds = useMemo(() => [...new Set(state.projects.map((project) => project.kind))], [state.projects])
  const projects = state.projects
    .filter((project) => {
      if (status === 'open' && project.status === 'archived') return false
      if (status !== 'all' && status !== 'open' && project.status !== status) return false
      if (kind !== 'all' && project.kind !== kind) return false
      const hay = `${project.name} ${project.clientName} ${project.business.name} ${project.business.city}`.toLowerCase()
      return hay.includes(query.trim().toLowerCase())
    })
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name, 'fr') : b.updatedAt.localeCompare(a.updatedAt)))

  const patch = (id: string, fn: (project: Project) => Project) => {
    setState({ ...state, projects: state.projects.map((project) => (project.id === id ? fn(project) : project)) })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Projets</h1>
          <p className="text-sm text-muted">Chaque projet reste dans ce navigateur jusqu’à l’export.</p>
        </div>
        <Button onClick={() => go({ name: 'new' })}>Créer</Button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un client, une ville…" aria-label="Recherche" />
        <Select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus | 'all' | 'open')} aria-label="Statut">
          <option value="open">Sauf archivés</option>
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_PROJECT).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </Select>
        <Select value={kind} onChange={(event) => setKind(event.target.value)} aria-label="Type">
          <option value="all">Tous les types</option>
          {kinds.map((id) => (
            <option key={id} value={id}>{kindName(id)}</option>
          ))}
        </Select>
        <Select value={sort} onChange={(event) => setSort(event.target.value as 'updated' | 'name')} aria-label="Tri">
          <option value="updated">Plus récents</option>
          <option value="name">Nom</option>
        </Select>
      </div>
      {projects.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-8 text-muted">Aucun projet pour ce filtre. Créez-en un, les modèles ne sont qu’un point de départ.</p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id} className="rounded-2xl border border-line bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-brass">{kindName(project.kind)}</p>
                  <h2 className="font-serif text-2xl">{project.name}</h2>
                  <p className="text-sm text-muted">{project.clientName || project.business.name} · {project.business.city}</p>
                  <p className="mt-1 text-xs text-muted">{STATUS_PROJECT[project.status]} · modifié {when(project.updatedAt)}</p>
                </div>
                <span className="h-10 w-10 rounded-full" style={{ background: project.tokens.primary }} aria-hidden />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => go({ name: 'editor', id: project.id })}>Ouvrir</Button>
                <Button size="sm" variant="quiet" onClick={() => download(project)}>Exporter</Button>
                <Button size="sm" variant="quiet" onClick={() => setState({ ...state, projects: [duplicateProject(project), ...state.projects] })}>Dupliquer</Button>
                <Button size="sm" variant="quiet" onClick={() => patch(project.id, (item) => ({ ...item, status: item.status === 'archived' ? 'active' : 'archived', updatedAt: new Date().toISOString() }))}>
                  {project.status === 'archived' ? 'Désarchiver' : 'Archiver'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setPendingDelete(project)}>Supprimer</Button>
              </div>
              <label className="mt-3 grid gap-1 text-xs text-muted">
                Renommer
                <Input
                  value={project.name}
                  onChange={(event) => patch(project.id, (item) => ({ ...item, name: event.target.value, updatedAt: new Date().toISOString() }))}
                />
              </label>
            </li>
          ))}
        </ul>
      )}
      <Modal open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)} title="Supprimer le projet ?">
        <p className="text-sm text-muted">La suppression est locale. Un export JSON dans Réglages permet de le retrouver si vous l’avez sauvegardé avant.</p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="danger"
            onClick={() => {
              if (!pendingDelete) return
              setState({ ...state, projects: state.projects.filter((project) => project.id !== pendingDelete.id) })
              setPendingDelete(null)
            }}
          >
            Supprimer
          </Button>
          <Button variant="quiet" onClick={() => setPendingDelete(null)}>Annuler</Button>
        </div>
      </Modal>
    </div>
  )
}

async function download(project: Project) {
  const issues = exportIssues(project).filter((issue) => issue.level === 'error')
  if (issues.length) {
    toast.error(issues[0]?.message ?? 'Export impossible')
    return
  }
  const bytes = await zipProject(project)
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.business.name || 'site'}.zip`
  link.click()
  URL.revokeObjectURL(url)
}
