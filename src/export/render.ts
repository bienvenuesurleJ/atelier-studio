import { field, list } from '../domain/blockData'
import { pageFile, slugify, uniqueSlug } from '../domain/ids'
import { embedUrl, mapQuery, safeHref, safeImg, type LinkMode } from '../domain/links'
import type { Block, DayHours, FreeNode, ListItem, Page, Project } from '../domain/types'
import { esc, lines, paragraphs, safeJson } from './html'
import { animDataAttrs } from './animAttrs'

export interface ArticlePage {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  image: string
}

export interface RenderTarget {
  slug: string
  title: string
  description: string
  htmlMain: string
}

export function collectArticles(project: Project): ArticlePage[] {
  const used = new Set(project.pages.map((page) => page.slug))
  const articles: ArticlePage[] = []
  for (const page of project.pages) {
    for (const block of page.blocks) {
      if (!block.visible || block.type !== 'blog') continue
      for (const post of list(block, 'posts')) {
        const title = post.fields.title || 'Article'
        const slug = uniqueSlug(`journal-${slugify(title)}`, used)
        used.add(slug)
        articles.push({
          slug,
          title,
          date: post.fields.date || '',
          excerpt: post.fields.excerpt || '',
          content: post.fields.content || '',
          image: post.fields.image || '',
        })
      }
    }
  }
  return articles
}

export function renderPageHtml(project: Project, page: Page, options: PageOptions): string {
  const articles = options.articles ?? collectArticles(project)
  const main = page.blocks
    .filter((block) => block.visible)
    .map((block) => renderBlock(block, project, options, articles))
    .join('\n')
  return documentShell(project, {
    slug: page.slug,
    title: page.slug === 'index' ? project.seo.title || project.business.name : `${page.title} · ${project.business.name}`,
    description: page.description || project.seo.description,
    main,
    options,
  })
}

export function renderArticleHtml(project: Project, article: ArticlePage, options: PageOptions): string {
  const image = media(article.image, article.title, article.title.slice(0, 1))
  const main = `<article class="block"><div class="wrap prose article-hero">${image}<p class="kicker">${esc(article.date)}</p><h1>${esc(article.title)}</h1>${paragraphs(article.content)}<p><a class="btn btn-ghost" href="${esc(safeHref('index', options.linkMode))}">Retour</a></p></div></article>`
  return documentShell(project, {
    slug: article.slug,
    title: `${article.title} · ${project.business.name}`,
    description: article.excerpt || project.seo.description,
    main,
    options,
  })
}

export interface PageOptions {
  linkMode: LinkMode
  preview: boolean
  selectedId?: string
  inlineCss?: string
  inlineJs?: string
  cssHref?: string
  jsHref?: string
  articles?: ArticlePage[]
}

function renderBlock(block: Block, project: Project, options: PageOptions, articles: ArticlePage[]): string {
  const flow = block.hideFlow ? '' : renderBody(block, project, options, articles)
  const free = renderFreeLayer(block, options)
  if (!flow && !free) return ''
  const reveal = block.reveal === 'inherit' ? project.motion.reveal : block.reveal
  const animated = Boolean(block.motionSpec && block.motionSpec.effect !== 'none')
  const selected = options.preview && options.selectedId === block.id ? ' data-selected="true"' : ''
  const min = freeMin(block)
  return `<section id="${esc(block.id)}" class="block block-${esc(block.type)}${!animated && reveal !== 'none' ? ' reveal' : ''}" data-bid="${esc(block.id)}" data-block="${esc(block.type)}" data-variant="${esc(block.variant)}" data-reveal="${esc(reveal)}" data-align="${esc(block.layout.align)}" data-pad="${esc(block.layout.pad)}" data-bg="${esc(block.layout.bg)}" data-width="${esc(block.layout.width)}" data-layout="${esc(block.layoutMode ?? 'flow')}" data-hide-flow="${block.hideFlow ? '1' : '0'}" style="--free-min:${min}px"${selected}${animDataAttrs(block.motionSpec)}>${flow}${free}</section>`
}

function renderBody(block: Block, project: Project, options: PageOptions, articles: ArticlePage[]): string {
  switch (block.type) {
    case 'hero':
      return hero(block, project, options)
    case 'features':
      return features(block)
    case 'services':
      return services(block)
    case 'pricing':
      return pricing(block, options)
    case 'menu':
      return menu(block, project)
    case 'testimonials':
      return testimonials(block)
    case 'team':
      return team(block)
    case 'gallery':
      return gallery(block, project)
    case 'timeline':
      return timeline(block)
    case 'stats':
      return stats(block, project)
    case 'faq':
      return faq(block)
    case 'cta':
      return cta(block, options)
    case 'contact':
      return contact(block, project)
    case 'map':
      return mapBlock(block, project)
    case 'hours':
      return hours(block, project)
    case 'newsletter':
      return newsletter(block, project)
    case 'logos':
      return logos(block)
    case 'about':
      return about(block)
    case 'booking':
      return booking(block, project)
    case 'catalog':
      return catalog(block, project)
    case 'blog':
      return blog(block, options, articles)
    case 'portfolio':
      return portfolio(block)
    case 'video':
      return video(block)
    case 'carousel':
      return carousel(block, project)
    case 'loyalty':
      return loyalty(block, project)
    case 'links':
      return links(block, options)
    case 'text':
      return textBlock(block)
    case 'steps':
      return steps(block)
    case 'footer':
      return footer(block, project, options)
    default:
      return ''
  }
}

