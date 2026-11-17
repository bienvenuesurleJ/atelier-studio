export interface SyncUser {
  id: string
  email: string
}

export interface RemoteDocument {
  payload: unknown
  updatedAt: string
}

export interface RemoteFile {
  hash: string
  name: string
  mime: string
  bytes: number
  updatedAt: string
}

export interface UploadFile {
  hash: string
  name: string
  mime: string
  bytes: Uint8Array
}

export interface SyncBackend {
  currentUser(): Promise<SyncUser | null>
  signInPassword(email: string, password: string): Promise<void>
  signUpPassword(email: string, password: string): Promise<string>
  sendMagicLink(email: string, redirectTo: string): Promise<void>
  signOut(): Promise<void>
  fetchDocument(kind: 'studio' | 'films'): Promise<RemoteDocument | null>
  saveDocument(kind: 'studio' | 'films', payload: unknown): Promise<string>
  listFiles(): Promise<RemoteFile[]>
  uploadFile(file: UploadFile): Promise<void>
  downloadFile(hash: string): Promise<Uint8Array | null>
}
