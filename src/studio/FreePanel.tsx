import { alignNodes, createFreeNode, distributeNodes, groupNodes } from '@/domain/freeform'
import type { FreeKind, FreeNode, Project, Viewport } from '@/domain/types'
import { updateBlock } from '@/domain/projectOps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { Toggle } from '@/components/ui/switch'

const KINDS: { id: FreeKind; label: string }[] = [
  { id: 'text', label: 'Texte' },
  { id: 'image', label: 'Image' },
  { id: 'button', label: 'Bouton' },
  { id: 'shape', label: 'Forme' },
  { id: 'container', label: 'Conteneur' },
  { id: 'grid', label: 'Grille' },
  { id: 'divider', label: 'Séparateur' },
]

export function FreePanel({
  project,
  pageId,
  blockId,
  nodes,
  layoutMode,
  hideFlow,
  viewport,
  selectedIds,
  commit,
  onSelect,
}: {
  project: Project
  pageId: string
  blockId: string
  nodes: FreeNode[]
  layoutMode: 'flow' | 'free'
  hideFlow: boolean
  viewport: Viewport
  selectedIds: string[]
  commit: (project: Project) => void
  onSelect: (ids: string[]) => void
}) {
  const patchNodes = (next: FreeNode[]) =>
    commit(updateBlock(project, pageId, blockId, (block) => ({ ...block, freeNodes: next, layoutMode: 'free' })))
  const parent = selectedIds.length === 1 ? nodes.find((node) => node.id === selectedIds[0] && (node.kind === 'container' || node.kind === 'grid')) : undefined
  return (
    <section className="grid gap-2 rounded-xl border border-line p-2">
      <p className="text-xs uppercase tracking-[0.14em] text-brass">Placement</p>
      <Toggle
        label="Canevas libre"
        checked={layoutMode === 'free'}
        onCheckedChange={(on) => commit(updateBlock(project, pageId, blockId, (block) => ({ ...block, layoutMode: on ? 'free' : 'flow' })))}
      />
      <Toggle
        label="Masquer le modèle sous le canevas"
        checked={hideFlow}
        onCheckedChange={(on) => commit(updateBlock(project, pageId, blockId, (block) => ({ ...block, hideFlow: on, layoutMode: 'free' })))}
      />
      <div className="flex flex-wrap gap-1">
        {KINDS.map((kind) => (
          <Button
            key={kind.id}
            size="sm"
            variant="quiet"
            onClick={() => {
              const z = nodes.reduce((max, node) => Math.max(max, node.box.desktop.z), 0) + 1
              const node = createFreeNode(kind.id, z, parent?.id ?? null)
              patchNodes([...nodes, node])
              onSelect([node.id])
            }}
          >
            {kind.label}
          </Button>
        ))}
      </div>
      <p className="text-[11px] text-muted">Glissez dans l’aperçu. Maj+clic ou le rectangle de sélection pour en prendre plusieurs. Flèches : 1 px, Maj+flèches : 10 px. Les poignées redimensionnent, le point doré tourne.</p>
      {selectedIds.length > 1 ? (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="quiet" onClick={() => patchNodes(alignNodes(nodes, selectedIds, viewport, 'left'))}>Gauche</Button>
          <Button size="sm" variant="quiet" onClick={() => patchNodes(alignNodes(nodes, selectedIds, viewport, 'center'))}>Centre</Button>
          <Button size="sm" variant="quiet" onClick={() => patchNodes(alignNodes(nodes, selectedIds, viewport, 'right'))}>Droite</Button>
          <Button size="sm" variant="quiet" onClick={() => patchNodes(alignNodes(nodes, selectedIds, viewport, 'top'))}>Haut</Button>
          <Button size="sm" variant="quiet" onClick={() => patchNodes(alignNodes(nodes, selectedIds, viewport, 'middle'))}>Milieu</Button>
          <Button size="sm" variant="quiet" onClick={() => patchNodes(distributeNodes(nodes, selectedIds, viewport, 'h'))}>Répartir</Button>
          <Button size="sm" variant="quiet" onClick={() => patchNodes(groupNodes(nodes, selectedIds, `node-${Math.random().toString(36).slice(2, 8)}`))}>Grouper</Button>
        </div>
      ) : null}
      <ul className="grid gap-1">
        {[...nodes].sort((a, b) => b.box.desktop.z - a.box.desktop.z).map((node) => (
          <li key={node.id} className="flex items-center gap-1 text-xs">
            <button type="button" className={selectedIds.includes(node.id) ? 'text-brass' : ''} onClick={() => onSelect([node.id])}>{node.name}</button>
            <span className="text-muted">z{node.box.desktop.z}</span>
            <button type="button" aria-label="Monter" onClick={() => patchNodes(nodes.map((item) => item.id === node.id ? { ...item, box: { ...item.box, desktop: { ...item.box.desktop, z: item.box.desktop.z + 1 } } } : item))}>+</button>
            <button type="button" aria-label={node.locked ? 'Déverrouiller' : 'Verrouiller'} onClick={() => patchNodes(nodes.map((item) => item.id === node.id ? { ...item, locked: !item.locked } : item))}>{node.locked ? 'Déverrouiller' : 'Verrouiller'}</button>
            <button type="button" aria-label={node.hidden ? 'Afficher' : 'Masquer'} onClick={() => patchNodes(nodes.map((item) => item.id === node.id ? { ...item, hidden: !item.hidden } : item))}>{node.hidden ? 'Afficher' : 'Masquer'}</button>
            <button type="button" className="text-danger" onClick={() => patchNodes(nodes.filter((item) => item.id !== node.id && item.parentId !== node.id))}>Retirer</button>
          </li>
        ))}
      </ul>
      {selectedIds.length === 1 ? <NodeFields nodes={nodes} id={selectedIds[0]} viewport={viewport} patchNodes={patchNodes} /> : null}
    </section>
  )
}

