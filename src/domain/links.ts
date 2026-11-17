export type LinkMode = 'export' | 'preview'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i

export function safeHref(raw: string, mode: LinkMode): string {
  const value = raw.trim()
  if (!value) return '#'
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value
  if (value.startsWith('#') && !value.toLowerCase().startsWith('javascript:')) return value
  const withoutFile = value.replace(/^\.?\//, '').replace(/\.html$/i, '')
  if (SLUG.test(withoutFile)) {
    const slug = withoutFile === 'index' ? 'index' : withoutFile
    if (mode === 'preview') return `#__page:${slug}`
    return slug === 'index' ? 'index.html' : `${slug}.html`
  }
  return '#'
}

export function safeImg(src: string): string {
  const value = src.trim()
  if (!value) return ''
  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+$/.test(value)) return value
  if (/^assets\/[a-zA-Z0-9._-]+$/.test(value)) return value
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString()
  } catch {
    return ''
  }
  return ''
}

export function embedUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] ?? ''
      return youtube(id)
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = url.searchParams.get('v')
      const fromPath = url.pathname.split('/').filter(Boolean).pop() ?? ''
      return youtube(fromQuery || fromPath)
    }
    if (host === 'vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0] ?? ''
      return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }
    if (host === 'player.vimeo.com') return url.toString()
  } catch {
    return null
  }
  return null
}

function youtube(id: string): string | null {
  return /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
}

export function waLink(phone: string, text: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `33${digits.slice(1)}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export function mapQuery(parts: string[]): string {
  return parts.map((part) => part.trim()).filter(Boolean).join(', ')
}
