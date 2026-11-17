import { item } from './blockData'
import type { BusinessType, DayHours, ListItem, TemplateContext } from './types'

export interface CopyPack {
  schemaType: string
  category: string
  priceRange: string
  tagline: string
  heroKicker: string
  heroTitle: string
  heroSubtitle: string
  heroPrimary: string
  heroSecondary: string
  aboutTitle: string
  aboutBody: string
  servicesTitle: string
  servicesIntro: string
  services: { title: string; text: string; price: string }[]
  features: { title: string; text: string }[]
  menu: { name: string; description: string; price: string; category: string; tag: string }[]
  testimonials: { quote: string; author: string; role: string }[]
  faqs: { q: string; a: string }[]
  stats: { value: string; suffix: string; label: string }[]
  gallery: { caption: string; alt: string }[]
  steps: { title: string; text: string }[]
  plans: { name: string; price: string; period: string; description: string; features: string; highlight: string }[]
  team: { name: string; role: string; bio: string }[]
  posts: { title: string; date: string; excerpt: string; content: string }[]
  products: { name: string; price: string; description: string; badge: string }[]
  timeline: { year: string; title: string; text: string }[]
  logos: string[]
  hours: DayHours[]
  ctaTitle: string
  ctaText: string
  loyaltyReward: string
  links: { label: string; url: string; note: string }[]
}

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function hours(
  pattern: { closed?: boolean; slots: { open: string; close: string }[] }[],
): DayHours[] {
  return days.map((day, index) => ({
    day,
    closed: pattern[index]?.closed ?? false,
    slots: pattern[index]?.closed ? [] : (pattern[index]?.slots ?? []),
  }))
}

const slot = (open: string, close: string) => ({ open, close })

