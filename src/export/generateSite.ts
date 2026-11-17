import { pageFile } from '../domain/ids'
import type { Project } from '../domain/types'
import { contrastColor } from '../domain/color'
import { buildCss } from './css'
import { monogramPng } from './png'
import { collectArticles, renderArticleHtml, renderPageHtml, type PageOptions } from './render'
import { buildScript } from './script'
import { shopFiles } from './shopHtml'

export interface GeneratedFile {
  path: string
  content: string | Uint8Array
}

export interface ExportIssue {
  level: 'error' | 'warn'
  message: string
}

export function exportIssues(project: Project): ExportIssue[] {
  const issues: ExportIssue[] = []
  if (!project.business.name.trim()) issues.push({ level: 'error', message: 'Le commerce n’a pas de nom.' })
  if (project.pages.length === 0) issues.push({ level: 'error', message: 'Le projet n’a aucune page.' })
  if (!project.pages.some((page) => page.blocks.some((block) => block.visible))) {
    issues.push({ level: 'error', message: 'Aucune section visible à exporter.' })
  }
  if (project.contactForm.mode === 'mailto' && !project.business.email.trim()) {
    issues.push({ level: 'warn', message: 'Formulaire en mailto sans e-mail : le visiteur verra un message d’erreur.' })
  }
  if (project.contactForm.mode === 'formspree' && !/^[a-zA-Z0-9]+$/.test(project.contactForm.formspreeId.trim())) {
    issues.push({ level: 'warn', message: 'Formspree est choisi mais l’identifiant est vide ou invalide. Le formulaire retombe sur l’e-mail.' })
  }
  if (project.ordering.mode === 'link' && !/^https?:\/\//.test(project.ordering.paymentLink.trim())) {
    issues.push({ level: 'warn', message: 'Mode lien de paiement sans URL. Les boutons Commander ne s’afficheront pas.' })
  }
  if ((project.ordering.mode === 'whatsapp' || project.shop !== 'none') && !project.business.phone.trim() && project.ordering.mode === 'whatsapp') {
    issues.push({ level: 'warn', message: 'Commande WhatsApp sans numéro.' })
  }
  const images = walkImages(project)
  if (images.some((alt) => !alt.trim())) issues.push({ level: 'warn', message: 'Au moins une image n’a pas de texte alternatif.' })
  return issues
}

export function generateSite(project: Project): GeneratedFile[] {
  const articles = collectArticles(project)
  const options: PageOptions = { linkMode: 'export', preview: false, articles }
  const css = buildCss(project)
  const js = buildScript()
  const pages = [
    ...project.pages.map((page) => ({ path: pageFile(page.slug), html: renderPageHtml(project, page, options) })),
    ...articles.map((article) => ({ path: pageFile(article.slug), html: renderArticleHtml(project, article, options) })),
    ...shopFiles(project, options),
  ]
  const media = new Map<string, Uint8Array>()
  const files: GeneratedFile[] = []
  for (const page of pages) files.push({ path: page.path, content: extractDataUrls(page.html, media) })
  const cssOut = extractDataUrls(css, media)
  for (const [path, bytes] of media) files.push({ path, content: bytes })
  files.push({ path: 'assets/styles.css', content: cssOut })
  files.push({ path: 'assets/app.js', content: js })
  files.push({ path: 'robots.txt', content: robots(project) })
  files.push({ path: 'sitemap.xml', content: sitemap(project, [...project.pages.map((page) => page.slug), ...articles.map((article) => article.slug)]) })
  files.push({ path: 'LISEZMOI.txt', content: clientReadme(project) })
  if (project.pwa) {
    const letter = (project.business.name.trim()[0] || 'A').toUpperCase()
    const bg = project.tokens.primary
    const fg = contrastColor(bg)
    files.push({ path: 'assets/icon-192.png', content: monogramPng(192, bg, fg, letter) })
    files.push({ path: 'assets/icon-512.png', content: monogramPng(512, bg, fg, letter) })
    files.push({ path: 'manifest.webmanifest', content: manifest(project) })
    const precache = files
      .map((file) => file.path)
      .filter((path) => path !== 'sw.js')
      .map((path) => `./${path}`)
    files.push({ path: 'sw.js', content: serviceWorker(precache) })
  }
  return files
}

export function previewDocument(project: Project, slug: string, selectedId = '', selectedElement = ''): string {
  const articles = collectArticles(project)
  const options: PageOptions = {
    linkMode: 'preview',
    preview: true,
    selectedId,
    inlineCss: buildCss(project),
    inlineJs: buildScript(),
    articles,
  }
  const page = project.pages.find((entry) => entry.slug === slug)
  const html = page
    ? renderPageHtml(project, page, options)
    : renderArticleHtml(
        project,
        articles.find((article) => article.slug === slug) ?? {
          slug,
          title: 'Page',
          date: '',
          excerpt: '',
          content: 'Cette page n’existe pas dans le projet.',
          image: '',
        },
        options,
      )
  if (!selectedElement) return html
  return html.replace(`data-el="${selectedElement}"`, `data-el="${selectedElement}" data-selected-el="true"`)
}

