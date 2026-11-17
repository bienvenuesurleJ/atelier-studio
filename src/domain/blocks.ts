import { data, item } from './blockData'
import {
  copyFor,
  faqList,
  featureList,
  galleryList,
  legalBody,
  linkList,
  logoList,
  menuList,
  planList,
  postList,
  productList,
  servicesList,
  statList,
  stepList,
  teamList,
  testimonialList,
  timelineList,
} from './content'
import type { Block, BlockType, FieldSchema, ListSchema, TemplateContext } from './types'

export interface BlockDefinition {
  type: BlockType
  name: string
  description: string
  category: string
  variants: { id: string; label: string }[]
  fields: FieldSchema[]
  lists: ListSchema[]
  create: (ctx: TemplateContext) => ReturnType<typeof data>
}

const text = (key: string, label: string, placeholder?: string): FieldSchema => ({
  key,
  label,
  control: 'text',
  placeholder,
})
const area = (key: string, label: string): FieldSchema => ({ key, label, control: 'textarea' })
const image = (key: string, label: string): FieldSchema => ({ key, label, control: 'image' })
const url = (key: string, label: string, hint?: string): FieldSchema => ({
  key,
  label,
  control: 'url',
  hint,
})

const v = (id: string, label: string) => ({ id, label })

export const BLOCKS: BlockDefinition[] = [
  {
    type: 'hero',
    name: 'Hero',
    description: 'Ouverture de page : titre, promesse, boutons, image.',
    category: 'Ouverture',
    variants: [v('split', 'Côte à côte'), v('center', 'Centré'), v('overlay', 'Image plein écran'), v('stack', 'Image puis texte')],
    fields: [
      text('kicker', 'Surtitre'),
      text('title', 'Titre'),
      area('subtitle', 'Texte'),
      text('primaryLabel', 'Bouton principal'),
      url('primaryHref', 'Lien principal', 'Slug de page (carte) ou URL.'),
      text('secondaryLabel', 'Bouton secondaire'),
      url('secondaryHref', 'Lien secondaire'),
      image('image', 'Image'),
      text('imageAlt', 'Texte alternatif'),
    ],
    lists: [],
    create: (ctx) => {
      const pack = copyFor(ctx)
      const primary = ctx.kind === 'restaurant' ? 'carte' : ctx.kind === 'booking' || ctx.kind === 'pwa-booking' ? 'contact' : 'index'
      const secondary = ctx.kind === 'restaurant' ? 'reserver' : 'contact'
      return data({
        kicker: pack.heroKicker,
        title: pack.heroTitle,
        subtitle: pack.heroSubtitle,
        primaryLabel: pack.heroPrimary,
        primaryHref: primary,
        secondaryLabel: pack.heroSecondary,
        secondaryHref: secondary,
        image: '',
        imageAlt: pack.heroTitle,
      })
    },
  },
  {
    type: 'features',
    name: 'Atouts',
    description: 'Trois ou quatre raisons de choisir la maison.',
    category: 'Preuve',
    variants: [v('grid', 'Grille'), v('list', 'Liste'), v('duo', 'Deux colonnes')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('intro', 'Introduction')],
    lists: [{ key: 'items', label: 'Atouts', itemLabel: 'Atout', fields: [text('title', 'Titre'), area('text', 'Texte')] }],
    create: (ctx) => {
      const pack = copyFor(ctx)
      return data(
        { kicker: 'Pourquoi ici', title: `Ce qui ne change pas chez ${ctx.name}`, intro: '' },
        { items: featureList(pack) },
      )
    },
  },
  {
    type: 'services',
    name: 'Prestations',
    description: 'Cartes de services avec prix.',
    category: 'Offre',
    variants: [v('cards', 'Cartes'), v('rows', 'Lignes'), v('duo', 'Deux colonnes')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('intro', 'Introduction')],
    lists: [{
      key: 'items',
      label: 'Prestations',
      itemLabel: 'Prestation',
      fields: [text('title', 'Titre'), area('text', 'Texte'), text('price', 'Prix'), image('image', 'Image')],
    }],
    create: (ctx) => {
      const pack = copyFor(ctx)
      return data(
        { kicker: 'Offre', title: pack.servicesTitle, intro: pack.servicesIntro },
        { items: servicesList(pack) },
      )
    },
  },
  {
    type: 'pricing',
    name: 'Tarifs',
    description: 'Formules comparées.',
    category: 'Offre',
    variants: [v('cards', 'Cartes'), v('stacked', 'Empilé'), v('compare', 'Comparatif')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('intro', 'Introduction')],
    lists: [{
      key: 'plans',
      label: 'Formules',
      itemLabel: 'Formule',
      fields: [
        text('name', 'Nom'),
        text('price', 'Prix'),
        text('period', 'Période'),
        area('description', 'Description'),
        area('features', 'Lignes (une par ligne)'),
        text('cta', 'Bouton'),
        url('href', 'Lien'),
        text('highlight', 'Mettre en avant (true/false)'),
      ],
    }],
    create: (ctx) => {
      const pack = copyFor(ctx)
      return data(
        { kicker: 'Tarifs', title: 'Des prix écrits, pas devinés', intro: 'Ajustez les montants. Une fourchette honnête vaut mieux qu’un blanc.' },
        { plans: planList(pack) },
      )
    },
  },
  {
    type: 'menu',
    name: 'Carte / menu',
    description: 'Plats ou prestations groupés par catégorie.',
    category: 'Offre',
    variants: [v('list', 'Liste'), v('cards', 'Cartes')],
    fields: [
      text('kicker', 'Surtitre'),
      text('title', 'Titre'),
      area('intro', 'Introduction'),
      text('orderable', 'Commande (true/false)'),
    ],
    lists: [{
      key: 'items',
      label: 'Éléments',
      itemLabel: 'Élément',
      fields: [
        text('category', 'Catégorie'),
        text('name', 'Nom'),
        area('description', 'Description'),
        text('price', 'Prix'),
        text('tag', 'Étiquette'),
      ],
    }],
    create: (ctx) => {
      const pack = copyFor(ctx)
      return data(
        {
          kicker: ctx.businessType === 'restaurant' ? 'La carte' : 'Le détail',
          title: ctx.businessType === 'restaurant' ? 'Ce qu’on sert en ce moment' : pack.servicesTitle,
          intro: 'Les prix sont ceux du jour. La carte bouge avec les arrivages.',
          orderable: ctx.kind === 'pwa-menu' ? 'true' : 'false',
        },
        { items: menuList(pack) },
      )
    },
  },
  {
    type: 'testimonials',
    name: 'Avis',
    description: 'Témoignages saisis par vous, pas récupérés automatiquement.',
    category: 'Preuve',
    variants: [v('cards', 'Cartes'), v('featured', 'Grande citation'), v('rangee', 'Rangée')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre')],
    lists: [{
      key: 'items',
      label: 'Avis',
      itemLabel: 'Avis',
      fields: [area('quote', 'Citation'), text('author', 'Auteur'), text('role', 'Précision')],
    }],
    create: (ctx) => data(
      { kicker: 'Avis', title: 'Ce qu’on nous dit' },
      { items: testimonialList(copyFor(ctx)) },
    ),
  },
  {
    type: 'team',
    name: 'Équipe',
    description: 'Les personnes qui reçoivent.',
    category: 'Preuve',
    variants: [v('grid', 'Grille'), v('list', 'Liste')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('intro', 'Introduction')],
    lists: [{
      key: 'people',
      label: 'Personnes',
      itemLabel: 'Personne',
      fields: [text('name', 'Nom'), text('role', 'Rôle'), area('bio', 'Bio'), image('image', 'Photo')],
    }],
    create: (ctx) => data(
      { kicker: 'Équipe', title: 'Qui vous reçoit', intro: '' },
      { people: teamList(copyFor(ctx)) },
    ),
  },
  {
    type: 'gallery',
    name: 'Galerie',
    description: 'Photos du lieu. Sans image, un cadre coloré tient la place.',
    category: 'Contenu',
    variants: [v('grid', 'Grille'), v('mosaic', 'Mosaïque'), v('bande', 'Bandeau')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre')],
    lists: [{
      key: 'shots',
      label: 'Photos',
      itemLabel: 'Photo',
      fields: [image('src', 'Image'), text('alt', 'Texte alternatif'), text('caption', 'Légende')],
    }],
    create: (ctx) => data(
      { kicker: 'Lieu', title: 'En images' },
      { shots: galleryList(copyFor(ctx)) },
    ),
  },
  {
    type: 'timeline',
    name: 'Frise',
    description: 'Quelques dates, pas une autobiographie.',
    category: 'Contenu',
    variants: [v('vertical', 'Verticale'), v('compact', 'Compacte')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre')],
    lists: [{
      key: 'events',
      label: 'Dates',
      itemLabel: 'Date',
      fields: [text('year', 'Année'), text('title', 'Titre'), area('text', 'Texte')],
    }],
    create: (ctx) => data(
      { kicker: 'Parcours', title: 'Quelques dates' },
      { events: timelineList(copyFor(ctx)) },
    ),
  },
  {
    type: 'stats',
    name: 'Chiffres',
    description: 'Compteurs animés si l’option est active.',
    category: 'Preuve',
    variants: [v('row', 'Ligne'), v('cards', 'Cartes')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre')],
    lists: [{
      key: 'stats',
      label: 'Chiffres',
      itemLabel: 'Chiffre',
      fields: [text('value', 'Valeur'), text('suffix', 'Suffixe'), text('label', 'Légende')],
    }],
    create: (ctx) => data(
      { kicker: 'En bref', title: '' },
      { stats: statList(copyFor(ctx)) },
    ),
  },
  {
    type: 'faq',
    name: 'FAQ',
    description: 'Questions fréquentes, en accordéon ou en grille.',
    category: 'Contenu',
    variants: [v('accordion', 'Accordéon'), v('grid', 'Grille ouverte')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre')],
    lists: [{ key: 'items', label: 'Questions', itemLabel: 'Question', fields: [text('q', 'Question'), area('a', 'Réponse')] }],
    create: (ctx) => data(
      { kicker: 'Questions', title: 'Avant de nous écrire' },
      { items: faqList(copyFor(ctx)) },
    ),
  },
  {
    type: 'cta',
    name: 'Appel à l’action',
    description: 'Une bande pour passer à l’étape suivante.',
    category: 'Conversion',
    variants: [v('band', 'Bande'), v('split', 'Deux colonnes')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('text', 'Texte'), text('button', 'Bouton'), url('href', 'Lien')],
    lists: [],
    create: (ctx) => {
      const pack = copyFor(ctx)
      return data({
        kicker: 'Prochaine étape',
        title: pack.ctaTitle,
        text: pack.ctaText,
        button: pack.heroPrimary,
        href: ctx.kind === 'restaurant' ? 'reserver' : 'contact',
      })
    },
  },
  {
    type: 'contact',
    name: 'Contact',
    description: 'Coordonnées et formulaire. L’envoi dépend du mode choisi dans Connexions.',
    category: 'Contact',
    variants: [v('split', 'Texte et formulaire'), v('simple', 'Formulaire seul'), v('bande', 'Bandeau')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('text', 'Texte'), text('submit', 'Bouton')],
    lists: [],
    create: () => data({
      kicker: 'Contact',
      title: 'Écrire',
      text: 'Le message s’ouvre dans votre application e-mail, sauf si un service de formulaire est branché.',
      submit: 'Envoyer',
    }),
  },
  {
    type: 'map',
    name: 'Carte',
    description: 'Google Maps à partir de l’adresse, sans clé API.',
    category: 'Contact',
    variants: [v('wide', 'Large'), v('card', 'Encadrée')],
    fields: [text('title', 'Titre'), area('text', 'Texte')],
    lists: [],
    create: (ctx) => data({
      title: 'Nous trouver',
      text: ctx.address ? `${ctx.address}, ${ctx.postalCode} ${ctx.city}` : ctx.city,
    }),
  },
  {
    type: 'hours',
    name: 'Horaires',
    description: 'Reprend les horaires des réglages du commerce.',
    category: 'Contact',
    variants: [v('table', 'Tableau'), v('cards', 'Cartes')],
    fields: [text('title', 'Titre'), area('note', 'Note')],
    lists: [],
    create: () => data({ title: 'Horaires', note: 'Les jours fériés sont affichés en vitrine la veille.' }),
  },
  {
    type: 'newsletter',
    name: 'Newsletter',
    description: 'Collecte d’e-mail via mailto, Formspree ou votre endpoint. Pas de liste hébergée ici.',
    category: 'Conversion',
    variants: [v('band', 'Bande'), v('card', 'Carte')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('text', 'Texte'), text('placeholder', 'Placeholder'), text('button', 'Bouton'), area('note', 'Note')],
    lists: [],
    create: () => data({
      kicker: 'Nouvelles',
      title: 'Les nouvelles du lieu, rarement.',
      text: 'Quelques messages par an : horaires de fêtes, carte qui change, rien d’autre.',
      placeholder: 'Votre e-mail',
      button: 'S’inscrire',
      note: 'Sans outil branché, le bouton prépare un e-mail. Aucune liste n’est stockée dans le site.',
    }),
  },
  {
    type: 'logos',
    name: 'Ils nous font confiance',
    description: 'Noms ou logos de partenaires.',
    category: 'Preuve',
    variants: [v('row', 'File'), v('grid', 'Grille')],
    fields: [text('title', 'Titre')],
    lists: [{ key: 'logos', label: 'Logos', itemLabel: 'Logo', fields: [text('name', 'Nom'), image('image', 'Image')] }],
    create: (ctx) => data({ title: 'Autour de nous' }, { logos: logoList(copyFor(ctx)) }),
  },
  {
    type: 'about',
    name: 'À propos',
    description: 'Portrait du lieu, texte et image.',
    category: 'Contenu',
    variants: [v('split', 'Côte à côte'), v('stacked', 'Empilé')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('body', 'Texte'), image('image', 'Image'), text('imageAlt', 'Texte alternatif'), text('caption', 'Légende')],
    lists: [],
    create: (ctx) => {
      const pack = copyFor(ctx)
      return data({
        kicker: 'La maison',
        title: pack.aboutTitle,
        body: pack.aboutBody,
        image: '',
        imageAlt: ctx.name,
        caption: ctx.city,
      })
    },
  },
  {
    type: 'booking',
    name: 'Rendez-vous',
    description: 'Demande de créneau. Ne bloque pas un agenda.',
    category: 'Conversion',
    variants: [v('split', 'Texte et formulaire'), v('simple', 'Formulaire')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('text', 'Texte'), text('submit', 'Bouton'), area('note', 'Note sous le bouton')],
    lists: [{ key: 'services', label: 'Prestations proposées', itemLabel: 'Prestation', fields: [text('name', 'Nom')] }],
    create: (ctx) => {
      const pack = copyFor(ctx)
      return data(
        {
          kicker: 'Rendez-vous',
          title: 'Demander un créneau',
          text: 'Ce formulaire envoie une demande. Le créneau n’est confirmé que lorsque vous répondez. Aucun agenda n’est synchronisé.',
          submit: 'Envoyer la demande',
          note: 'Indiquez deux moments. On confirme le plus tôt possible.',
        },
        { services: pack.services.map((service) => item({ name: service.title })) },
      )
    },
  },
  {
    type: 'catalog',
    name: 'Catalogue',
    description: 'Produits commandés par WhatsApp, e-mail ou lien de paiement.',
    category: 'Offre',
    variants: [v('grid', 'Grille'), v('list', 'Liste')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('intro', 'Introduction')],
    lists: [{
      key: 'products',
      label: 'Produits',
      itemLabel: 'Produit',
      fields: [
        text('name', 'Nom'),
        text('price', 'Prix'),
        area('description', 'Description'),
        image('image', 'Image'),
        text('badge', 'Badge'),
        url('link', 'Lien de paiement propre à la pièce'),
      ],
    }],
    create: (ctx) => data(
      {
        kicker: 'Sélection',
        title: 'À emporter ou à réserver',
        intro: 'Le paiement en ligne n’est actif que si vous collez un lien (Stripe, PayPal, Lydia…). Sinon, la commande part par WhatsApp ou e-mail.',
      },
      { products: productList(copyFor(ctx)) },
    ),
  },
  {
    type: 'blog',
    name: 'Journal',
    description: 'Articles générés en pages statiques.',
    category: 'Contenu',
    variants: [v('cards', 'Cartes'), v('list', 'Liste')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('intro', 'Introduction')],
    lists: [{
      key: 'posts',
      label: 'Articles',
      itemLabel: 'Article',
      fields: [text('title', 'Titre'), text('date', 'Date'), area('excerpt', 'Chapô'), area('content', 'Texte'), image('image', 'Image')],
    }],
    create: (ctx) => data(
      { kicker: 'Journal', title: 'Nouvelles', intro: 'Des textes courts, utiles, pas un magazine.' },
      { posts: postList(copyFor(ctx)) },
    ),
  },
  {
    type: 'portfolio',
    name: 'Réalisations',
    description: 'Projets, chantiers, coupes, séances.',
    category: 'Preuve',
    variants: [v('grid', 'Grille'), v('list', 'Liste')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('intro', 'Introduction')],
    lists: [{
      key: 'works',
      label: 'Réalisations',
      itemLabel: 'Réalisation',
      fields: [text('title', 'Titre'), text('category', 'Catégorie'), area('description', 'Description'), image('image', 'Image')],
    }],
    create: (ctx) => data(
      { kicker: 'Réalisations', title: 'Quelques pièces récentes', intro: '' },
      {
        works: copyFor(ctx).gallery.map((shot, index) =>
          item({
            title: shot.caption,
            category: index % 2 === 0 ? 'Récent' : 'En cours',
            description: shot.alt,
            image: '',
          }),
        ),
      },
    ),
  },
  {
    type: 'video',
    name: 'Vidéo',
    description: 'YouTube ou Vimeo, en lecture intégrée sans cookies YouTube quand c’est possible.',
    category: 'Contenu',
    variants: [v('theater', 'Grand'), v('split', 'Texte à côté')],
    fields: [text('title', 'Titre'), area('text', 'Texte'), url('url', 'URL YouTube ou Vimeo'), text('caption', 'Légende')],
    lists: [],
    create: () => data({
      title: 'Une minute sur place',
      text: 'Collez un lien YouTube ou Vimeo. Sans lien, la section explique qu’elle attend une vidéo.',
      url: '',
      caption: '',
    }),
  },
  {
    type: 'carousel',
    name: 'Carrousel',
    description: 'Diaporama léger, sans bibliothèque payante.',
    category: 'Contenu',
    variants: [v('slides', 'Visuels'), v('quotes', 'Citations')],
    fields: [text('title', 'Titre')],
    lists: [{
      key: 'slides',
      label: 'Diapositives',
      itemLabel: 'Diapositive',
      fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('text', 'Texte'), image('image', 'Image')],
    }],
    create: (ctx) => data(
      { title: '' },
      {
        slides: copyFor(ctx).testimonials.map((quote) =>
          item({ kicker: quote.role, title: quote.author, text: quote.quote, image: '' }),
        ),
      },
    ),
  },
  {
    type: 'loyalty',
    name: 'Carte de fidélité',
    description: 'Tampons enregistrés sur le téléphone du client.',
    category: 'Application',
    variants: [v('pass', 'Carte portefeuille'), v('simple', 'Liste simple')],
    fields: [
      text('kicker', 'Surtitre'),
      text('title', 'Titre'),
      area('reward', 'Récompense'),
      text('goal', 'Nombre de tampons'),
      text('pin', 'Code commerçant'),
      area('note', 'Note'),
    ],
    lists: [],
    create: (ctx) => data({
      kicker: 'Fidélité',
      title: ctx.name,
      reward: copyFor(ctx).loyaltyReward,
      goal: '8',
      pin: '2468',
      note: 'Les tampons restent sur cet appareil. Le code commerçant évite les ajouts accidentels, ce n’est pas un verrou sérieux.',
    }),
  },
  {
    type: 'links',
    name: 'Liens',
    description: 'Page de liens, type link-in-bio.',
    category: 'Application',
    variants: [v('stack', 'Pile'), v('cards', 'Cartes')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('bio', 'Bio'), image('avatar', 'Portrait')],
    lists: [{
      key: 'links',
      label: 'Liens',
      itemLabel: 'Lien',
      fields: [text('label', 'Libellé'), url('url', 'URL ou page'), text('note', 'Note')],
    }],
    create: (ctx) => data(
      { kicker: ctx.city, title: ctx.name, bio: copyFor(ctx).tagline, avatar: '' },
      { links: linkList(copyFor(ctx), ctx.phone, ctx.email) },
    ),
  },
  {
    type: 'text',
    name: 'Texte',
    description: 'Un titre et des paragraphes. Sert aussi pour les mentions légales.',
    category: 'Contenu',
    variants: [v('narrow', 'Colonne étroite'), v('wide', 'Large')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre'), area('body', 'Texte')],
    lists: [],
    create: (ctx) => data({
      kicker: 'Mentions',
      title: 'Mentions légales',
      body: legalBody(ctx),
    }),
  },
  {
    type: 'steps',
    name: 'Étapes',
    description: 'Comment ça se passe, en trois temps.',
    category: 'Contenu',
    variants: [v('row', 'En ligne'), v('stacked', 'Empilé')],
    fields: [text('kicker', 'Surtitre'), text('title', 'Titre')],
    lists: [{ key: 'steps', label: 'Étapes', itemLabel: 'Étape', fields: [text('title', 'Titre'), area('text', 'Texte')] }],
    create: (ctx) => data(
      { kicker: 'Déroulé', title: 'Comment ça se passe' },
      { steps: stepList(copyFor(ctx)) },
    ),
  },
  {
    type: 'footer',
    name: 'Pied de page',
    description: 'Coordonnées, liens, ligne légale.',
    category: 'Structure',
    variants: [v('columns', 'Colonnes'), v('center', 'Centré'), v('simple', 'Une ligne')],
    fields: [area('blurb', 'Phrase'), text('note', 'Ligne légale')],
    lists: [{ key: 'links', label: 'Liens', itemLabel: 'Lien', fields: [text('label', 'Libellé'), url('href', 'Lien')] }],
    create: (ctx) => data(
      {
        blurb: copyFor(ctx).tagline,
        note: `© ${new Date().getFullYear()} ${ctx.name}. Tous droits réservés.`,
      },
      {
        links: [
          item({ label: 'Accueil', href: 'index' }),
          item({ label: 'Contact', href: 'contact' }),
          item({ label: 'Mentions légales', href: 'mentions' }),
        ],
      },
    ),
  },
]

const byType = new Map(BLOCKS.map((block) => [block.type, block]))

export function getBlockDefinition(type: BlockType): BlockDefinition {
  const found = byType.get(type)
  if (!found) throw new Error(`Bloc inconnu : ${type}`)
  return found
}

export function createBlock(type: BlockType, ctx: TemplateContext, variant?: string): Block {
  const definition = getBlockDefinition(type)
  const variantId = definition.variants.some((entry) => entry.id === variant)
    ? variant!
    : definition.variants[0].id
  return {
    id: `blk-${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    variant: variantId,
    visible: true,
    reveal: 'inherit',
    layout: { align: 'inherit', pad: 'inherit', bg: 'inherit', width: 'inherit' },
    data: definition.create(ctx),
    elements: {},
    anim: { duration: '0.7s', delay: '0s' },
    layoutMode: 'flow',
    hideFlow: false,
    freeNodes: [],
    motionSpec: null,
    motions: {},
    imageFrames: {},
  }
}