export function copyFor(ctx: TemplateContext): CopyPack {
  const { name, city } = ctx
  const packs: Record<BusinessType, CopyPack> = {
    restaurant: {
      schemaType: 'Restaurant',
      category: 'Restaurant',
      priceRange: '€€',
      tagline: `Cuisine de saison et table ouverte à ${city}.`,
      heroKicker: `Restaurant · ${city}`,
      heroTitle: name,
      heroSubtitle: `Produits du marché, une salle qui sent le pain grillé, et un service qui connaît les habitués. Au cœur de ${city}.`,
      heroPrimary: 'Voir la carte',
      heroSecondary: 'Réserver une table',
      aboutTitle: 'Une cuisine de marché, pas une carte figée.',
      aboutBody: `Chez ${name}, le menu change avec les arrivages. Le midi, une formule courte. Le soir, une table plus longue, des vins choisis avec les vignerons, et la lumière basse.\n\nLa salle est petite exprès. On préfère bien recevoir quarante couverts que courir après le bruit.`,
      servicesTitle: 'À table',
      servicesIntro: 'Trois façons de venir, selon l’heure et l’appétit.',
      services: [
        { title: 'Formule midi', text: 'Entrée, plat et café, servis sans attendre.', price: '22 €' },
        { title: 'Le soir', text: 'Carte courte, desserts maison, accord mets et verres.', price: 'dès 38 €' },
        { title: 'Table privée', text: 'La salle pour un repas d’équipe ou un anniversaire.', price: 'sur devis' },
      ],
      features: [
        { title: 'Marché du matin', text: 'Les légumes et le poisson arrivent le jour même, pas en barquette sous vide.' },
        { title: 'Pain et desserts maison', text: 'Le levain est pétri ici. Les tartes partent quand la vitrine est vide.' },
        { title: 'Salle de quarante couverts', text: 'On vous place, on vous laisse parler, on revient au bon moment.' },
      ],
      menu: [
        { name: 'Céleri rôti, beurre noisette', description: 'Noisette, pomme acidulée, feuilles amères.', price: '14 €', category: 'Entrées', tag: 'Végétarien' },
        { name: 'Tartare de bœuf, jaune fumé', description: 'Câpres, échalote, pain grillé.', price: '16 €', category: 'Entrées', tag: '' },
        { name: 'Lieu jaune, beurre blanc', description: 'Fenouil, agrumes, huile de persil.', price: '28 €', category: 'Plats', tag: '' },
        { name: 'Risotto de petit épeautre', description: 'Champignons, parmesan affiné 24 mois.', price: '24 €', category: 'Plats', tag: 'Végétarien' },
        { name: 'Poulet fermier rôti', description: 'Jus corsé, pommes de terre écrasées.', price: '26 €', category: 'Plats', tag: '' },
        { name: 'Tarte au citron brûlé', description: 'Crème légère, sablé, zeste confit.', price: '11 €', category: 'Desserts', tag: '' },
        { name: 'Chocolat grand cru', description: 'Ganache, olive noire, fleur de sel.', price: '12 €', category: 'Desserts', tag: '' },
      ],
      testimonials: [
        { quote: 'On revient pour le céleri rôti et pour la façon dont on est reçu, sans théâtre.', author: 'Camille R.', role: 'Habituée du jeudi' },
        { quote: 'La formule du midi est juste : assez pour travailler l’après-midi, assez bonne pour en parler.', author: 'Julien M.', role: 'Quartier des bureaux' },
        { quote: 'Anniversaire de dix personnes, timing tenu, gâteau accepté sans sourciller.', author: 'Inès K.', role: 'Repas de famille' },
      ],
      faqs: [
        { q: 'Faut-il réserver ?', a: 'Le soir, oui. Le midi, la formule passe aussi sans réservation, dans la limite des places.' },
        { q: 'Avez-vous des options végétariennes ?', a: 'Toujours au moins une entrée, un plat et un dessert. Les allergènes sont indiqués à la demande.' },
        { q: 'Prenez-vous les groupes ?', a: 'Jusqu’à douze personnes en salle, au-delà on privatise un service. Écrivez-nous.' },
        { q: 'Les chiens sont-ils acceptés ?', a: 'Les petits chiens calmes, en terrasse et au fond de salle, à condition que le service ne soit pas complet.' },
      ],
      stats: [
        { value: '40', suffix: '', label: 'couverts, pas un de plus' },
        { value: '12', suffix: '', label: 'ans à la même adresse' },
        { value: '3', suffix: '', label: 'services par semaine au marché' },
        { value: '100', suffix: '%', label: 'des desserts faits maison' },
      ],
      gallery: [
        { caption: 'La salle', alt: 'Salle du restaurant' },
        { caption: 'Le passe', alt: 'Passe de la cuisine' },
        { caption: 'Terrasse', alt: 'Terrasse en fin de journée' },
        { caption: 'Pain du matin', alt: 'Pain au levain' },
      ],
      steps: [
        { title: 'Écrire ou appeler', text: 'Un nom, une heure, le nombre de couverts.' },
        { title: 'On confirme', text: 'Un message dans la journée, pas un robot.' },
        { title: 'La table est mise', text: 'Vous arrivez, on s’occupe du reste.' },
      ],
      plans: [
        { name: 'Formule midi', price: '22 €', period: '', description: 'Du mardi au vendredi.', features: 'Entrée + plat\nCafé ou thé\nPain maison', highlight: 'false' },
        { name: 'Menu du soir', price: '42 €', period: '', description: 'Trois temps, carte du moment.', features: 'Entrée\nPlat\nDessert', highlight: 'true' },
        { name: 'Dégustation', price: '68 €', period: '', description: 'Cinq services, accord au verre possible.', features: 'Cinq assiettes\nMises en bouche\nAccord +28 €', highlight: 'false' },
      ],
      team: [
        { name: 'Léa Martin', role: 'Cuisine', bio: 'Passée par des maisons de ville, revenue au marché et aux feux doux.' },
        { name: 'Noah Garcia', role: 'Salle', bio: 'Les vins, les horaires, et le prénom des habitués du jeudi.' },
      ],
      posts: [
        { title: 'Ce que le marché a changé cette semaine', date: '12 mars 2026', excerpt: 'Les agrumes partent, les herbes reviennent. La carte suit.', content: 'Le lieu jaune reste, le beurre blanc change de parfum. On a troqué l’orange pour le fenouil nouveau, plus doux, et un filet d’huile de persil.\n\nLe céleri rôti, lui, ne bouge pas : c’est le plat qu’on nous réclame, même en mars.' },
        { title: 'Privatiser un service, mode d’emploi', date: '2 février 2026', excerpt: 'Dix à vingt personnes, un menu unique, une heure de début.', content: 'On ferme la salle pour vous le dimanche soir ou un lundi. Menu unique annoncé à l’avance, gâteau bienvenu, discours tolérés s’ils restent courts.\n\nÉcrivez-nous avec la date et le nombre : on répond sous quarante-huit heures.' },
      ],
      products: [
        { name: 'Vin du mois', price: '18 €', description: 'Bouteille à emporter, celle qu’on sert au verre.', badge: 'Cave' },
        { name: 'Pâte à tartiner noisette', price: '9 €', description: 'Le pot de la maison, 220 g.', badge: 'Épicerie' },
        { name: 'Carte cadeau', price: '50 €', description: 'Valable un an, en salle.', badge: '' },
      ],
      timeline: [
        { year: '2014', title: 'Ouverture', text: `Première salle, quatorze couverts, à ${city}.` },
        { year: '2019', title: 'Le four à pain', text: 'On arrête d’acheter le pain. Le levain s’installe.' },
        { year: '2024', title: 'La terrasse', text: 'Huit tables dehors, d’avril à octobre.' },
      ],
      logos: ['Marché du centre', 'Vignerons d’à côté', 'Moulin du plateau', 'Ferme des Graves'],
      hours: hours([
        { closed: true, slots: [] },
        { slots: [slot('12:00', '14:30'), slot('19:00', '22:30')] },
        { slots: [slot('12:00', '14:30'), slot('19:00', '22:30')] },
        { slots: [slot('12:00', '14:30'), slot('19:00', '22:30')] },
        { slots: [slot('12:00', '14:30'), slot('19:00', '22:30')] },
        { slots: [slot('12:00', '14:30'), slot('19:00', '22:30')] },
        { slots: [slot('12:00', '15:00')] },
      ]),
      ctaTitle: 'Une table ce week-end ?',
      ctaText: 'Dites-nous le jour, l’heure et le nombre. On confirme dans la journée.',
      loyaltyReward: 'Au 9e déjeuner, le café et le dessert sont offerts.',
      links: [
        { label: 'Réserver une table', url: 'reserver', note: 'Demande en ligne' },
        { label: 'Voir la carte', url: 'carte', note: 'Entrées, plats, desserts' },
        { label: 'Nous écrire', url: 'contact', note: 'Groupes et privatisation' },
      ],
    },
    coiffeur: {
      schemaType: 'HairSalon',
      category: 'Salon de coiffure',
      priceRange: '€€',
      tagline: `Coupe, couleur et barbe, sur rendez-vous, à ${city}.`,
      heroKicker: `Salon · ${city}`,
      heroTitle: name,
      heroSubtitle: `Un salon calme, des rendez-vous qui commencent à l’heure, et des coupes qui tiennent plus d’une semaine. Au centre de ${city}.`,
      heroPrimary: 'Prendre rendez-vous',
      heroSecondary: 'Voir les tarifs',
      aboutTitle: 'On coupe moins, on coupe mieux.',
      aboutBody: `${name} travaille uniquement sur rendez-vous. Le diagnostic prend dix minutes : votre quotidien, le temps que vous accordez au brushing, ce que vous ne voulez plus.\n\nLes colorations sont posées sans se presser. Le thé est offert, le téléphone peut rester dans la poche.`,
      servicesTitle: 'Prestations',
      servicesIntro: 'Des tarifs affichés, un temps prévu, pas de surprise à la caisse.',
      services: [
        { title: 'Coupe femme', text: 'Diagnostic, coupe, mise en forme.', price: '62 €' },
        { title: 'Coupe homme', text: 'Coupe ciseaux et finitions.', price: '38 €' },
        { title: 'Couleur', text: 'Racines ou balayage, selon la longueur.', price: 'dès 74 €' },
        { title: 'Barbe', text: 'Taille, contours, serviette chaude.', price: '22 €' },
      ],
      features: [
        { title: 'Uniquement sur rendez-vous', text: 'Pas de salle d’attente qui déborde. Votre heure est la vôtre.' },
        { title: 'Produits expliqués', text: 'On vous montre deux gestes, pas une étagère entière à racheter.' },
        { title: 'Retouche sous 10 jours', text: 'Si la frange ou le contour ne vous va pas, on reprend.' },
      ],
      menu: [
        { name: 'Coupe femme', description: 'Shampoing, coupe, brushing court.', price: '62 €', category: 'Cheveux', tag: '' },
        { name: 'Coupe homme', description: 'Ciseaux, tondeuse en finition seulement.', price: '38 €', category: 'Cheveux', tag: '' },
        { name: 'Couleur racines', description: 'Jusqu’à 3 cm, soin inclus.', price: '74 €', category: 'Couleur', tag: '' },
        { name: 'Balayage', description: 'Selon longueur et densité.', price: 'dès 120 €', category: 'Couleur', tag: '' },
        { name: 'Barbe', description: 'Serviette chaude et huile.', price: '22 €', category: 'Barbe', tag: '' },
        { name: 'Forfait père et fils', description: 'Deux coupes homme, même rendez-vous.', price: '64 €', category: 'Barbe', tag: '' },
      ],
      testimonials: [
        { quote: 'Première fois que je sors sans avoir à « arranger » devant le miroir du tram.', author: 'Sarah B.', role: 'Cliente depuis 2022' },
        { quote: 'Mon fils de huit ans a tenu assis. Ça vaut déjà le déplacement.', author: 'Marc D.', role: 'Coupe père et fils' },
        { quote: 'La couleur a tenu six semaines sans virer. On m’avait prévenue du shampoing, j’ai suivi.', author: 'Amina L.', role: 'Balayage' },
      ],
      faqs: [
        { q: 'Acceptez-vous sans rendez-vous ?', a: 'Non. Un créneau libéré le jour même est parfois possible : appelez avant de passer.' },
        { q: 'Combien de temps prévoir ?', a: 'Coupe : 45 minutes. Couleur : entre 1 h 30 et 3 h selon la prestation. On vous le dit à la prise de rendez-vous.' },
        { q: 'Et les enfants ?', a: 'À partir de 6 ans, avec un adulte dans le salon. Forfait père et fils le mercredi.' },
        { q: 'Quels moyens de paiement ?', a: 'Carte et espèces. Les bons cadeaux de la maison sont acceptés.' },
      ],
      stats: [
        { value: '45', suffix: ' min', label: 'pour une coupe, montre en main' },
        { value: '10', suffix: ' j', label: 'pour une retouche offerte' },
        { value: '2', suffix: '', label: 'fauteuils, pas davantage' },
        { value: '6', suffix: '', label: 'jours d’ouverture' },
      ],
      gallery: [
        { caption: 'Le salon', alt: 'Fauteuils du salon' },
        { caption: 'Couleur', alt: 'Pose couleur' },
        { caption: 'Détail', alt: 'Détail d’une coupe' },
        { caption: 'Barbe', alt: 'Taille de barbe' },
      ],
      steps: [
        { title: 'Choisir la prestation', text: 'Coupe, couleur ou barbe. Le temps est affiché.' },
        { title: 'Proposer deux créneaux', text: 'On confirme celui qui tient vraiment.' },
        { title: 'Venir les cheveux propres', text: 'Sauf si une couleur est prévue : on vous le dira.' },
      ],
      plans: [
        { name: 'Coupe', price: '38 €', period: '', description: 'Homme, entretien.', features: 'Diagnostic\nCoupe\nConseil produit', highlight: 'false' },
        { name: 'Couleur', price: '74 €', period: '', description: 'Racines, le plus demandé.', features: 'Diagnostic\nApplication\nSoin', highlight: 'true' },
        { name: 'Rituel', price: '96 €', period: '', description: 'Coupe femme et soin profond.', features: 'Coupe\nSoin\nBrushing', highlight: 'false' },
      ],
      team: [
        { name: 'Chloé Renard', role: 'Coupe & couleur', bio: 'Dix ans de salon, obsession des lignes qui tombent juste.' },
        { name: 'Adam Costa', role: 'Barbe & homme', bio: 'Contours nets, conversations facultatives.' },
      ],
      posts: [
        { title: 'Pourquoi la frange se relève au bout de quatre jours', date: '4 mars 2026', excerpt: 'Ce n’est pas la coupe. C’est le séchage, presque toujours.', content: 'Une frange coupée sur cheveux mouillés remonte en séchant. On vous montre le geste : sécher vers l’avant, pas vers le ciel.\n\nSi malgré ça elle gêne, la retouche des dix jours est faite pour ça.' },
      ],
      products: [
        { name: 'Huile barbe', price: '18 €', description: 'Le flacon qu’on utilise au salon, 30 ml.', badge: 'Soin' },
        { name: 'Shampoing doux', price: '22 €', description: 'Pour espacer les lavages après une couleur.', badge: '' },
        { name: 'Bon cadeau', price: '50 €', description: 'Valable un an, toutes prestations.', badge: 'Cadeau' },
      ],
      timeline: [
        { year: '2018', title: 'Le premier fauteuil', text: `Ouverture de ${name} à ${city}.` },
        { year: '2021', title: 'La couleur', text: 'Deuxième poste, rendez-vous plus longs, moins de monde en même temps.' },
        { year: '2025', title: 'Sans attente', text: 'Fin du sans rendez-vous. Le salon respire.' },
      ],
      logos: ['Fournisseur local', 'Atelier céramique', 'Torréfacteur d’en face'],
      hours: hours([
        { closed: true, slots: [] },
        { slots: [slot('09:30', '19:00')] },
        { slots: [slot('09:30', '19:00')] },
        { slots: [slot('09:30', '19:00')] },
        { slots: [slot('09:30', '19:00')] },
        { slots: [slot('09:00', '17:00')] },
        { closed: true, slots: [] },
      ]),
      ctaTitle: 'Un créneau cette semaine ?',
      ctaText: 'Dites la prestation et deux moments qui vous arrangent. On confirme par message.',
      loyaltyReward: 'La 6e coupe entretien est à −50 %.',
      links: [
        { label: 'Prendre rendez-vous', url: 'contact', note: 'Demande de créneau' },
        { label: 'Voir les tarifs', url: 'index', note: 'Coupe, couleur, barbe' },
        { label: 'Instagram', url: 'https://instagram.com', note: 'Coupes récentes' },
      ],
    },
    artisan: {
      schemaType: 'HomeAndConstructionBusiness',
      category: 'Artisan',
      priceRange: '€€',
      tagline: `Dépannage et travaux soignés à ${city} et alentours.`,
      heroKicker: `Artisan · ${city}`,
      heroTitle: name,
      heroSubtitle: `Une intervention claire : ce qui est cassé, ce que ça coûte, quand on passe. Basés à ${city}, on se déplace dans l’agglomération.`,
      heroPrimary: 'Demander un devis',
      heroSecondary: 'Voir les interventions',
      aboutTitle: 'On dit le prix avant de sortir la caisse.',
      aboutBody: `${name} intervient pour le dépannage et les petits travaux. Le devis est écrit, même court. Si un imprévu apparaît derrière une cloison, on s’arrête et on vous appelle.\n\nPas de sous-traitance opaque : la personne qui vient est celle qui a vu le chantier, ou son associé.`,
      servicesTitle: 'Interventions',
      servicesIntro: 'Les demandes qu’on traite le plus souvent.',
      services: [
        { title: 'Dépannage', text: 'Fuite, panne, mise en sécurité. Passage rapide.', price: 'déplacement 45 €' },
        { title: 'Installation', text: 'Équipement neuf, pose propre, essais devant vous.', price: 'sur devis' },
        { title: 'Rénovation', text: 'Pièce d’eau ou tableau, chantier suivi.', price: 'sur devis' },
        { title: 'Entretien', text: 'Visite annuelle pour les clients sous contrat.', price: 'dès 120 €' },
      ],
      features: [
        { title: 'Devis écrit', text: 'Même pour une demi-journée. Vous signez, ensuite on commande.' },
        { title: 'Créneau tenu', text: 'On arrive dans la plage annoncée. Si la route coince, on prévient.' },
        { title: 'Chantier laissé propre', text: 'Les gravats partent avec nous, pas dans votre bac.' },
      ],
      menu: [
        { name: 'Déplacement', description: 'Dans l’agglomération, déduit si le devis est accepté.', price: '45 €', category: 'Dépannage', tag: '' },
        { name: 'Recherche de fuite simple', description: 'Sans ouverture de cloison.', price: 'dès 90 €', category: 'Dépannage', tag: '' },
        { name: 'Remplacement robinetterie', description: 'Fourniture en sus, ou la vôtre.', price: 'dès 80 €', category: 'Installation', tag: '' },
        { name: 'Tableau électrique', description: 'Mise en sécurité, selon le nombre de rangées.', price: 'sur devis', category: 'Installation', tag: '' },
      ],
      testimonials: [
        { quote: 'Fuite un dimanche matin, rappel dans l’heure, joint changé avant le déjeuner.', author: 'Hélène P.', role: 'Appartement centre-ville' },
        { quote: 'Le devis tenait sur une page. La facture était la même page.', author: 'Karim S.', role: 'Maison de ville' },
        { quote: 'Salle de bain refaite en huit jours, comme écrit. On a dormi sur place sans poussière dans le lit.', author: 'Famille Morel', role: 'Rénovation' },
      ],
      faqs: [
        { q: 'Intervenez-vous le week-end ?', a: 'Le dépannage urgent, oui, avec un supplément annoncé au téléphone avant de prendre la route.' },
        { q: 'Faut-il être présent ?', a: 'Pour un devis et pour la réception, oui. En cours de chantier, on s’organise.' },
        { q: 'Travaillez-vous avec mon assurance ?', a: 'On transmet photos et facture. On ne fait pas l’expert, on fait la réparation.' },
        { q: 'Quel secteur ?', a: `${city} et environ 25 km. Au-delà, le déplacement est chiffré à part.` },
      ],
      stats: [
        { value: '24', suffix: ' h', label: 'pour rappeler un devis simple' },
        { value: '25', suffix: ' km', label: 'autour de la ville' },
        { value: '15', suffix: '', label: 'ans d’atelier' },
        { value: '0', suffix: '', label: 'sous-traitant surprise' },
      ],
      gallery: [
        { caption: 'Avant / après', alt: 'Chantier terminé' },
        { caption: 'Détail', alt: 'Détail de pose' },
        { caption: 'Atelier', alt: 'Établi' },
        { caption: 'Tableau', alt: 'Tableau électrique rangé' },
      ],
      steps: [
        { title: 'Décrire le problème', text: 'Photos bienvenues. On dit si ça peut attendre.' },
        { title: 'Devis', text: 'Écrit, daté, valable trente jours.' },
        { title: 'Intervention', text: 'Le créneau est confirmé la veille.' },
      ],
      plans: [
        { name: 'Dépannage', price: '45 €', period: 'déplacement', description: 'Puis main-d’œuvre au réel.', features: 'Diagnostic\nRéparation si simple\nCompte-rendu', highlight: 'false' },
        { name: 'Installation', price: 'sur devis', period: '', description: 'Fourniture et pose.', features: 'Visite\nDevis ferme\nPose', highlight: 'true' },
        { name: 'Entretien', price: '120 €', period: '/ an', description: 'Une visite, les petits réglages.', features: 'Contrôle\nRéglages\nPriorité dépannage', highlight: 'false' },
      ],
      team: [
        { name: 'Marc Duval', role: 'Artisan', bio: 'Sur la route le matin, au devis l’après-midi.' },
        { name: 'Lina Bernard', role: 'Planning', bio: 'Elle cale les créneaux et rappelle quand la pièce arrive.' },
      ],
      posts: [
        { title: 'Trois signes qu’un joint va lâcher', date: '18 janvier 2026', excerpt: 'Une trace, une odeur, une tache au plafond du voisin.', content: 'Si le meuble sous l’évier gondole, n’attendez pas le week-end. Coupez l’arrivée, photographiez, envoyez-nous ça.\n\nUn joint se change en une heure. Un plafond, non.' },
      ],
      products: [
        { name: 'Contrat entretien', price: '120 €', description: 'Visite annuelle, priorité sur le dépannage.', badge: 'Contrat' },
        { name: 'Diagnostic humidité', price: '90 €', description: 'Relevé et préconisations écrites.', badge: '' },
      ],
      timeline: [
        { year: '2011', title: 'Installation', text: `Début d’activité à ${city}.` },
        { year: '2017', title: 'Second véhicule', text: 'Les dépannages du matin ne bloquent plus les chantiers.' },
        { year: '2023', title: 'Devis le jour même', text: 'Pour tout ce qui se voit en photos.' },
      ],
      logos: ['Chambre des métiers', 'Négociant local', 'Syndic du quartier'],
      hours: hours([
        { slots: [slot('08:00', '18:00')] },
        { slots: [slot('08:00', '18:00')] },
        { slots: [slot('08:00', '18:00')] },
        { slots: [slot('08:00', '18:00')] },
        { slots: [slot('08:00', '18:00')] },
        { slots: [slot('09:00', '12:00')] },
        { closed: true, slots: [] },
      ]),
      ctaTitle: 'Un devis cette semaine',
      ctaText: 'Décrivez le besoin et le quartier. On vous dit sous 24 h si on peut passer.',
      loyaltyReward: 'Les clients sous contrat passent devant sur le dépannage.',
      links: [
        { label: 'Demander un devis', url: 'contact', note: 'Réponse sous 24 h' },
        { label: 'Voir les interventions', url: 'index', note: 'Dépannage, pose, entretien' },
        { label: 'Appeler', url: 'tel:', note: 'Urgences' },
      ],
    },
    coach: {
      schemaType: 'SportsActivityLocation',
      category: 'Coach sportif',
      priceRange: '€€',
      tagline: `Entraînement personnalisé à ${city}, en studio ou dehors.`,
      heroKicker: `Coaching · ${city}`,
      heroTitle: name,
      heroSubtitle: `Des séances courtes, un programme qui tient dans une vraie semaine, et un suivi sans discours miracle. À ${city}.`,
      heroPrimary: 'Réserver un bilan',
      heroSecondary: 'Voir les formules',
      aboutTitle: 'Le programme doit survivre à un mardi chargé.',
      aboutBody: `${name} entraîne des gens qui travaillent, pas des athlètes en stage. Le premier rendez-vous sert à comprendre le dos, le genou, l’agenda.\n\nEnsuite : deux séances, des mouvements que vous saurez refaire seul, et un message quand la semaine dérape.`,
      servicesTitle: 'Formules',
      servicesIntro: 'On commence par un bilan. La suite se choisit après, pas avant.',
      services: [
        { title: 'Bilan', text: '45 minutes, historique, objectifs, premiers mouvements.', price: '40 €' },
        { title: 'Séance solo', text: 'En studio ou en extérieur, selon la météo.', price: '55 €' },
        { title: 'Petit groupe', text: 'Quatre personnes maximum.', price: '28 €' },
        { title: 'Cycle 8 semaines', text: 'Programme écrit, deux points par semaine.', price: '420 €' },
      ],
      features: [
        { title: 'Groupes de quatre', text: 'Assez de monde pour se motiver, assez peu pour corriger.' },
        { title: 'Dehors quand c’est bon', text: 'Les parcs de la ville font partie de la salle.' },
        { title: 'Programme écrit', text: 'Vous repartez avec les séances, pas seulement une sensation.' },
      ],
      menu: [
        { name: 'Bilan', description: 'Le premier rendez-vous, sans engagement.', price: '40 €', category: 'Démarrer', tag: '' },
        { name: 'Séance individuelle', description: '50 minutes.', price: '55 €', category: 'Séances', tag: '' },
        { name: 'Cours collectif', description: '4 personnes, créneaux fixes.', price: '28 €', category: 'Séances', tag: '' },
        { name: 'Cycle 8 semaines', description: '16 séances + suivi écrit.', price: '420 €', category: 'Cycles', tag: '' },
      ],
      testimonials: [
        { quote: 'J’ai repris sans me blesser le genou, ce qui n’était pas gagné.', author: 'Thomas G.', role: 'Cycle de 8 semaines' },
        { quote: 'Les créneaux de 7 h tiennent. Je suis au bureau à 8 h 30.', author: 'Nadia F.', role: 'Collectif du matin' },
        { quote: 'Pas de promesse de −10 kg. Un dos qui va mieux, ça me suffit.', author: 'Éric V.', role: 'Séances solo' },
      ],
      faqs: [
        { q: 'Faut-il être sportif ?', a: 'Non. Le bilan est fait pour les gens qui reprennent, y compris après un arrêt long.' },
        { q: 'Où ont lieu les séances ?', a: `Au studio et dans les parcs de ${city}. En cas de pluie, on bascule en salle.` },
        { q: 'Les séances se reportent-elles ?', a: 'Jusqu’à 12 h la veille, oui. Après, la séance est due.' },
        { q: 'Faites-vous du sport sur ordonnance ?', a: 'On peut travailler avec les consignes de votre kiné. On ne remplace pas le kiné.' },
      ],
      stats: [
        { value: '4', suffix: '', label: 'personnes maximum par cours' },
        { value: '50', suffix: ' min', label: 'la durée d’une séance' },
        { value: '8', suffix: '', label: 'semaines pour un cycle' },
        { value: '7', suffix: ' h', label: 'le premier créneau du matin' },
      ],
      gallery: [
        { caption: 'Studio', alt: 'Studio d’entraînement' },
        { caption: 'Dehors', alt: 'Séance en extérieur' },
        { caption: 'Détail', alt: 'Matériel léger' },
        { caption: 'Collectif', alt: 'Petit groupe' },
      ],
      steps: [
        { title: 'Bilan', text: 'On regarde ce qui coince et ce que vous pouvez tenir.' },
        { title: 'Deux semaines d’essai', text: 'Assez pour sentir, pas assez pour s’enfermer.' },
        { title: 'Le cycle', text: 'Si ça vous va, on écrit les huit semaines.' },
      ],
      plans: [
        { name: 'Bilan', price: '40 €', period: '', description: 'Sans engagement.', features: 'Historique\nMouvements\nPiste de travail', highlight: 'false' },
        { name: 'Cycle', price: '420 €', period: '', description: 'Huit semaines.', features: '16 séances\nProgramme écrit\nSuivi', highlight: 'true' },
        { name: 'Collectif', price: '28 €', period: '/ séance', description: 'Carte de 10 : 250 €.', features: 'Groupe de 4\nCréneau fixe\nReport la veille', highlight: 'false' },
      ],
      team: [
        { name: 'Julie Cohen', role: 'Coach', bio: 'Préparatrice, allergique aux challenges de trente jours.' },
        { name: 'Samir El Khattabi', role: 'Coach', bio: 'Renforcement et reprise après arrêt.' },
      ],
      posts: [
        { title: 'Reprendre sans se punir', date: '9 février 2026', excerpt: 'Deux séances valent mieux qu’un programme que vous lâchez le jeudi.', content: 'Si votre semaine a déjà trois soirées prises, on n’en ajoute pas quatre. On en cale deux, courtes, et on les protège.\n\nLe reste est du bonus, pas une dette.' },
      ],
      products: [
        { name: 'Carte 10 collectifs', price: '250 €', description: 'Valable quatre mois.', badge: 'Carte' },
        { name: 'Cycle 8 semaines', price: '420 €', description: 'Séances et programme écrit.', badge: 'Cycle' },
      ],
      timeline: [
        { year: '2019', title: 'Premières séances parc', text: `Démarrage en extérieur à ${city}.` },
        { year: '2022', title: 'Le studio', text: 'Une salle petite, pour les jours de pluie et les bilans.' },
        { year: '2025', title: 'Créneaux de 7 h', text: 'Avant le bureau, groupe complet en trois semaines.' },
      ],
      logos: ['Salle partenaire', 'Kiné du quartier', 'Club d’athlétisme'],
      hours: hours([
        { slots: [slot('07:00', '20:00')] },
        { slots: [slot('07:00', '20:00')] },
        { slots: [slot('07:00', '20:00')] },
        { slots: [slot('07:00', '20:00')] },
        { slots: [slot('07:00', '20:00')] },
        { slots: [slot('09:00', '13:00')] },
        { closed: true, slots: [] },
      ]),
      ctaTitle: 'Commencer par un bilan',
      ctaText: '40 €, 45 minutes, aucune formule à signer sur place.',
      loyaltyReward: 'Au 10e cours collectif, le onzième est offert.',
      links: [
        { label: 'Réserver un bilan', url: 'contact', note: '45 minutes' },
        { label: 'Les formules', url: 'index', note: 'Séance, cycle, collectif' },
        { label: 'Écrire', url: 'mailto:', note: 'Question avant de venir' },
      ],
    },
    boutique: {
      schemaType: 'Store',
      category: 'Boutique',
      priceRange: '€€',
      tagline: `Une sélection courte, choisie à ${city}.`,
      heroKicker: `Boutique · ${city}`,
      heroTitle: name,
      heroSubtitle: `Peu de pièces, bien présentées, et quelqu’un dans la boutique qui sait pourquoi elles sont là. À ${city}.`,
      heroPrimary: 'Voir la sélection',
      heroSecondary: 'Nous rendre visite',
      aboutTitle: 'On refuse plus qu’on ne commande.',
      aboutBody: `${name} tient une sélection volontairement courte. Les marques restent plusieurs saisons : le temps de les connaître, de les réparer, de les conseiller sans fiche plastifiée.\n\nLe click and collect est simple : vous écrivez, on met de côté, vous passez.`,
      servicesTitle: 'En boutique',
      servicesIntro: 'Ce qu’on fait en plus de vendre.',
      services: [
        { title: 'Conseil', text: 'Trente minutes pour composer, sur rendez-vous le samedi.', price: 'offert' },
        { title: 'Mise de côté', text: '48 heures, le temps de passer après le travail.', price: '' },
        { title: 'Retouche simple', text: 'Ourlet et bouton, via l’atelier d’à côté.', price: 'dès 12 €' },
        { title: 'Carte cadeau', text: 'Valable un an, en boutique.', price: 'dès 30 €' },
      ],
      features: [
        { title: 'Sélection courte', text: 'Vous voyez tout en dix minutes. Rien n’est là pour remplir un rayon.' },
        { title: 'Mise de côté 48 h', text: 'Un message suffit. On ne revend pas dans la foulée.' },
        { title: 'Atelier de retouche', text: 'L’ourlet part le mardi, revient le vendredi.' },
      ],
      menu: [
        { name: 'Conseil rendez-vous', description: 'Samedi, trente minutes.', price: 'offert', category: 'Services', tag: '' },
        { name: 'Ourlet', description: 'Par l’atelier partenaire.', price: 'dès 12 €', category: 'Services', tag: '' },
        { name: 'Carte cadeau', description: 'De 30 à 150 €.', price: 'dès 30 €', category: 'Cadeaux', tag: '' },
      ],
      testimonials: [
        { quote: 'On m’a déconseillé une pièce. Je suis repartie avec celle qui allait, pas avec la plus chère.', author: 'Claire D.', role: 'Cliente' },
        { quote: 'Mise de côté le mardi, essayage le jeudi, ourlet le vendredi. Fluide.', author: 'Yanis A.', role: 'Click and collect' },
        { quote: 'La boutique sent bon et personne ne vous suit entre les portants.', author: 'Maëlle C.', role: 'Passage' },
      ],
      faqs: [
        { q: 'Puis-je réserver un article vu en ligne ?', a: 'Oui, par message. On le tient 48 heures.' },
        { q: 'Faites-vous les échanges ?', a: 'Sous 14 jours, non porté, avec le ticket. Les cartes cadeaux ne sont pas reprises.' },
        { q: 'Les retouches sont-elles sur place ?', a: 'Non, elles partent à l’atelier voisin. Comptez trois jours.' },
        { q: 'Livrez-vous ?', a: 'Dans la ville, parfois, pour un panier déjà payé. On le dit au cas par cas. Pas de site de paiement intégré ici.' },
      ],
      stats: [
        { value: '48', suffix: ' h', label: 'de mise de côté' },
        { value: '14', suffix: ' j', label: 'pour échanger' },
        { value: '30', suffix: '', label: 'pièces en rayon, grand maximum' },
        { value: '1', suffix: '', label: 'atelier de retouche partenaire' },
      ],
      gallery: [
        { caption: 'Vitrine', alt: 'Vitrine de la boutique' },
        { caption: 'Rayon', alt: 'Sélection en rayon' },
        { caption: 'Détail', alt: 'Détail matière' },
        { caption: 'Cabine', alt: 'Cabine d’essayage' },
      ],
      steps: [
        { title: 'Écrire', text: 'La pièce, la taille, le moment où vous passez.' },
        { title: 'On confirme le stock', text: 'S’il reste, c’est mis de côté.' },
        { title: 'Vous essayez', text: 'Sans file, ou presque.' },
      ],
      plans: [
        { name: 'Carte 30 €', price: '30 €', period: '', description: 'Pour un petit cadeau.', features: 'Valable 1 an\nEn boutique\nNon remboursable', highlight: 'false' },
        { name: 'Carte 80 €', price: '80 €', period: '', description: 'Le montant le plus choisi.', features: 'Valable 1 an\nConseil offert\nÉcrin', highlight: 'true' },
        { name: 'Carte 150 €', price: '150 €', period: '', description: 'De quoi composer.', features: 'Valable 1 an\nConseil sur rendez-vous', highlight: 'false' },
      ],
      team: [
        { name: 'Eva Lambert', role: 'Boutique', bio: 'Elle choisit les pièces et dit non aux collections fourre-tout.' },
        { name: 'Paul Nguyen', role: 'Accueil', bio: 'Les mises de côté, les ourlets, le samedi.' },
      ],
      posts: [
        { title: 'Ce qui reste après les soldes', date: '20 février 2026', excerpt: 'Trois pièces qu’on a décidé de ne pas solder, et pourquoi.', content: 'On ne solde pas une pièce qu’on recommanderait encore en avril. Le reste part à −30 %, une fois, sans deuxième démarque mystère.\n\nLa liste est en boutique et dans le catalogue du site.' },
      ],
      products: [
        { name: 'Chemise lin', price: '98 €', description: 'Coupe droite, lavée, deux coloris.', badge: 'Sélection' },
        { name: 'Sac jour', price: '140 €', description: 'Cuir tanné végétal, bandoulière.', badge: '' },
        { name: 'Bougie atelier', price: '28 €', description: 'La même que sur le comptoir.', badge: 'Maison' },
        { name: 'Carte cadeau', price: '80 €', description: 'Le montant le plus offert.', badge: 'Cadeau' },
      ],
      timeline: [
        { year: '2016', title: 'Ouverture', text: `Une pièce, une vitrine, ${city}.` },
        { year: '2020', title: 'La mise de côté', text: 'Le message remplace la file devant la porte.' },
        { year: '2024', title: 'L’atelier', text: 'Ourlets et boutons, à trois rues.' },
      ],
      logos: ['Atelier de retouche', 'Céramique locale', 'Imprimeur'],
      hours: hours([
        { closed: true, slots: [] },
        { slots: [slot('10:30', '19:00')] },
        { slots: [slot('10:30', '19:00')] },
        { slots: [slot('10:30', '19:00')] },
        { slots: [slot('10:30', '19:00')] },
        { slots: [slot('10:30', '19:00')] },
        { closed: true, slots: [] },
      ]),
      ctaTitle: 'Passer cette semaine',
      ctaText: 'Écrivez si vous voulez qu’on mette une pièce de côté avant votre passage.',
      loyaltyReward: 'Au 5e achat, −15 % sur l’accessoire de votre choix.',
      links: [
        { label: 'Voir la sélection', url: 'index', note: 'Pièces du moment' },
        { label: 'Écrire à la boutique', url: 'contact', note: 'Mise de côté' },
        { label: 'L’adresse', url: 'contact', note: 'Horaires et plan' },
      ],
    },
    liberal: {
      schemaType: 'ProfessionalService',
      category: 'Profession libérale',
      priceRange: '€€',
      tagline: `Consultations sur rendez-vous à ${city}.`,
      heroKicker: `Cabinet · ${city}`,
      heroTitle: name,
      heroSubtitle: `Un premier échange clair, des honoraires annoncés, et un suivi qui ne se perd pas entre deux portes. Cabinet à ${city}.`,
      heroPrimary: 'Demander un rendez-vous',
      heroSecondary: 'Les honoraires',
      aboutTitle: 'Le premier rendez-vous sert à voir si on travaille ensemble.',
      aboutBody: `${name} reçoit sur rendez-vous. Le premier échange dure assez longtemps pour comprendre la situation, pas pour la régler en quarante minutes chrono.\n\nLes honoraires sont écrits avant la consultation. Si le sujet n’est pas de notre ressort, on le dit et on oriente.`,
      servicesTitle: 'Consultations',
      servicesIntro: 'Les formats proposés au cabinet.',
      services: [
        { title: 'Premier échange', text: 'Comprendre la demande et dire si on peut aider.', price: '70 €' },
        { title: 'Consultation', text: 'Le rendez-vous de travail, compte-rendu court.', price: '110 €' },
        { title: 'Suivi', text: 'Pour les accompagnements déjà engagés.', price: '90 €' },
      ],
      features: [
        { title: 'Honoraires écrits', text: 'Avant de venir, pas à la sortie.' },
        { title: 'Compte-rendu', text: 'Quelques lignes après le rendez-vous, pour vous, pas pour un dossier fantôme.' },
        { title: 'Orientation', text: 'Si ce n’est pas notre métier, on vous le dit.' },
      ],
      menu: [
        { name: 'Premier échange', description: '45 minutes.', price: '70 €', category: 'Cabinet', tag: '' },
        { name: 'Consultation', description: 'Une heure, avec compte-rendu.', price: '110 €', category: 'Cabinet', tag: '' },
        { name: 'Suivi', description: '45 minutes.', price: '90 €', category: 'Cabinet', tag: '' },
      ],
      testimonials: [
        { quote: 'On m’a dit dès le premier appel que ce n’était pas le bon cabinet. J’ai perdu dix minutes, pas trois mois.', author: 'Sophie A.', role: 'Premier échange' },
        { quote: 'Les honoraires étaient dans le message de confirmation. Pas de mauvaise surprise.', author: 'Laurent B.', role: 'Consultation' },
        { quote: 'Le compte-rendu tenait sur une page. Je m’en suis servi.', author: 'Nora H.', role: 'Suivi' },
      ],
      faqs: [
        { q: 'Comment se passe la prise de rendez-vous ?', a: 'Par le formulaire ou par téléphone. On confirme le créneau et les honoraires dans le même message.' },
        { q: 'Consultez-vous à distance ?', a: 'Oui, en visio, pour le suivi. Le premier rendez-vous se fait de préférence au cabinet.' },
        { q: 'Les consultations sont-elles remboursées ?', a: 'Cela dépend de votre situation et de votre contrat. On vous remet une note d’honoraires, on ne promet pas un remboursement.' },
        { q: 'Que préparer ?', a: 'Les pièces utiles, et une phrase sur ce que vous attendez de ce rendez-vous.' },
      ],
      stats: [
        { value: '45', suffix: ' min', label: 'le premier échange' },
        { value: '24', suffix: ' h', label: 'pour confirmer un créneau' },
        { value: '1', suffix: '', label: 'page de compte-rendu' },
        { value: '0', suffix: '', label: 'engagement imposé au premier appel' },
      ],
      gallery: [
        { caption: 'Cabinet', alt: 'Salle de consultation' },
        { caption: 'Attente', alt: 'Entrée du cabinet' },
        { caption: 'Lumière', alt: 'Détail du bureau' },
      ],
      steps: [
        { title: 'Écrire le motif', text: 'Quelques lignes suffisent. Pas de dossier complet.' },
        { title: 'Confirmation', text: 'Créneau, honoraires, ce qu’il faut apporter.' },
        { title: 'Rendez-vous', text: 'Au cabinet ou en visio pour le suivi.' },
      ],
      plans: [
        { name: 'Premier échange', price: '70 €', period: '', description: '45 minutes.', features: 'Écoute du motif\nOrientation\nSuite éventuelle', highlight: 'false' },
        { name: 'Consultation', price: '110 €', period: '', description: 'Une heure.', features: 'Travail de fond\nCompte-rendu\nPistes', highlight: 'true' },
        { name: 'Suivi', price: '90 €', period: '', description: '45 minutes.', features: 'Point d’étape\nAjustements\nNote courte', highlight: 'false' },
      ],
      team: [
        { name: 'Claire Lemoine', role: 'Praticienne', bio: 'Reçoit au cabinet quatre jours par semaine.' },
        { name: 'Accueil', role: 'Secrétariat', bio: 'Les créneaux, les notes d’honoraires, les reports.' },
      ],
      posts: [
        { title: 'Ce qu’on peut traiter en un premier rendez-vous', date: '5 janvier 2026', excerpt: 'Pas tout. Assez pour savoir si on continue.', content: 'Le premier échange ne règle pas une situation de plusieurs années. Il sert à poser le cadre, les honoraires, et la prochaine étape — y compris si la prochaine étape est ailleurs.\n\nVenez avec l’essentiel, pas avec une chemise de trois cents pages.' },
      ],
      products: [],
      timeline: [
        { year: '2015', title: 'Installation', text: `Ouverture du cabinet à ${city}.` },
        { year: '2020', title: 'Visio de suivi', text: 'Le premier rendez-vous reste au cabinet.' },
        { year: '2024', title: 'Honoraires en ligne', text: 'Affichés avant même l’appel.' },
      ],
      logos: ['Ordre professionnel', 'Réseau de confrères', 'Maison de santé'],
      hours: hours([
        { slots: [slot('09:00', '18:00')] },
        { slots: [slot('09:00', '18:00')] },
        { slots: [slot('09:00', '18:00')] },
        { slots: [slot('09:00', '18:00')] },
        { slots: [slot('09:00', '17:00')] },
        { closed: true, slots: [] },
        { closed: true, slots: [] },
      ]),
      ctaTitle: 'Demander un premier échange',
      ctaText: 'Décrivez le motif en quelques lignes. On répond avec un créneau et les honoraires.',
      loyaltyReward: 'Le suivi engagé conserve le tarif annoncé au départ.',
      links: [
        { label: 'Demander un rendez-vous', url: 'contact', note: 'Créneau et honoraires' },
        { label: 'Le cabinet', url: 'index', note: 'Adresse et horaires' },
        { label: 'Écrire', url: 'mailto:', note: 'Question simple' },
      ],
    },
    generic: {
      schemaType: 'LocalBusiness',
      category: 'Commerce',
      priceRange: '€€',
      tagline: `Une adresse utile à ${city}.`,
      heroKicker: `${city}`,
      heroTitle: name,
      heroSubtitle: `Ce que nous faisons, pour qui, et comment nous joindre. Une page claire pour les gens de ${city} qui nous cherchent.`,
      heroPrimary: 'Nos prestations',
      heroSecondary: 'Nous contacter',
      aboutTitle: 'Dites simplement ce que vous faites.',
      aboutBody: `${name} reçoit sa clientèle à ${city}. Remplacez ce texte par votre histoire en quelques phrases : depuis quand, pour qui, ce qui vous distingue du confrère d’à côté.\n\nGardez les phrases courtes. La personne qui lit est souvent sur son téléphone, entre deux portes.`,
      servicesTitle: 'Prestations',
      servicesIntro: 'Trois offres suffisent pour commencer. Vous en ajouterez dans l’éditeur.',
      services: [
        { title: 'Prestation essentielle', text: 'Décrivez le service le plus demandé, en deux lignes.', price: 'à préciser' },
        { title: 'Prestation signature', text: 'Celle pour laquelle on vous recommande.', price: 'à préciser' },
        { title: 'Accompagnement', text: 'Un format plus long, ou un forfait.', price: 'sur devis' },
      ],
      features: [
        { title: 'Réponse rapide', text: 'Indiquez sous quel délai vous rappelez vraiment.' },
        { title: 'Sur place', text: `Une adresse à ${city}, pas une boîte postale.` },
        { title: 'Tarifs lisibles', text: 'Même une fourchette vaut mieux qu’un silence.' },
      ],
      menu: [
        { name: 'Essentiel', description: 'La prestation la plus demandée.', price: 'à préciser', category: 'Offres', tag: '' },
        { name: 'Signature', description: 'Celle qu’on recommande.', price: 'à préciser', category: 'Offres', tag: '' },
        { name: 'Accompagnement', description: 'Format long ou forfait.', price: 'sur devis', category: 'Offres', tag: '' },
      ],
      testimonials: [
        { quote: 'Remplacez ces avis par de vraies phrases de clients, avec leur accord.', author: 'Cliente locale', role: city },
        { quote: 'Un avis court, concret, daté dans votre tête, vaut mieux qu’un paragraphe vague.', author: 'Client habitué', role: city },
      ],
      faqs: [
        { q: 'Comment vous joindre ?', a: 'Par téléphone aux heures affichées, ou par le formulaire. Le message ouvre votre e-mail.' },
        { q: 'Où êtes-vous ?', a: `À ${city}. Complétez l’adresse dans les réglages pour que la carte se place.` },
        { q: 'Quels sont vos tarifs ?', a: 'Affichez au moins une fourchette. Le devis précis peut rester sur demande.' },
      ],
      stats: [
        { value: '1', suffix: '', label: 'adresse, facile à trouver' },
        { value: '24', suffix: ' h', label: 'pour répondre à un message' },
        { value: '7', suffix: '', label: 'jours pour ajuster un texte' },
      ],
      gallery: [
        { caption: 'Le lieu', alt: 'Le lieu' },
        { caption: 'Le travail', alt: 'Le travail' },
        { caption: 'L’équipe', alt: 'L’équipe' },
      ],
      steps: [
        { title: 'Écrire', text: 'Le besoin, le quartier, le délai.' },
        { title: 'Échanger', text: 'Un appel ou un passage.' },
        { title: 'Commencer', text: 'Avec un cadre et un prix.' },
      ],
      plans: [
        { name: 'Essentiel', price: '—', period: '', description: 'À personnaliser.', features: 'Prestation de base\nConseil\nSuivi court', highlight: 'false' },
        { name: 'Signature', price: '—', period: '', description: 'L’offre principale.', features: 'Prestation complète\nCompte-rendu\nAjustements', highlight: 'true' },
        { name: 'Accompagnement', price: 'sur devis', period: '', description: 'Dans la durée.', features: 'Plusieurs étapes\nPoint régulier', highlight: 'false' },
      ],
      team: [
        { name: 'Alex Martin', role: 'Fondateur', bio: 'Remplacez par votre nom et une phrase vraie.' },
      ],
      posts: [
        { title: 'Bienvenue', date: '1 mars 2026', excerpt: 'Un premier texte pour montrer le ton du lieu.', content: `Ceci est un article d’exemple pour ${name}. Remplacez-le par une nouvelle utile : un changement d’horaire, une réalisation, une précision que vos clients demandent souvent au téléphone.` },
      ],
      products: [
        { name: 'Offre du moment', price: 'à préciser', description: 'Décrivez la pièce ou le forfait en une phrase.', badge: 'Nouveau' },
        { name: 'Carte cadeau', price: '30 €', description: 'Si vous en proposez.', badge: '' },
      ],
      timeline: [
        { year: '2020', title: 'Début', text: `Lancement de l’activité à ${city}.` },
        { year: '2024', title: 'Aujourd’hui', text: 'Ce que vous voulez mettre en avant maintenant.' },
      ],
      logos: ['Partenaire 1', 'Partenaire 2', 'Partenaire 3'],
      hours: hours([
        { slots: [slot('09:00', '18:30')] },
        { slots: [slot('09:00', '18:30')] },
        { slots: [slot('09:00', '18:30')] },
        { slots: [slot('09:00', '18:30')] },
        { slots: [slot('09:00', '18:30')] },
        { closed: true, slots: [] },
        { closed: true, slots: [] },
      ]),
      ctaTitle: 'Parlons de votre besoin',
      ctaText: 'Un message suffit. On répond avec une prochaine étape concrète.',
      loyaltyReward: 'Au 8e passage, une attention de la maison.',
      links: [
        { label: 'Nous écrire', url: 'contact', note: 'Formulaire' },
        { label: 'Nos prestations', url: 'index', note: 'L’essentiel' },
        { label: 'Téléphoner', url: 'tel:', note: 'Aux heures d’ouverture' },
      ],
    },
  }
  return packs[ctx.businessType]
}

