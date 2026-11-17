import type { VideoFormat } from '../domain/types'
import type { Clip, Film, FilmBrand, Track } from './model'

export const FILM_TEMPLATES: { id: string; name: string; detail: string; format: VideoFormat }[] = [
  { id: 'boutique', name: 'Présentation boutique', detail: 'Le lieu, l’offre, l’adresse.', format: '9:16' },
  { id: 'promo', name: 'Promo / soldes', detail: 'Une offre, puis l’appel.', format: '9:16' },
  { id: 'produit', name: 'Nouveau produit', detail: 'Une pièce mise en avant.', format: '1:1' },
  { id: 'avis', name: 'Avis clients', detail: 'Une citation, clairement un exemple à remplacer.', format: '9:16' },
  { id: 'menu', name: 'Menu du jour', detail: 'Trois lignes et un prix.', format: '9:16' },
  { id: 'evenement', name: 'Ouverture / événement', detail: 'La date, le lieu, la raison.', format: '16:9' },
  { id: 'immo', name: 'Immobilier', detail: 'Le bien, le quartier, la visite.', format: '16:9' },
  { id: 'coach', name: 'Coach / fitness', detail: 'La promesse, la séance, le créneau.', format: '9:16' },
  { id: 'beaute', name: 'Salon de beauté', detail: 'Le geste, le tarif, le rendez-vous.', format: '9:16' },
  { id: 'artisan', name: 'Artisan', detail: 'Le métier, le devis, la zone.', format: '1:1' },
  { id: 'brunch', name: 'Brunch', detail: 'Le dimanche, la table, l’heure.', format: '9:16' },
  { id: 'soldes', name: 'Derniers jours', detail: 'Une date, une remise, une adresse.', format: '1:1' },
  { id: 'fleuriste', name: 'Fleuriste', detail: 'Le bouquet, la saison, le retrait.', format: '9:16' },
  { id: 'boulangerie', name: 'Boulangerie', detail: 'Le fournil, l’heure, le pain.', format: '9:16' },
  { id: 'hotel', name: 'Hôtel', detail: 'La chambre, le petit-déjeuner, la nuit.', format: '16:9' },
  { id: 'yoga', name: 'Cours de yoga', detail: 'Le cours, le niveau, l’essai.', format: '9:16' },
  { id: 'garage', name: 'Garage', detail: 'Le contrôle, le devis, l’atelier.', format: '16:9' },
  { id: 'vin', name: 'Cave', detail: 'La cuvée, la visite, la bouteille.', format: '1:1' },
  { id: 'photo', name: 'Séance photo', detail: 'Le lieu, la durée, le tarif.', format: '16:9' },
  { id: 'traiteur', name: 'Traiteur', detail: 'Le plateau, le délai, le devis.', format: '1:1' },
  { id: 'librairie', name: 'Librairie', detail: 'La sélection, la rencontre, l’heure.', format: '9:16' },
  { id: 'osteo', name: 'Cabinet', detail: 'Le motif, la séance, le créneau.', format: '9:16' },
  { id: 'velo', name: 'Atelier vélo', detail: 'La révision, le forfait, le retrait.', format: '1:1' },
  { id: 'mariage', name: 'Mariage', detail: 'La date, le lieu, la formule.', format: '16:9' },
  { id: 'epicerie', name: 'Épicerie', detail: 'Le rayon, la consigne, l’horaire.', format: '9:16' },
]

const blank = (): FilmBrand => ({
  name: 'Maison Horizon',
  city: 'Lyon',
  primary: '#d7b07a',
  accent: '#8fbfa8',
  bg: '#141210',
  text: '#f4efe7',
  font: 'Georgia, serif',
})

