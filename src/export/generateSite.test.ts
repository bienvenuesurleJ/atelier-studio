import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { createProject, createSampleProject } from '../domain/createProject'
import { BLOCKS } from '../domain/blocks'
import { CONNECTORS } from '../domain/connectors'
import { STYLES } from '../domain/styles'
import { moveItem, setPalette, setStyle, setTokenColor } from '../domain/projectOps'
import { suggestedPrice, DEFAULT_RATES } from '../domain/commerce'
import { parseBackup, serializeBackup, emptyState } from '../storage/backup'
import { contrastColor } from '../domain/color'
import { exportIssues, generateSite, previewDocument } from './generateSite'
import { zipProject } from './zip'
import type { ProjectKind } from '../domain/types'

const kinds: ProjectKind[] = [
  'vitrine',
  'landing',
  'multipage',
  'portfolio',
  'restaurant',
  'booking',
  'eshop',
  'blog',
  'agence',
  'pwa-loyalty',
  'pwa-menu',
  'pwa-booking',
  'pwa-linkinbio',
  'pwa-catalog',
  'pwa-event',
]

describe('générateur', () => {
  it('expose au moins 25 sections, 10 styles, et des connecteurs honnêtes', () => {
    expect(BLOCKS.length).toBeGreaterThanOrEqual(25)
    expect(new Set(BLOCKS.map((block) => block.type)).size).toBe(BLOCKS.length)
    for (const block of BLOCKS) expect(block.variants.length).toBeGreaterThanOrEqual(2)
    expect(STYLES.length).toBeGreaterThanOrEqual(10)
    expect(CONNECTORS.some((item) => item.status === 'needs-server')).toBe(true)
  })

  it('génère un site restaurant avec SEO, schema.org et la carte', () => {
    const project = createSampleProject()
    const files = generateSite(project)
    const html = text(files, 'index.html')
    const css = text(files, 'assets/styles.css')
    expect(html).toContain('<title>')
    expect(html).toContain('name="description"')
    expect(html).toContain('property="og:title"')
    expect(html).toContain('property="og:description"')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type":"Restaurant"')
    expect(html).toContain('La Table des Remparts')
    expect(html).toContain('Lyon')
    expect(html).toContain('Tu 12:00-14:30')
    expect(html).not.toContain('data-preview="on"')
    expect(text(files, 'carte.html')).toContain('Céleri rôti')
    expect(css).toContain('prefers-reduced-motion')
    expect(css).toContain(project.tokens.primary)
    expect(text(files, 'sitemap.xml')).toContain('carte.html')
    expect(files.some((file) => file.path === 'manifest.webmanifest')).toBe(false)
  })

  it('échappe le HTML et le JSON-LD', () => {
    const project = createSampleProject()
    project.business.name = '<script>alert(1)</script>'
    project.seo.title = '<script>alert(1)</script>'
    const html = text(generateSite(project), 'index.html')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('\\u003c')
  })

  it('respecte l’ordre, le masquage et le style d’un élément', () => {
    const project = createSampleProject()
    const page = project.pages[0]
    page.blocks[0].visible = false
    const html = text(generateSite(project), 'index.html')
    expect(html).not.toContain(`data-bid="${page.blocks[0].id}"`)
    const hero = createProject({
      kind: 'landing',
      businessType: 'coach',
      styleId: 'neon',
      businessName: 'Studio Brise',
      city: 'Lille',
    })
    const block = hero.pages[0].blocks[0]
    block.elements.title = { desktop: { color: '#123456', fontSize: '4rem' }, mobile: { fontSize: '2rem' } }
    const css = text(generateSite(hero), 'assets/styles.css')
    expect(css).toContain('#123456')
    expect(css).toContain('font-size:4rem')
    expect(css).toContain('max-width:760px')
    expect(css).toContain('font-size:2rem')
    expect(text(generateSite(hero), 'index.html')).toContain(`data-el="${block.id}:title"`)
  })

  it('produit une PWA installable et un ZIP ouvrable', async () => {
    const project = createProject({
      kind: 'pwa-loyalty',
      businessType: 'coiffeur',
      styleId: 'playful',
      businessName: 'Atelier Nuage',
      city: 'Nantes',
      email: 'bonjour@nuage.example',
    })
    const files = generateSite(project)
    expect(files.some((file) => file.path === 'manifest.webmanifest')).toBe(true)
    expect(files.some((file) => file.path === 'sw.js')).toBe(true)
    const png = files.find((file) => file.path === 'assets/icon-192.png')?.content
    expect(png).toBeInstanceOf(Uint8Array)
    expect((png as Uint8Array)[0]).toBe(137)
    const html = text(files, 'index.html')
    expect(html).toContain('rel="manifest"')
    expect(html).toContain('href="manifest.webmanifest"')
    expect(html).toContain('data-pwa="on"')
    const manifest = JSON.parse(text(files, 'manifest.webmanifest')) as { start_url: string; scope: string; icons: { src: string }[] }
    expect(manifest.start_url).toBe('./')
    expect(manifest.scope).toBe('./')
    expect(manifest.icons.every((icon) => !icon.src.startsWith('/'))).toBe(true)
    const worker = text(files, 'sw.js')
    expect(worker).toContain("addEventListener('fetch'")
    expect(worker).toContain('"./index.html"')
    expect(worker).not.toContain('"/sw.js"')
    expect(text(files, 'assets/app.js')).toContain("register('./sw.js')")
    const zip = await zipProject(project)
    const loaded = await JSZip.loadAsync(zip)
    expect(await loaded.file('index.html')?.async('string')).toContain('Atelier Nuage')
    expect(loaded.file('manifest.webmanifest')).toBeTruthy()
  })

  it('n’invente pas un paiement réussi et documente le mailto', () => {
    const project = createSampleProject()
    project.contactForm.mode = 'mailto'
    const reserve = text(generateSite(project), 'reserver.html')
    expect(reserve).toContain('data-form="mailto"')
    expect(reserve).not.toContain('paiement confirmé')
    expect(reserve).not.toContain('payment_intent')
    project.contactForm.mode = 'formspree'
    project.contactForm.formspreeId = 'abc123'
    expect(text(generateSite(project), 'reserver.html')).toContain('https://formspree.io/f/abc123')
    project.contactForm.mode = 'endpoint'
    project.contactForm.endpoint = 'javascript:alert(1)'
    expect(text(generateSite(project), 'reserver.html')).toContain('data-form="mailto"')
  })

  it('calcule un prix, change de palette, et boucle une sauvegarde', () => {
    expect(suggestedPrice(DEFAULT_RATES, { pages: 4, design: true, shop: false, pwa: true, seo: true })).toBe(
      DEFAULT_RATES.base + 3 * DEFAULT_RATES.perPage + DEFAULT_RATES.design + DEFAULT_RATES.pwa + DEFAULT_RATES.seo,
    )
    const project = setTokenColor(setPalette(setStyle(createSampleProject(), 'brutal'), 'ocean'), 'primary', '#112233')
    expect(project.paletteId).toBeNull()
    expect(project.tokens.primary).toBe('#112233')
    expect(project.styleId).toBe('brutal')
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    const state = emptyState()
    state.projects.push(createSampleProject())
    const restored = parseBackup(serializeBackup(state))
    expect(restored.projects[0]?.business.name).toBe('La Table des Remparts')
    expect(contrastColor('#ffffff')).toBe('#141414')
    expect(contrastColor('#111111')).toBe('#ffffff')
    expect(exportIssues(createSampleProject()).some((issue) => issue.level === 'error')).toBe(false)
    expect(previewDocument(createSampleProject(), 'index')).toContain('data-preview="on"')
  })

  it('place un élément libre et une animation comme sur le canevas', () => {
    const project = createSampleProject()
    const block = project.pages[0].blocks[0]
    block.layoutMode = 'free'
    block.freeNodes = [
      {
        id: 'node-a',
        parentId: null,
        kind: 'text',
        name: 'Titre libre',
        text: 'Texte posé',
        href: '',
        src: '',
        alt: '',
        locked: false,
        hidden: false,
        layout: 'free',
        columns: 2,
        gap: 12,
        box: { desktop: { x: 48, y: 72, w: 220, h: 80, r: 12, z: 3 }, mobile: { x: 12, y: 20, w: 160, h: 60, r: 0, z: 3 } },
        style: { color: '#abcdef' },
        motion: {
          trigger: 'scroll',
          effect: 'letters',
          duration: 640,
          delay: 40,
          easing: 'spring',
          distance: 20,
          intensity: 1,
          repeat: 1,
          stagger: 30,
          direction: 'up',
          desktop: true,
          tablet: true,
          mobile: false,
        },
      },
    ]
    block.motionSpec = { ...block.freeNodes[0].motion!, effect: 'fade', trigger: 'load' }
    const files = generateSite(project)
    const html = text(files, 'index.html')
    const css = text(files, 'assets/styles.css')
    expect(html).toContain('Texte posé')
    expect(html).toContain('data-fx="letters"')
    expect(html).toContain('data-trigger="scroll"')
    expect(html).toContain('data-fx-mobile="0"')
    expect(css).toContain('left:48px')
    expect(css).toContain('rotate(12deg)')
    expect(css).toContain('#abcdef')
    expect(css).toContain('max-width:760px')
    expect(css).toContain('left:12px')
    expect(css).toContain('@keyframes fxFade')
    expect(css).toContain('prefers-reduced-motion')
    expect(text(files, 'assets/app.js')).toContain('runSpring')
    const framed = createSampleProject()
    framed.fonts = [{ id: 'f1', family: 'Atelier Essai', fileName: 'a.woff2', format: 'woff2', dataUrl: 'data:font/woff2;base64,YQ==' }]
    framed.pages[0].blocks[0].data.fields.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    framed.pages[0].blocks[0].imageFrames = {
      image: { original: '', crop: { x: 10, y: 5, w: 80, h: 70 }, focal: { x: 20, y: 80 }, focalMobile: { x: 70, y: 30 } },
    }
    framed.pages[0].blocks[0].motionSpec = {
      trigger: 'load', effect: 'slide', duration: 800, delay: 0, easing: 'spring', distance: 40, intensity: 1, repeat: 1, stagger: 0, direction: 'up', desktop: true, tablet: true, mobile: true, stiffness: 240, damping: 12, mass: 1,
    }
    const out = generateSite(framed)
    const framedCss = text(out, 'assets/styles.css')
    expect(framedCss).toContain('@font-face')
    expect(framedCss).toContain('Atelier Essai')
    expect(framedCss).toContain('object-position:20% 80%')
    expect(framedCss).toContain('object-position:70% 30%')
    expect(text(out, 'index.html')).toContain('data-stiffness="240"')
    expect(out.some((file) => file.path.endsWith('.woff2'))).toBe(true)
    expect(text(files, 'assets/app.js')).toContain('bootFreeform')
  })

  it('ouvre chaque type de projet sans jeter', () => {
    for (const kind of kinds) {
      const project = createProject({
        kind,
        businessType: 'generic',
        styleId: 'minimal',
        businessName: 'Maison Horizon',
        city: 'Bordeaux',
      })
      const files = generateSite(project)
      expect(text(files, 'index.html')).toContain('Maison Horizon')
      expect(text(files, 'assets/styles.css')).toContain('prefers-reduced-motion')
    }
  })
})

function text(files: { path: string; content: string | Uint8Array }[], path: string): string {
  const file = files.find((entry) => entry.path === path)
  if (!file || typeof file.content !== 'string') throw new Error(`Fichier manquant : ${path}`)
  return file.content
}