export function legalBody(ctx: TemplateContext): string {
  const who = ctx.name
  return `${who}\n${ctx.address ? `${ctx.address}, ` : ''}${ctx.postalCode} ${ctx.city}\n\nDirecteur de la publication : à compléter.\nSIRET : à compléter.\nE-mail : ${ctx.email || 'à compléter'}.\nTéléphone : ${ctx.phone || 'à compléter'}.\n\nHébergement : le site est un ensemble de fichiers statiques. L’hébergeur est celui choisi lors de la mise en ligne (par exemple Netlify, Cloudflare Pages ou GitHub Pages). Son nom et son adresse seront indiqués ici au moment de la livraison.\n\nLes textes et les photographies sont la propriété de ${who}, sauf mention contraire. Toute reproduction demande un accord écrit.\n\nFormulaire : les messages sont envoyés via le logiciel de messagerie du visiteur, ou via le service de formulaire indiqué dans les réglages. Aucune base de données n’est tenue par l’outil de création du site.\n\nDernière mise à jour : à compléter à la livraison.`
}

export function servicesList(pack: CopyPack): ListItem[] {
  return pack.services.map((service) =>
    item({ title: service.title, text: service.text, price: service.price, image: '' }),
  )
}

export function featureList(pack: CopyPack): ListItem[] {
  return pack.features.map((feature) => item({ title: feature.title, text: feature.text }))
}

