import { useRef, useState, type PointerEvent } from 'react'
import { ASPECTS, clampCrop, fitCrop } from '@/domain/imageFrame'
import type { CropRect, FocalPoint, ImageAdjust } from '@/domain/types'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'

export function ImageFrameButton({
  src,
  adjust,
  viewport,
  onChange,
}: {
  src: string
  adjust: ImageAdjust | undefined
  viewport: 'desktop' | 'tablet' | 'mobile'
  onChange: (adjust: ImageAdjust) => void
}) {
  const [open, setOpen] = useState(false)
  if (!src) return null
  const current = adjust ?? { original: src, crop: { x: 10, y: 10, w: 80, h: 80 }, focal: { x: 50, y: 50 } }
  return (
    <>
      <Button size="sm" variant="quiet" type="button" onClick={() => setOpen(true)}>Recadrer et point focal</Button>
      <Modal open={open} onOpenChange={setOpen} title="Cadrage de l’image" className="w-[min(720px,calc(100%-2rem))]">
        <FrameEditor
          src={current.original || src}
          adjust={current}
          viewport={viewport}
          onCancel={() => setOpen(false)}
          onApply={(next) => {
            onChange({ ...next, original: current.original || src })
            setOpen(false)
          }}
        />
      </Modal>
    </>
  )
}

function FrameEditor({
  src,
  adjust,
  viewport,
  onApply,
  onCancel,
}: {
  src: string
  adjust: ImageAdjust
  viewport: 'desktop' | 'tablet' | 'mobile'
  onApply: (adjust: ImageAdjust) => void
  onCancel: () => void
}) {
  const [crop, setCrop] = useState<CropRect>(adjust.crop ?? { x: 8, y: 8, w: 84, h: 84 })
  const [focal, setFocal] = useState<FocalPoint>(viewport === 'mobile' ? adjust.focalMobile ?? adjust.focal : viewport === 'tablet' ? adjust.focalTablet ?? adjust.focal : adjust.focal)
  const [aspect, setAspect] = useState('free')
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef<{ mode: string; x: number; y: number; crop: CropRect } | null>(null)

  const point = (event: PointerEvent<HTMLDivElement>) => {
    const rect = box.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">Le recadrage est commun. Le point focal (object-position) est celui de {viewport === 'mobile' ? 'mobile' : viewport === 'tablet' ? 'la tablette' : 'l’ordinateur'}.</p>
      <div className="flex flex-wrap gap-1">
        {ASPECTS.map((item) => (
          <Button key={item.id} size="sm" variant={aspect === item.id ? 'default' : 'quiet'} type="button" onClick={() => { setAspect(item.id); setCrop(fitCrop(item.ratio, crop)) }}>{item.label}</Button>
        ))}
      </div>
      <div
        ref={box}
        className="relative h-72 overflow-hidden rounded-xl bg-sand"
        onPointerDown={(event) => {
          const at = point(event)
          const edge = edgeAt(crop, at)
          drag.current = { mode: edge || (inside(crop, at) ? 'move' : 'focal'), x: at.x, y: at.y, crop }
          if (!edge && !inside(crop, at)) setFocal({ x: Math.round(at.x), y: Math.round(at.y) })
        }}
        onPointerMove={(event) => {
          if (!drag.current) return
          const at = point(event)
          const dx = at.x - drag.current.x
          const dy = at.y - drag.current.y
          if (drag.current.mode === 'focal') return
          if (drag.current.mode === 'move') {
            setCrop(clampCrop({ ...drag.current.crop, x: drag.current.crop.x + dx, y: drag.current.crop.y + dy }))
            return
          }
          setCrop(resizeCrop(drag.current.crop, drag.current.mode, dx, dy, ASPECTS.find((item) => item.id === aspect)?.ratio ?? 0))
        }}
        onPointerUp={() => { drag.current = null }}
      >
        <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${focal.x}% ${focal.y}%` }} />
        <div className="absolute border-2 border-brass bg-brass/10" style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.w}%`, height: `${crop.h}%` }} />
        <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sand bg-brass" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={() => onApply(withFocal(adjust, viewport, focal, crop))}>Appliquer</Button>
        <Button type="button" variant="quiet" onClick={onCancel}>Fermer</Button>
      </div>
    </div>
  )
}

function withFocal(adjust: ImageAdjust, viewport: 'desktop' | 'tablet' | 'mobile', focal: FocalPoint, crop: CropRect): ImageAdjust {
  const next = { ...adjust, crop }
  if (viewport === 'tablet') return { ...next, focalTablet: focal }
  if (viewport === 'mobile') return { ...next, focalMobile: focal }
  return { ...next, focal }
}

function inside(crop: CropRect, at: { x: number; y: number }) {
  return at.x > crop.x && at.x < crop.x + crop.w && at.y > crop.y && at.y < crop.y + crop.h
}

function edgeAt(crop: CropRect, at: { x: number; y: number }) {
  const near = (a: number, b: number) => Math.abs(a - b) < 4
  const left = near(at.x, crop.x)
  const right = near(at.x, crop.x + crop.w)
  const top = near(at.y, crop.y)
  const bottom = near(at.y, crop.y + crop.h)
  if (top && left) return 'nw'
  if (top && right) return 'ne'
  if (bottom && left) return 'sw'
  if (bottom && right) return 'se'
  if (left) return 'w'
  if (right) return 'e'
  if (top) return 'n'
  if (bottom) return 's'
  return ''
}

function resizeCrop(start: CropRect, mode: string, dx: number, dy: number, ratio: number): CropRect {
  let next = { ...start }
  if (mode.includes('e')) next.w = start.w + dx
  if (mode.includes('s')) next.h = start.h + dy
  if (mode.includes('w')) { next.x = start.x + dx; next.w = start.w - dx }
  if (mode.includes('n')) { next.y = start.y + dy; next.h = start.h - dy }
  if (ratio) {
    next.h = next.w / ratio
  }
  return clampCrop(next)
}