function extractDataUrls(text: string, media: Map<string, Uint8Array>): string {
  return text.replace(/data:(image|font)\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/g, (_full, kind: string, mime: string, b64: string) => {
    const ext = kind === 'font'
      ? (mime.includes('woff2') ? 'woff2' : mime.includes('woff') ? 'woff' : mime.includes('otf') || mime.includes('opentype') ? 'otf' : 'ttf')
      : mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('svg') ? 'svg' : 'jpg'
    const path = `assets/${kind === 'font' ? 'font' : 'media'}-${hash(b64)}.${ext}`
    if (!media.has(path)) media.set(path, base64ToBytes(b64))
    return path
  })
}

function hash(value: string): string {
  let h = 2166136261
  const step = Math.max(1, Math.floor(value.length / 4000))
  for (let i = 0; i < value.length; i += step) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

function robots(project: Project): string {
  const base = project.seo.canonicalBase.replace(/\/$/, '')
  return `User-agent: *\nAllow: /\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}`
}

function sitemap(project: Project, slugs: string[]): string {
  const base = project.seo.canonicalBase.replace(/\/$/, '')
  const urls = slugs
    .map((slug) => {
      const file = pageFile(slug)
      const loc = base ? `${base}/${file}` : `/${file}`
      return `  <url><loc>${escapeXml(loc)}</loc></url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

function manifest(project: Project): string {
  return JSON.stringify(
    {
      name: project.pwaName || project.business.name,
      short_name: (project.pwaShortName || project.business.name).slice(0, 12),
      start_url: './',
      scope: './',
      display: 'standalone',
      background_color: project.tokens.bg,
      theme_color: project.tokens.primary,
      lang: 'fr',
      icons: [
        { src: 'assets/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    },
    null,
    2,
  )
}

function serviceWorker(assets: string[]): string {
  return `const CACHE = 'atelier-${hash(assets.join('|'))}';
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
`
}

function walkImages(project: Project): string[] {
  const alts: string[] = []
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    const record = value as Record<string, unknown>
    if (typeof record.src === 'string' && record.src) alts.push(String(record.alt ?? ''))
    if (typeof record.image === 'string' && record.image) alts.push(String(record.imageAlt ?? record.alt ?? ''))
    Object.values(record).forEach(visit)
  }
  visit(project.pages)
  return alts
}

function clientReadme(project: Project): string {
  return `Site de ${project.business.name}
Généré par Atelier Local — fichiers statiques, sans abonnement imposé.

MISE EN LIGNE GRATUITE
1. Décompressez ce dossier.
2. Netlify Drop : https://app.netlify.com/drop — déposez le dossier. Vous obtenez une adresse en .netlify.app.
   Cloudflare Pages ou GitHub Pages fonctionnent aussi, toujours sur l’offre gratuite.
3. Envoyez cette adresse au client pour la démo. Ce n’est pas une adresse de votre ordinateur.

NOM DE DOMAINE DU CLIENT
Le nom de domaine se paie chez un registrar (souvent 10 à 15 € / an) et doit rester au nom du client.
Chez Netlify ou Cloudflare Pages : ajoutez le domaine, puis chez le registrar créez l’enregistrement demandé (souvent un CNAME ou les serveurs DNS de Cloudflare).
Le site lui-même reste hébergé gratuitement. Seul le nom de domaine est un coût du client, pas du studio.

FORMULAIRE
Par défaut, le bouton ouvre l’e-mail du visiteur (mailto) vers ${project.business.email || 'l’adresse à renseigner'}.
Aucun message n’est stocké sur un serveur. Formspree ou une URL personnelle se règlent dans le studio avant export.

PAIEMENT
Ce site n’encaisse pas. Une commande part par WhatsApp, par e-mail, ou vers un lien de paiement que vous avez collé (Stripe Payment Link, PayPal, Lydia).
Un paiement confirmé, un stock et un historique de commandes demandent un backend. Ils ne sont pas simulés ici.

CARTE DE FIDÉLITÉ
Les tampons restent dans le navigateur de l’appareil. Ils ne se synchronisent pas entre téléphones.

APPLICATION INSTALLABLE
Si le manifeste est présent, le site peut être ajouté à l’écran d’accueil (Chrome ou Safari : Partager → Sur l’écran d’accueil).
Les notifications push ne sont pas incluses.

ANIMATIONS
Elles sont dans le CSS et le JavaScript du dossier. Si le visiteur demande moins d’animation, le site le respecte.
`
}
