import { useState } from 'react'
import { createProject } from '@/domain/createProject'
import { SITE_PRESETS, createFromPreset } from '@/domain/presets'
import { STYLES } from '@/domain/styles'
import type { BusinessType, Project, ProjectKind, StyleId } from '@/domain/types'
import { BUSINESS_LABELS, KIND_LABELS } from '@/studio/labels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'

export function Wizard({ onCreate, onCancel }: { onCreate: (project: Project) => void; onCancel: () => void }) {
  const [kind, setKind] = useState<ProjectKind>('vitrine')
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant')
  const [styleId, setStyleId] = useState<StyleId>('luxe')
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [clientName, setClientName] = useState('')

  return (
    <form
      className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:px-6"
      onSubmit={(event) => {
        event.preventDefault()
        const project = createProject({
          kind,
          businessType,
          styleId,
          businessName: businessName || 'Maison Horizon',
          city: city || 'Lyon',
          phone,
          email,
          projectName: businessName || 'Nouveau projet',
        })
        project.clientName = clientName
        if (kind === 'eshop' || kind === 'pwa-catalog' || kind === 'pwa-menu') project.shop = kind === 'eshop' ? 'mini' : 'mini'
        onCreate(project)
      }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-brass">Point de départ</p>
        <h1 className="font-serif text-4xl">Le modèle ne fige rien</h1>
        <p className="max-w-2xl text-sm text-muted">Vous choisirez ensuite chaque texte, chaque couleur, chaque section. Les phrases d’exemple sont à remplacer, y compris les avis.</p>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm text-muted">{SITE_PRESETS.length} modèles prêts</legend>
        <div className="grid max-h-64 gap-2 overflow-auto sm:grid-cols-2 lg:grid-cols-3">
          {SITE_PRESETS.map((preset) => (
            <button key={preset.id} type="button" className={card(false)} onClick={() => onCreate(createFromPreset(preset.id))}>
              <span className="block font-medium">{preset.name}</span>
              <span className="mt-1 block text-xs text-muted">{preset.detail}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm text-muted">Type de projet</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {KIND_LABELS.map((item) => (
            <button key={item.id} type="button" onClick={() => setKind(item.id)} className={card(kind === item.id)}>
              <span className="block font-medium">{item.name}</span>
              <span className="mt-1 block text-xs text-muted">{item.detail}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm text-muted">Métier, pour les textes de départ</legend>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_LABELS.map((item) => (
            <button key={item.id} type="button" onClick={() => setBusinessType(item.id)} className={pill(businessType === item.id)}>
              {item.name}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm text-muted">Univers graphique</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {STYLES.map((style) => (
            <button key={style.id} type="button" onClick={() => setStyleId(style.id)} className={card(styleId === style.id)}>
              <span className="mb-2 flex h-10 overflow-hidden rounded-md">
                <span className="flex-1" style={{ background: style.tokens.bg }} />
                <span className="flex-1" style={{ background: style.tokens.primary }} />
                <span className="flex-1" style={{ background: style.tokens.accent }} />
              </span>
              <span className="block text-sm">{style.name}</span>
              <span className="block text-xs text-muted">{style.tagline}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nom du commerce" value={businessName} onChange={setBusinessName} placeholder="La Table des Remparts" />
        <Field label="Nom du client" value={clientName} onChange={setClientName} placeholder="Camille Martin" />
        <Field label="Ville" value={city} onChange={setCity} placeholder="Lyon" />
        <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="04 78 00 00 00" />
        <Field label="E-mail de réception" value={email} onChange={setEmail} placeholder="bonjour@commerce.fr" />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Créer et ouvrir l’éditeur</Button>
        <Button type="button" variant="quiet" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-1 text-xs text-muted">
      {label}
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function card(active: boolean) {
  return `rounded-xl border p-3 text-left ${active ? 'border-brass bg-paper-2' : 'border-line bg-paper hover:border-brass/60'}`
}

function pill(active: boolean) {
  return `rounded-full border px-3 py-1 text-sm ${active ? 'border-brass bg-brass text-sand' : 'border-line'}`
}
