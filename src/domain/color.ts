export function safeColor(input: string, fallback: string): string {
  const value = input.trim()
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : fallback
}

export function expandHex(hex: string): string {
  const value = hex.replace('#', '')
  if (value.length === 3) {
    return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`
  }
  return `#${value}`
}

export function contrastColor(hex: string): string {
  const full = expandHex(safeColor(hex, '#111111')).slice(1)
  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  const y = (r * 299 + g * 587 + b * 114) / 1000
  return y > 150 ? '#141414' : '#ffffff'
}

export function safeFont(input: string, fallback: string): string {
  return /^[a-zA-Z0-9 ",-]+$/.test(input) ? input : fallback
}

export function safeCssToken(input: string, fallback: string): string {
  if (!input || input.length > 140 || /[;{}<>]/.test(input)) return fallback
  return input
}
