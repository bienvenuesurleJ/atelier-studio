import { useEffect, useRef, useState } from 'react'
import type { Clip, Film } from './model'
import { defaultBox, snapBox, type Guide } from './placement'

export function Stage({
  film,
  time,
  selected,
  frame,
  onSelect,
  onPatch,
}: {
  film: Film
  time: number
  selected: string | null
  frame: { left: number; top: number; width: number; height: number }
  onSelect: (id: string) => void
  onPatch: (id: string, patch: Partial<Clip>, record: boolean) => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const elements = film.tracks.flatMap((track) => track.clips.filter((clip) => !clip.hidden && time >= clip.start && time < clip.start + clip.duration).map((clip) => ({ clip, kind: track.kind })))
  elements.sort((a, b) => (a.clip.z ?? 0) - (b.clip.z ?? 0))
  const current = elements.find((item) => item.clip.id === selected)
  const box = current ? defaultBox(current.clip, current.kind) : null
  const safe = film.format === '16:9' ? { x: 5, y: 10, w: 90, h: 80 } : film.format === '1:1' ? { x: 8, y: 8, w: 84, h: 84 } : { x: 8, y: 12, w: 84, h: 76 }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!current || current.clip.locked) return
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select')) return
      if (event.key.startsWith('Arrow')) {
        event.preventDefault()
        const step = event.shiftKey ? 5 : 1
        const next = defaultBox(current.clip, current.kind)
        if (event.key === 'ArrowLeft') next.x -= step
        if (event.key === 'ArrowRight') next.x += step
        if (event.key === 'ArrowUp') next.y -= step
        if (event.key === 'ArrowDown') next.y += step
        onPatch(current.clip.id, next, true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, onPatch])

  if (frame.width < 20) return null
  return (
    <div ref={host} className="absolute" style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }} onPointerDown={(event) => event.currentTarget.focus()} tabIndex={0}>
      <div className="pointer-events-none absolute border border-dashed border-white/50" style={{ left: `${safe.x}%`, top: `${safe.y}%`, width: `${safe.w}%`, height: `${safe.h}%` }} />
      {guides.map((guide, index) => (
        <div key={index} className="pointer-events-none absolute bg-brass" style={guide.axis === 'x' ? { left: `${guide.at}%`, top: 0, bottom: 0, width: 1 } : { top: `${guide.at}%`, left: 0, right: 0, height: 1 }} />
      ))}
      {elements.map(({ clip, kind }) => {
        const item = defaultBox(clip, kind)
        return (
          <button
            key={clip.id}
            type="button"
            aria-label={clip.text || kind}
            className="absolute"
            style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%`, transform: `rotate(${item.rotation}deg)` }}
            onPointerDown={(event) => {
              if (clip.locked) return
              event.stopPropagation()
              const hits = elements.filter((entry) => contains(defaultBox(entry.clip, entry.kind), pointOf(event, host.current)))
              const chosen = event.altKey ? hits[(hits.findIndex((entry) => entry.clip.id === selected) + 1) % Math.max(1, hits.length)] : hits.at(-1)
              const target = chosen ?? { clip, kind }
              onSelect(target.clip.id)
              const origin = defaultBox(target.clip, target.kind)
              const start = pointOf(event, host.current)
              const move = (next: PointerEvent) => {
                const point = pointOf(next, host.current)
                const moved = { ...origin, x: origin.x + point.x - start.x, y: origin.y + point.y - start.y }
                const others = elements.filter((entry) => entry.clip.id !== target.clip.id).map((entry) => defaultBox(entry.clip, entry.kind))
                const snapped = snapBox(moved, others)
                setGuides(snapped.guides)
                onPatch(target.clip.id, snapped.box, false)
              }
              const up = () => {
                setGuides([])
                window.removeEventListener('pointermove', move)
                window.removeEventListener('pointerup', up)
              }
              window.addEventListener('pointermove', move)
              window.addEventListener('pointerup', up)
            }}
          />
        )
      })}
      {current && box && !current.clip.locked ? (
        <div className="pointer-events-none absolute border-2 border-brass" style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%`, transform: `rotate(${box.rotation}deg)` }}>
          {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => (
            <span
              key={handle}
              className="pointer-events-auto absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brass bg-white"
              style={{ left: handle.includes('w') ? 0 : '100%', top: handle.includes('n') ? 0 : '100%' }}
              onPointerDown={(event) => {
                event.stopPropagation()
                const start = pointOf(event, host.current)
                const origin = box
                const move = (next: PointerEvent) => {
                  const point = pointOf(next, host.current)
                  const dx = point.x - start.x
                  const dy = point.y - start.y
                  const patch = { ...origin }
                  if (handle.includes('e')) patch.w = Math.max(6, origin.w + dx)
                  if (handle.includes('s')) patch.h = Math.max(6, origin.h + dy)
                  if (handle.includes('w')) { patch.x = origin.x + dx; patch.w = Math.max(6, origin.w - dx) }
                  if (handle.includes('n')) { patch.y = origin.y + dy; patch.h = Math.max(6, origin.h - dy) }
                  onPatch(current.clip.id, patch, false)
                }
                const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
                window.addEventListener('pointermove', move)
                window.addEventListener('pointerup', up)
              }}
            />
          ))}
          <span
            className="pointer-events-auto absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-6 rounded-full border border-brass bg-white"
            onPointerDown={(event) => {
              event.stopPropagation()
              const move = (next: PointerEvent) => {
                const point = pointOf(next, host.current)
                const centerX = box.x + box.w / 2
                const centerY = box.y + box.h / 2
                const rotation = Math.round((Math.atan2(point.y - centerY, point.x - centerX) * 180) / Math.PI + 90)
                onPatch(current.clip.id, { ...box, rotation }, false)
              }
              const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
              window.addEventListener('pointermove', move)
              window.addEventListener('pointerup', up)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

function pointOf(event: { clientX: number; clientY: number }, node: HTMLElement | null): { x: number; y: number } {
  const rect = node?.getBoundingClientRect()
  if (!rect || rect.width < 1) return { x: 0, y: 0 }
  return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }
}

function contains(box: { x: number; y: number; w: number; h: number }, point: { x: number; y: number }): boolean {
  return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h
}
