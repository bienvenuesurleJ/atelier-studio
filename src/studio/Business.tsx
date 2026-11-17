import { useMemo, useState } from 'react'
import { CHECKLIST, PRICE_OFFERS, STATUS_LABELS, coldDm, coldEmail, quoteMessage, suggestedPrice } from '@/domain/commerce'
import { uid } from '@/domain/ids'
import type { MaintenancePlan, Prospect, ProspectStatus, Quote, StudioState } from '@/domain/types'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/field'
import { money } from '@/studio/labels'

export function Business({ state, setState }: { state: StudioState; setState: (state: StudioState) => void }) {
  const [filter, setFilter] = useState<ProspectStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [pages, setPages] = useState(4)
  const [flags, setFlags] = useState({ design: true, shop: false, pwa: false, seo: true })
  const [sale, setSale] = useState(890)
  const suggested = suggestedPrice(state.rates, { pages, ...flags })
  const margin = sale - state.rates.costEstimate
  const prospects = state.prospects.filter((item) => (filter === 'all' || item.status === filter) && `${item.businessName} ${item.contactName} ${item.city}`.toLowerCase().includes(query.toLowerCase()))
  const due = useMemo(
    () => state.prospects.filter((item) => item.followUpDate && item.followUpDate <= new Date().toISOString().slice(0, 10) && item.status !== 'client' && item.status !== 'refuse'),
    [state.prospects],
  )

  const addProspect = () => {
    const prospect: Prospect = {
      id: uid('pro'),
      businessName: 'Nouveau commerce',
      contactName: '',
      activity: '',
      address: '',
      website: '',
      city: '',
      phone: '',
      email: '',
      channel: 'Visite',
      status: 'nouveau',
      offer: '',
      price: '',
      budget: '',
      notes: '',
      nextStep: 'Premier contact',
      contactDate: new Date().toISOString().slice(0, 10),
      followUpDate: '',
      history: [{ at: new Date().toISOString(), text: 'Fiche créée.' }],
      updatedAt: new Date().toISOString(),
    }
    setState({ ...state, prospects: [prospect, ...state.prospects] })
  }

  const patch = (id: string, partial: Partial<Prospect>, history?: string) => {
    setState({
      ...state,
      prospects: state.prospects.map((item) =>
        item.id === id
          ? {
              ...item,
              ...partial,
              updatedAt: new Date().toISOString(),
              history: history ? [...item.history, { at: new Date().toISOString(), text: history }] : item.history,
            }
          : item,
      ),
    })
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 md:px-6">
      <header>
        <h1 className="font-serif text-4xl">Activité</h1>
        <p className="max-w-2xl text-sm text-muted">Chiffrage, prospects et devis. Rien n’est prélevé automatiquement : ce n’est pas un logiciel de facturation.</p>
      </header>
      {due.length ? <p className="rounded-xl border border-brass/50 px-3 py-2 text-sm">{due.length} relance(s) arrivent à échéance.</p> : null}
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-paper p-4">
          <h2 className="font-serif text-2xl">Calculateur</h2>
          <div className="mt-3 grid gap-2">
            <label className="text-xs text-muted">Pages
              <Input type="number" min={1} value={pages} onChange={(event) => setPages(Number(event.target.value) || 1)} />
            </label>
            {(['design', 'shop', 'pwa', 'seo'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={flags[key]} onChange={(event) => setFlags({ ...flags, [key]: event.target.checked })} />
                {key === 'design' ? 'Design poussé' : key === 'shop' ? 'Catalogue' : key === 'pwa' ? 'Application installable' : 'SEO local'}
              </label>
            ))}
            <p className="font-serif text-3xl">{money(suggested)}</p>
            <label className="text-xs text-muted">Prix de vente proposé
              <Input type="number" value={sale} onChange={(event) => setSale(Number(event.target.value) || 0)} />
            </label>
            <p className="text-sm">Coût estimé {money(state.rates.costEstimate)} · marge {money(margin)}. Le coût se règle dans Réglages, il est à 0 tant que vous ne le saisissez pas.</p>
          </div>
        </article>
        <article className="rounded-2xl border border-line bg-paper p-4">
          <h2 className="font-serif text-2xl">Repères, modifiables</h2>
          <ul className="mt-3 grid gap-3">
            {PRICE_OFFERS.map((offer) => (
              <li key={offer.id}>
                <p className="font-medium">{offer.name}</p>
                <p className="text-sm text-muted">{offer.creation} · entretien {offer.maintenance}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-2xl">Prospects</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="quiet" onClick={() => downloadCsv(state.prospects)}>Export CSV</Button>
            <Button size="sm" onClick={addProspect}>Ajouter</Button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" aria-label="Rechercher un prospect" />
          <Select value={filter} onChange={(event) => setFilter(event.target.value as ProspectStatus | 'all')} aria-label="Filtrer par statut">
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </Select>
        </div>
        <ul className="mt-3 grid gap-3">
          {prospects.map((prospect) => (
            <li key={prospect.id} className="grid gap-2 rounded-2xl border border-line p-3 md:grid-cols-2">
              <Input value={prospect.businessName} aria-label="Entreprise" onChange={(event) => patch(prospect.id, { businessName: event.target.value })} />
              <Input value={prospect.contactName} aria-label="Contact" placeholder="Contact" onChange={(event) => patch(prospect.id, { contactName: event.target.value })} />
              <Input value={prospect.city} aria-label="Ville" placeholder="Ville" onChange={(event) => patch(prospect.id, { city: event.target.value })} />
              <Input value={prospect.phone} aria-label="Téléphone" placeholder="Téléphone" onChange={(event) => patch(prospect.id, { phone: event.target.value })} />
              <Input value={prospect.email} aria-label="E-mail" placeholder="E-mail" onChange={(event) => patch(prospect.id, { email: event.target.value })} />
              <Input value={prospect.budget} aria-label="Budget" placeholder="Budget estimé" onChange={(event) => patch(prospect.id, { budget: event.target.value })} />
              <Select value={prospect.status} aria-label="Statut" onChange={(event) => patch(prospect.id, { status: event.target.value as ProspectStatus }, `Statut : ${STATUS_LABELS[event.target.value as ProspectStatus]}`)}>
                {Object.entries(STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </Select>
              <Input type="date" value={prospect.followUpDate} aria-label="Date de relance" onChange={(event) => patch(prospect.id, { followUpDate: event.target.value })} />
              <Textarea className="md:col-span-2" value={prospect.notes} aria-label="Notes" placeholder="Notes" onChange={(event) => patch(prospect.id, { notes: event.target.value })} />
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button size="sm" variant="quiet" onClick={() => copy(coldEmail(state.agency.owner, prospect.businessName, prospect.city))}>Copier l’e-mail</Button>
                <Button size="sm" variant="quiet" onClick={() => copy(coldDm(prospect.businessName))}>Copier le message court</Button>
                <Button size="sm" variant="quiet" onClick={() => copy(quoteMessagePlaceholder(state, prospect))}>Copier une proposition</Button>
                <Button size="sm" variant="danger" onClick={() => setState({ ...state, prospects: state.prospects.filter((item) => item.id !== prospect.id) })}>Supprimer</Button>
              </div>
              {prospect.history.length ? <p className="text-xs text-muted md:col-span-2">{prospect.history.at(-1)?.text}</p> : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-2">
        <h2 className="font-serif text-2xl">Prospection</h2>
        {CHECKLIST.map((item) => (
          <label key={item.id} className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(state.checklist[item.id])}
              onChange={(event) => setState({ ...state, checklist: { ...state.checklist, [item.id]: event.target.checked } })}
            />
            {item.label}
          </label>
        ))}
      </section>
      <Maintenance state={state} setState={setState} />
      <Quotes state={state} setState={setState} />
    </div>
  )
}

function Maintenance({ state, setState }: { state: StudioState; setState: (state: StudioState) => void }) {
  const add = () => {
    const plan: MaintenancePlan = {
      id: uid('mnt'),
      clientName: 'Client',
      projectId: state.projects[0]?.id ?? '',
      offer: 'Textes, horaires, sauvegarde',
      price: state.rates.monthly,
      start: new Date().toISOString().slice(0, 10),
      renewal: '',
      notes: 'Suivi local. Aucun prélèvement automatique.',
      active: true,
    }
    setState({ ...state, plans: [plan, ...state.plans] })
  }
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Entretien</h2>
        <Button size="sm" onClick={add}>Ajouter un plan</Button>
      </div>
      <ul className="mt-3 grid gap-2">
        {state.plans.map((plan) => (
          <li key={plan.id} className="grid gap-2 rounded-xl border border-line p-3 md:grid-cols-4">
            <Input aria-label="Client" value={plan.clientName} onChange={(event) => setState({ ...state, plans: state.plans.map((item) => item.id === plan.id ? { ...item, clientName: event.target.value } : item) })} />
            <Input aria-label="Offre" value={plan.offer} onChange={(event) => setState({ ...state, plans: state.plans.map((item) => item.id === plan.id ? { ...item, offer: event.target.value } : item) })} />
            <Input aria-label="Prix mensuel" type="number" value={plan.price} onChange={(event) => setState({ ...state, plans: state.plans.map((item) => item.id === plan.id ? { ...item, price: Number(event.target.value) || 0 } : item) })} />
            <Input aria-label="Renouvellement" type="date" value={plan.renewal} onChange={(event) => setState({ ...state, plans: state.plans.map((item) => item.id === plan.id ? { ...item, renewal: event.target.value } : item) })} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function Quotes({ state, setState }: { state: StudioState; setState: (state: StudioState) => void }) {
  const create = () => {
    const quote: Quote = {
      id: uid('dev'),
      number: `D-${state.quotes.length + 1}`,
      prospectId: state.prospects[0]?.id ?? '',
      projectId: state.projects[0]?.id ?? '',
      title: 'Création de site',
      lines: [{ id: uid('lig'), label: 'Création', qty: 1, unitPrice: suggestedPrice(state.rates, { pages: 4, design: true, shop: false, pwa: false, seo: true }) }],
      conditions: 'Acompte 40 % à la commande. Solde à la mise en ligne. Deux allers-retours inclus.',
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    setState({ ...state, quotes: [quote, ...state.quotes] })
  }
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Devis</h2>
        <Button size="sm" onClick={create}>Nouveau devis</Button>
      </div>
      <ul className="mt-3 grid gap-3">
        {state.quotes.map((quote) => {
          const total = quote.lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0)
          const prospect = state.prospects.find((item) => item.id === quote.prospectId)
          return (
            <li key={quote.id} className="print-sheet rounded-2xl border border-line p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-brass">{quote.number} · {quote.status}</p>
              <h3 className="font-serif text-2xl">{quote.title}</h3>
              <p className="text-sm">{state.agency.name || 'Votre studio'} — {prospect?.businessName || 'Client à préciser'}</p>
              <p className="mt-2">Total {money(total)} · valable jusqu’au {quote.validUntil}</p>
              <p className="text-sm text-muted">{quote.conditions}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="quiet" onClick={() => window.print()}>Imprimer / PDF</Button>
                <Button size="sm" variant="danger" onClick={() => setState({ ...state, quotes: state.quotes.filter((item) => item.id !== quote.id) })}>Supprimer</Button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function quoteMessagePlaceholder(state: StudioState, prospect: Prospect): string {
  const project = state.projects[0]
  if (!project) return `Proposition pour ${prospect.businessName} : à chiffrer.`
  return quoteMessage(project, prospect.budget || prospect.price, `${state.rates.monthly} €`)
}

function copy(text: string) {
  void navigator.clipboard.writeText(text)
}

function downloadCsv(prospects: Prospect[]) {
  const header = ['entreprise', 'contact', 'ville', 'telephone', 'email', 'statut', 'budget', 'relance']
  const rows = prospects.map((item) => [item.businessName, item.contactName, item.city, item.phone, item.email, item.status, item.budget, item.followUpDate])
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'prospects.csv'
  link.click()
  URL.revokeObjectURL(url)
}
