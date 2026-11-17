import { toast } from 'sonner'
import type { Project, SiteBackdrop } from '@/domain/types'
import { applyBrandToFilm } from '@/domain/brand'
import { emptyBackdrop } from '@/domain/backdrop'
import { loadFilms, saveFilms } from '@/video/db'
import { fileToDataUrl } from '@/studio/images'
import { Input } from '@/components/ui/field'

export function IdentityPanel({ project, onChange }: { project: Project; onChange: (project: Project) => void }) {
  const backdrop = project.backdrop ?? emptyBackdrop()
  const setBackdrop = (patch: Partial<SiteBackdrop>) => onChange({ ...project, backdrop: { ...backdrop, ...patch } })
  return (
    <div className="grid gap-3">
      <p className="text-xs uppercase tracking-[0.14em] text-brass">Identité</p>
      <FileField label="Logo" accept="image/*" hint="Affiché dans l’en-tête et le pied de page." value={project.logo} onFile={async (file) => onChange({ ...project, logo: await fileToDataUrl(file) })} onClear={() => onChange({ ...project, logo: '' })} />
      <label className="grid gap-1 text-xs text-muted">Taille du logo ({project.logoSize || 42} px)
        <input type="range" min={24} max={120} value={project.logoSize || 42} onChange={(event) => onChange({ ...project, logoSize: Number(event.target.value) })} />
      </label>
      <FileField label="Favicon" accept="image/png,image/svg+xml,image/x-icon,image/webp,.ico,.png,.svg" hint="Icône de l’onglet, dans l’aperçu et dans le ZIP." value={project.favicon} onFile={async (file) => onChange({ ...project, favicon: await fileToDataUrl(file) })} onClear={() => onChange({ ...project, favicon: '' })} />
      <BackdropFields title="Fond du site" backdrop={backdrop} onChange={setBackdrop} />
      <button type="button" className="text-left text-sm text-brass" onClick={() => void applyFilms(project)}>Appliquer ce kit aux films</button>
    </div>
  )
}

export function SectionBackdrop({ backdrop, onChange }: { backdrop: SiteBackdrop | undefined; onChange: (backdrop: SiteBackdrop) => void }) {
  return <BackdropFields title="Fond de la section" backdrop={backdrop ?? emptyBackdrop()} onChange={onChange} />
}

function BackdropFields({ title, backdrop, onChange }: { title: string; backdrop: SiteBackdrop; onChange: (backdrop: SiteBackdrop) => void }) {
  return (
    <div className="grid gap-2 rounded-xl border border-line p-2">
      <p className="text-xs text-brass">{title}</p>
      <FileField label="Image" accept="image/*" value={backdrop.src} onFile={async (file) => onChange({ ...backdrop, src: await fileToDataUrl(file) })} onClear={() => onChange({ ...backdrop, src: '' })} />
      <label className="grid gap-1 text-xs text-muted">Position
        <Input value={backdrop.position} onChange={(event) => onChange({ ...backdrop, position: event.target.value })} placeholder="50% 40%" />
      </label>
      <label className="grid gap-1 text-xs text-muted">Couleur de superposition
        <Input type="color" value={toColor(backdrop.overlay)} onChange={(event) => onChange({ ...backdrop, overlay: event.target.value })} />
      </label>
      <label className="grid gap-1 text-xs text-muted">Opacité du voile ({Math.round(backdrop.opacity * 100)} %)
        <input type="range" min={0} max={0.9} step={0.05} value={backdrop.opacity} onChange={(event) => onChange({ ...backdrop, opacity: Number(event.target.value) })} />
      </label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={backdrop.parallax} onChange={(event) => onChange({ ...backdrop, parallax: event.target.checked })} /> Parallaxe</label>
    </div>
  )
}

function FileField({ label, accept, hint, value, onFile, onClear }: { label: string; accept: string; hint?: string; value: string; onFile: (file: File) => Promise<void>; onClear: () => void }) {
  return (
    <div className="grid gap-1 text-xs text-muted">
      <span>{label}</span>
      {hint ? <span>{hint}</span> : null}
      <input type="file" accept={accept} onChange={(event) => { const file = event.target.files?.[0]; if (file) void onFile(file); event.target.value = '' }} />
      {value ? (
        <span className="flex items-center gap-2">
          <img src={value} alt="" className="h-10 w-10 rounded-md object-contain" />
          <button type="button" className="text-danger" onClick={onClear}>Retirer</button>
        </span>
      ) : <span>Aucun fichier.</span>}
    </div>
  )
}

async function applyFilms(project: Project) {
  const library = await loadFilms()
  await saveFilms({ ...library, films: library.films.map((film) => applyBrandToFilm(film, project)) })
  toast.success(library.films.length ? 'Couleurs, police et logo appliqués aux films' : 'Aucun film à mettre à jour pour l’instant')
}

function toColor(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#1c1712'
}
