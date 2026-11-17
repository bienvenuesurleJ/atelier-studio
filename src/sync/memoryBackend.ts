import type { RemoteDocument, RemoteFile, SyncBackend, SyncUser, UploadFile } from './backend'

interface StoredFile extends RemoteFile {
  body: Uint8Array
}

export function createMemoryBackend(user: SyncUser | null = { id: 'user-1', email: 'atelier@exemple.fr' }): SyncBackend {
  const documents = new Map<string, RemoteDocument>()
  const files = new Map<string, StoredFile>()
  let session = user
  const docKey = (kind: string) => `${session?.id ?? 'none'}:${kind}`
  const objectKey = (hash: string) => `${session?.id ?? 'none'}/${hash}`
  return {
    async currentUser() {
      return session
    },
    async signInPassword(email) {
      session = { id: email, email }
    },
    async signUpPassword(email) {
      session = { id: email, email }
      return ''
    },
    async sendMagicLink() {
      return undefined
    },
    async signOut() {
      session = null
    },
    async fetchDocument(kind) {
      return documents.get(docKey(kind)) ?? null
    },
    async saveDocument(kind, payload) {
      const updatedAt = new Date().toISOString()
      documents.set(docKey(kind), { payload, updatedAt })
      return updatedAt
    },
    async listFiles() {
      if (!session) return []
      const prefix = `${session.id}/`
      return [...files.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([, file]) => ({ hash: file.hash, name: file.name, mime: file.mime, bytes: file.bytes, updatedAt: file.updatedAt }))
    },
    async uploadFile(file: UploadFile) {
      if (!session) throw new Error('Connexion requise.')
      files.set(objectKey(file.hash), {
        hash: file.hash,
        name: file.name,
        mime: file.mime,
        bytes: file.bytes.byteLength,
        updatedAt: new Date().toISOString(),
        body: file.bytes,
      })
    },
    async downloadFile(hash) {
      return files.get(objectKey(hash))?.body ?? null
    },
  }
}