function NodeFields({
  nodes,
  id,
  viewport,
  patchNodes,
}: {
  nodes: FreeNode[]
  id: string
  viewport: Viewport
  patchNodes: (nodes: FreeNode[]) => void
}) {
  const node = nodes.find((item) => item.id === id)
  if (!node) return null
  const box = viewport === 'mobile' ? { ...node.box.desktop, ...node.box.tablet, ...node.box.mobile } : viewport === 'tablet' ? { ...node.box.desktop, ...node.box.tablet } : node.box.desktop
  const setBox = (partial: Partial<typeof box>) => {
    const next = { ...box, ...partial }
    patchNodes(nodes.map((item) => {
      if (item.id !== id) return item
      if (viewport === 'tablet') return { ...item, box: { ...item.box, tablet: next } }
      if (viewport === 'mobile') return { ...item, box: { ...item.box, mobile: next } }
      return { ...item, box: { ...item.box, desktop: next } }
    }))
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <Num label="X" value={box.x} onChange={(x) => setBox({ x })} />
      <Num label="Y" value={box.y} onChange={(y) => setBox({ y })} />
      <Num label="Largeur" value={box.w} onChange={(w) => setBox({ w })} />
      <Num label="Hauteur" value={box.h} onChange={(h) => setBox({ h })} />
      <Num label="Rotation" value={box.r} onChange={(r) => setBox({ r })} />
      <label className="col-span-2 grid gap-1 text-xs text-muted">
        Texte
        <Input value={node.text} onChange={(event) => patchNodes(nodes.map((item) => item.id === id ? { ...item, text: event.target.value } : item))} />
      </label>
    </div>
  )
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-xs text-muted">
      {label}
      <Input type="number" value={Math.round(value)} onChange={(event) => onChange(Number(event.target.value) || 0)} />
    </label>
  )
}
