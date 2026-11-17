import { frameSize } from '../domain/video'
import type { Clip, Film } from './model'
import { clipsAt } from './model'

export interface FrameAssets {
  images: Map<string, CanvasImageSource>
}

export function drawFilm(ctx: CanvasRenderingContext2D, film: Film, time: number, assets: FrameAssets): void {
  const { width, height } = sizeOf(ctx)
  ctx.fillStyle = film.brand.bg
  ctx.fillRect(0, 0, width, height)
  for (const track of film.tracks) {
    if (track.kind === 'audio') continue
    for (const clip of clipsAt(track, time)) {
      const local = time - clip.start
      if (track.kind === 'image' || track.kind === 'video') paintMedia(ctx, film, clip, local, assets)
      if (track.kind === 'shape') paintShape(ctx, film, clip)
      if (track.kind === 'text') paintText(ctx, film, clip, local)
    }
  }
  ctx.fillStyle = film.brand.primary
  ctx.fillRect(0, 0, width, Math.max(6, height * 0.008))
}

function paintMedia(ctx: CanvasRenderingContext2D, film: Film, clip: Clip, local: number, assets: FrameAssets): void {
  const { width, height } = sizeOf(ctx)
  const source = clip.media ? assets.images.get(clip.media) : undefined
  const progress = clip.duration > 0 ? local / clip.duration : 0
  const zoom = clip.kenBurns || clip.transition === 'kenburns' ? 1 + progress * 0.12 : clip.transition === 'zoom' ? 1.04 - progress * 0.04 : 1
  ctx.save()
  if (clip.transition === 'mask') {
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, Math.hypot(width, height) * (0.25 + 0.8 * progress), 0, Math.PI * 2)
    ctx.clip()
  }
  if (clip.transition === 'slide') ctx.translate((1 - Math.min(1, local / 0.4)) * width * 0.08, 0)
  ctx.translate(width / 2, height / 2)
  ctx.scale(zoom, zoom)
  if (source) cover(ctx, source, width, height)
  else {
    ctx.fillStyle = film.brand.accent
    ctx.fillRect(-width / 2, -height / 2, width, height)
    ctx.fillStyle = film.brand.text
    ctx.font = `${Math.round(height * 0.08)}px ${film.brand.font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(film.brand.name.slice(0, 1), 0, 0)
  }
  ctx.restore()
  const shade = ctx.createLinearGradient(0, height * 0.45, 0, height)
  shade.addColorStop(0, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = shade
  ctx.fillRect(0, height * 0.45, width, height * 0.55)
}

function paintShape(ctx: CanvasRenderingContext2D, film: Film, clip: Clip): void {
  const { width, height } = sizeOf(ctx)
  ctx.fillStyle = clip.color || film.brand.primary
  if (clip.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(width * 0.82, height * 0.18, Math.min(width, height) * 0.08, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  if (clip.shape === 'badge') {
    const w = Math.min(width * 0.42, 280)
    round(ctx, width * 0.08, height * 0.16, w, height * 0.07, 16)
    ctx.fill()
    ctx.fillStyle = contrast(clip.color || film.brand.primary)
    ctx.font = `700 ${Math.round(height * 0.03)}px ${film.brand.font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(clip.text || 'Offre', width * 0.08 + w / 2, height * 0.16 + height * 0.035, w * 0.85)
    return
  }
  ctx.fillRect(0, height * 0.9, width, height * 0.1)
}

function paintText(ctx: CanvasRenderingContext2D, film: Film, clip: Clip, local: number): void {
  const { width, height } = sizeOf(ctx)
  const appear = clip.textAnim === 'none' ? 1 : Math.min(1, local / 0.5)
  ctx.save()
  ctx.globalAlpha = clip.textAnim === 'fade' || clip.textAnim === 'rise' ? appear : 1
  ctx.translate(0, clip.textAnim === 'rise' ? (1 - appear) * 18 : 0)
  ctx.fillStyle = film.brand.text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const title = clip.textAnim === 'type' ? clip.text.slice(0, Math.ceil(clip.text.length * Math.min(1, local / 1.2))) : clip.text
  ctx.font = `600 ${Math.round(height * 0.058)}px ${film.brand.font}`
  wrap(ctx, title, width * 0.08, height * 0.62, width * 0.84, Math.round(height * 0.064))
  ctx.globalAlpha *= 0.85
  ctx.font = `${Math.round(height * 0.028)}px ${film.brand.font}`
  wrap(ctx, clip.subtext, width * 0.08, height * 0.76, width * 0.84, Math.round(height * 0.036))
  ctx.restore()
}

function cover(ctx: CanvasRenderingContext2D, image: CanvasImageSource, boxW: number, boxH: number): void {
  const source = image as HTMLImageElement
  const sw = source.naturalWidth || (image as HTMLVideoElement).videoWidth || 0
  const sh = source.naturalHeight || (image as HTMLVideoElement).videoHeight || 0
  if (!sw || !sh) return
  const scale = Math.max(boxW / sw, boxH / sh)
  ctx.drawImage(image, (-sw * scale) / 2, (-sh * scale) / 2, sw * scale, sh * scale)
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const words = text.split(/\s+/).filter(Boolean)
  let line = ''
  let cursor = y
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, cursor, maxWidth)
      line = word
      cursor += lineHeight
      if (cursor > y + lineHeight * 5) return
    } else line = next
  }
  if (line) ctx.fillText(line, x, cursor, maxWidth)
}

function round(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function contrast(hex: string): string {
  const raw = hex.replace('#', '')
  if (raw.length < 6) return '#111'
  const y = (Number.parseInt(raw.slice(0, 2), 16) * 299 + Number.parseInt(raw.slice(2, 4), 16) * 587 + Number.parseInt(raw.slice(4, 6), 16) * 114) / 1000
  return y > 150 ? '#141414' : '#fff'
}

function sizeOf(ctx: CanvasRenderingContext2D): { width: number; height: number } {
  return { width: ctx.canvas.width, height: ctx.canvas.height }
}

export function canvasSize(format: Film['format']): { width: number; height: number } {
  return frameSize(format)
}
