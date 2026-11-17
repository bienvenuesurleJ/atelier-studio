import { describe, expect, it } from 'vitest'
import { safeImg } from '../domain/links'
import { imageProblem } from '../studio/readImage'
import { understand } from './intents'

describe('logo et assistant', () => {
  it('accepte png jpg webp svg et refuse le HEIC avec une explication', () => {
    expect(imageProblem({ name: 'logo.png', type: 'image/png', size: 1000 })).toBeNull()
    expect(imageProblem({ name: 'logo.jpg', type: '', size: 1000 })).toBeNull()
    expect(imageProblem({ name: 'logo.webp', type: 'image/webp', size: 1000 })).toBeNull()
    expect(imageProblem({ name: 'logo.svg', type: 'image/svg+xml', size: 1000 })).toBeNull()
    expect(imageProblem({ name: 'IMG.HEIC', type: '', size: 1000 })).toMatch(/HEIC/)
    expect(imageProblem({ name: 'notes.txt', type: 'text/plain', size: 10 })).toMatch(/PNG/)
    expect(safeImg('data:image/webp;base64,YQ==')).toContain('webp')
    expect(safeImg('data:image/svg+xml;charset=utf-8,<svg></svg>')).toContain('svg')
  })

  it('comprend les demandes courantes sans appeler une IA', () => {
    expect(understand('ajoute un hero').command).toEqual({ type: 'add-block', blockType: 'hero' })
    expect(understand('mets un logo').command).toEqual({ type: 'focus-logo' })
    expect(understand('style nature').command).toEqual({ type: 'set-style', styleId: 'nature' })
    expect(understand('ajoute un produit').command).toEqual({ type: 'add-product' })
    expect(understand('exporte le site').command?.type).toBe('export')
    expect(understand('ouvre la vidéo').command?.type).toBe('open-video')
    const guide = understand('pourquoi le logo ne marche pas')
    expect(guide.source).toBe('guide')
    expect(guide.command).toBeUndefined()
    expect(guide.text).toMatch(/HEIC/)
  })
})
