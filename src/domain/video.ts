import type { Project, PromoVideo, VideoFormat, VideoScene, VideoTemplate, VideoTransition } from './types'

export const VIDEO_TEMPLATES: { id: VideoTemplate; name: string; detail: string }[] = [
  { id: 'boutique', name: 'Présentation', detail: 'Le lieu, l’offre, l’adresse.' },
  { id: 'promo', name: 'Promo / soldes', detail: 'Une offre lisible, puis l’appel.' },
  { id: 'produit', name: 'Nouveau produit', detail: 'Une pièce ou une formule mise en avant.' },
  { id: 'avis', name: 'Avis clients', detail: 'Des citations déjà saisies dans le site, marquées comme exemples s’il le faut.' },
  { id: 'menu', name: 'Menu du jour', detail: 'Trois lignes de carte et le prix.' },
  { id: 'evenement', name: 'Ouverture / événement', detail: 'La date, le lieu, la raison de venir.' },
]

export function frameSize(format: VideoFormat): { width: number; height: number } {
  if (format === '9:16') return { width: 720, height: 1280 }
  if (format === '1:1') return { width: 720, height: 720 }
  return { width: 1280, height: 720 }
}

export function totalDuration(scenes: VideoScene[]): number {
  return scenes.reduce((sum, scene) => sum + Math.max(0.4, scene.duration), 0)
}

export function sceneAt(scenes: VideoScene[], time: number): { index: number; local: number; duration: number } {
  if (!scenes.length) return { index: 0, local: 0, duration: 1 }
  let cursor = 0
  for (let index = 0; index < scenes.length; index += 1) {
    const duration = Math.max(0.4, scenes[index].duration)
    if (time < cursor + duration || index === scenes.length - 1) {
      return { index, local: Math.max(0, Math.min(duration, time - cursor)), duration }
    }
    cursor += duration
  }
  const last = scenes.length - 1
  return { index: last, local: scenes[last].duration, duration: scenes[last].duration }
}

export function transitionMix(local: number, duration: number, blend = 0.45): number {
  const start = Math.max(0, duration - blend)
  if (local < start) return 0
  return Math.min(1, (local - start) / blend)
}

