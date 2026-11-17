import type { AnimSpec, FreeBox, FreeNode, Viewport } from './types'

export const SNAP_GRID = 8
export const SNAP_EDGE = 6

export function effectiveBox(node: FreeNode, viewport: Viewport): FreeBox {
  if (viewport === 'mobile') return { ...node.box.desktop, ...node.box.tablet, ...node.box.mobile }
  if (viewport === 'tablet') return { ...node.box.desktop, ...node.box.tablet }
  return { ...node.box.desktop }
}

export function writeBox(node: FreeNode, viewport: Viewport, box: FreeBox): FreeNode {
  if (viewport === 'tablet') return { ...node, box: { ...node.box, tablet: box } }
  if (viewport === 'mobile') return { ...node, box: { ...node.box, mobile: box } }
  return { ...node, box: { ...node.box, desktop: box } }
}

export interface SnapResult {
  x: number
  y: number
  guidesX: number[]
  guidesY: number[]
}

export function snapPoint(
  x: number,
  y: number,
  width: number,
  height: number,
  targetsX: number[],
  targetsY: number[],
): SnapResult {
  const xs = [x, x + width / 2, x + width]
  const ys = [y, y + height / 2, y + height]
  let nextX = x
  let nextY = y
  const guidesX: number[] = []
  const guidesY: number[] = []
  for (const edge of xs) {
    for (const target of targetsX) {
      if (Math.abs(edge - target) <= SNAP_EDGE) {
        nextX = x + (target - edge)
        guidesX.push(target)
        break
      }
    }
    if (guidesX.length) break
  }
  for (const edge of ys) {
    for (const target of targetsY) {
      if (Math.abs(edge - target) <= SNAP_EDGE) {
        nextY = y + (target - edge)
        guidesY.push(target)
        break
      }
    }
    if (guidesY.length) break
  }
  if (!guidesX.length) nextX = snapGrid(x)
  if (!guidesY.length) nextY = snapGrid(y)
  return { x: Math.round(nextX), y: Math.round(nextY), guidesX, guidesY }
}

function snapGrid(value: number): number {
  const snapped = Math.round(value / SNAP_GRID) * SNAP_GRID
  return Math.abs(value - snapped) <= 3 ? snapped : value
}

export type AlignMode = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'

export function alignBoxes(boxes: FreeBox[], mode: AlignMode): FreeBox[] {
  if (boxes.length < 2) return boxes.map((box) => ({ ...box }))
  if (mode === 'left') {
    const x = Math.min(...boxes.map((box) => box.x))
    return boxes.map((box) => ({ ...box, x }))
  }
  if (mode === 'right') {
    const right = Math.max(...boxes.map((box) => box.x + box.w))
    return boxes.map((box) => ({ ...box, x: right - box.w }))
  }
  if (mode === 'center') {
    const center = boxes.reduce((sum, box) => sum + box.x + box.w / 2, 0) / boxes.length
    return boxes.map((box) => ({ ...box, x: Math.round(center - box.w / 2) }))
  }
  if (mode === 'top') {
    const y = Math.min(...boxes.map((box) => box.y))
    return boxes.map((box) => ({ ...box, y }))
  }
  if (mode === 'bottom') {
    const bottom = Math.max(...boxes.map((box) => box.y + box.h))
    return boxes.map((box) => ({ ...box, y: bottom - box.h }))
  }
  const middle = boxes.reduce((sum, box) => sum + box.y + box.h / 2, 0) / boxes.length
  return boxes.map((box) => ({ ...box, y: Math.round(middle - box.h / 2) }))
}

