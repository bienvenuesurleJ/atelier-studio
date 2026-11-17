import type { Project, ProspectStatus, RateCard } from './types'

export interface PriceOffer {
  id: string
  name: string
  forKinds: string
  creation: string
  maintenance: string
  includes: string[]
}

export const PRICE_OFFERS: PriceOffer[] = [
  {
    id: 'landing',
    name: 'Page unique',
    forKinds: 'Landing',
    creation: '390 à 690 €',
    maintenance: '29 € / mois',
    includes: ['Une page, mobile', 'Textes de départ', 'Formulaire e-mail', 'Mise en ligne gratuite'],
  },
  {
    id: 'vitrine',
    name: 'Site vitrine',
    forKinds: 'Vitrine, réservation',
    creation: '590 à 990 €',
    maintenance: '39 € / mois',
    includes: ['Jusqu’à 4 pages', 'SEO local de base', 'Carte et horaires', 'Formation de 30 minutes'],
  },
  {
    id: 'multipage',
    name: 'Site complet',
    forKinds: 'Multipage, portfolio, journal',
    creation: '890 à 1 490 €',
    maintenance: '49 € / mois',
    includes: ['Plusieurs pages', 'Galerie ou journal', 'Mentions légales', 'Deux allers-retours inclus'],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    forKinds: 'Carte + demande de table',
    creation: '790 à 1 290 €',
    maintenance: '49 € / mois',
    includes: ['Carte modifiable par vous', 'Demande de réservation par e-mail', 'Horaires et plan'],
  },
  {
    id: 'catalogue',
    name: 'Catalogue',
    forKinds: 'Mini-boutique sans stock en ligne',
    creation: '990 à 1 690 €',
    maintenance: '59 € / mois',
    includes: ['Fiches produits', 'Commande WhatsApp ou e-mail', 'Lien de paiement si le client en a un'],
  },
  {
    id: 'pwa',
    name: 'Application installable',
    forKinds: 'Fidélité, menu, rendez-vous, liens',
    creation: '1 190 à 1 990 €',
    maintenance: '69 € / mois',
    includes: ['Installation sur l’écran d’accueil', 'Fonctionne ensuite hors ligne', 'Limites expliquées au client'],
  },
]

export const CHECKLIST = [
  { id: 'niche', label: 'Choisir un quartier et un métier (par exemple les salons d’une rue).' },
  { id: 'list', label: 'Noter 20 commerces sans site, ou avec un site illisible sur téléphone.' },
  { id: 'demo', label: 'Préparer une démo avec leur nom avant la visite, pas un exemple générique.' },
  { id: 'visit', label: 'Passer en personne à une heure calme, téléphone en main.' },
  { id: 'send', label: 'Envoyer le lien Netlify ou Cloudflare le jour même.' },
  { id: 'follow', label: 'Relancer à J+3, une fois, puis à J+10 si silence.' },
  { id: 'deposit', label: 'Demander un acompte (40 %) et une date de mise en ligne avant de figer les textes.' },
  { id: 'domain', label: 'Le nom de domaine reste au nom du client, chez son registrar.' },
  { id: 'handoff', label: 'Montrer que les changements passent par vous : c’est le sens de la maintenance.' },
  { id: 'referral', label: 'Demander un avis et deux adresses de confrères après la livraison.' },
]

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  nouveau: 'Nouveau',
  'a-contacter': 'À contacter',
  contacte: 'Contacté',
  interesse: 'Intéressé',
  devis: 'Devis envoyé',
  negociation: 'En négociation',
  client: 'Client',
  refuse: 'Refusé',
}

export const DEFAULT_RATES: RateCard = {
  base: 490,
  perPage: 80,
  design: 150,
  shop: 280,
  pwa: 220,
  seo: 90,
  monthly: 39,
  costEstimate: 0,
}

export function suggestedPrice(rates: RateCard, input: { pages: number; design: boolean; shop: boolean; pwa: boolean; seo: boolean }): number {
  return (
    rates.base +
    Math.max(0, input.pages - 1) * rates.perPage +
    (input.design ? rates.design : 0) +
    (input.shop ? rates.shop : 0) +
    (input.pwa ? rates.pwa : 0) +
    (input.seo ? rates.seo : 0)
  )
}

export function coldEmail(owner: string, business: string, city: string): string {
  return `Objet : le site de ${business}, une première version

Bonjour,

Je m’appelle ${owner || '[votre prénom]'} et je prépare des sites pour les commerces de ${city || '[ville]'}. J’ai regardé la présence en ligne de ${business} : sur téléphone, on ne voit pas clairement les horaires, les tarifs et comment vous écrire.

J’ai monté une première version, à votre nom, que vous pouvez ouvrir ici : [collez le lien de la démo].

Ce n’est pas un engagement. Si la direction vous convient, je m’occupe des textes définitifs, des photos et de la mise en ligne. Le site vous appartient, le nom de domaine aussi. L’hébergement que j’utilise pour démarrer est gratuit.

Je passe dans le quartier cette semaine. Dites-moi si dix minutes vous arrangent.

${owner || '[votre prénom]'}`
}

export function coldDm(business: string): string {
  return `Bonjour, je prépare des sites pour les commerces du quartier. J’ai fait une première version pour ${business}, lisible sur téléphone, avec horaires et contact. Je peux vous l’envoyer, sans engagement. Vous me dites si le ton vous va ?`
}

export function quoteMessage(project: Project, price: string, maintenance: string): string {
  const name = project.business.name
  return `Bonjour,

Suite à la démo de ${name}, je vous propose :

— Création : ${price || '[montant]'} TTC, acompte de 40 % à la commande, solde à la mise en ligne.
— Maintenance optionnelle : ${maintenance || '[montant]'} / mois (textes, horaires, sauvegarde, petites photos).
— Nom de domaine : à votre nom, chez le registrar de votre choix (environ 10 à 15 € / an, réglés par vous).
— Hébergement : gratuit (Netlify, Cloudflare Pages ou GitHub Pages).

Le formulaire envoie les messages par e-mail. Il n’y a pas de paiement encaissé par le site, sauf si vous me donnez un lien de paiement déjà ouvert chez Stripe, PayPal ou Lydia.

Deux allers-retours sur les textes sont inclus. Dites-moi si je lance.

Belle journée`
}

export function demoMessage(project: Project): string {
  return `Bonjour,

Voici une première version du site de ${project.business.name} : [collez le lien après avoir déposé le dossier sur Netlify Drop ou Cloudflare Pages].

Regardez-le sur votre téléphone. Dites-moi ce qui sonne faux : une phrase, une photo, un prix, une couleur. Rien n’est figé.

Belle journée`
}
