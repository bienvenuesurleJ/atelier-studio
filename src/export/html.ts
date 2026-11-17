export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function paragraphs(text: string): string {
  const parts = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.map((part) => `<p>${esc(part).replace(/\n/g, '<br>')}</p>`).join('')
}

export function safeJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function lines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}