function edit(options: PageOptions, key: string): string {
  return options.preview ? ` data-edit="${esc(key)}"` : ''
}

function elAttr(block: Block, key: string): string {
  return ` data-el="${esc(`${block.id}:${key}`)}"${animDataAttrs(block.motions?.[key])}`
}

function renderFreeLayer(block: Block, options: PageOptions): string {
  const nodes = block.freeNodes ?? []
  if (!nodes.length && block.layoutMode !== 'free') return ''
  const html = nodes.filter((node) => !node.parentId).map((node) => renderFreeNode(node, nodes, options)).join('')
  return `<div class="free-layer" data-free-root="${esc(block.id)}">${html}</div>`
}

function renderFreeNode(node: FreeNode, all: FreeNode[], options: PageOptions): string {
  const children = all.filter((item) => item.parentId === node.id).map((item) => renderFreeNode(item, all, options)).join('')
  const inner = freeInner(node, options)
  return `<div class="free-node" data-node="${esc(node.id)}" data-kind="${esc(node.kind)}" data-layout="${esc(node.layout)}" data-locked="${node.locked ? '1' : '0'}" data-hidden="${node.hidden ? '1' : '0'}"${animDataAttrs(node.motion)}><div class="free-rot">${inner}</div>${children}</div>`
}

function freeInner(node: FreeNode, options: PageOptions): string {
  if (node.kind === 'image') return media(node.src, node.alt || node.name, node.name || 'Image', '', node.image ? node.id : '')
  if (node.kind === 'button') return `<a class="btn" href="${esc(safeHref(node.href || '#', options.linkMode))}">${esc(node.text || node.name)}</a>`
  if (node.kind === 'shape' || node.kind === 'container' || node.kind === 'grid') return ''
  if (node.kind === 'divider') return ''
  return esc(node.text || node.name)
}

function freeMin(block: Block): number {
  const roots = (block.freeNodes ?? []).filter((node) => !node.parentId)
  const bottom = roots.reduce((max, node) => Math.max(max, node.box.desktop.y + node.box.desktop.h), 0)
  return Math.max(block.layoutMode === 'free' ? 420 : 0, Math.ceil(bottom + 32))
}

function sectionHead(block: Block, kickerKey: string, titleKey = 'title', introKey = ''): string {
  const kicker = kickerKey ? field(block, kickerKey) : ''
  const title = titleKey ? field(block, titleKey) : ''
  const intro = introKey ? field(block, introKey) : ''
  return `<div class="section-head">${kicker ? `<p class="kicker"${elAttr(block, kickerKey)}>${esc(kicker)}</p>` : ''}${title ? `<h2${elAttr(block, titleKey)}>${esc(title)}</h2>` : ''}${intro ? `<p class="muted"${elAttr(block, introKey)}>${esc(intro)}</p>` : ''}</div>`
}

function media(src: string, alt: string, fallback: string, el = '', focal = ''): string {
  const attr = `${el ? ` data-el="${esc(el)}"` : ''}${focal ? ` data-focal="${esc(focal)}"` : ''}`
  const safe = safeImg(src)
  const img = safe
    ? `<img${attr} src="${esc(safe)}" alt="${esc(alt)}" loading="lazy">`
    : `<div class="media-fallback"${attr} aria-hidden="true"><span>${esc((fallback || '·').slice(0, 1).toUpperCase())}</span></div>`
  return focal ? `<span class="crop-host">${img}</span>` : img
}

function hero(block: Block, project: Project, options: PageOptions): string {
  const title = field(block, 'title')
  const typing = project.motion.typing ? ' js-typing' : ''
  const copy = `<div class="hero-copy"><p class="kicker"${elAttr(block, 'kicker')}${edit(options, 'kicker')}>${esc(field(block, 'kicker'))}</p><h1 class="${typing.trim()}" data-text="${esc(title)}"${elAttr(block, 'title')}${edit(options, 'title')}>${esc(title)}</h1><p${elAttr(block, 'subtitle')}${edit(options, 'subtitle')}>${esc(field(block, 'subtitle'))}</p><div class="hero-actions">${button(field(block, 'primaryLabel'), field(block, 'primaryHref'), 'btn', options, `${block.id}:primary`)}${button(field(block, 'secondaryLabel'), field(block, 'secondaryHref'), 'btn btn-ghost', options, `${block.id}:secondary`)}</div></div>`
  const picture = `<div class="hero-media ${project.motion.parallax ? 'parallax' : ''}">${media(field(block, 'image'), field(block, 'imageAlt'), project.business.name, `${block.id}:image`, block.imageFrames?.image ? `${block.id}:image` : '')}</div>`
  if (block.variant === 'center') return `<div class="wrap">${copy}${picture}</div>`
  if (block.variant === 'overlay') return `${picture}${copy}`
  return `<div class="wrap hero-grid">${copy}${picture}</div>`
}

