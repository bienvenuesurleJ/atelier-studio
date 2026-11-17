import { createBlock } from './blocks'
import { findFontPair, findPalette, findStyle, tokensFor } from './styles'
import { uid, uniqueSlug } from './ids'
import type { Block, BlockType, ElementStyle, Page, Project, StyleId, TemplateContext, Viewport } from './types'

export function touch(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() }
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items.slice()
  const next = items.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function contextOf(project: Project): TemplateContext {
  return {
    kind: project.kind,
    businessType: project.businessType,
    name: project.business.name,
    city: project.business.city,
    phone: project.business.phone,
    email: project.business.email,
    address: project.business.address,
    postalCode: project.business.postalCode,
  }
}

export function mapPage(project: Project, pageId: string, fn: (page: Page) => Page): Project {
  return touch({
    ...project,
    pages: project.pages.map((page) => (page.id === pageId ? fn(page) : page)),
  })
}

export function updateBlock(project: Project, pageId: string, blockId: string, fn: (block: Block) => Block): Project {
  return mapPage(project, pageId, (page) => ({
    ...page,
    blocks: page.blocks.map((block) => (block.id === blockId ? fn(block) : block)),
  }))
}

export function reorderBlocks(project: Project, pageId: string, from: number, to: number): Project {
  return mapPage(project, pageId, (page) => ({ ...page, blocks: moveItem(page.blocks, from, to) }))
}

export function addBlock(project: Project, pageId: string, type: BlockType, variant?: string): Project {
  const block = createBlock(type, contextOf(project), variant)
  return mapPage(project, pageId, (page) => {
    const footer = page.blocks.findIndex((entry) => entry.type === 'footer')
    const blocks = page.blocks.slice()
    if (footer === -1 || type === 'footer') blocks.push(block)
    else blocks.splice(footer, 0, block)
    return { ...page, blocks }
  })
}

export function removeBlock(project: Project, pageId: string, blockId: string): Project {
  return mapPage(project, pageId, (page) => ({
    ...page,
    blocks: page.blocks.filter((block) => block.id !== blockId),
  }))
}

export function duplicateBlock(project: Project, pageId: string, blockId: string): Project {
  return mapPage(project, pageId, (page) => {
    const index = page.blocks.findIndex((block) => block.id === blockId)
    if (index < 0) return page
    const copy = structuredClone(page.blocks[index])
    copy.id = uid('blk')
    const blocks = page.blocks.slice()
    blocks.splice(index + 1, 0, copy)
    return { ...page, blocks }
  })
}

export function addPage(project: Project, title: string): Project {
  const used = new Set(project.pages.map((page) => page.slug))
  const slug = uniqueSlug(title, used)
  const ctx = contextOf(project)
  const page: Page = {
    id: uid('page'),
    slug,
    title: title.trim() || 'Nouvelle page',
    navLabel: title.trim() || 'Page',
    showInNav: true,
    description: '',
    blocks: [createBlock('text', ctx, 'narrow'), createBlock('footer', ctx, 'simple')],
  }
  page.blocks[0].data.fields.kicker = ''
  page.blocks[0].data.fields.title = page.title
  page.blocks[0].data.fields.body = 'Écrivez ici le contenu de la page.'
  return touch({ ...project, pages: [...project.pages, page] })
}

export function removePage(project: Project, pageId: string): Project {
  if (project.pages.length < 2) return project
  return touch({ ...project, pages: project.pages.filter((page) => page.id !== pageId) })
}

export function reorderPages(project: Project, from: number, to: number): Project {
  return touch({ ...project, pages: moveItem(project.pages, from, to) })
}

export function setStyle(project: Project, styleId: StyleId): Project {
  return touch({
    ...project,
    styleId,
    tokens: tokensFor(styleId, project.paletteId, project.fontPairId),
    chrome: {
      ...project.chrome,
      headerVariant: styleId === 'luxe' || styleId === 'minimal' ? 'center' : project.chrome.headerVariant,
    },
  })
}

export function setPalette(project: Project, paletteId: string | null): Project {
  return touch({
    ...project,
    paletteId,
    tokens: tokensFor(project.styleId, paletteId, project.fontPairId),
  })
}

export function setFontPair(project: Project, fontPairId: string | null): Project {
  return touch({
    ...project,
    fontPairId,
    tokens: tokensFor(project.styleId, project.paletteId, fontPairId),
  })
}

export function setTokenColor(project: Project, key: 'bg' | 'surface' | 'text' | 'muted' | 'primary' | 'accent' | 'border', value: string): Project {
  return touch({
    ...project,
    paletteId: null,
    tokens: { ...project.tokens, [key]: value },
  })
}

export function setField(project: Project, pageId: string, blockId: string, key: string, value: string): Project {
  return updateBlock(project, pageId, blockId, (block) => ({
    ...block,
    data: { ...block.data, fields: { ...block.data.fields, [key]: value } },
  }))
}

export function setElementStyle(
  project: Project,
  pageId: string,
  blockId: string,
  key: string,
  viewport: Viewport,
  patch: ElementStyle,
): Project {
  return updateBlock(project, pageId, blockId, (block) => {
    const current = block.elements?.[key] ?? {}
    return {
      ...block,
      elements: {
        ...block.elements,
        [key]: { ...current, [viewport]: { ...current[viewport], ...patch } },
      },
    }
  })
}

export function duplicateProject(project: Project): Project {
  const copy = structuredClone(project)
  const now = new Date().toISOString()
  copy.id = uid('prj')
  copy.name = `${project.name} (copie)`
  copy.createdAt = now
  copy.updatedAt = now
  return copy
}

export function styleStillKnown(id: StyleId): boolean {
  return findStyle(id).id === id
}

export function paletteKnown(id: string | null): boolean {
  return id === null || Boolean(findPalette(id))
}

export function fontKnown(id: string | null): boolean {
  return id === null || Boolean(findFontPair(id))
}
