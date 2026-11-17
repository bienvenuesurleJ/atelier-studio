import { toast } from 'sonner'
import { CONNECTORS, connectorStatusLabel } from '@/domain/connectors'
import { parseBackup, serializeBackup } from '@/storage/backup'
import type { StudioState } from '@/domain/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'

export function SettingsScreen({ state, setState }: { state: StudioState; setState: (state: StudioState) => void }) {
  const agency = state.agency
  const setAgency = (key: keyof typeof agency, value: string) => setState({ ...state, agency: { ...agency, [key]: value } })
  const setRate = (key: keyof typeof state.rates, value: number) => setState({ ...state, rates: { ...state.rates, [key]: value } })
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-6 md:px-6">
      <header>
        <h1 className="font-serif text-4xl">Réglages</h1>
        <p className="text-sm text-muted">Identité utilisée sur les devis, barème, et copie de secours. La copie entre appareils se règle dans Espace admin.</p>
      </header>
      <section className="grid gap-2">
        <h2 className="font-serif text-2xl">Studio</h2>
        <Field label="Nom commercial" value={agency.name} onChange={(value) => setAgency('name', value)} />
        <Field label="Votre nom" value={agency.owner} onChange={(value) => setAgency('owner', value)} />
        <Field label="E-mail" value={agency.email} onChange={(value) => setAgency('email', value)} />
        <Field label="Téléphone" value={agency.phone} onChange={(value) => setAgency('phone', value)} />
        <Field label="Adresse" value={agency.address} onChange={(value) => setAgency('address', value)} />
        <Field label="SIRET" value={agency.siret} onChange={(value) => setAgency('siret', value)} />
      </section>
      <section className="grid gap-2">
        <h2 className="font-serif text-2xl">Barème</h2>
        <Rate label="Base" value={state.rates.base} onChange={(value) => setRate('base', value)} />
        <Rate label="Page supplémentaire" value={state.rates.perPage} onChange={(value) => setRate('perPage', value)} />
        <Rate label="Design poussé" value={state.rates.design} onChange={(value) => setRate('design', value)} />
        <Rate label="Catalogue" value={state.rates.shop} onChange={(value) => setRate('shop', value)} />
        <Rate label="Application" value={state.rates.pwa} onChange={(value) => setRate('pwa', value)} />
        <Rate label="SEO" value={state.rates.seo} onChange={(value) => setRate('seo', value)} />
        <Rate label="Entretien mensuel" value={state.rates.monthly} onChange={(value) => setRate('monthly', value)} />
        <Rate label="Coût estimé" value={state.rates.costEstimate} onChange={(value) => setRate('costEstimate', value)} />
      </section>
      <section className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            const blob = new Blob([serializeBackup(state)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'atelier-local-sauvegarde.json'
            link.click()
            URL.revokeObjectURL(url)
          }}
        >
          Exporter la sauvegarde JSON
        </Button>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-line px-3 py-2 text-sm">
          Restaurer
          <input
            className="sr-only"
            type="file"
            accept="application/json"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              try {
                setState(parseBackup(await file.text()))
                toast.success('Sauvegarde restaurée')
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Import impossible')
              }
            }}
          />
        </label>
      </section>
      <section>
        <h2 className="font-serif text-2xl">Ce qui n’est pas inclus</h2>
        <ul className="mt-3 grid gap-3">
          {CONNECTORS.map((item) => (
            <li key={item.id} className="rounded-xl border border-line p-3 text-sm">
              <p className="text-brass">{connectorStatusLabel(item.status)} — {item.name}</p>
              <p className="mt-1 text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-xs text-muted">
      {label}
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function Rate({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-xs text-muted">
      {label}
      <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} />
    </label>
  )
}