function button(label: string, href: string, className: string, options: PageOptions, el = ''): string {
  if (!label.trim()) return ''
  const attr = el ? ` data-el="${esc(el)}"` : ''
  return `<a class="${className}"${attr} href="${esc(safeHref(href, options.linkMode))}">${esc(label)}</a>`
}

function features(block: Block): string {
  const items = list(block, 'items')
  const cards = items
    .map((entry, index) =>
      block.variant === 'list'
        ? `<article><span class="index-no">${String(index + 1).padStart(2, '0')}</span><div><h3>${esc(entry.fields.title)}</h3><p class="muted">${esc(entry.fields.text)}</p></div></article>`
        : `<article class="card"><h3>${esc(entry.fields.title)}</h3><p class="muted">${esc(entry.fields.text)}</p></article>`,
    )
    .join('')
  const gridClass = block.variant === 'list' ? 'feature-list' : 'grid-3'
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'intro')}<div class="${gridClass}">${cards}</div></div>`
}

function services(block: Block): string {
  const cards = list(block, 'items')
    .map((entry) => {
      const image = entry.fields.image ? media(entry.fields.image, entry.fields.title, entry.fields.title) : ''
      return `<article class="card">${image}<h3>${esc(entry.fields.title)}</h3><p class="muted">${esc(entry.fields.text)}</p>${entry.fields.price ? `<p><strong>${esc(entry.fields.price)}</strong></p>` : ''}</article>`
    })
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'intro')}<div class="${block.variant === 'rows' ? 'feature-list' : 'grid-3'}">${cards}</div></div>`
}

function pricing(block: Block, options: PageOptions): string {
  const cards = list(block, 'plans')
    .map((entry) => {
      const points = lines(entry.fields.features || '')
        .map((line) => `<li>${esc(line)}</li>`)
        .join('')
      return `<article class="price-card" data-highlight="${entry.fields.highlight === 'true' ? 'true' : 'false'}"><h3>${esc(entry.fields.name)}</h3><p class="price-value">${esc(entry.fields.price)} <span>${esc(entry.fields.period)}</span></p><p>${esc(entry.fields.description)}</p><ul>${points}</ul>${button(entry.fields.cta || 'Choisir', entry.fields.href || 'contact', 'btn', options)}</article>`
    })
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'intro')}<div class="${block.variant === 'stacked' ? 'feature-list' : 'grid-3'}">${cards}</div></div>`
}

function menu(block: Block, project: Project): string {
  const groups = group(list(block, 'items'), 'category')
  const orderable = field(block, 'orderable') === 'true' || project.kind === 'pwa-menu'
  const html = groups
    .map((groupEntry) => {
      const rows = groupEntry.items
        .map((entry) => {
          const add =
            orderable && project.ordering.mode !== 'none' && project.ordering.mode !== 'link'
              ? `<button type="button" class="btn btn-small" data-add="1" data-name="${esc(entry.fields.name)}" data-price="${esc(entry.fields.price)}">Ajouter</button>`
              : ''
          return `<article class="menu-item"><div><h3>${esc(entry.fields.name)}${entry.fields.tag ? `<span class="tag">${esc(entry.fields.tag)}</span>` : ''}</h3><p class="muted">${esc(entry.fields.description)}</p></div><div><strong class="price">${esc(entry.fields.price)}</strong>${add}</div></article>`
        })
        .join('')
      return `<div class="menu-group"><h3>${esc(groupEntry.name)}</h3>${rows}</div>`
    })
    .join('')
  const basket =
    orderable && (project.ordering.mode === 'whatsapp' || project.ordering.mode === 'email')
      ? `<div class="basket-bar" data-basket hidden><p><span data-basket-count>0</span> article(s)</p><button type="button" class="btn btn-on-primary" data-checkout>Envoyer la commande</button></div>`
      : ''
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'intro')}${html}${basket}</div>`
}

function testimonials(block: Block): string {
  const quotes = list(block, 'items')
    .map((entry) =>
      block.variant === 'featured'
        ? `<blockquote class="quote">“${esc(entry.fields.quote)}”<footer><strong>${esc(entry.fields.author)}</strong> · ${esc(entry.fields.role)}</footer></blockquote>`
        : `<blockquote class="card"><p>${esc(entry.fields.quote)}</p><footer><strong>${esc(entry.fields.author)}</strong><br><span class="muted">${esc(entry.fields.role)}</span></footer></blockquote>`,
    )
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title')}<p class="muted">Textes d’exemple à remplacer par de vrais avis, avec l’accord des personnes. Ce ne sont pas des témoignages réels.</p><div class="${block.variant === 'featured' ? 'feature-list' : 'grid-3'}">${quotes}</div></div>`
}

