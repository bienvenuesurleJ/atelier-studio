import type { BusinessType, ProjectKind, StyleId } from './types'
import { createProject } from './createProject'
import type { Project } from './types'

export interface SitePreset {
  id: string
  name: string
  detail: string
  kind: ProjectKind
  businessType: BusinessType
  styleId: StyleId
  city: string
}

const styles: StyleId[] = ['luxe', 'minimal', 'moderne', 'nature', 'brutal', 'neon', 'retro', 'glass', 'corporate', 'playful']

const seeds: Array<Omit<SitePreset, 'id' | 'styleId'> & { style?: StyleId }> = [
  { name: 'Table des Remparts', detail: 'Restaurant, carte et réservation.', kind: 'restaurant', businessType: 'restaurant', city: 'Lyon' },
  { name: 'Boulangerie du quai', detail: 'Vitrine chaude, horaires, click & collect.', kind: 'vitrine', businessType: 'artisan', city: 'Nantes' },
  { name: 'Atelier Durand', detail: 'Artisan, devis, zone d’intervention.', kind: 'vitrine', businessType: 'artisan', city: 'Bordeaux' },
  { name: 'Salon Nuage', detail: 'Coiffure, prestations, rendez-vous.', kind: 'booking', businessType: 'coiffeur', city: 'Lille' },
  { name: 'Cabinet Horizon', detail: 'Libéral, parcours, prise de rendez-vous.', kind: 'booking', businessType: 'liberal', city: 'Rennes' },
  { name: 'Maison Céleste', detail: 'Boutique, lookbook, contact.', kind: 'eshop', businessType: 'boutique', city: 'Paris' },
  { name: 'Studio Brise', detail: 'Coach, promesses, créneaux.', kind: 'booking', businessType: 'coach', city: 'Toulouse' },
  { name: 'Agence du port', detail: 'Plusieurs pages, offres, équipe.', kind: 'agence', businessType: 'generic', city: 'Marseille' },
  { name: 'Journal de quartier', detail: 'Articles, à propos, newsletter.', kind: 'blog', businessType: 'generic', city: 'Strasbourg' },
  { name: 'Portfolio ligne claire', detail: 'Réalisations et parcours.', kind: 'portfolio', businessType: 'artisan', city: 'Nantes' },
  { name: 'Landing soldes', detail: 'Une page, offre, preuve, appel.', kind: 'landing', businessType: 'boutique', city: 'Lyon' },
  { name: 'Carte fidélité', detail: 'Application tampons, installable.', kind: 'pwa-loyalty', businessType: 'coiffeur', city: 'Dijon' },
  { name: 'Menu à emporter', detail: 'Carte commandable, une page.', kind: 'pwa-menu', businessType: 'restaurant', city: 'Nice' },
  { name: 'Liens du soir', detail: 'Une page de liens.', kind: 'pwa-linkinbio', businessType: 'coach', city: 'Brest' },
  { name: 'Soirée d’ouverture', detail: 'Événement, date, lieu.', kind: 'pwa-event', businessType: 'restaurant', city: 'Lyon' },
  { name: 'Catalogue céramique', detail: 'Fiches, prix, demande.', kind: 'pwa-catalog', businessType: 'artisan', city: 'Limoges' },
  { name: 'Rendez-vous express', detail: 'Créneaux, services, horaires.', kind: 'pwa-booking', businessType: 'liberal', city: 'Angers' },
  { name: 'Maison de thé', detail: 'Ambiance calme, carte, salon.', kind: 'restaurant', businessType: 'restaurant', city: 'Annecy' },
  { name: 'Fleuriste du marché', detail: 'Saisons, compositions, retrait.', kind: 'vitrine', businessType: 'boutique', city: 'Tours' },
  { name: 'Garage des Allées', detail: 'Atelier auto, devis, horaires.', kind: 'vitrine', businessType: 'artisan', city: 'Clermont' },
  { name: 'Yoga du parc', detail: 'Cours, niveaux, essai.', kind: 'booking', businessType: 'coach', city: 'Grenoble' },
  { name: 'Librairie page 48', detail: 'Sélection, événements, horaires.', kind: 'multipage', businessType: 'boutique', city: 'Poitiers' },
  { name: 'Fromager des halles', detail: 'Étals, plateaux, commande.', kind: 'eshop', businessType: 'artisan', city: 'Rouen' },
  { name: 'Architecte d’intérieur', detail: 'Projets, méthode, contact.', kind: 'portfolio', businessType: 'liberal', city: 'Bordeaux' },
  { name: 'Pressing minute', detail: 'Tarifs, délais, adresse.', kind: 'vitrine', businessType: 'artisan', city: 'Metz' },
  { name: 'Crèche des tilleuls', detail: 'Accueil, équipe, inscriptions.', kind: 'multipage', businessType: 'generic', city: 'Orléans' },
  { name: 'Bar à vins', detail: 'Cave, planches, réservation.', kind: 'restaurant', businessType: 'restaurant', city: 'Beaune' },
  { name: 'Photographe mariage', detail: 'Séries, formules, date.', kind: 'portfolio', businessType: 'liberal', city: 'Reims' },
  { name: 'Épicerie vrac', detail: 'Rayons, consignes, horaires.', kind: 'eshop', businessType: 'boutique', city: 'Rennes' },
  { name: 'Ostéo du centre', detail: 'Motifs, séance, rendez-vous.', kind: 'booking', businessType: 'liberal', city: 'Caen' },
  { name: 'Menuiserie Loire', detail: 'Pose, atelier, zone.', kind: 'vitrine', businessType: 'artisan', city: 'Saumur' },
  { name: 'Institut peau douce', detail: 'Soins, tarifs, silence.', kind: 'booking', businessType: 'coiffeur', city: 'Aix' },
  { name: 'Cave coopérative', detail: 'Cuves, visites, bouteilles.', kind: 'eshop', businessType: 'artisan', city: 'Bergerac' },
  { name: 'École de musique', detail: 'Cours, professeurs, audition.', kind: 'multipage', businessType: 'coach', city: 'Colmar' },
  { name: 'Hôtel des douves', detail: 'Chambres, petit-déjeuner, plan.', kind: 'multipage', businessType: 'generic', city: 'La Rochelle' },
  { name: 'Réparateur vélo', detail: 'Atelier, forfaits, retrait.', kind: 'vitrine', businessType: 'artisan', city: 'Lorient' },
  { name: 'Concept store', detail: 'Sélection courte, marques locales.', kind: 'eshop', businessType: 'boutique', city: 'Lille' },
  { name: 'Traiteur du dimanche', detail: 'Plateaux, délais, devis.', kind: 'restaurant', businessType: 'restaurant', city: 'Versailles' },
  { name: 'Studio photo', detail: 'Séances, tarifs, book.', kind: 'portfolio', businessType: 'liberal', city: 'Paris' },
  { name: 'Cowork du fleuve', detail: 'Postes, salles, adhésion.', kind: 'landing', businessType: 'generic', city: 'Nantes' },
]

export const SITE_PRESETS: SitePreset[] = seeds.map((seed, index) => ({
  id: `modele-${index + 1}`,
  name: seed.name,
  detail: seed.detail,
  kind: seed.kind,
  businessType: seed.businessType,
  styleId: seed.style ?? styles[index % styles.length],
  city: seed.city,
}))

export function createFromPreset(id: string): Project {
  const preset = SITE_PRESETS.find((item) => item.id === id) ?? SITE_PRESETS[0]
  const project = createProject({
    kind: preset.kind,
    businessType: preset.businessType,
    styleId: preset.styleId,
    businessName: preset.name,
    city: preset.city,
    projectName: preset.name,
  })
  project.products = []
  return project
}
