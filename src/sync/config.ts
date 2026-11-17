const STORAGE_KEY = 'atelier-supabase-config'

export interface SupabaseConfig {
  url: string
  anonKey: string
  source: 'browser' | 'build'
}

export interface ConfigSource {
  local?: { url?: string; anonKey?: string } | null
  env?: { url?: string; anonKey?: string }
}

export function authRedirectTo(origin: string, base: string): string {
  const url = new URL(base || '/', origin)
  url.search = ''
  url.hash = ''
  if (!url.pathname.endsWith('/')) url.pathname += '/'
  return url.toString()
}

export function explainConfig(url: string, anonKey: string): string | null {
  const cleanUrl = url.trim().replace(/\/+$/, '')
  const cleanKey = anonKey.trim()
  if (!cleanUrl && !cleanKey) return null
  if (!cleanUrl || !cleanKey) return 'Il faut l’adresse du projet et la clé anon.'
  let parsed: URL
  try {
    parsed = new URL(cleanUrl)
  } catch {
    return 'L’adresse du projet n’est pas une URL.'
  }
  const local = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && local)) {
    return 'L’adresse doit commencer par https://.'
  }
  const role = jwtRole(cleanKey)
  if (role === 'service_role') return 'Cette clé est la clé secrète du serveur. Collez uniquement la clé anon, publique.'
  if (cleanKey.split('.').length < 3) return 'La clé anon ne ressemble pas à une clé Supabase.'
  return null
}

export function readSupabaseConfig(source: ConfigSource): SupabaseConfig | null {
  const localUrl = source.local?.url?.trim() ?? ''
  const localKey = source.local?.anonKey?.trim() ?? ''
  if (localUrl || localKey) {
    if (explainConfig(localUrl, localKey)) return null
    return { url: localUrl.replace(/\/+$/, ''), anonKey: localKey, source: 'browser' }
  }
  const envUrl = source.env?.url?.trim() ?? ''
  const envKey = source.env?.anonKey?.trim() ?? ''
  if (!envUrl && !envKey) return null
  if (explainConfig(envUrl, envKey)) return null
  return { url: envUrl.replace(/\/+$/, ''), anonKey: envKey, source: 'build' }
}

export function browserConfigSource(): ConfigSource {
  return {
    local: readStoredConfig(),
    env: {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
  }
}

export function readStoredConfig(): { url: string; anonKey: string } | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { url?: string; anonKey?: string }
    if (!parsed || typeof parsed.url !== 'string' || typeof parsed.anonKey !== 'string') return null
    return { url: parsed.url, anonKey: parsed.anonKey }
  } catch {
    return null
  }
}

export function writeStoredConfig(url: string, anonKey: string): void {
  const problem = explainConfig(url, anonKey)
  if (problem) throw new Error(problem)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim().replace(/\/+$/, ''), anonKey: anonKey.trim() }))
}

export function clearStoredConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* navigateur sans stockage */
  }
}

function jwtRole(token: string): string | null {
  const part = token.split('.')[1]
  if (!part) return null
  try {
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
    const json = JSON.parse(atob(padded)) as { role?: string }
    return typeof json.role === 'string' ? json.role : null
  } catch {
    return null
  }
}
