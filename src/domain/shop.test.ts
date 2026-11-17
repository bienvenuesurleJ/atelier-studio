import { describe, expect, it } from 'vitest'
import { createSampleProject } from './createProject'
import { SITE_PRESETS, createFromPreset } from './presets'
import { applyBrandToFilm } from './brand'
import { cartMessage, cartTotal, filterProducts, parseProductCsv, unitPrice } from './shop'
import { createFilm, FILM_TEMPLATES } from '../video/templates'
import { fadeWindow } from '../video/draw'
import { generateSite } from '../export/generateSite'

describe('boutique, modèles et vidéo', () => {
  it('importe un CSV, filtre et calcule le panier', () => {
    const products = parseProductCsv('nom,collection,prix,prixbarre,stock,description,lien,variantes\nChemise,Hauts,49,69,8,Lin,https://paypal.me/exemple,"S:45:2|M:49:3"')
    expect(products).toHaveLength(1)
    expect(products[0].variants).toHaveLength(2)
    expect(unitPrice(products[0], products[0].variants[0].id)).toBe(45)
    expect(filterProducts(products, { collection: 'Bas' })).toHaveLength(0)
    expect(filterProducts(products, { sort: 'nom', text: 'chem' })).toHaveLength(1)
    expect(cartTotal([{ productId: 'a', variantId: '', name: 'Chemise', variantName: 'M', price: 49, qty: 2 }])).toBe(98)
    expect(cartMessage([{ productId: 'a', variantId: '', name: 'Chemise', variantName: 'M', price: 49, qty: 1 }])).toContain('pas un paiement confirmé')
  })

  it('écrit la boutique, les fiches et le panier dans le ZIP logique', () => {
    const project = createSampleProject()
    project.products = parseProductCsv('nom,collection,prix,prixbarre,stock,description,lien,variantes\nLampe,Maison,80,0,3,Laiton,,')
    project.ordering.paymentLink = 'https://buy.stripe.com/test'
    const files = generateSite(project).map((file) => file.path)
    expect(files).toContain('boutique.html')
    expect(files).toContain('panier.html')
    expect(files.some((path) => path.startsWith('produit-'))).toBe(true)
    const built = generateSite(project)
    expect(String(built.find((file) => file.path === 'boutique.html')?.content)).toContain('data-shop-collection')
    expect(String(built.find((file) => file.path === 'assets/app.js')?.content)).toContain('localStorage')
  })

  it('propose au moins quarante modèles de sites et vingt-cinq films', () => {
    expect(SITE_PRESETS.length).toBeGreaterThanOrEqual(40)
    expect(new Set(SITE_PRESETS.map((item) => item.id)).size).toBe(SITE_PRESETS.length)
    expect(createFromPreset(SITE_PRESETS[0].id).business.name).toBe(SITE_PRESETS[0].name)
    expect(FILM_TEMPLATES.length).toBeGreaterThanOrEqual(25)
    const film = createFilm('yoga', '9:16')
    expect(film.subtitles?.[0].text.length).toBeGreaterThan(2)
    expect(film.tracks.find((track) => track.kind === 'text')?.clips.some((clip) => clip.textAnim === 'pop')).toBe(true)
    expect(fadeWindow(0, 3)).toBe(0)
    expect(fadeWindow(1, 3)).toBe(1)
  })

  it('applique le kit de marque à un film', () => {
    const project = createSampleProject()
    project.logo = 'data:image/png;base64,YQ=='
    project.tokens.primary = '#123456'
    const next = applyBrandToFilm(createFilm('boutique'), project)
    expect(next.brand.primary).toBe('#123456')
    expect(next.brand.logo).toContain('YQ==')
    expect(next.brand.name).toBe(project.business.name)
  })
})
