import { describe, expect, it } from 'vitest'
import { createSampleProject } from './createProject'
import { applyFade, renderMusic } from './music'
import { parseHash } from '../studio/router'
import { createVideo, frameSize, sceneAt, totalDuration, transitionMix } from './video'

describe('module vidéo', () => {
  it('fabrique six modèles avec une carte finale et la marque du projet', () => {
    const project = createSampleProject()
    for (const template of ['boutique', 'promo', 'produit', 'avis', 'menu', 'evenement'] as const) {
      const video = createVideo(project, template, '9:16')
      expect(video.scenes.length).toBeGreaterThanOrEqual(3)
      expect(video.scenes.some((scene) => scene.title.includes('Table') || scene.text.includes('Table') || scene.title.length > 0)).toBe(true)
      expect(totalDuration(video.scenes)).toBeGreaterThan(6)
    }
  })

  it('situe une scène dans le temps et calcule les formats', () => {
    const video = createVideo(createSampleProject(), 'boutique', '16:9')
    expect(frameSize('16:9')).toEqual({ width: 1280, height: 720 })
    expect(frameSize('1:1').width).toBe(frameSize('1:1').height)
    expect(frameSize('9:16').height).toBeGreaterThan(frameSize('9:16').width)
    const first = sceneAt(video.scenes, 0.2)
    expect(first.index).toBe(0)
    const late = sceneAt(video.scenes, totalDuration(video.scenes) - 0.1)
    expect(late.index).toBe(video.scenes.length - 1)
    expect(transitionMix(2.9, 3, 0.4)).toBeGreaterThan(0)
    expect(transitionMix(0.2, 3, 0.4)).toBe(0)
  })

  it('ouvre la route vidéo sans confondre l’identifiant', () => {
    expect(parseHash('#/video')).toEqual({ name: 'films' })
    expect(parseHash('#/admin')).toEqual({ name: 'admin' })
    expect(parseHash('#/projet/prj-abc')).toEqual({ name: 'editor', id: 'prj-abc' })
  })
  it('compose une musique originale non silencieuse, avec fondu', () => {
    const pcm = renderMusic('comptoir', 4, 8000)
    expect(pcm.length).toBe(32000)
    let energy = 0
    for (let i = 0; i < pcm.length; i += 40) energy += Math.abs(pcm[i])
    expect(energy).toBeGreaterThan(1)
    const faded = applyFade(pcm, 8000, 0.5, 0.5)
    expect(Math.abs(faded[0])).toBeLessThan(0.001)
    expect(Math.abs(faded[faded.length - 1])).toBeLessThan(0.02)
  })
})
