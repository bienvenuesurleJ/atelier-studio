export interface MusicNote {
  time: number
  freq: number
  duration: number
  gain: number
}

export interface MusicTrack {
  id: string
  name: string
  credit: string
  notes: MusicNote[]
}

const motif = (start: number, degrees: number[], base = 220, step = 0.5): MusicNote[] =>
  degrees.map((degree, index) => ({
    time: start + index * step,
    freq: base * 2 ** (degree / 12),
    duration: step * 0.92,
    gain: 0.08,
  }))

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'comptoir',
    name: 'Comptoir',
    credit: 'Pièce originale, domaine public (CC0), écrite pour Atelier Local.',
    notes: [
      ...motif(0, [0, 4, 7, 12, 7, 4], 196, 0.55),
      ...motif(3.3, [0, 3, 7, 10, 7, 3], 196, 0.55),
      ...motif(6.6, [0, 5, 9, 12, 9, 5], 220, 0.5),
    ],
  },
  {
    id: 'vitrine',
    name: 'Vitrine',
    credit: 'Pièce originale, domaine public (CC0), écrite pour Atelier Local.',
    notes: [
      ...motif(0, [0, 7, 12, 16, 12, 7, 4, 0], 262, 0.42),
      ...motif(3.4, [0, 5, 9, 12, 9, 5], 262, 0.48),
    ],
  },
  {
    id: 'soiree',
    name: 'Soirée',
    credit: 'Pièce originale, domaine public (CC0), écrite pour Atelier Local.',
    notes: [
      ...motif(0, [0, -5, 0, 3, 7, 3, 0, -5], 174, 0.7),
      ...motif(5.6, [0, 2, 7, 10, 7, 2], 174, 0.65),
    ],
  },
]

export function trackById(id: string): MusicTrack {
  return MUSIC_TRACKS.find((track) => track.id === id) ?? MUSIC_TRACKS[0]
}

export function renderMusic(trackId: string, seconds: number, sampleRate = 22050): Float32Array {
  const total = Math.max(1, Math.floor(seconds * sampleRate))
  const buffer = new Float32Array(total)
  const track = trackById(trackId)
  for (const note of track.notes) {
    const start = Math.floor(note.time * sampleRate)
    const length = Math.floor(note.duration * sampleRate)
    for (let i = 0; i < length; i += 1) {
      const index = start + i
      if (index < 0 || index >= total) continue
      const env = Math.sin(Math.PI * (i / length))
      buffer[index] += Math.sin((2 * Math.PI * note.freq * i) / sampleRate) * note.gain * env
    }
  }
  let peak = 0
  for (let i = 0; i < buffer.length; i += 1) peak = Math.max(peak, Math.abs(buffer[i]))
  if (peak > 0.9) {
    const scale = 0.9 / peak
    for (let i = 0; i < buffer.length; i += 1) buffer[i] *= scale
  }
  return buffer
}

export function applyFade(buffer: Float32Array, sampleRate: number, fade: number, volume: number): Float32Array {
  const out = new Float32Array(buffer.length)
  const fadeSamples = Math.max(1, Math.floor(fade * sampleRate))
  for (let i = 0; i < buffer.length; i += 1) {
    let gain = volume
    if (i < fadeSamples) gain *= i / fadeSamples
    if (i > buffer.length - fadeSamples) gain *= (buffer.length - i) / fadeSamples
    out[i] = buffer[i] * gain
  }
  return out
}