function team(block: Block): string {
  const people = list(block, 'people')
    .map(
      (entry) =>
        `<article class="card">${media(entry.fields.image, entry.fields.name, entry.fields.name)}<h3>${esc(entry.fields.name)}</h3><p class="kicker">${esc(entry.fields.role)}</p><p class="muted">${esc(entry.fields.bio)}</p></article>`,
    )
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'intro')}<div class="${block.variant === 'list' ? 'feature-list' : 'grid-3'}">${people}</div></div>`
}

function gallery(block: Block, project: Project): string {
  const shots = list(block, 'shots')
    .map((entry) => {
      const src = safeImg(entry.fields.src)
      const figure = src
        ? `<img src="${esc(src)}" alt="${esc(entry.fields.alt || entry.fields.caption)}">`
        : media('', entry.fields.alt, entry.fields.caption || project.business.name)
      return `<button type="button" class="shot" data-full="${esc(src)}" data-alt="${esc(entry.fields.alt)}">${figure}<span class="muted">${esc(entry.fields.caption)}</span></button>`
    })
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title')}<div class="gallery-grid">${shots}</div></div><div class="lightbox" hidden><button type="button" class="btn btn-ghost lightbox-close">Fermer</button><img alt=""></div>`
}

function timeline(block: Block): string {
  const events = list(block, 'events')
    .map(
      (entry) =>
        `<li><span class="year">${esc(entry.fields.year)}</span><div><h3>${esc(entry.fields.title)}</h3><p class="muted">${esc(entry.fields.text)}</p></div></li>`,
    )
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title')}<ol class="timeline">${events}</ol></div>`
}

function stats(block: Block, project: Project): string {
  const cells = list(block, 'stats')
    .map((entry) => {
      const value = entry.fields.value || '0'
      const suffix = entry.fields.suffix || ''
      const shown = project.motion.counters
        ? `<span class="counter" data-to="${esc(value)}" data-suffix="${esc(suffix)}">${esc(value)}${esc(suffix)}</span>`
        : `${esc(value)}${esc(suffix)}`
      return `<article class="${block.variant === 'cards' ? 'card' : ''}"><p class="stat-value">${shown}</p><p class="muted">${esc(entry.fields.label)}</p></article>`
    })
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title')}<div class="stats">${cells}</div></div>`
}

function faq(block: Block): string {
  const items = list(block, 'items')
    .map((entry) => {
      if (block.variant === 'grid') {
        return `<article class="card faq-item"><h3>${esc(entry.fields.q)}</h3><div class="faq-panel"><p>${esc(entry.fields.a)}</p></div></article>`
      }
      return `<div class="faq-item"><button type="button" aria-expanded="false"><span>${esc(entry.fields.q)}</span><span aria-hidden="true">+</span></button><div class="faq-panel" hidden><p>${esc(entry.fields.a)}</p></div></div>`
    })
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title')}<div class="${block.variant === 'grid' ? 'faq-grid' : ''}">${items}</div></div>`
}

function cta(block: Block, options: PageOptions): string {
  return `<div class="wrap grid-2"><div><p class="kicker">${esc(field(block, 'kicker'))}</p><h2>${esc(field(block, 'title'))}</h2><p>${esc(field(block, 'text'))}</p></div><div class="cluster">${button(field(block, 'button'), field(block, 'href'), 'btn btn-on-primary', options)}</div></div>`
}

