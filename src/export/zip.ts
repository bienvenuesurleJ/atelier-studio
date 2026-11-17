import JSZip from 'jszip'
import type { Project } from '../domain/types'
import { generateSite, type GeneratedFile } from './generateSite'

export async function zipFiles(files: GeneratedFile[]): Promise<Uint8Array> {
  const zip = new JSZip()
  for (const file of files) zip.file(file.path, file.content)
  return zip.generateAsync({ type: 'uint8array' })
}

export async function zipProject(project: Project): Promise<Uint8Array> {
  return zipFiles(generateSite(project))
}
