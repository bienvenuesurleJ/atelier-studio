export interface ExtractedFile {
  hash: string
  mime: string
  name: string
  bytes: Uint8Array
}

const DATA_URL = /^data:((?:image|video|audio|font)\/[-+.\w]+)(;base64)?,([a-z0-9+/=\s]+)$/i

export function fileRef(hash: string): string {
  return `atelier-file://${hash}`
}

export function fileHash(value: string): string | null {
  const match = /^atelier-file:\/\/([a-f0-9]{64})$/i.exec(value)
  return match ? match[1].toLowerCase() : null
}

export async function hashBytes(bytes: Uint8Array): Promise<string> {
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const digest = await crypto.subtle.digest('SHA-256', copy)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function extractMedia(value: unknown): Promise<{ value: unknown; files: ExtractedFile[] }> {
  const files = new Map<string, ExtractedFile>()
  const next = await walk(value, files)
  return { value: next, files: [...files.values()] }
}

export function restoreMedia(value: unknown, files: Map<string, { mime: string; bytes: Uint8Array }>): unknown {
  if (typeof value === 'string') {
    const hash = fileHash(value)
    const file = hash ? files.get(hash) : undefined
    return file ? toDataUrl(file.mime, file.bytes) : value
  }
  if (Array.isArray(value)) return value.map((item) => restoreMedia(item, files))
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, restoreMedia(item, files)]))
  }
  return value
}

export function collectRefs(value: unknown, into = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    const hash = fileHash(value)
    if (hash) into.add(hash)
    return into
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectRefs(item, into))
    return into
  }
  if (value && typeof value === 'object') Object.values(value as Record<string, unknown>).forEach((item) => collectRefs(item, into))
  return into
}

async function walk(value: unknown, files: Map<string, ExtractedFile>): Promise<unknown> {
  if (typeof value === 'string') {
    const parsed = parseDataUrl(value)
    if (!parsed) return value
    const hash = await hashBytes(parsed.bytes)
    if (!files.has(hash)) files.set(hash, { hash, mime: parsed.mime, name: fileName(hash, parsed.mime), bytes: parsed.bytes })
    return fileRef(hash)
  }
  if (Array.isArray(value)) return Promise.all(value.map((item) => walk(item, files)))
  if (value && typeof value === 'object') {
    const entries = await Promise.all(Object.entries(value as Record<string, unknown>).map(async ([key, item]) => [key, await walk(item, files)] as const))
    return Object.fromEntries(entries)
  }
  return value
}

function parseDataUrl(value: string): { mime: string; bytes: Uint8Array } | null {
  const match = DATA_URL.exec(value.trim())
  if (!match || !/;base64,/i.test(value)) return null
  try {
    const binary = atob(match[3].replace(/\s/g, ''))
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    return { mime: match[1].toLowerCase(), bytes }
  } catch {
    return null
  }
}

function fileName(hash: string, mime: string): string {
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg').replace('svg+xml', 'svg').replace('quicktime', 'mov') ?? 'bin'
  return `${hash.slice(0, 8)}.${ext}`
}

function toDataUrl(mime: string, bytes: Uint8Array): string {
  let binary = ''
  const step = 0x8000
  for (let index = 0; index < bytes.length; index += step) {
    binary += String.fromCharCode(...bytes.subarray(index, index + step))
  }
  return `data:${mime};base64,${btoa(binary)}`
}
