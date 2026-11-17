import { describe, expect, it } from 'vitest'
import { deleteClip, filmDuration, moveClip, splitClip, trimClip } from './model'
import { createFilm, FILM_TEMPLATES } from './templates'

describe('studio vidéo', () => {
  it('propose au moins dix modèles indépendants des sites', () => {
    expect(FILM_TEMPLATES.length).toBeGreaterThanOrEqual(10)
    const film = createFilm('menu', '9:16')
    expect(film.tracks.map((track) => track.kind)).toEqual(['image', 'video', 'shape', 'text'])
    expect(film.tracks.find((track) => track.kind === 'text')?.clips.length).toBeGreaterThanOrEqual(3)
    expect(filmDuration(film)).toBeGreaterThan(6)
    expect(film.brand.name.length).toBeGreaterThan(2)
  })

  it('déplace, recadre, coupe et retire un plan', () => {
    const film = createFilm('boutique')
    const clip = film.tracks.find((track) => track.kind === 'text')!.clips[0]
    const moved = moveClip(film, clip.id, 1.25)
    expect(moved.tracks.find((track) => track.kind === 'text')!.clips[0].start).toBe(1.3)
    const trimmed = trimClip(moved, clip.id, 'end', clip.start + 1.25 + 1)
    expect(trimmed.tracks.find((track) => track.kind === 'text')!.clips[0].duration).toBeGreaterThan(0.3)
    const split = splitClip(createFilm('promo'), film.tracks[0].clips[0] ? createFilm('promo').tracks.find((track) => track.kind === 'image')!.clips[0].id : clip.id, 2)
    const image = split.tracks.find((track) => track.kind === 'image')!
    expect(image.clips.length).toBeGreaterThanOrEqual(1)
    const target = createFilm('promo')
    const id = target.tracks.find((track) => track.kind === 'text')!.clips[0].id
    const cut = splitClip(target, id, target.tracks.find((track) => track.kind === 'text')!.clips[0].start + 1)
    expect(cut.tracks.find((track) => track.kind === 'text')!.clips.length).toBe(target.tracks.find((track) => track.kind === 'text')!.clips.length + 1)
    expect(deleteClip(target, id).tracks.find((track) => track.kind === 'text')!.clips.some((item) => item.id === id)).toBe(false)
  })
})
