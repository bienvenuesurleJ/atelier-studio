import type { StudioState } from '@/domain/types'
import { STATUS_LABELS } from '@/domain/commerce'
import type { ProspectStatus } from '@/domain/types'
import { money, parseMoney, when } from '@/studio/labels'
import type { Route } from '@/studio/router'
import { Button } from '@/components/ui/button'

const OPEN: ProspectStatus[] = ['nouveau', 'a-contacter', 'contacte', 'interesse', 'devis', 'negociation']

export function Dashboard({ state, go }: { state: StudioState; go: (route: Route) => void }) {
  const projects = state.projects.filter((project) => project.status !== 'archived')
  const forecast =
    state.prospects.filter((item) => OPEN.includes(item.status)).reduce((sum, item) => sum + parseMoney(item.budget), 0) +
    state.quotes.filter((quote) => quote.status === 'accepted').reduce((sum, quote) => sum + quote.lines.reduce((s, line) => s + line.qty * line.unitPrice, 0), 0)
  const maintenance = state.plans.filter((plan) => plan.active).reduce((sum, plan) => sum + plan.price, 0)
  const counts = (Object.keys(STATUS_LABELS) as ProspectStatus[]).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    n: state.prospects.filter((item) => item.status === status).length,
  }))
  const max = Math.max(1, ...counts.map((item) => item.n))
  const recent = [...state.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4)

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-brass">Studio</p>
          <h1 className="font-serif text-4xl">Ce qui est vraiment dans ce navigateur</h1>
        </div>
        <Button onClick={() => go({ name: 'new' })}>Nouveau projet</Button>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Projets en cours" value={String(projects.filter((item) => item.status === 'draft' || item.status === 'active').length)} />
        <Stat label="Terminés" value={String(state.projects.filter((item) => item.status === 'done').length)} />
        <Stat label="Publiés" value={String(state.projects.filter((item) => item.status === 'published').length)} />
        <Stat label="Prospects" value={String(state.prospects.length)} />
        <Stat label="Devis ouverts" value={String(state.quotes.filter((item) => item.status === 'draft' || item.status === 'sent').length)} />
        <Stat label="Prévisionnel" value={money(forecast)} hint="Budgets saisis + devis acceptés" />
        <Stat label="Entretien / mois" value={money(maintenance)} hint="Somme des plans actifs" />
        <Stat label="Projets au total" value={String(state.projects.length)} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-2xl border border-line bg-paper p-4">
          <h2 className="font-serif text-2xl">Prospects par statut</h2>
          {state.prospects.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Aucun prospect enregistré. Le graphique restera vide tant que vous n’en ajoutez pas.</p>
          ) : (
            <svg viewBox={`0 0 ${counts.length * 48} 140`} className="mt-4 h-40 w-full" role="img" aria-label="Répartition des prospects">
              {counts.map((item, index) => {
                const h = (item.n / max) * 100
                return (
                  <g key={item.status} transform={`translate(${index * 48 + 10}, 0)`}>
                    <rect x="8" y={120 - h} width="20" height={h} rx="4" fill="#d7b07a" />
                    <text x="18" y="136" textAnchor="middle" fill="#b3a79a" fontSize="8">
                      {item.n}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </article>
        <article className="rounded-2xl border border-line bg-paper p-4">
          <h2 className="font-serif text-2xl">Dernières modifications</h2>
          <ul className="mt-3 grid gap-2">
            {recent.length === 0 ? <li className="text-sm text-muted">Pas encore de projet.</li> : null}
            {recent.map((project) => (
              <li key={project.id}>
                <button type="button" className="w-full rounded-xl border border-line px-3 py-2 text-left hover:border-brass" onClick={() => go({ name: 'editor', id: project.id })}>
                  <span className="block">{project.name}</span>
                  <span className="text-xs text-muted">{when(project.updatedAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-line bg-paper p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </article>
  )
}
