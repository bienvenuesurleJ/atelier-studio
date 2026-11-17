export type ConnectorStatus = 'ready' | 'bring-your-own' | 'needs-server'

export interface ConnectorDefinition {
  id: string
  name: string
  status: ConnectorStatus
  summary: string
  detail: string
}

export const CONNECTORS: ConnectorDefinition[] = [
  {
    id: 'form-mailto',
    name: 'Formulaire par e-mail',
    status: 'ready',
    summary: 'Ouvre le logiciel de messagerie du visiteur. Aucun compte, aucun serveur.',
    detail:
      'Le message est composé dans un lien mailto. Si le visiteur n’a pas de logiciel de messagerie, rien n’est envoyé : c’est la limite d’une page statique. Indiquez aussi le téléphone.',
  },
  {
    id: 'form-formspree',
    name: 'Formspree',
    status: 'bring-your-own',
    summary: 'Collez l’identifiant d’un formulaire Formspree (offre gratuite limitée).',
    detail:
      'Créez le formulaire sur formspree.io, copiez l’identifiant (la partie après /f/) et collez-le dans les réglages. Atelier Local n’héberge pas les messages.',
  },
  {
    id: 'form-endpoint',
    name: 'Endpoint personnel',
    status: 'bring-your-own',
    summary: 'Le formulaire poste vers une URL que vous hébergez vous-même.',
    detail:
      'L’URL doit répondre en POST et accepter les champs du formulaire. Sans cette URL, le studio ne simule pas de réception.',
  },
  {
    id: 'order-whatsapp',
    name: 'Commande WhatsApp',
    status: 'ready',
    summary: 'Le panier ouvre une conversation WhatsApp avec le récapitulatif.',
    detail: 'Le numéro du commerce est utilisé. WhatsApp est gratuit pour ce lien ; les frais éventuels sont ceux de l’opérateur du client.',
  },
  {
    id: 'order-email',
    name: 'Commande par e-mail',
    status: 'ready',
    summary: 'Le panier prépare un e-mail de commande.',
    detail: 'Même principe que le formulaire mailto. Aucun paiement n’est encaissé par le site.',
  },
  {
    id: 'order-link',
    name: 'Lien de paiement',
    status: 'bring-your-own',
    summary: 'Stripe Payment Link, PayPal.me, Lydia… un lien que vous collez.',
    detail:
      'Le site n’encaisse rien. Le prestataire (Stripe, PayPal, etc.) peut prélever une commission sur les ventes : ce n’est pas un coût de fonctionnement d’Atelier Local. Sans lien collé, le bouton n’apparaît pas.',
  },
  {
    id: 'booking-email',
    name: 'Demande de rendez-vous',
    status: 'ready',
    summary: 'Le visiteur envoie une demande. Vous confirmez ensuite.',
    detail: 'Ce n’est pas un agenda synchronisé. La demande part par e-mail ou Formspree. Le créneau n’est pas bloqué automatiquement.',
  },
  {
    id: 'booking-calendar',
    name: 'Agenda synchronisé',
    status: 'needs-server',
    summary: 'Google Calendar, réservation confirmée, rappels SMS : hors périmètre.',
    detail:
      'Bloquer un créneau et empêcher les doubles réservations demande une base de données et un compte calendrier. Le studio prépare le formulaire, pas cette synchronisation.',
  },
  {
    id: 'maps',
    name: 'Carte',
    status: 'ready',
    summary: 'Intégration Google Maps sans clé API, à partir de l’adresse.',
    detail: 'La carte se charge depuis Google quand le visiteur est en ligne. Aucune clé n’est requise pour l’iframe publique.',
  },
  {
    id: 'loyalty',
    name: 'Carte de fidélité',
    status: 'ready',
    summary: 'Tampons enregistrés sur le téléphone du client.',
    detail:
      'Les tampons vivent dans le navigateur de cet appareil (localStorage). Ils ne sont pas partagés entre téléphones et un client déterminé peut les modifier. Le code commerçant est un confort, pas une sécurité bancaire. Un vrai programme multi-appareils demanderait un serveur.',
  },
  {
    id: 'reviews',
    name: 'Avis Google en direct',
    status: 'needs-server',
    summary: 'Les avis affichés sont ceux que vous saisissez.',
    detail:
      'L’API Google Business Profile n’est pas appelée. Vous rédigez ou collez les témoignages. Rien n’est inventé depuis Google.',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    status: 'bring-your-own',
    summary: 'Collecte par e-mail, ou vers votre endpoint / Formspree.',
    detail: 'Pas de liste hébergée dans Atelier Local. Branchez Formspree ou votre outil, sinon le visiteur vous écrit.',
  },
  {
    id: 'analytics',
    name: 'Statistiques de fréquentation',
    status: 'needs-server',
    summary: 'Pas de compteur intégré.',
    detail:
      'Un outil comme Plausible ou Cloudflare Web Analytics se branche plus tard par une ligne de script, sur l’hébergement du client. Le studio ne fait pas semblant de compter les visites.',
  },
]

export function connectorStatusLabel(status: ConnectorStatus): string {
  if (status === 'ready') return 'Prêt'
  if (status === 'bring-your-own') return 'À brancher'
  return 'Nécessite un serveur'
}