export function distributeBoxes(boxes: FreeBox[], axis: 'h' | 'v'): FreeBox[] {
  if (boxes.length < 3) return boxes.map((box) => ({ ...box }))
  const indexed = boxes.map((box, index) => ({ box, index }))
  indexed.sort((a, b) => (axis === 'h' ? a.box.x - b.box.x : a.box.y - b.box.y))
  const first = indexed[0].box
  const last = indexed[indexed.length - 1].box
  const span = axis === 'h' ? last.x + last.w - first.x : last.y + last.h - first.y
  const total = indexed.reduce((sum, item) => sum + (axis === 'h' ? item.box.w : item.box.h), 0)
  const gap = (span - total) / (indexed.length - 1)
  let cursor = axis === 'h' ? first.x : first.y
  const next = boxes.map((box) => ({ ...box }))
  for (const item of indexed) {
    if (axis === 'h') {
      next[item.index] = { ...next[item.index], x: Math.round(cursor) }
      cursor += item.box.w + gap
    } else {
      next[item.index] = { ...next[item.index], y: Math.round(cursor) }
      cursor += item.box.h + gap
    }
  }
  return next
}

export function nudgeBox(box: FreeBox, key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown', step: number): FreeBox {
  if (key === 'ArrowLeft') return { ...box, x: box.x - step }
  if (key === 'ArrowRight') return { ...box, x: box.x + step }
  if (key === 'ArrowUp') return { ...box, y: box.y - step }
  return { ...box, y: box.y + step }
}

export function unionBox(boxes: FreeBox[]): FreeBox {
  const x = Math.min(...boxes.map((box) => box.x))
  const y = Math.min(...boxes.map((box) => box.y))
  const right = Math.max(...boxes.map((box) => box.x + box.w))
  const bottom = Math.max(...boxes.map((box) => box.y + box.h))
  const z = Math.max(...boxes.map((box) => box.z)) + 1
  return { x, y, w: Math.max(40, right - x), h: Math.max(40, bottom - y), r: 0, z }
}

export function groupNodes(nodes: FreeNode[], ids: string[], groupId: string): FreeNode[] {
  const chosen = nodes.filter((node) => ids.includes(node.id))
  if (chosen.length < 2) return nodes
  const parentId = chosen[0].parentId
  if (chosen.some((node) => node.parentId !== parentId)) return nodes
  const boxes = chosen.map((node) => node.box.desktop)
  const frame = unionBox(boxes)
  const group: FreeNode = {
    id: groupId,
    parentId,
    kind: 'container',
    name: 'Groupe',
    text: '',
    href: '',
    src: '',
    alt: '',
    locked: false,
    hidden: false,
    layout: 'free',
    columns: 2,
    gap: 12,
    box: { desktop: frame },
    style: { background: 'transparent' },
    motion: null,
  }
  return [
    group,
    ...nodes.map((node) => {
      if (!ids.includes(node.id)) return node
      return {
        ...node,
        parentId: groupId,
        box: {
          desktop: {
            ...node.box.desktop,
            x: node.box.desktop.x - frame.x,
            y: node.box.desktop.y - frame.y,
          },
        },
      }
    }),
  ]
}

export function applyCommittedBoxes(nodes: FreeNode[], viewport: Viewport, boxes: (FreeBox & { id: string })[]): FreeNode[] {
  return nodes.map((node) => {
    const next = boxes.find((box) => box.id === node.id)
    if (!next) return node
    return writeBox(node, viewport, { x: next.x, y: next.y, w: next.w, h: next.h, r: next.r, z: next.z })
  })
}

export function alignNodes(nodes: FreeNode[], ids: string[], viewport: Viewport, mode: AlignMode): FreeNode[] {
  const chosen = nodes.filter((node) => ids.includes(node.id))
  const boxes = alignBoxes(chosen.map((node) => effectiveBox(node, viewport)), mode)
  return nodes.map((node) => {
    const index = chosen.findIndex((item) => item.id === node.id)
    if (index < 0) return node
    return writeBox(node, viewport, boxes[index])
  })
}

export function distributeNodes(nodes: FreeNode[], ids: string[], viewport: Viewport, axis: 'h' | 'v'): FreeNode[] {
  const chosen = nodes.filter((node) => ids.includes(node.id))
  const boxes = distributeBoxes(chosen.map((node) => effectiveBox(node, viewport)), axis)
  return nodes.map((node) => {
    const index = chosen.findIndex((item) => item.id === node.id)
    if (index < 0) return node
    return writeBox(node, viewport, boxes[index])
  })
}

