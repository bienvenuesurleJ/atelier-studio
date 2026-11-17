import { createBlock } from './blocks'
import { copyFor, legalBody } from './content'
import { findStyle } from './styles'
import { pageFile, uid } from './ids'
import type {
  Block,
  BlockType,
  BusinessType,
  Page,
  Project,
  ProjectKind,
  StyleId,
  TemplateContext,
} from './types'

export interface CreateProjectInput {
  kind: ProjectKind
  businessType: BusinessType
  styleId: StyleId
  businessName: string
  city: string
  phone?: string
  email?: string
  address?: string
  postalCode?: string
  projectName?: string
}

export function createProject(input: CreateProjectInput): Project {
  const name = input.businessName.trim() || 'Mon commerce'
  const city = input.city.trim() || 'Lyon'
  const ctx: TemplateContext = {
    kind: input.kind,
    businessType: input.businessType,
    name,
    city,
    phone: input.phone?.trim() ?? '',
    email: input.email?.trim() ?? '',
    address: input.address?.trim() ?? '',
    postalCode: input.postalCode?.trim() ?? '',
  }
  const pack = copyFor(ctx)
  const style = findStyle(input.styleId)
  const now = new Date().toISOString()
  const pages = buildPages(ctx)
  const ctaHref =
    input.kind === 'restaurant' ? 'reserver' : input.kind === 'pwa-linkinbio' ? 'index' : 'contact'

  return {
    id: uid('prj'),
    version: 1,
    name: input.projectName?.trim() || name,
    kind: input.kind,
    businessType: input.businessType,
    styleId: input.styleId,
    paletteId: null,
    fontPairId: null,
    tokens: { ...style.tokens },
    motion: { ...style.motion },
    business: {
      name,
      tagline: pack.tagline,
      city,
      address: ctx.address,
      postalCode: ctx.postalCode,
      phone: ctx.phone,
      email: ctx.email,
      whatsapp: ctx.phone,
      instagram: '',
      facebook: '',
      categoryLabel: pack.category,
      schemaType: pack.schemaType,
      priceRange: pack.priceRange,
      hours: pack.hours,
      siret: '',
      legalName: name,
    },
    seo: {
      title: `${name} · ${pack.category} à ${city}`,
      description: pack.tagline,
      canonicalBase: '',
      ogImage: '',
    },
    contactForm: {
      mode: 'mailto',
      formspreeId: '',
      endpoint: '',
      subject: `Message depuis le site ${name}`,
    },
    ordering: {
      mode: input.kind === 'eshop' || input.kind === 'pwa-menu' ? 'whatsapp' : 'none',
      paymentLink: '',
      note: 'La commande n’est pas un paiement. Le règlement se fait selon le canal choisi.',
    },
    chrome: {
      announcement: '',
      ctaLabel: ctaLabel(input.kind),
      ctaHref,
      showPhone: true,
      headerVariant: input.styleId === 'luxe' || input.styleId === 'minimal' ? 'center' : 'bar',
    },
    pwa: input.kind.startsWith('pwa-'),
    pwaName: name,
    pwaShortName: name.slice(0, 12),
    logo: '',
    clientName: '',
    status: 'draft',
    shop: input.kind === 'eshop' || input.kind === 'pwa-catalog' ? 'mini' : 'none',
    taxRate: 0,
    shippingFlat: 0,
    library: [],
    fonts: [],
    videos: [],
    pages,
    createdAt: now,
    updatedAt: now,
  }
}

export function createSampleProject(): Project {
  return createProject({
    kind: 'restaurant',
    businessType: 'restaurant',
    styleId: 'luxe',
    businessName: 'La Table des Remparts',
    city: 'Lyon',
    phone: '04 78 00 00 00',
    email: 'bonjour@table-remparts.example',
    address: '12 rue des Teinturiers',
    postalCode: '69001',
    projectName: 'La Table des Remparts',
  })
}

function ctaLabel(kind: ProjectKind): string {
  if (kind === 'eshop' || kind === 'pwa-menu') return 'Commander'
  if (kind === 'restaurant') return 'Réserver'
  if (kind === 'booking' || kind === 'pwa-booking') return 'Prendre rendez-vous'
  return 'Contact'
}

