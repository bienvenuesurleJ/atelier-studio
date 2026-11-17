import type { StudioFont } from './types'

export function safeFamily(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9 \-]/g, '').trim().slice(0, 48)
  return cleaned || 'Police importee'
}

export function fontFormat(fileName: string): StudioFont['format'] | null {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.woff2')) return 'woff2'
  if (lower.endsWith('.woff')) return 'woff'
  if (lower.endsWith('.ttf')) return 'truetype'
  if (lower.endsWith('.otf')) return 'opentype'
  return null
}

export function fontFaceCss(fonts: StudioFont[] | undefined): string {
  return (fonts ?? [])
    .map((font) => {
      const family = safeFamily(font.family)
      if (!font.dataUrl.startsWith('data:font/')) return ''
      return `@font-face{font-family:"${family}";src:url("${font.dataUrl}") format("${font.format}");font-display:swap;font-weight:100 900;}`
    })
    .filter(Boolean)
    .join('\n')
}