export function createFreeNode(kind: FreeNode['kind'], z: number, parentId: string | null = null): FreeNode {
  const name = { text: 'Texte', image: 'Image', button: 'Bouton', shape: 'Forme', container: 'Conteneur', grid: 'Grille', divider: 'Séparateur' }[kind]
  return {
    id: `node-${Math.random().toString(36).slice(2, 8)}`,
    parentId,
    kind,
    name,
    text: kind === 'button' ? 'Action' : kind === 'text' ? 'Nouveau texte' : '',
    href: kind === 'button' ? '#contenu' : '',
    src: '',
    alt: '',
    locked: false,
    hidden: false,
    layout: kind === 'grid' ? 'grid' : kind === 'container' ? 'free' : 'free',
    columns: 2,
    gap: 12,
    box: { desktop: { x: 32 + (z % 5) * 12, y: 32 + (z % 4) * 16, w: kind === 'divider' ? 220 : kind === 'grid' || kind === 'container' ? 320 : 200, h: kind === 'divider' ? 24 : kind === 'button' ? 52 : kind === 'grid' || kind === 'container' ? 220 : 88, r: 0, z } },
    style: {
      fontSize: kind === 'text' ? '1.6rem' : '1rem',
      ...(kind === 'button' ? { color: '#ffffff' } : {}),
      background: kind === 'shape' ? '#d7b07a' : kind === 'button' ? '#1c1712' : 'transparent',
      radius: kind === 'shape' || kind === 'button' ? '12px' : '0px',
    },
    motion: null,
  }
}

export function defaultAnim(patch: Partial<AnimSpec> = {}): AnimSpec {
  return {
    trigger: 'scroll',
    effect: 'fade',
    duration: 700,
    delay: 0,
    easing: 'ease-out',
    distance: 28,
    intensity: 1,
    repeat: 1,
    stagger: 70,
    direction: 'up',
    desktop: true,
    tablet: true,
    mobile: true,
    stiffness: 180,
    damping: 22,
    mass: 1,
    ...patch,
  }
}

export const ANIMATION_PRESETS: { id: string; name: string; spec: AnimSpec }[] = [
  { id: 'fade-in', name: 'Fondu à l’apparition', spec: defaultAnim({ effect: 'fade', trigger: 'scroll' }) },
  { id: 'slide-up', name: 'Glisse vers le haut', spec: defaultAnim({ effect: 'slide', direction: 'up', distance: 36 }) },
  { id: 'zoom', name: 'Zoom doux', spec: defaultAnim({ effect: 'zoom', intensity: 0.92 }) },
  { id: 'blur', name: 'Flou qui se dissipe', spec: defaultAnim({ effect: 'blur', intensity: 8 }) },
  { id: 'letters', name: 'Lettres une à une', spec: defaultAnim({ effect: 'letters', stagger: 28, duration: 500 }) },
  { id: 'words', name: 'Mots un à un', spec: defaultAnim({ effect: 'words', stagger: 60 }) },
  { id: 'mask', name: 'Révélation masquée', spec: defaultAnim({ effect: 'mask', direction: 'up' }) },
  { id: 'flip', name: 'Retournement 3D', spec: defaultAnim({ effect: 'flip', trigger: 'scroll', duration: 900 }) },
  { id: 'hover-lift', name: 'Survol', spec: defaultAnim({ effect: 'zoom', trigger: 'hover', intensity: 1.04, duration: 280 }) },
  { id: 'marquee', name: 'Défilement continu', spec: defaultAnim({ effect: 'marquee', trigger: 'load', repeat: 0, duration: 12000 }) },
  { id: 'gradient', name: 'Dégradé animé', spec: defaultAnim({ effect: 'gradient', trigger: 'load', repeat: 0, duration: 8000 }) },
  { id: 'parallax', name: 'Parallaxe', spec: defaultAnim({ effect: 'parallax', trigger: 'scroll-link', intensity: 0.25 }) },
]