function contact(block: Block, project: Project): string {
  const info = addressBlock(project)
  const form = formMarkup(project, 'contact', field(block, 'submit') || 'Envoyer', [])
  if (block.variant === 'simple') return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'text')}${form}</div>`
  return `<div class="wrap grid-2"><div>${sectionHead(block, 'kicker', 'title', 'text')}${info}</div><div class="panel" style="padding:1.2rem">${form}</div></div>`
}

function mapBlock(block: Block, project: Project): string {
  const query = mapQuery([project.business.address, project.business.postalCode, project.business.city, 'France'])
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
  const frame = `<iframe class="map-frame" title="Carte de ${esc(project.business.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${esc(src)}"></iframe>`
  if (block.variant === 'card') {
    return `<div class="wrap grid-2"><div>${sectionHead(block, '', 'title', 'text')}</div><div class="card">${frame}</div></div>`
  }
  return `<div class="wrap">${sectionHead(block, '', 'title', 'text')}${frame}</div>`
}

function hours(block: Block, project: Project): string {
  const rows = project.business.hours
    .map((day) => `<tr><th>${esc(day.day)}</th><td>${esc(formatDay(day))}</td></tr>`)
    .join('')
  const table =
    block.variant === 'cards'
      ? `<div class="grid-3">${project.business.hours.map((day) => `<article class="card"><h3>${esc(day.day)}</h3><p>${esc(formatDay(day))}</p></article>`).join('')}</div>`
      : `<table class="hours-table">${rows}</table>`
  return `<div class="wrap">${sectionHead(block, '', 'title')}${table}${field(block, 'note') ? `<p class="muted">${esc(field(block, 'note'))}</p>` : ''}</div>`
}

function newsletter(block: Block, project: Project): string {
  const form = `<form class="form-grid" ${formAttrs(project)}><label><span class="muted">${esc(field(block, 'placeholder') || 'E-mail')}</span><input name="email" type="email" required placeholder="${esc(field(block, 'placeholder') || 'vous@exemple.fr')}"></label><button class="btn" type="submit">${esc(field(block, 'button') || 'S’inscrire')}</button><p class="form-status" role="status"></p><p class="muted">${esc(field(block, 'note'))}</p></form>`
  return `<div class="wrap ${block.variant === 'card' ? 'card' : ''}" style="${block.variant === 'card' ? 'padding:1.4rem' : ''}">${sectionHead(block, 'kicker', 'title', 'text')}${form}</div>`
}

function logos(block: Block): string {
  const items = list(block, 'logos')
    .map((entry) => {
      const src = safeImg(entry.fields.image)
      return src ? `<img src="${esc(src)}" alt="${esc(entry.fields.name)}">` : `<span class="logo-chip">${esc(entry.fields.name)}</span>`
    })
    .join('')
  return `<div class="wrap"><p class="kicker">${esc(field(block, 'title'))}</p><div class="${block.variant === 'grid' ? 'grid-4' : 'logo-row'}">${items}</div></div>`
}

function about(block: Block): string {
  const copy = `<div><p class="kicker">${esc(field(block, 'kicker'))}</p><h2>${esc(field(block, 'title'))}</h2><div class="prose">${paragraphs(field(block, 'body'))}</div></div>`
  const picture = `<figure>${media(field(block, 'image'), field(block, 'imageAlt'), field(block, 'title'))}<figcaption class="muted">${esc(field(block, 'caption'))}</figcaption></figure>`
  if (block.variant === 'stacked') return `<div class="wrap">${copy}${picture}</div>`
  return `<div class="wrap grid-2">${copy}${picture}</div>`
}

function booking(block: Block, project: Project): string {
  const services = list(block, 'services').map((entry) => entry.fields.name).filter(Boolean)
  const form = formMarkup(project, 'booking', field(block, 'submit') || 'Envoyer la demande', services)
  const note = `<p class="muted">${esc(field(block, 'note'))}</p>`
  if (block.variant === 'simple') {
    return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'text')}${form}${note}</div>`
  }
  return `<div class="wrap grid-2"><div>${sectionHead(block, 'kicker', 'title', 'text')}${note}</div><div class="panel" style="padding:1.2rem">${form}</div></div>`
}

function catalog(block: Block, project: Project): string {
  const products = list(block, 'products')
    .map((entry) => {
      const own = entry.fields.link || ''
      let action = ''
      if (project.ordering.mode === 'link') {
        const href = payHref(own) || payHref(project.ordering.paymentLink)
        if (href) action = `<a class="btn btn-small" href="${esc(href)}">Commander</a>`
      } else if (project.ordering.mode === 'whatsapp' || project.ordering.mode === 'email') {
        action = `<button type="button" class="btn btn-small" data-add="1" data-name="${esc(entry.fields.name)}" data-price="${esc(entry.fields.price)}">Ajouter</button>`
      }
      return `<article class="card product">${entry.fields.badge ? `<p class="badge">${esc(entry.fields.badge)}</p>` : ''}${media(entry.fields.image, entry.fields.name, entry.fields.name)}<h3>${esc(entry.fields.name)}</h3><p class="muted">${esc(entry.fields.description)}</p><p><strong>${esc(entry.fields.price)}</strong></p>${action}</article>`
    })
    .join('')
  const basket =
    project.ordering.mode === 'whatsapp' || project.ordering.mode === 'email'
      ? `<div class="basket-bar" data-basket hidden><p><span data-basket-count>0</span> article(s)</p><button type="button" class="btn btn-on-primary" data-checkout>Envoyer la commande</button></div>`
      : ''
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'intro')}<div class="${block.variant === 'list' ? 'feature-list' : 'catalog-grid'}">${products}</div>${basket}<p class="muted">${esc(project.ordering.note)}</p></div>`
}

function blog(block: Block, options: PageOptions, articles: ArticlePage[]): string {
  const cards = list(block, 'posts')
    .map((entry) => {
      const article = articles.find((item) => item.title === entry.fields.title)
      const href = article ? safeHref(article.slug, options.linkMode) : '#'
      return `<article class="card">${media(entry.fields.image, entry.fields.title, entry.fields.title)}<p class="kicker">${esc(entry.fields.date)}</p><h3><a href="${esc(href)}">${esc(entry.fields.title)}</a></h3><p class="muted">${esc(entry.fields.excerpt)}</p></article>`
    })
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'intro')}<div class="${block.variant === 'list' ? 'feature-list' : 'grid-3'}">${cards}</div></div>`
}

function portfolio(block: Block): string {
  const works = list(block, 'works')
    .map(
      (entry) =>
        `<article class="card">${media(entry.fields.image, entry.fields.title, entry.fields.title)}<p class="kicker">${esc(entry.fields.category)}</p><h3>${esc(entry.fields.title)}</h3><p class="muted">${esc(entry.fields.description)}</p></article>`,
    )
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title', 'intro')}<div class="${block.variant === 'list' ? 'feature-list' : 'grid-3'}">${works}</div></div>`
}

