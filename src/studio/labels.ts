import type { BusinessType, ProjectKind, ProjectStatus } from '@/domain/types'

export const KIND_LABELS: { id: ProjectKind; name: string; detail: string }[] = [
  { id: 'landing', name: 'Landing page', detail: 'Une page, une promesse, un formulaire.' },
  { id: 'vitrine', name: 'Site vitrine', detail: 'La maison, les prestations, le contact.' },
  { id: 'multipage', name: 'Site multipage', detail: 'Accueil, récit, offres, contact.' },
  { id: 'agence', name: 'Agence', detail: 'Présentation d’un studio ou d’une équipe.' },
  { id: 'portfolio', name: 'Portfolio', detail: 'Réalisations et parcours.' },
  { id: 'restaurant', name: 'Restaurant', detail: 'Carte, salle, demande de table.' },
  { id: 'booking', name: 'Prise de rendez-vous', detail: 'Créneaux demandés par e-mail, sans agenda synchronisé.' },
  { id: 'eshop', name: 'Mini-boutique', detail: 'Catalogue et commande WhatsApp, e-mail ou lien de paiement.' },
  { id: 'blog', name: 'Journal', detail: 'Articles en pages statiques.' },
  { id: 'pwa-loyalty', name: 'Carte de fidélité', detail: 'Application installable, tampons sur l’appareil.' },
  { id: 'pwa-menu', name: 'Commande', detail: 'Carte et panier, sans paiement simulé.' },
  { id: 'pwa-booking', name: 'Rendez-vous installable', detail: 'Demande de créneau, ajout à l’écran d’accueil.' },
  { id: 'pwa-linkinbio', name: 'Liens', detail: 'Une page de liens, installable.' },
  { id: 'pwa-catalog', name: 'Catalogue installable', detail: 'Produits hors ligne après installation.' },
  { id: 'pwa-event', name: 'Événement', detail: 'Page d’annonce installable.' },
]

export const BUSINESS_LABELS: { id: BusinessType; name: string }[] = [
  { id: 'restaurant', name: 'Restaurant, café' },
  { id: 'coiffeur', name: 'Coiffeur, barbier, esthétique' },
  { id: 'artisan', name: 'Artisan' },
  { id: 'coach', name: 'Coach, sport' },
  { id: 'boutique', name: 'Boutique' },
  { id: 'liberal', name: 'Profession libérale' },
  { id: 'generic', name: 'Autre commerce' },
]

export const STATUS_PROJECT: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  active: 'En cours',
  done: 'Terminé',
  published: 'Publié',
  archived: 'Archivé',
}

export function kindName(id: ProjectKind): string {
  return KIND_LABELS.find((item) => item.id === id)?.name ?? id
}

export function businessName(id: BusinessType): string {
  return BUSINESS_LABELS.find((item) => item.id === id)?.name ?? id
}

export function money(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

export function parseMoney(value: string): number {
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function when(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}
