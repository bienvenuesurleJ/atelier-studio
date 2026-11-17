import type { CropRect, FocalPoint, ImageAdjust, Project } from './types'

export const ASPECTS: { id: string; label: string; ratio: number }[] = [
  { id: 'free', label: 'Libre', ratio: 0 },
  { id: 'square', label: '1:1', ratio: 1 },
  { id: 'portrait', label: '4:5', ratio: 4 / 5 },
  { id: 'landscape', label: '16:9', ratio: 16 / 9 },
  { id: 'photo', label: '3:2', ratio: 3 / 2 },
  { id: 'story', label: '2:3', ratio: 2 / 3 },
]

export function fullCrop(): CropRect {
  return { x: 0, y: 0, w: 100, h: 100 }
}

export function defaultAdjust(original = ''): ImageAdjust {
  return { original, crop: null, focal: { x: 50, y: 50 } }
}

export function fitCrop(ratio: number, current: CropRect): CropRect {
  if (!ratio) return clampCrop(current)
  const centerX = current.x + current.w / 2
  const centerY = current.y + current.h / 2
  let w = current.w
  let h = w / ratio
  if (h > 100) {
    h = 100
    w = h * ratio
  }
  if (w > 100) {
    w = 100
    h = w / ratio
  }
  return clampCrop({ x: centerX - w / 2, y: centerY - h / 2, w, h })
}

export function clampCrop(crop: CropRect): CropRect {
  const w = clamp(crop.w, 8, 100)
  const h = clamp(crop.h, 8, 100)
  return {
    x: clamp(crop.x, 0, 100 - w),
    y: clamp(crop.y, 0, 100 - h),
    w,
    h,
  }
}

export function focalFor(adjust: ImageAdjust, viewport: 'desktop' | 'tablet' | 'mobile'): FocalPoint {
  if (viewport === 'mobile') return adjust.focalMobile ?? adjust.focalTablet ?? adjust.focal
  if (viewport === 'tablet') return adjust.focalTablet ?? adjust.focal
  return adjust.focal
}

export function focalDeclaration(point: FocalPoint): string {
  return `object-position:${clamp(point.x, 0, 100)}% ${clamp(point.y, 0, 100)}%`
}

export function imageAdjustCss(project: Project): string {
  const rules: string[] = []
  for (const page of project.pages) {
    for (const block of page.blocks) {
      for (const [key, adjust] of Object.entries(block.imageFrames ?? {})) {
        rules.push(focalRules(`[data-focal="${block.id}:${key}"]`, adjust))
      }
      for (const node of block.freeNodes ?? []) {
        if (!node.image) continue
        rules.push(focalRules(`[data-focal="${node.id}"]`, node.image))
      }
    }
  }
  return rules.join('\n')
}

function focalRules(selector: string, adjust: ImageAdjust): string {
  const parts = [`${selector}{${focalDeclaration(adjust.focal)};object-fit:cover}`]
  if (adjust.focalTablet) parts.push(`@media (max-width:1024px){${selector}{${focalDeclaration(adjust.focalTablet)}}}`)
  if (adjust.focalMobile) parts.push(`@media (max-width:760px){${selector}{${focalDeclaration(adjust.focalMobile)}}}`)
  if (adjust.crop && (adjust.crop.w < 99.5 || adjust.crop.h < 99.5 || adjust.crop.x > 0.5 || adjust.crop.y > 0.5)) {
    const crop = clampCrop(adjust.crop)
    const width = 10000 / crop.w
    const height = 10000 / crop.h
    const left = (-crop.x / crop.w) * 100
    const top = (-crop.y / crop.h) * 100
    parts.push(
      `${selector}{position:absolute;max-width:none;width:${round(width)}%;height:${round(height)}%;left:${round(left)}%;top:${round(top)}%;object-fit:fill}`,
    )
  }
  return parts.join('\n')
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