function video(block: Block): string {
  const embed = embedUrl(field(block, 'url'))
  const frame = embed
    ? `<iframe class="video-frame" src="${esc(embed)}" title="${esc(field(block, 'title'))}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
    : `<div class="card"><p>Ajoutez un lien YouTube ou Vimeo pour afficher la vidéo.</p></div>`
  const copy = `<div><h2>${esc(field(block, 'title'))}</h2><p>${esc(field(block, 'text'))}</p><p class="muted">${esc(field(block, 'caption'))}</p></div>`
  if (block.variant === 'split') return `<div class="wrap grid-2">${copy}<div>${frame}</div></div>`
  return `<div class="wrap">${copy}${frame}</div>`
}

function carousel(block: Block, project: Project): string {
  const slides = list(block, 'slides')
    .map(
      (entry) =>
        `<article class="slide">${entry.fields.image ? media(entry.fields.image, entry.fields.title, entry.fields.title) : ''}<p class="kicker">${esc(entry.fields.kicker)}</p><h3>${esc(entry.fields.title)}</h3><p>${esc(entry.fields.text)}</p></article>`,
    )
    .join('')
  return `<div class="wrap"><div class="carousel" data-autoplay="${project.motion.carouselAutoplay ? 'true' : 'false'}"><div class="carousel-track">${slides}</div><button type="button" class="carousel-prev" aria-label="Précédent">‹</button><button type="button" class="carousel-next" aria-label="Suivant">›</button><div class="carousel-dots"></div></div></div>`
}

function loyalty(block: Block, project: Project): string {
  const goal = Number.parseInt(field(block, 'goal') || '8', 10)
  const config = safeJson({
    goal: Number.isFinite(goal) && goal > 0 ? goal : 8,
    pin: field(block, 'pin'),
    reward: field(block, 'reward'),
    title: project.business.name,
  })
  return `<div class="wrap"><div class="${block.variant === 'simple' ? 'card' : 'pass'}"><p class="kicker">${esc(field(block, 'kicker'))}</p><h2>${esc(field(block, 'title') || project.business.name)}</h2><p>${esc(field(block, 'reward'))}</p><div class="stamps" aria-live="polite"></div><p class="loyalty-status"></p><div class="cluster"><button type="button" class="btn" id="stamp-btn">Ajouter un tampon</button><button type="button" class="btn btn-ghost" id="reset-btn">Remettre à zéro</button></div><p class="muted">${esc(field(block, 'note'))}</p></div><script type="application/json" id="loyalty-config">${config}</script></div>`
}

function links(block: Block, options: PageOptions): string {
  const avatar = safeImg(field(block, 'avatar'))
  const photo = avatar
    ? `<img class="avatar" src="${esc(avatar)}" alt="">`
    : `<div class="avatar-fallback" aria-hidden="true">${esc((field(block, 'title') || 'A').slice(0, 1))}</div>`
  const stack = list(block, 'links')
    .map(
      (entry) =>
        `<a class="link-pill" href="${esc(safeHref(entry.fields.url, options.linkMode))}"><span>${esc(entry.fields.label)}</span><small class="muted">${esc(entry.fields.note)}</small></a>`,
    )
    .join('')
  return `<div class="wrap linkhub">${photo}<p class="kicker">${esc(field(block, 'kicker'))}</p><h1>${esc(field(block, 'title'))}</h1><p>${esc(field(block, 'bio'))}</p><div class="link-stack">${stack}</div></div>`
}

function textBlock(block: Block): string {
  return `<div class="wrap prose"><p class="kicker">${esc(field(block, 'kicker'))}</p><h2>${esc(field(block, 'title'))}</h2>${paragraphs(field(block, 'body'))}</div>`
}

function steps(block: Block): string {
  const items = list(block, 'steps')
    .map((entry) => `<li><h3>${esc(entry.fields.title)}</h3><p class="muted">${esc(entry.fields.text)}</p></li>`)
    .join('')
  return `<div class="wrap">${sectionHead(block, 'kicker', 'title')}<ol class="steps">${items}</ol></div>`
}

function footer(block: Block, project: Project, options: PageOptions): string {
  const social = [
    project.business.instagram ? `<a href="${esc(safeHref(project.business.instagram, options.linkMode))}">Instagram</a>` : '',
    project.business.facebook ? `<a href="${esc(safeHref(project.business.facebook, options.linkMode))}">Facebook</a>` : '',
    project.business.phone ? `<a href="tel:${esc(project.business.phone.replace(/\s/g, ''))}">${esc(project.business.phone)}</a>` : '',
    project.business.email ? `<a href="mailto:${esc(project.business.email)}">${esc(project.business.email)}</a>` : '',
  ]
    .filter(Boolean)
    .join('')
  const nav = list(block, 'links')
    .map((entry) => `<a href="${esc(safeHref(entry.fields.href, options.linkMode))}">${esc(entry.fields.label)}</a>`)
    .join('')
  if (block.variant === 'simple') {
    return `<div class="wrap"><p>${esc(field(block, 'note'))}</p></div>`
  }
  if (block.variant === 'center') {
    return `<div class="wrap center-footer"><strong>${esc(project.business.name)}</strong><p>${esc(field(block, 'blurb'))}</p><div class="footer-links">${nav}</div><p class="muted">${esc(field(block, 'note'))}</p></div>`
  }
  return `<div class="wrap footer-grid"><div><strong>${esc(project.business.name)}</strong><p>${esc(field(block, 'blurb'))}</p><p class="muted">${esc(field(block, 'note'))}</p></div><div class="footer-links">${nav}</div><div class="footer-links">${social}<p class="muted">${esc([project.business.address, project.business.postalCode, project.business.city].filter(Boolean).join(' '))}</p></div></div>`
}

function addressBlock(project: Project): string {
  const bits = [
    project.business.address,
    [project.business.postalCode, project.business.city].filter(Boolean).join(' '),
    project.business.phone,
    project.business.email,
  ].filter(Boolean)
  return `<div>${bits.map((bit) => `<p>${esc(bit)}</p>`).join('')}</div>`
}

function formMarkup(project: Project, kind: 'contact' | 'booking', submit: string, services: string[]): string {
  const serviceField = services.length
    ? `<label><span>Prestation</span><select name="prestation">${services.map((service) => `<option>${esc(service)}</option>`).join('')}</select></label>`
    : ''
  const bookingFields =
    kind === 'booking'
      ? `${serviceField}<label><span>Date souhaitée</span><input name="date" type="date"></label><label><span>Heure souhaitée</span><input name="heure" type="time"></label>`
      : ''
  return `<form class="form-grid" ${formAttrs(project)}><label><span>Nom</span><input name="nom" required autocomplete="name"></label><label><span>Téléphone</span><input name="telephone" type="tel" autocomplete="tel"></label><label><span>E-mail</span><input name="email" type="email" autocomplete="email"></label>${bookingFields}<label><span>Message</span><textarea name="message" required></textarea></label><button class="btn" type="submit">${esc(submit)}</button><p class="form-status" role="status"></p><p class="muted">${esc(formHelp(project))}</p></form>`
}

function formAttrs(project: Project): string {
  const action = resolveForm(project)
  if (action.mode === 'post') {
    return `action="${esc(action.action)}" method="post" data-form="post"`
  }
  return `data-form="mailto" data-email="${esc(project.business.email)}" data-subject="${esc(project.contactForm.subject || 'Message depuis le site')}"`
}

export function resolveForm(project: Project): { mode: 'mailto' | 'post'; action: string } {
  if (project.contactForm.mode === 'formspree') {
    const id = project.contactForm.formspreeId.trim()
    if (/^[a-zA-Z0-9]+$/.test(id)) return { mode: 'post', action: `https://formspree.io/f/${id}` }
  }
  if (project.contactForm.mode === 'endpoint') {
    try {
      const url = new URL(project.contactForm.endpoint.trim())
      if (url.protocol === 'https:' || url.protocol === 'http:') return { mode: 'post', action: url.toString() }
    } catch {
      return { mode: 'mailto', action: '' }
    }
  }
  return { mode: 'mailto', action: '' }
}

