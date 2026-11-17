import { ANIMATION_PRESETS, defaultAnim } from '@/domain/freeform'
import type { AnimSpec } from '@/domain/types'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/field'

export function MotionPanel({
  spec,
  onChange,
  onReplay,
}: {
  spec: AnimSpec | null
  onChange: (spec: AnimSpec | null) => void
  onReplay: () => void
}) {
  return (
    <section className="grid gap-2 rounded-xl border border-line p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.14em] text-brass">Animation</p>
        <Button size="sm" variant="quiet" onClick={onReplay} disabled={!spec}>Rejouer</Button>
      </div>
      <Select
        aria-label="Préréglage"
        value=""
        onChange={(event) => {
          const preset = ANIMATION_PRESETS.find((item) => item.id === event.target.value)
          if (preset) onChange({ ...preset.spec })
        }}
      >
        <option value="">Préréglages</option>
        {ANIMATION_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>{preset.name}</option>
        ))}
      </Select>
      {!spec ? (
        <Button size="sm" onClick={() => onChange(defaultAnim())}>Ajouter une animation</Button>
      ) : (
        <div className="grid gap-2">
          <Select aria-label="Déclencheur" value={spec.trigger} onChange={(event) => onChange({ ...spec, trigger: event.target.value as AnimSpec['trigger'] })}>
            <option value="load">Au chargement</option>
            <option value="scroll">À l’apparition</option>
            <option value="hover">Au survol</option>
            <option value="click">Au clic</option>
            <option value="scroll-link">Liée au défilement</option>
          </Select>
          <Select aria-label="Effet" value={spec.effect} onChange={(event) => onChange({ ...spec, effect: event.target.value as AnimSpec['effect'] })}>
            <option value="none">Aucune</option>
            <option value="fade">Fondu</option>
            <option value="slide">Glissement</option>
            <option value="zoom">Zoom</option>
            <option value="blur">Flou</option>
            <option value="rotate">Rotation</option>
            <option value="flip">Retournement 3D</option>
            <option value="tilt">Inclinaison 3D</option>
            <option value="letters">Lettre par lettre</option>
            <option value="words">Mot par mot</option>
            <option value="mask">Masque</option>
            <option value="stagger">Décalage des enfants</option>
            <option value="parallax">Parallaxe</option>
            <option value="marquee">Bandeau</option>
            <option value="gradient">Dégradé animé</option>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Num label="Durée (ms)" value={spec.duration} onChange={(duration) => onChange({ ...spec, duration })} />
            <Num label="Délai (ms)" value={spec.delay} onChange={(delay) => onChange({ ...spec, delay })} />
            <Num label="Distance" value={spec.distance} onChange={(distance) => onChange({ ...spec, distance })} />
            <Num label="Intensité" value={spec.intensity} onChange={(intensity) => onChange({ ...spec, intensity })} />
            <Num label="Répétitions (0 = infini)" value={spec.repeat} onChange={(repeat) => onChange({ ...spec, repeat })} />
            <Num label="Décalage" value={spec.stagger} onChange={(stagger) => onChange({ ...spec, stagger })} />
          </div>
          <Select aria-label="Courbe" value={spec.easing} onChange={(event) => onChange({ ...spec, easing: event.target.value as AnimSpec['easing'] })}>
            <option value="ease">ease</option>
            <option value="ease-out">ease-out</option>
            <option value="ease-in">ease-in</option>
            <option value="ease-in-out">ease-in-out</option>
            <option value="linear">linéaire</option>
            <option value="spring">ressort physique</option>
          </Select>
          {spec.easing === 'spring' ? (
            <div className="grid grid-cols-3 gap-2">
              <Num label="Raideur" value={spec.stiffness ?? 180} onChange={(stiffness) => onChange({ ...spec, stiffness })} />
              <Num label="Amorti" value={spec.damping ?? 22} onChange={(damping) => onChange({ ...spec, damping })} />
              <Num label="Masse" value={spec.mass ?? 1} onChange={(mass) => onChange({ ...spec, mass })} />
            </div>
          ) : null}
          <Select aria-label="Direction" value={spec.direction} onChange={(event) => onChange({ ...spec, direction: event.target.value as AnimSpec['direction'] })}>
            <option value="up">Haut</option>
            <option value="down">Bas</option>
            <option value="left">Gauche</option>
            <option value="right">Droite</option>
          </Select>
          <div className="flex flex-wrap gap-3 text-xs">
            <label><input type="checkbox" checked={spec.desktop} onChange={(event) => onChange({ ...spec, desktop: event.target.checked })} /> Ordinateur</label>
            <label><input type="checkbox" checked={spec.tablet} onChange={(event) => onChange({ ...spec, tablet: event.target.checked })} /> Tablette</label>
            <label><input type="checkbox" checked={spec.mobile} onChange={(event) => onChange({ ...spec, mobile: event.target.checked })} /> Mobile</label>
          </div>
          <Button size="sm" variant="quiet" onClick={() => onChange(null)}>Retirer l’animation</Button>
        </div>
      )}
      <p className="text-[11px] text-muted">Les visiteurs qui demandent moins d’animation voient l’état final, sans mouvement.</p>
    </section>
  )
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-xs text-muted">
      {label}
      <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} />
    </label>
  )
}