export function createVideo(project: Project, template: VideoTemplate, format: VideoFormat = '9:16'): PromoVideo {
  const name = project.business.name || project.name
  const city = project.business.city
  const offers = collectLines(project, ['services', 'catalog', 'menu', 'pricing'])
  const quotes = collectQuotes(project)
  const images = collectImages(project)
  const hero = images[0] ?? ''
  const scenes: VideoScene[] = []
  const push = (title: string, text: string, image: string, transition: VideoTransition, duration = 3.2) => {
    scenes.push({
      id: `scene-${scenes.length}-${template}`,
      title,
      text,
      image,
      duration,
      transition,
      textAnim: scenes.length === 0 ? 'rise' : 'fade',
    })
  }
  if (template === 'promo') {
    push(name, city ? `À ${city}` : 'En ce moment', hero, 'fade', 2.6)
    push(offers[0]?.title || 'Offre du moment', offers[0]?.text || 'Une attention pour les premiers visiteurs.', images[1] || hero, 'zoom', 3.4)
    push(offers[1]?.title || 'Cette semaine', offers[1]?.text || 'Montrez le prix, ou la remise, en toutes lettres.', images[2] || hero, 'slide')
  } else if (template === 'produit') {
    push('Nouveau', name, hero, 'kenburns', 2.8)
    push(offers[0]?.title || 'La nouveauté', offers[0]?.text || 'Décrivez la pièce en une phrase.', images[1] || hero, 'mask', 3.6)
    push(offers[0]?.price || 'En boutique', city || 'Venez la voir', hero, 'zoom')
  } else if (template === 'avis') {
    push(name, 'Ils en parlent', hero, 'fade', 2.4)
    const quote = quotes[0]
    push(quote?.author || 'Exemple à remplacer', quote?.text || 'Remplacez cette phrase par un avis réel, avec l’accord de la personne.', images[1] || hero, 'slide', 4)
    if (quotes[1]) push(quotes[1].author, quotes[1].text, images[2] || hero, 'fade', 3.6)
  } else if (template === 'menu') {
    push(name, 'Aujourd’hui', hero, 'kenburns', 2.4)
    push(offers[0]?.title || 'Entrée', offers[0]?.price || offers[0]?.text || 'À composer', images[1] || hero, 'slide')
    push(offers[1]?.title || 'Plat', offers[1]?.price || offers[1]?.text || 'Selon le marché', images[2] || hero, 'zoom')
    push(offers[2]?.title || 'Douceur', offers[2]?.price || 'Maison', hero, 'fade')
  } else if (template === 'evenement') {
    push(name, 'On ouvre les portes', hero, 'mask', 2.8)
    push(city || 'Le lieu', project.business.address || 'L’adresse se règle dans le projet.', images[1] || hero, 'kenburns', 3.4)
    push('Venez', project.business.tagline || 'Une raison simple de passer.', hero, 'zoom')
  } else {
    push(name, project.business.tagline || `À ${city || 'deux pas'}`, hero, 'kenburns', 3)
    push(offers[0]?.title || 'Ce qu’on fait', offers[0]?.text || 'Une phrase nette sur le métier.', images[1] || hero, 'slide', 3.4)
    push(city || 'Nous trouver', project.business.address || 'Ajoutez l’adresse dans le projet.', images[2] || hero, 'fade')
  }
  push(project.business.phone || 'Passez nous voir', ctaFor(template), hero, 'fade', 3.2)
  return {
    id: `vid-${Math.random().toString(36).slice(2, 8)}`,
    name: `${VIDEO_TEMPLATES.find((item) => item.id === template)?.name ?? 'Vidéo'} — ${name}`,
    template,
    format,
    scenes,
    musicId: 'comptoir',
    musicName: 'Comptoir',
    musicDataUrl: '',
    musicVolume: 0.35,
    musicFade: 0.8,
    cta: ctaFor(template),
    updatedAt: new Date().toISOString(),
  }
}

function ctaFor(template: VideoTemplate): string {
  if (template === 'promo') return 'Profitez-en cette semaine'
  if (template === 'produit') return 'Disponible en boutique'
  if (template === 'menu') return 'Réservez une table'
  if (template === 'evenement') return 'On vous attend'
  if (template === 'avis') return 'Venez vous faire votre idée'
  return 'Écrivez-nous'
}

export interface BrandLine {
  title: string
  text: string
  price: string
}

export function collectLines(project: Project, types: string[]): BrandLine[] {
  const lines: BrandLine[] = []
  for (const page of project.pages) {
    for (const block of page.blocks) {
      if (!types.includes(block.type)) continue
      for (const list of Object.values(block.data.lists)) {
        for (const entry of list) {
          const title = entry.fields.title || entry.fields.name || ''
          if (!title) continue
          lines.push({
            title,
            text: entry.fields.text || entry.fields.description || entry.fields.features || '',
            price: entry.fields.price || '',
          })
        }
      }
    }
  }
  return lines.slice(0, 8)
}

export function collectQuotes(project: Project): { author: string; text: string }[] {
  const quotes: { author: string; text: string }[] = []
  for (const page of project.pages) {
    for (const block of page.blocks) {
      if (block.type !== 'testimonials') continue
      for (const entry of block.data.lists.items ?? []) {
        if (!entry.fields.quote) continue
        quotes.push({ author: entry.fields.author || 'Client', text: entry.fields.quote })
      }
    }
  }
  return quotes.slice(0, 4)
}

export function collectImages(project: Project): string[] {
  const found: string[] = []
  const push = (value: string) => {
    if (!value) return
    if (value.startsWith('data:image') || value.startsWith('http://') || value.startsWith('https://')) found.push(value)
  }
  push(project.logo)
  for (const page of project.pages) {
    for (const block of page.blocks) {
      Object.values(block.data.fields).forEach(push)
      Object.values(block.data.lists).forEach((list) => list.forEach((entry) => Object.values(entry.fields).forEach(push)))
      block.freeNodes?.forEach((node) => push(node.src))
    }
  }
  return [...new Set(found)].slice(0, 12)
}