function payHref(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString()
  } catch {
    return ''
  }
  return ''
}

function formHelp(project: Project): string {
  const action = resolveForm(project)
  if (action.mode === 'post' && action.action.includes('formspree.io')) {
    return 'Le message est envoyé via Formspree, le service dont vous avez collé l’identifiant.'
  }
  if (action.mode === 'post') return 'Le message est envoyé vers l’adresse que vous avez indiquée.'
  return 'Le message s’ouvre dans l’application e-mail du visiteur. Aucun serveur ne le réceptionne.'
}

function formatDay(day: DayHours): string {
  if (day.closed || day.slots.length === 0) return 'Fermé'
  return day.slots.map((slot) => `${slot.open}–${slot.close}`).join(' · ')
}

function group(items: ListItem[], key: string): { name: string; items: ListItem[] }[] {
  const order: string[] = []
  const map = new Map<string, ListItem[]>()
  for (const entry of items) {
    const name = entry.fields[key] || 'Autres'
    if (!map.has(name)) {
      map.set(name, [])
      order.push(name)
    }
    map.get(name)?.push(entry)
  }
  return order.map((name) => ({ name, items: map.get(name) ?? [] }))
}

function documentShell(
  project: Project,
  input: { slug: string; title: string; description: string; main: string; options: PageOptions },
): string {
  const business = project.business
  const base = project.seo.canonicalBase.replace(/\/$/, '')
  const file = pageFile(input.slug)
  const canonical = base ? `${base}/${file}` : ''
  const motion = project.motion
  const nav = project.pages
    .filter((page) => page.showInNav)
    .map((page) => {
      const current = page.slug === input.slug ? ' aria-current="page"' : ''
      return `<a href="${esc(safeHref(page.slug, input.options.linkMode))}"${current}>${esc(page.navLabel)}</a>`
    })
    .join('')
  const cta = project.chrome.ctaLabel
    ? `<a class="btn btn-small" href="${esc(safeHref(project.chrome.ctaHref, input.options.linkMode))}">${esc(project.chrome.ctaLabel)}</a>`
    : ''
  const phone =
    project.chrome.showPhone && business.phone
      ? `<a class="header-phone" href="tel:${esc(business.phone.replace(/\s/g, ''))}">${esc(business.phone)}</a>`
      : ''
  const logo = safeImg(project.logo)
  const brand = `<a class="brand" href="${esc(safeHref('index', input.options.linkMode))}">${logo ? `<img class="brand-logo" data-logo="1" src="${esc(logo)}" alt="">` : ''}<span>${esc(business.name)}</span></a>`
  const showNav = project.pages.filter((page) => page.showInNav).length > 1
  const json = safeJson(schemaData(project, canonical, logo && !logo.startsWith('data:') ? logo : undefined))
  const css = input.options.inlineCss
    ? `<style>${input.options.inlineCss}</style>`
    : `<link rel="stylesheet" href="${esc(input.options.cssHref || 'assets/styles.css')}">`
  const js = input.options.inlineJs
    ? `<script>${input.options.inlineJs}</script>`
    : `<script src="${esc(input.options.jsHref || 'assets/app.js')}" defer></script>`
  const manifest = project.pwa ? `<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="${esc(project.tokens.primary)}"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">` : ''
  const ogImage = safeImg(project.seo.ogImage)
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(input.title)}</title>
<meta name="description" content="${esc(input.description)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta property="og:title" content="${esc(input.title)}">
<meta property="og:description" content="${esc(input.description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
${manifest}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${esc(`https://fonts.googleapis.com/css2?${project.tokens.googleQuery}&display=swap`)}" rel="stylesheet">
${css}
<script type="application/ld+json">${json}</script>
<script>document.documentElement.classList.add('js')</script>
</head>
<body data-style="${esc(project.styleId)}" data-spacing="${esc(project.tokens.spacing)}" data-preview="${input.options.preview ? 'on' : 'off'}" data-pwa="${project.pwa ? 'on' : 'off'}" data-gradient="${motion.gradient ? 'on' : 'off'}" data-transition="${motion.pageTransition ? 'on' : 'off'}" data-parallax="${motion.parallax ? 'on' : 'off'}" data-typing="${motion.typing ? 'on' : 'off'}" data-counters="${motion.counters ? 'on' : 'off'}" data-progress="${motion.scrollProgress ? 'on' : 'off'}" data-hover="${esc(motion.hover)}" data-micro="${motion.buttonMicro ? 'on' : 'off'}" data-order="${esc(project.ordering.mode)}" data-shop="${esc(project.shop)}" data-tax="${esc(String(project.taxRate || 0))}" data-shipping="${esc(String(project.shippingFlat || 0))}" data-whatsapp="${esc(project.business.whatsapp || project.business.phone)}" data-email="${esc(project.business.email)}" data-header="${esc(project.chrome.headerVariant)}">
<a class="skip" href="#contenu">Aller au contenu</a>
${motion.scrollProgress ? '<div class="scroll-progress" aria-hidden="true"></div>' : ''}
${project.chrome.announcement ? `<div class="announce">${esc(project.chrome.announcement)}</div>` : ''}
<header class="site-header" data-variant="${esc(project.chrome.headerVariant)}">
  <div class="wrap header-inner">
    ${brand}
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav">${showNav ? nav : ''}${phone}${cta}</nav>
  </div>
