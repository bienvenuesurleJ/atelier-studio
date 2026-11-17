import type { SiteBackdrop } from './types'

export function emptyBackdrop(): SiteBackdrop {
  return { src: '', position: '50% 50%', overlay: '#1c1712', opacity: 0.4, parallax: false }
}

export function backdropVars(backdrop: SiteBackdrop | undefined, scope: 'site' | 'section'): string {
  if (!backdrop?.src) return ''
  const url = backdrop.src.replace(/["\\\n\r]/g, '')
  const attach = backdrop.parallax ? 'fixed' : 'scroll'
  const opacity = Number.isFinite(backdrop.opacity) ? Math.min(1, Math.max(0, backdrop.opacity)) : 0.4
  const position = backdrop.position || '50% 50%'
  const overlay = backdrop.overlay || '#1c1712'
  if (scope === 'site') {
    return `--site-bg:url("${url}");--site-pos:${position};--site-overlay:${overlay};--site-opacity:${opacity};--site-attach:${attach}`
  }
  return `--section-bg:url("${url}");--section-pos:${position};--section-overlay:${overlay};--section-opacity:${opacity};--section-attach:${attach}`
}
