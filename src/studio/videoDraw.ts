import type { Project, PromoVideo, VideoScene } from '../domain/types'
import { sceneAt, transitionMix } from '../domain/video'

export interface DrawAssets {
  images: Map<string, CanvasImageSource>
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  project: Project,
  video: PromoVideo,
  time: number,
  assets: DrawAssets,
): void {
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  const tokens = project.tokens
  const here = sceneAt(video.scenes, time)
  const scene = video.scenes[here.index]
  if (!scene) return
  const mix = here.index < video.scenes.length - 1 ? transitionMix(here.local, here.duration) : 0
  paintScene(ctx, project, video, scene, here.local, here.duration, 1, assets)
  if (mix > 0) {
    const next = video.scenes[here.index + 1]
    ctx.save()
    ctx.globalAlpha = mix
    paintScene(ctx, project, video, next, 0.05, next.duration, mix, assets)
    ctx.restore()
  }
  ctx.fillStyle = tokens.primary
  ctx.fillRect(0, 0, width, Math.max(8, height * 0.008))
  ctx.fillStyle = tokens.text
  ctx.font = `${Math.round(height * 0.028)}px ${tokens.fontHeadingCss}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const brand = project.business.name
  ctx.fillText(brand, width * 0.08, height * 0.045, width * 0.7)
  if (project.business.city) {
    ctx.fillStyle = tokens.muted
    ctx.font = `${Math.round(height * 0.02)}px ${tokens.fontBodyCss}`
    ctx.fillText(project.business.city, width * 0.08, height * 0.08, width * 0.6)
  }
  if (here.index === video.scenes.length - 1) {
    const y = height * 0.86
    ctx.fillStyle = tokens.primary
    roundRect(ctx, width * 0.1, y, width * 0.8, height * 0.08, 18)
    ctx.fill()
    ctx.fillStyle = contrast(tokens.primary)
    ctx.font = `600 ${Math.round(height * 0.028)}px ${tokens.fontBodyCss}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(video.cta || scene.title, width / 2, y + height * 0.04, width * 0.7)
  }
}

function paintScene(
  ctx: CanvasRenderingContext2D,
  project: Project,
  video: PromoVideo,
  scene: VideoScene,
  local: number,
  duration: number,
  mix: number,
  assets: DrawAssets,
): void {
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  const tokens = project.tokens
  const progress = duration > 0 ? local / duration : 0
  ctx.fillStyle = tokens.bg
  ctx.fillRect(0, 0, width, height)
  const image = scene.image ? assets.images.get(scene.image) : undefined
  if (image) {
    const ken = scene.transition === 'kenburns'
    const zoom = ken ? 1 + progress * 0.14 : scene.transition === 'zoom' ? 0.92 + mix * 0.08 : 1
    const pan = ken ? (progress - 0.5) * width * 0.06 : scene.transition === 'slide' ? (1 - mix) * width * 0.08 : 0
    ctx.save()
    if (scene.transition === 'mask') {
      const radius = Math.hypot(width, height) * (0.2 + 0.9 * Math.max(mix, progress))
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2)
      ctx.clip()
    }
    ctx.translate(width / 2 + pan, height * 0.48)
    ctx.scale(zoom, zoom)
    cover(ctx, image, width * 1.05, height * 0.62)
    ctx.restore()
    const shade = ctx.createLinearGradient(0, height * 0.35, 0, height)
    shade.addColorStop(0, 'rgba(0,0,0,0)')
    shade.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = shade
    ctx.fillRect(0, height * 0.35, width, height * 0.65)
  } else {
    ctx.fillStyle = tokens.surface
    ctx.fillRect(width * 0.1, height * 0.18, width * 0.8, height * 0.34)
    ctx.fillStyle = tokens.primary
    ctx.font = `${Math.round(height * 0.12)}px ${tokens.fontHeadingCss}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText((project.business.name || 'A').slice(0, 1), width / 2, height * 0.35)
  }
  const appear = scene.textAnim === 'none' ? 1 : Math.min(1, local / 0.55)
  const rise = scene.textAnim === 'rise' ? (1 - appear) * height * 0.03 : 0
  ctx.save()
  ctx.globalAlpha = scene.textAnim === 'fade' || scene.textAnim === 'rise' ? appear : 1
  ctx.translate(0, rise)
  ctx.fillStyle = image ? '#f7f3ec' : tokens.text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const title = scene.textAnim === 'type' ? scene.title.slice(0, Math.ceil(scene.title.length * Math.min(1, local / 1.1))) : scene.title
  ctx.font = `600 ${Math.round(height * 0.055)}px ${tokens.fontHeadingCss}`
  wrap(ctx, title, width * 0.1, height * 0.58, width * 0.8, Math.round(height * 0.06))
  ctx.globalAlpha = image ? 0.92 : 0.8
  ctx.font = `${Math.round(height * 0.028)}px ${tokens.fontBodyCss}`
  wrap(ctx, scene.text, width * 0.1, height * 0.72, width * 0.8, Math.round(height * 0.036))
  ctx.restore()
  void video
}

function cover(ctx: CanvasRenderingContext2D, image: CanvasImageSource, boxW: number, boxH: number): void {
  const source = image as HTMLImageElement
  const sw = source.naturalWidth || boxW
  const sh = source.naturalHeight || boxH
  const scale = Math.max(boxW / sw, boxH / sh)
  const w = sw * scale
  const h = sh * scale
  ctx.drawImage(image, -w / 2, -h / 2, w, h)
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
      if (cursor > y + lineHeight * 4) return
    } else line = next
  }
  if (line) ctx.fillText(line, x, cursor, maxWidth)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
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
  if (raw.length < 6) return '#111111'
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#141414' : '#ffffff'
}