</header>
<main id="contenu">
${input.main}
${project.pwa ? '<div class="wrap cluster"><button type="button" class="btn btn-ghost" id="install-btn" hidden>Installer sur l’écran d’accueil</button></div>' : ''}
</main>
${js}
</body>
</html>`
}

function schemaData(project: Project, canonical: string, image?: string): Record<string, unknown> {
  const business = project.business
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': business.schemaType || 'LocalBusiness',
    name: business.name,
    description: project.seo.description,
    telephone: business.phone || undefined,
    email: business.email || undefined,
    priceRange: business.priceRange || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || undefined,
      addressLocality: business.city,
      postalCode: business.postalCode || undefined,
      addressCountry: 'FR',
    },
    openingHours: openingHours(business.hours),
  }
  if (canonical) data.url = canonical
  if (image) data.image = image
  return data
}

const DAY_CODE: Record<string, string> = {
  Lundi: 'Mo',
  Mardi: 'Tu',
  Mercredi: 'We',
  Jeudi: 'Th',
  Vendredi: 'Fr',
  Samedi: 'Sa',
  Dimanche: 'Su',
}

export function openingHours(days: DayHours[]): string[] {
  const result: string[] = []
  for (const day of days) {
    const code = DAY_CODE[day.day]
    if (!code || day.closed) continue
    for (const slot of day.slots) {
      if (slot.open && slot.close) result.push(`${code} ${slot.open}-${slot.close}`)
    }
  }
  return result
}

export function fontStylesheet(project: Project): string {
  return `https://fonts.googleapis.com/css2?${project.tokens.googleQuery}&display=swap`
}
