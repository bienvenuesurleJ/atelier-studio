import type { VideoFormat, VideoTextAnim, VideoTransition } from '../domain/types'

export type TrackKind = 'video' | 'image' | 'text' | 'shape' | 'audio'

export interface Clip {
  id: string
  start: number
  duration: number
  trimIn: number
  text: string
  subtext: string
  media: string
  mediaKind: 'none' | 'image' | 'video'
  transition: VideoTransition
  textAnim: VideoTextAnim
  kenBurns: boolean
  shape: 'none' | 'bar' | 'badge' | 'circle'
  color: string
  volume: number
  muted: boolean
  x?: number
  y?: number
  w?: number
  h?: number
  rotation?: number
  opacity?: number
  hidden?: boolean
  locked?: boolean
  z?: number
}

export interface Track {
  id: string
  kind: TrackKind
  name: string
  clips: Clip[]
}

export interface FilmBrand {
  name: string
  city: string
  primary: string
  accent: string
  bg: string
  text: string
  font: string
  logo?: string
}

export interface SubtitleCue {
  id: string
  start: number
  duration: number
  text: string
  style: 'bas' | 'cinema' | 'bandeau'
}

export interface Film {
  id: string
  name: string
  templateId: string
  format: VideoFormat
  brand: FilmBrand
  tracks: Track[]
  musicId: string
  musicDataUrl: string
  musicVolume: number
  musicFade: number
  musicMuted: boolean
  subtitles?: SubtitleCue[]
  createdAt: string
  updatedAt: string
}

export interface FilmLibrary {
  version: 1
  films: Film[]
}

export function emptyLibrary(): FilmLibrary {
  return { version: 1, films: [] }
}

export function filmDuration(film: Film): number {
  let end = 1
  for (const track of film.tracks) {
    for (const clip of track.clips) end = Math.max(end, clip.start + clip.duration)
  }
  return Math.round(end * 10) / 10
}

export function clipsAt(track: Track, time: number): Clip[] {
  return track.clips.filter((clip) => time >= clip.start && time < clip.start + clip.duration)
}

export function moveClip(film: Film, clipId: string, start: number): Film {
  const next = Math.max(0, Math.round(start * 10) / 10)
  return mapClip(film, clipId, (clip) => ({ ...clip, start: next }))
}

export function trimClip(film: Film, clipId: string, edge: 'start' | 'end', time: number): Film {
  return mapClip(film, clipId, (clip) => {
    if (edge === 'end') {
      const duration = Math.max(0.3, Math.round((time - clip.start) * 10) / 10)
      return { ...clip, duration }
    }
    const start = Math.max(0, Math.min(clip.start + clip.duration - 0.3, Math.round(time * 10) / 10))
    const delta = start - clip.start
    return { ...clip, start, duration: Math.round((clip.duration - delta) * 10) / 10, trimIn: Math.max(0, clip.trimIn + delta) }
  })
}

export function splitClip(film: Film, clipId: string, time: number): Film {
  return {
    ...film,
    tracks: film.tracks.map((track) => {
      const clip = track.clips.find((item) => item.id === clipId)
      if (!clip) return track
      const local = time - clip.start
      if (local < 0.2 || local > clip.duration - 0.2) return track
      const left: Clip = { ...clip, duration: Math.round(local * 10) / 10 }
      const right: Clip = {
        ...clip,
        id: `clip-${Math.random().toString(36).slice(2, 8)}`,
        start: Math.round(time * 10) / 10,
        duration: Math.round((clip.duration - local) * 10) / 10,
        trimIn: clip.trimIn + local,
      }
      return { ...track, clips: track.clips.flatMap((item) => (item.id === clipId ? [left, right] : [item])) }
    }),
  }
}

export function deleteClip(film: Film, clipId: string): Film {
  return { ...film, tracks: film.tracks.map((track) => ({ ...track, clips: track.clips.filter((clip) => clip.id !== clipId) })) }
}

function mapClip(film: Film, clipId: string, fn: (clip: Clip) => Clip): Film {
  return {
    ...film,
    tracks: film.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => (clip.id === clipId ? fn(clip) : clip)),
    })),
  }
}
