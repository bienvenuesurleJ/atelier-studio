import type { ElementStyle, Project } from '../domain/types'

const MAP: Record<keyof ElementStyle, string> = {
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  color: 'color',
  textAlign: 'text-align',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  textTransform: 'text-transform',
  opacity: 'opacity',
  maxWidth: 'max-width',
  margin: 'margin',
  padding: 'padding',
  background: 'background',
  radius: 'border-radius',
  border: 'border',
  shadow: 'box-shadow',
  width: 'width',
  height: 'height',
}

export function elementCss(project: Project): string {
  const rules: string[] = []
  for (const page of project.pages) {
    for (const block of page.blocks) {
      const elements = block.elements ?? {}
      for (const [key, override] of Object.entries(elements)) {
        if (!override) continue
        const sel = `[data-el="${cssIdent(block.id)}:${cssIdent(key)}"]`
        const desktop = styleDeclarations(override.desktop)
        const tablet = styleDeclarations(override.tablet)
        const mobile = styleDeclarations(override.mobile)
        if (desktop) rules.push(`${sel}{${desktop}}`)
        if (tablet) rules.push(`@media (max-width:1024px){${sel}{${tablet}}}`)
        if (mobile) rules.push(`@media (max-width:760px){${sel}{${mobile}}}`)
        if (override.hidden) rules.push(`${sel}{display:none !important}`)
      }
      const duration = safeTime(block.anim?.duration)
      const delay = safeTime(block.anim?.delay)
      if (duration || delay) {
        rules.push(
          `[data-bid="${cssIdent(block.id)}"].reveal.is-inview{transition-duration:${duration || '0.7s'};transition-delay:${delay || '0s'}}`,
        )
      }
    }
  }
  return rules.join('\n')
}

export function styleDeclarations(style: ElementStyle | undefined): string {
  if (!style) return ''
  const parts: string[] = []
  for (const key of Object.keys(MAP) as (keyof ElementStyle)[]) {
    const value = style[key]
    if (!value) continue
    const safe = safeValue(value)
    if (!safe) continue
    parts.push(`${MAP[key]}:${safe}`)
  }
  return parts.join(';')
}

function safeValue(input: string): string {
  const value = input.trim()
  if (!value || value.length > 80 || /[;{}<>]|url\s*\(|expression|javascript/i.test(value)) return ''
  return value
}

function safeTime(input: string | undefined): string {
  if (!input) return ''
  return /^\d+(\.\d+)?(ms|s)$/.test(input.trim()) ? input.trim() : ''
}

function cssIdent(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '')
}