function buildPages(ctx: TemplateContext): Page[] {
  const b = (...types: BlockType[]) => types.map((type) => createBlock(type, ctx))
  const pages: Page[] = []
  const add = (slug: string, title: string, nav: string, blocks: Block[], show = true, description = '') => {
    pages.push({
      id: uid('page'),
      slug,
      title,
      navLabel: nav,
      showInNav: show,
      description,
      blocks,
    })
  }

  switch (ctx.kind) {
    case 'landing':
      add('index', 'Accueil', 'Accueil', [
        ...b('hero', 'logos', 'features', 'stats', 'pricing', 'testimonials', 'faq', 'cta', 'contact', 'footer'),
      ])
      break
    case 'agence':
    case 'multipage':
      add('index', 'Accueil', 'Accueil', b('hero', 'features', 'services', 'testimonials', 'cta', 'footer'))
      add('a-propos', 'À propos', 'À propos', b('about', 'timeline', 'team', 'footer'))
      add('prestations', 'Prestations', 'Prestations', b('services', 'pricing', 'faq', 'cta', 'footer'))
      add('contact', 'Contact', 'Contact', b('contact', 'hours', 'map', 'footer'))
      add('mentions', 'Mentions légales', 'Mentions', legalPage(ctx), false)
      break
    case 'portfolio':
      add('index', 'Accueil', 'Accueil', b('hero', 'portfolio', 'about', 'testimonials', 'contact', 'footer'))
      add('parcours', 'Parcours', 'Parcours', b('timeline', 'team', 'footer'))
      add('mentions', 'Mentions légales', 'Mentions', legalPage(ctx), false)
      break
    case 'restaurant':
      add('index', 'Accueil', 'Accueil', b('hero', 'about', 'gallery', 'testimonials', 'hours', 'map', 'footer'))
      add('carte', 'La carte', 'La carte', b('menu', 'cta', 'footer'))
      add('reserver', 'Réserver', 'Réserver', b('booking', 'faq', 'contact', 'footer'))
      add('mentions', 'Mentions légales', 'Mentions', legalPage(ctx), false)
      break
    case 'booking':
      add('index', 'Accueil', 'Accueil', b('hero', 'services', 'steps', 'testimonials', 'booking', 'faq', 'hours', 'map', 'footer'))
      add('mentions', 'Mentions légales', 'Mentions', legalPage(ctx), false)
      break
    case 'eshop':
    case 'pwa-catalog':
      add('index', 'Accueil', 'Accueil', b('hero', 'catalog', 'features', 'faq', 'contact', 'footer'))
      add('mentions', 'Mentions légales', 'Mentions', legalPage(ctx), false)
      break
    case 'pwa-event':
      add('index', 'Événement', 'Événement', b('hero', 'features', 'steps', 'cta', 'contact', 'footer'))
      break
    case 'blog':
      add('index', 'Accueil', 'Journal', b('hero', 'blog', 'newsletter', 'footer'))
      add('a-propos', 'À propos', 'À propos', b('about', 'footer'))
      add('mentions', 'Mentions légales', 'Mentions', legalPage(ctx), false)
      break
    case 'pwa-loyalty':
      add('index', 'Carte', 'Carte', [
        createBlock('loyalty', ctx, 'pass'),
        createBlock('hours', ctx),
        createBlock('footer', ctx, 'simple'),
      ])
      break
    case 'pwa-menu':
      add('index', 'Commander', 'Carte', [
        createBlock('hero', ctx, 'center'),
        createBlock('menu', ctx, 'list'),
        createBlock('footer', ctx, 'simple'),
      ])
      break
    case 'pwa-booking':
      add('index', 'Rendez-vous', 'Rendez-vous', [
        createBlock('booking', ctx, 'simple'),
        createBlock('services', ctx, 'rows'),
        createBlock('hours', ctx),
        createBlock('footer', ctx, 'simple'),
      ])
      break
    case 'pwa-linkinbio':
      add('index', 'Liens', 'Liens', [createBlock('links', ctx, 'stack'), createBlock('footer', ctx, 'simple')])
      break
    default:
      add('index', 'Accueil', 'Accueil', b('hero', 'features', 'services', 'gallery', 'testimonials', 'faq', 'hours', 'map', 'contact', 'footer'))
      add('mentions', 'Mentions légales', 'Mentions', legalPage(ctx), false)
  }

  return pages
}

function legalPage(ctx: TemplateContext): Block[] {
  const text = createBlock('text', ctx, 'narrow')
  text.data.fields.title = 'Mentions légales'
  text.data.fields.body = legalBody(ctx)
  text.data.fields.kicker = 'Informations'
  return [text, createBlock('footer', ctx, 'simple')]
}

export function pagePath(slug: string): string {
  return pageFile(slug)
}
