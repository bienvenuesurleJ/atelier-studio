const EXTENSIONS = /\.(png|jpe?g|webp|gif|svg)$/i

export function imageProblem(file: { name: string; type: string; size: number }): string | null {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  if (type === 'image/heic' || type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif')) {
    return 'Les photos HEIC de l’iPhone ne sont pas lisibles ici. Dans Photos : Partager, Enregistrer en JPEG, puis choisissez ce JPEG.'
  }
  const image = type.startsWith('image/') || EXTENSIONS.test(name)
  if (!image) return 'Choisissez un PNG, JPG, SVG ou WebP.'
  if (file.size > 15 * 1024 * 1024) return 'Image trop lourde : 15 Mo maximum.'
  return null
}

export async function readImageFile(file: File): Promise<string> {
  const problem = imageProblem(file)
  if (problem) throw new Error(problem)
  const type = file.type.toLowerCase()
  if (type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) return readAsDataUrl(file)
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(1, bitmap.width))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return readAsDataUrl(file)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()
    return canvas.toDataURL('image/png')
  } catch {
    const url = await readAsDataUrl(file)
    if (!url.startsWith('data:image/')) throw new Error('Cette image n’a pas pu être lue. Essayez un PNG ou un JPG.')
    return url
  }
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'))
    reader.readAsDataURL(file)
  })
}