export function menuList(pack: CopyPack): ListItem[] {
  return pack.menu.map((dish) =>
    item({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category: dish.category,
      tag: dish.tag,
    }),
  )
}

export function testimonialList(pack: CopyPack): ListItem[] {
  return pack.testimonials.map((quote) =>
    item({ quote: quote.quote, author: quote.author, role: quote.role }),
  )
}

export function faqList(pack: CopyPack): ListItem[] {
  return pack.faqs.map((faq) => item({ q: faq.q, a: faq.a }))
}

export function statList(pack: CopyPack): ListItem[] {
  return pack.stats.map((stat) => item({ value: stat.value, suffix: stat.suffix, label: stat.label }))
}

export function galleryList(pack: CopyPack): ListItem[] {
  return pack.gallery.map((shot) => item({ src: '', alt: shot.alt, caption: shot.caption }))
}

export function stepList(pack: CopyPack): ListItem[] {
  return pack.steps.map((step) => item({ title: step.title, text: step.text }))
}

export function planList(pack: CopyPack): ListItem[] {
  return pack.plans.map((plan) =>
    item({
      name: plan.name,
      price: plan.price,
      period: plan.period,
      description: plan.description,
      features: plan.features,
      cta: 'Choisir',
      href: 'contact',
      highlight: plan.highlight,
    }),
  )
}

export function teamList(pack: CopyPack): ListItem[] {
  return pack.team.map((person) =>
    item({ name: person.name, role: person.role, bio: person.bio, image: '' }),
  )
}

export function postList(pack: CopyPack): ListItem[] {
  return pack.posts.map((post) =>
    item({
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      content: post.content,
      image: '',
    }),
  )
}

export function productList(pack: CopyPack): ListItem[] {
  return pack.products.map((product) =>
    item({
      name: product.name,
      price: product.price,
      description: product.description,
      image: '',
      badge: product.badge,
      link: '',
    }),
  )
}

export function timelineList(pack: CopyPack): ListItem[] {
  return pack.timeline.map((event) => item({ year: event.year, title: event.title, text: event.text }))
}

export function logoList(pack: CopyPack): ListItem[] {
  return pack.logos.map((name) => item({ name, image: '' }))
}

export function linkList(pack: CopyPack, phone: string, email: string): ListItem[] {
  return pack.links.map((link) =>
    item({
      label: link.label,
      url: link.url === 'tel:' ? `tel:${phone}` : link.url === 'mailto:' ? `mailto:${email}` : link.url,
      note: link.note,
    }),
  )
}
