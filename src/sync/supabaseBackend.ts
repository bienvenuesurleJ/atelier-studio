import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { RemoteFile, SyncBackend, UploadFile } from './backend'

const BUCKET = 'atelier-files'

export function createSupabaseBackend(url: string, anonKey: string, redirectTo: string): SyncBackend {
  const client = createClient(url, anonKey, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return backendFor(client, redirectTo)
}

function backendFor(client: SupabaseClient, redirectTo: string): SyncBackend {
  return {
    async currentUser() {
      const { data } = await client.auth.getSession()
      const user = data.session?.user
      if (!user) return null
      return { id: user.id, email: user.email ?? '' }
    },
    async signInPassword(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw new Error(authMessage(error.message))
    },
    async signUpPassword(email, password) {
      const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
      if (error) throw new Error(authMessage(error.message))
      return data.session ? '' : 'Compte créé. Ouvrez le message reçu pour confirmer l’adresse, puis revenez ici.'
    },
    async sendMagicLink(email) {
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } })
      if (error) throw new Error(authMessage(error.message))
    },
    async signOut() {
      const { error } = await client.auth.signOut()
      if (error) throw new Error(authMessage(error.message))
    },
    async fetchDocument(kind) {
      const { data, error } = await client.from('documents').select('payload, updated_at').eq('kind', kind).maybeSingle()
      if (error) throw new Error(dataMessage(error.message))
      if (!data) return null
      return { payload: data.payload, updatedAt: data.updated_at as string }
    },
    async saveDocument(kind, payload) {
      const user = await requiredUser(client)
      const { data, error } = await client
        .from('documents')
        .upsert({ user_id: user.id, kind, payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id,kind' })
        .select('updated_at')
        .single()
      if (error) throw new Error(dataMessage(error.message))
      return data.updated_at as string
    },
    async listFiles() {
      const { data, error } = await client.from('files').select('hash, name, mime, bytes, updated_at').order('updated_at', { ascending: false })
      if (error) throw new Error(dataMessage(error.message))
      return (data ?? []).map((row) => ({
        hash: String(row.hash),
        name: String(row.name),
        mime: String(row.mime),
        bytes: Number(row.bytes),
        updatedAt: String(row.updated_at),
      })) satisfies RemoteFile[]
    },
    async uploadFile(file: UploadFile) {
      const user = await requiredUser(client)
      const path = `${user.id}/${file.hash}`
      const body = new Blob([file.bytes.buffer.slice(file.bytes.byteOffset, file.bytes.byteOffset + file.bytes.byteLength) as ArrayBuffer], { type: file.mime })
      const stored = await client.storage.from(BUCKET).upload(path, body, { contentType: file.mime, upsert: true })
      if (stored.error) throw new Error(dataMessage(stored.error.message))
      const { error } = await client.from('files').upsert({
        user_id: user.id,
        hash: file.hash,
        name: file.name,
        mime: file.mime,
        bytes: file.bytes.byteLength,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,hash' })
      if (error) throw new Error(dataMessage(error.message))
    },
    async downloadFile(hash) {
      const user = await requiredUser(client)
      const { data, error } = await client.storage.from(BUCKET).download(`${user.id}/${hash}`)
      if (error || !data) return null
      return new Uint8Array(await data.arrayBuffer())
    },
  }
}

async function requiredUser(client: SupabaseClient): Promise<{ id: string }> {
  const { data } = await client.auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('Connexion requise.')
  return { id }
}

function authMessage(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login')) return 'L’e-mail ou le mot de passe ne correspond pas.'
  if (lower.includes('already registered') || lower.includes('already been registered')) return 'Un compte existe déjà avec cet e-mail. Connectez-vous, ou demandez un lien.'
  if (lower.includes('email not confirmed')) return 'Confirmez l’adresse avec le message reçu, puis connectez-vous.'
  if (lower.includes('rate limit')) return 'Trop d’essais. Patientez une minute avant de redemander un message.'
  return message
}

function dataMessage(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('does not exist') || lower.includes('schema cache') || lower.includes('relation')) {
    return 'Les tables ne sont pas encore là. Collez supabase/setup.sql dans le SQL Editor, puis réessayez.'
  }
  if (lower.includes('jwt') || lower.includes('permission') || lower.includes('row-level')) return 'Accès refusé. Seules vos données sont visibles.'
  return message
}
