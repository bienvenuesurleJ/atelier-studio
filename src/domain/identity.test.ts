import { describe, expect, it } from 'vitest'
import { getBlockDefinition } from './blocks'
import { createSampleProject } from './createProject'
import { addBlock } from './projectOps'
import { previewDocument } from '../export/generateSite'

const png = 'data:image/png;base64,iVBORw0KGgo='

describe('identité et variantes', () => {
  it('affiche le logo, le favicon et le fond dans l’aperçu', () => {
    const project = createSampleProject()
    project.logo = png
    project.logoSize = 64
    project.favicon = png
    project.backdrop = { src: png, position: '20% 30%', overlay: '#112233', opacity: 0.5, parallax: true }
    project.pages[0].blocks[0].backdrop = { ...project.backdrop, parallax: false }
    const html = previewDocument(project, project.pages[0].slug)
    expect(html).toContain('rel="icon"')
    expect(html).toContain('--logo-size:64px')
    expect(html).toContain('footer-logo')
    expect(html).toContain('has-backdrop')
    expect(html).toContain('--site-attach:fixed')
    expect(html).toContain('has-photo')
    expect(html).toContain('--section-pos:20% 30%')
  })

  it('propose au moins trois variantes sur les sections principales', () => {
    for (const type of ['hero', 'features', 'gallery', 'testimonials', 'pricing', 'contact'] as const) {
      expect(getBlockDefinition(type).variants.length).toBeGreaterThanOrEqual(3)
    }
    const project = createSampleProject()
    const page = project.pages[0]
    const next = addBlock(project, page.id, 'gallery', 'bande')
    const added = next.pages[0].blocks.find((block) => block.variant === 'bande')
    expect(added?.type).toBe('gallery')
    expect(next.pages[0].blocks.at(-1)?.type).toBe('footer')
  })
})