export function createFilm(templateId: string, format?: VideoFormat): Film {
  const template = FILM_TEMPLATES.find((item) => item.id === templateId) ?? FILM_TEMPLATES[0]
  const brand = blank()
  const chosen = format ?? template.format
  const now = new Date().toISOString()
  return {
    id: `film-${Math.random().toString(36).slice(2, 8)}`,
    name: template.name,
    templateId: template.id,
    format: chosen,
    brand: brandFor(template.id, brand),
    tracks: tracksFor(template.id, brandFor(template.id, brand)),
    musicId: 'comptoir',
    musicDataUrl: '',
    musicVolume: 0.32,
    musicFade: 0.7,
    musicMuted: false,
    subtitles: [
      { id: 'sub-1', start: 0.4, duration: 2.2, text: template.name, style: 'bas' },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

function brandFor(id: string, base: FilmBrand): FilmBrand {
  if (id === 'coach') return { ...base, name: 'Studio Brise', primary: '#7CDE9A', bg: '#101612', text: '#f3fff6' }
  if (id === 'beaute') return { ...base, name: 'Atelier Nuage', primary: '#e7a0b4', bg: '#1a1216', text: '#fff5f7' }
  if (id === 'artisan') return { ...base, name: 'Atelier Durand', primary: '#e0a15a', bg: '#161311', text: '#f8f1e7' }
  if (id === 'immo') return { ...base, name: 'Rue des Remparts', primary: '#9eb6d4', bg: '#10141a', text: '#f4f7fb' }
  if (id === 'menu' || id === 'evenement') return { ...base, name: 'La Table des Remparts', city: 'Lyon' }
  if (id === 'promo') return { ...base, name: 'Maison Céleste', primary: '#ff5d8f' }
  return base
}

function tracksFor(id: string, brand: FilmBrand): Track[] {
  const copy = scriptFor(id, brand)
  return [
    track('image', 'Images', copy.images),
    track('video', 'Vidéos', []),
    track('shape', 'Formes', copy.shapes),
    track('text', 'Textes', copy.texts),
  ]
}

function track(kind: Track['kind'], name: string, clips: ClipInput[]): Track {
  return { id: `track-${kind}-${Math.random().toString(36).slice(2, 6)}`, kind, name, clips: clips.map(clip) }
}

interface ClipInput {
  start: number
  duration: number
  text?: string
  subtext?: string
  transition?: Clip['transition']
  textAnim?: Clip['textAnim']
  kenBurns?: boolean
  shape?: Clip['shape']
  color?: string
}

function clip(input: ClipInput): Clip {
  return {
    id: `clip-${Math.random().toString(36).slice(2, 8)}`,
    start: input.start,
    duration: input.duration,
    trimIn: 0,
    text: input.text ?? '',
    subtext: input.subtext ?? '',
    media: '',
    mediaKind: 'none',
    transition: input.transition ?? 'fade',
    textAnim: input.textAnim ?? 'rise',
    kenBurns: Boolean(input.kenBurns),
    shape: input.shape ?? 'none',
    color: input.color ?? '',
    volume: 1,
    muted: false,
  }
}

const extraLines: Record<string, [string, string, string, string]> = {
  brunch: ['Brunch du dimanche', 'De 11 h à 14 h', 'La table du fond', '11 h'],
  soldes: ['Derniers jours', '−30 % jusqu’à samedi', 'En boutique seulement', '−30 %'],
  fleuriste: ['Bouquet de saison', 'Retrait au marché', 'Commande la veille', 'Saison'],
  boulangerie: ['Sortie du four', 'Le pain à 7 h 30', 'Fermé le lundi', '7 h 30'],
  hotel: ['Chambre sur cour', 'Petit-déjeuner inclus', 'Deux nuits minimum', 'Nuit'],
  yoga: ['Cours du soir', 'Tous niveaux', 'Premier cours offert', '19 h'],
  garage: ['Contrôle avant l’été', 'Devis avant les pièces', 'Véhicule de courtoisie', 'Devis'],
  vin: ['Cuvée du domaine', 'Visite le samedi', 'Bouteille à emporter', 'Cave'],
  photo: ['Séance d’une heure', '20 photos livrées', 'Extérieur ou studio', '1 h'],
  traiteur: ['Plateau du dimanche', 'Commande 48 h avant', 'Livraison en ville', '48 h'],
  librairie: ['Table des nouveautés', 'Rencontre jeudi 18 h', 'Commande sous 48 h', 'Jeudi'],
  osteo: ['Première séance', '45 minutes', 'Sans ordonnance', '45 min'],
  velo: ['Révision de printemps', 'Prêt en 48 h', 'Forfait freins 35 €', '48 h'],
  mariage: ['Le jour J', 'Reportage 8 heures', 'Album sous six semaines', '8 h'],
  epicerie: ['Rayon vrac', 'Consigne reprise', 'Ouvert jusqu’à 19 h 30', 'Vrac'],
}

function scriptFor(id: string, brand: FilmBrand): { images: ClipInput[]; shapes: ClipInput[]; texts: ClipInput[] } {
  const bar = (start: number, duration: number): ClipInput => ({ start, duration, shape: 'bar', color: brand.primary })
  const badge = (start: number, duration: number, text: string): ClipInput => ({ start, duration, shape: 'badge', text, color: brand.accent })
  if (id === 'promo') {
    return {
      images: [{ start: 0, duration: 8, kenBurns: true, transition: 'kenburns' }],
      shapes: [bar(0, 8), badge(2.2, 3.2, '−20 %')],
      texts: [
        { start: 0.2, duration: 2.4, text: brand.name, subtext: 'Cette semaine seulement', textAnim: 'rise' },
        { start: 2.6, duration: 3, text: 'Soldes de saison', subtext: 'Sur une sélection déjà en boutique', textAnim: 'fade' },
        { start: 5.6, duration: 2.4, text: 'Passez avant samedi', subtext: brand.city, textAnim: 'type' },
      ],
    }
  }
  if (id === 'produit') {
    return {
      images: [{ start: 0, duration: 7.5, kenBurns: true }],
      shapes: [bar(0, 7.5)],
      texts: [
        { start: 0.2, duration: 2.2, text: 'Nouveau', subtext: brand.name, textAnim: 'rise' },
        { start: 2.4, duration: 2.8, text: 'La pièce de la semaine', subtext: 'Remplacez par le nom du produit', textAnim: 'fade' },
        { start: 5.2, duration: 2.3, text: 'En boutique', subtext: brand.city, textAnim: 'type' },
      ],
    }
  }
  if (id === 'avis') {
    return {
      images: [{ start: 0, duration: 8, kenBurns: true }],
      shapes: [bar(0, 8)],
      texts: [
        { start: 0.3, duration: 3.4, text: '« Remplacez par un avis réel. »', subtext: 'Exemple — avec l’accord de la personne', textAnim: 'fade' },
        { start: 3.8, duration: 4, text: brand.name, subtext: 'Venez vous faire votre idée', textAnim: 'rise' },
      ],
    }
  }
  if (id === 'menu') {
    return {
      images: [{ start: 0, duration: 9, kenBurns: true }],
      shapes: [bar(0, 9), badge(2, 4, 'Midi')],
      texts: [
        { start: 0.2, duration: 2.2, text: brand.name, subtext: 'Aujourd’hui', textAnim: 'rise' },
        { start: 2.4, duration: 4, text: 'Céleri rôti · 14 €', subtext: 'Lieu jaune · 28 €\nTarte citron · 11 €', textAnim: 'fade' },
        { start: 6.4, duration: 2.6, text: 'Réservez une table', subtext: brand.city, textAnim: 'type' },
      ],
    }
  }
  if (id === 'evenement') {
    return {
      images: [{ start: 0, duration: 8, kenBurns: true, transition: 'mask' }],
      shapes: [bar(0, 8)],
      texts: [
        { start: 0.2, duration: 2.6, text: 'Ouverture', subtext: brand.name, textAnim: 'rise' },
        { start: 2.8, duration: 2.6, text: brand.city, subtext: 'Samedi, à partir de 11 h', textAnim: 'fade' },
        { start: 5.4, duration: 2.6, text: 'On vous attend', subtext: 'Entrée libre', textAnim: 'type' },
      ],
    }
  }
  if (id === 'immo') {
    return {
      images: [{ start: 0, duration: 9, kenBurns: true }],
      shapes: [bar(0, 9), badge(2.2, 3, 'Visite')],
      texts: [
        { start: 0.2, duration: 2.4, text: 'Appartement traversant', subtext: brand.city, textAnim: 'rise' },
        { start: 2.6, duration: 3.2, text: '3 pièces · 68 m²', subtext: 'Lumière du matin, cave, proche tram', textAnim: 'fade' },
        { start: 5.8, duration: 3, text: 'Demander une visite', subtext: brand.name, textAnim: 'type' },
      ],
    }
  }
  if (id === 'coach') {
    return {
      images: [{ start: 0, duration: 8, kenBurns: true }],
      shapes: [bar(0, 8)],
      texts: [
        { start: 0.2, duration: 2.4, text: brand.name, subtext: 'Reprendre sans se blesser', textAnim: 'rise' },
        { start: 2.6, duration: 2.8, text: 'Séances de 50 min', subtext: 'Seul ou à quatre', textAnim: 'fade' },
        { start: 5.4, duration: 2.6, text: 'Bilan 40 €', subtext: 'Sans engagement', textAnim: 'type' },
      ],
    }
  }
  if (id === 'beaute') {
    return {
      images: [{ start: 0, duration: 8, kenBurns: true }],
      shapes: [bar(0, 8), badge(2, 3.2, 'Rendez-vous')],
      texts: [
        { start: 0.2, duration: 2.4, text: brand.name, subtext: 'Coupe et couleur', textAnim: 'rise' },
        { start: 2.6, duration: 2.8, text: 'Couleur dès 74 €', subtext: 'Uniquement sur rendez-vous', textAnim: 'fade' },
        { start: 5.4, duration: 2.6, text: 'Écrire pour un créneau', subtext: brand.city, textAnim: 'type' },
      ],
    }
  }
  const extra = extraLines[id]
  if (extra) {
    return {
      images: [{ start: 0, duration: 8, kenBurns: true, transition: 'fade' }],
      shapes: [bar(0, 8), badge(2, 3, extra[3] || 'Nouveau')],
      texts: [
        { start: 0.2, duration: 2.4, text: extra[0], subtext: brand.name, textAnim: 'pop' },
        { start: 2.6, duration: 2.6, text: extra[1], subtext: brand.city, textAnim: 'glisse' },
        { start: 5.2, duration: 2.6, text: extra[2], subtext: 'Exemple à personnaliser', textAnim: 'fade' },
      ],
    }
  }
  if (id === 'artisan') {
    return {
      images: [{ start: 0, duration: 8, kenBurns: true }],
      shapes: [bar(0, 8)],
      texts: [
        { start: 0.2, duration: 2.4, text: brand.name, subtext: 'Devis écrit avant les travaux', textAnim: 'rise' },
        { start: 2.6, duration: 2.8, text: 'Dépannage et pose', subtext: `Autour de ${brand.city}`, textAnim: 'fade' },
        { start: 5.4, duration: 2.6, text: 'Demander un passage', subtext: 'Réponse sous 24 h', textAnim: 'type' },
      ],
    }
  }
  return {
    images: [{ start: 0, duration: 9, kenBurns: true }],
    shapes: [bar(0, 9)],
    texts: [
      { start: 0.2, duration: 2.6, text: brand.name, subtext: brand.city, textAnim: 'rise' },
      { start: 2.8, duration: 3, text: 'Une sélection courte', subtext: 'Du conseil, pas un catalogue interminable', textAnim: 'fade' },
      { start: 5.8, duration: 3, text: 'Poussez la porte', subtext: 'Du mardi au samedi', textAnim: 'type' },
    ],
  }
}
