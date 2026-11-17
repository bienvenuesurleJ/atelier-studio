import type { Clip, Film } from './model'
import { smartOrigin } from './placement'

export const MEDIA_ACCEPT = 'image/*,video/*,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,.m4v'

const IMAGE = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i
const VIDEO = /\.(mp4|webm|mov|m4v|ogv)$/i

export function mediaKindFromFile(file: { type: string; name: string }): 'image' | 'video' | null {
  const type = file.type.toLowerCase()
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (IMAGE.test(file.name)) return 'image'
  if (VIDEO.test(file.name)) return 'video'
  return null
}

export function mediaTooLarge(bytes: number): boolean {
  return bytes > 40 * 1024 * 1024
}

export function placeMedia(film: Film, selectedId: string | null, dataUrl: string, kind: 'image' | 'video', at: number): { film: Film; clipId: string } {
  const track = film.tracks.find((item) => item.kind === kind)
  if (!track) return { film, clipId: selectedId ?? '' }
  if (selectedId && track.clips.some((clip) => clip.id === selectedId)) {
    return {
      clipId: selectedId,
      film: {
        ...film,
        tracks: film.tracks.map((item) => item.id !== track.id ? item : {
          ...item,
          clips: item.clips.map((clip) => clip.id === selectedId ? { ...clip, media: dataUrl, mediaKind: kind } : clip),
        }),
      },
    }
  }
  const id = `clip-${Math.random().toString(36).slice(2, 8)}`
  const origin = smartOrigin(track.clips.length)
  const clip: Clip = {
    id,
    start: Math.max(0, Math.round(at * 10) / 10),
    duration: kind === 'video' ? 4 : 3,
    trimIn: 0,
    text: kind === 'video' ? 'Vidéo' : 'Photo',
    subtext: '',
    media: dataUrl,
    mediaKind: kind,
    transition: 'fade',
    textAnim: 'none',
    kenBurns: kind === 'image',
    shape: 'none',
    color: '',
    volume: 1,
    muted: true,
    x: origin.x,
    y: origin.y,
    w: 42,
    h: 28,
  }
  return {
    clipId: id,
    film: {
      ...film,
      tracks: film.tracks.map((item) => item.id === track.id ? { ...item, clips: [...item.clips, clip] } : item),
    },
  }
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'))
    reader.readAsDataURL(file)
  })
}
