export type AssistantCommand =
  | { type: 'add-block'; blockType: string }
  | { type: 'set-style'; styleId: string }
  | { type: 'focus-logo' }
  | { type: 'add-product' }
  | { type: 'export' }
  | { type: 'open-video' }
  | { type: 'open-admin' }

export interface LocalReply {
  source: 'guide'
  text: string
  confirm?: string
  command?: AssistantCommand
}

const styles: Record<string, string> = {
  luxe: 'luxe',
  minimal: 'minimal',
  moderne: 'moderne',
  nature: 'nature',
  brut: 'brutal',
  brutal: 'brutal',
  neon: 'neon',
  retro: 'retro',
  verre: 'glass',
  glass: 'glass',
  corporate: 'corporate',
  joue: 'playful',
  playful: 'playful',
}

export function understand(raw: string): LocalReply {
  const text = normalize(raw)
  if (!text) return { source: 'guide', text: 'Dites par exemple : « ajoute un hero », « mets un logo », « exporte le site ».' }
  if (matches(text, ['pourquoi', 'marche pas', 'ne marche', 'bug', 'heic', 'invisible'])) {
    return { source: 'guide', text: faq(matches(text, ['video', 'film']) ? 'video' : matches(text, ['supabase', 'synchro']) ? 'sync' : 'logo') }
  }
  if (matches(text, ['logo', 'image de marque', 'favicon'])) {
    return { source: 'guide', text: 'Je peux ouvrir le choix du logo (PNG, JPG, SVG, WebP). Les HEIC iPhone doivent d’abord être enregistrés en JPEG.', confirm: 'Choisir un logo', command: { type: 'focus-logo' } }
  }
  if (matches(text, ['video', 'film', 'studio video', 'capcut'])) {
    return { source: 'guide', text: 'Studio Vidéo est une application à part. Le bouton Importer accepte photos et vidéos.', confirm: 'Ouvrir Studio Vidéo', command: { type: 'open-video' } }
  }
  if (matches(text, ['export', 'zip', 'publie', 'publier', 'telecharger'])) {
    return { source: 'guide', text: 'L’export prépare un ZIP statique. Aucun paiement n’est simulé.', confirm: 'Ouvrir l’export', command: { type: 'export' } }
  }
  if (matches(text, ['produit', 'boutique', 'article', 'prix'])) {
    return { source: 'guide', text: 'J’ajoute un produit à 12 € dans la collection Général. Vous pourrez changer le prix et les variantes.', confirm: 'Ajouter le produit', command: { type: 'add-product' } }
  }
  if (matches(text, ['supabase', 'synchro', 'synchron', 'cle anon', 'compte'])) {
    return { source: 'guide', text: faq('sync') }
  }
  if (matches(text, ['heic', 'iphone', 'logo invisible', 'logo ne', 'pas de logo'])) {
    return { source: 'guide', text: faq('logo') }
  }
  if (matches(text, ['image', 'photo ne', 'import'])) {
    return { source: 'guide', text: faq('image') }
  }
  for (const [word, styleId] of Object.entries(styles)) {
    if (text.includes(word)) {
      return { source: 'guide', text: `Je peux passer le site sur l’univers « ${styleId} ». Les textes restent.`, confirm: 'Changer le style', command: { type: 'set-style', styleId } }
    }
  }
  const block = blockFrom(text)
  if (block) {
    return { source: 'guide', text: `Je peux ajouter une section ${block.label}. Elle sera sélectionnée dans l’aperçu.`, confirm: `Ajouter ${block.label}`, command: { type: 'add-block', blockType: block.type } }
  }
  if (matches(text, ['aide', 'comment', 'faq', 'bloque', 'marche pas', 'fonctionne pas'])) return { source: 'guide', text: faq('all') }
  return { source: 'guide', text: 'Je n’ai pas reconnu la demande. Essayez « ajoute une galerie », « mets un logo », « style nature », « ajoute un produit » ou « exporte ».' }
}

function blockFrom(text: string): { type: string; label: string } | null {
  const table: Array<[string[], string, string]> = [
    [['hero', 'banniere', 'ouverture', 'accueil'], 'hero', 'Hero'],
    [['galerie', 'photos'], 'gallery', 'Galerie'],
    [['avis', 'temoignage'], 'testimonials', 'Avis'],
    [['contact', 'formulaire'], 'contact', 'Contact'],
    [['tarif', 'prix'], 'pricing', 'Tarifs'],
    [['equipe'], 'team', 'Équipe'],
    [['faq', 'questions'], 'faq', 'FAQ'],
    [['carte', 'menu'], 'menu', 'Carte'],
    [['horaire'], 'hours', 'Horaires'],
  ]
  for (const [words, type, label] of table) {
    if (words.some((word) => text.includes(word))) return { type, label }
  }
  return null
}

function faq(topic: string): string {
  const logo = 'Logo : bouton Logo en haut de l’éditeur, ou cliquez le logo dans l’aperçu. PNG, JPG, SVG, WebP. Un HEIC iPhone doit être enregistré en JPEG avant.'
  const image = 'Images : onglet Médias, ou le champ image d’une section. Si rien ne s’affiche, le message d’erreur en haut à droite dit pourquoi.'
  const sync = 'Synchro : Espace admin, collez l’adresse Supabase et la clé anon (jamais la clé secrète), puis exécutez supabase/setup.sql. Sans ça, tout reste dans ce navigateur.'
  const video = 'Vidéo : Studio Vidéo, bouton Importer. MP4 et WebM marchent. Un MOV illisible est signalé. L’export est H.264 si le navigateur sait l’encoder, sinon WebM.'
  if (topic === 'logo') return logo
  if (topic === 'image') return image
  if (topic === 'sync') return sync
  if (topic === 'video') return video
  return [logo, image, sync, video].join('\n\n')
}

function matches(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(normalize(word)))
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}
