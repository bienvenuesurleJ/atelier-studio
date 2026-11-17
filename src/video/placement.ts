import type { Clip } from './model'

export interface Box {
  x: number
  y: number
  w: number
  h: number
  rotation: number
  opacity: number
}

export interface Guide {
  axis: 'x' | 'y'
  at: number
}

export function defaultBox(clip: Clip, kind: string): Box {
  if (clip.x != null && clip.y != null && clip.w != null && clip.h != null) {
    return { x: clip.x, y: clip.y, w: clip.w, h: clip.h, rotation: clip.rotation ?? 0, opacity: clip.opacity ?? 1 }
  }
  if (kind === 'text') return { x: 8, y: 58, w: 84, h: 22, rotation: 0, opacity: 1 }
  if (clip.shape === 'circle') return { x: 74, y: 8, w: 16, h: 16, rotation: 0, opacity: 1 }
  if (clip.shape === 'badge') return { x: 8, y: 14, w: 42, h: 10, rotation: 0, opacity: 1 }
  if (clip.shape === 'bar') return { x: 0, y: 90, w: 100, h: 10, rotation: 0, opacity: 1 }
  if (kind === 'image' || kind === 'video') return { x: 0, y: 0, w: 100, h: 100, rotation: 0, opacity: 1 }
  return { x: 20, y: 20, w: 40, h: 18, rotation: 0, opacity: 1 }
}

export function smartOrigin(index: number): { x: number; y: number } {
  const column = index % 3
  const row = Math.floor(index / 3) % 4
  return { x: 10 + column * 22, y: 12 + row * 18 }
}

export function snapBox(box: Box, others: Box[], threshold = 1.6): { box: Box; guides: Guide[] } {
  const guides: Guide[] = []
  let x = box.x
  let y = box.y
  const anchorsX = [0, 50 - box.w / 2, 100 - box.w]
  const anchorsY = [0, 50 - box.h / 2, 100 - box.h]
  for (const other of others) {
    anchorsX.push(other.x, other.x + other.w / 2 - box.w / 2, other.x + other.w - box.w)
    anchorsY.push(other.y, other.y + other.h / 2 - box.h / 2, other.y + other.h - box.h)
  }
  const best = (value: number, anchors: number[], axis: 'x' | 'y') => {
    let chosen = value
    let distance = threshold
    for (const anchor of anchors) {
      const gap = Math.abs(value - anchor)
      if (gap <= distance) {
        distance = gap
        chosen = anchor
        guides.push({ axis, at: axis === 'x' ? anchor + (axis === 'x' ? box.w / 2 : 0) : anchor })
      }
    }
    return Math.round(chosen * 10) / 10
  }
  x = best(box.x, anchorsX, 'x')
  y = best(box.y, anchorsY, 'y')
  return { box: { ...box, x: clamp(x, -20, 100), y: clamp(y, -20, 100) }, guides }
}

export function nudge(box: Box, key: string, shift: boolean): Box {
  const step = shift ? 5 : 1
  if (key === 'ArrowLeft') return { ...box, x: box.x - step }
  if (key === 'ArrowRight') return { ...box, x: box.x + step }
  if (key === 'ArrowUp') return { ...box, y: box.y - step }
  if (key === 'ArrowDown') return { ...box, y: box.y + step }
  return box
}

export function bring(clips: { id: string; z?: number }[], id: string, where: 'forward' | 'back' | 'front' | 'backmost'): { id: string; z: number }[] {
  const ordered = [...clips].sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
  const index = ordered.findIndex((item) => item.id === id)
  if (index < 0) return ordered.map((item, order) => ({ id: item.id, z: order }))
  const [item] = ordered.splice(index, 1)
  if (where === 'front') ordered.push(item)
  else if (where === 'backmost') ordered.unshift(item)
  else if (where === 'forward') ordered.splice(Math.min(ordered.length, index + 1), 0, item)
  else ordered.splice(Math.max(0, index - 1), 0, item)
  return ordered.map((entry, order) => ({ id: entry.id, z: order }))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
