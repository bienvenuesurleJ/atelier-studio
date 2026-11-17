import { describe, expect, it } from 'vitest'
import { createFilm } from './templates'
import { mediaKindFromFile, mediaTooLarge, placeMedia } from './mediaFile'

describe('import média vidéo', () => {
  it('reconnaît les photos et les vidéos, y compris sans type MIME', () => {
    expect(mediaKindFromFile({ type: 'image/jpeg', name: 'photo.jpg' })).toBe('image')
    expect(mediaKindFromFile({ type: 'image/png', name: 'photo.png' })).toBe('image')
    expect(mediaKindFromFile({ type: 'video/mp4', name: 'clip.mp4' })).toBe('video')
    expect(mediaKindFromFile({ type: 'video/webm', name: 'clip.webm' })).toBe('video')
    expect(mediaKindFromFile({ type: '', name: 'film.MOV' })).toBe('video')
    expect(mediaKindFromFile({ type: 'application/octet-stream', name: 'note.txt' })).toBeNull()
    expect(mediaTooLarge(40 * 1024 * 1024 + 1)).toBe(true)
    expect(mediaTooLarge(2_000_000)).toBe(false)
  })

  it('ajoute un plan puis remplace son média', () => {
    const film = createFilm('menu', '9:16')
    const added = placeMedia(film, null, 'data:image/png;base64,YQ==', 'image', 1.2)
    const clip = added.film.tracks.find((track) => track.kind === 'image')?.clips.find((item) => item.id === added.clipId)
    expect(clip?.media).toContain('YQ==')
    expect(clip?.start).toBe(1.2)
    const replaced = placeMedia(added.film, added.clipId, 'data:image/png;base64,Yg==', 'image', 0)
    const next = replaced.film.tracks.find((track) => track.kind === 'image')?.clips.find((item) => item.id === added.clipId)
    expect(next?.media).toContain('Yg==')
    expect(replaced.film.tracks.find((track) => track.kind === 'image')?.clips.length).toBe(film.tracks.find((track) => track.kind === 'image')!.clips.length + 1)
  })
})
