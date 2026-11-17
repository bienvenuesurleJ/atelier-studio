import type { ElementStyle, FreeNode } from '../domain/types'
import { styleDeclarations } from './elementCss'

export function freeCss(nodes: FreeNode[]): string {
  const rules: string[] = []
  for (const node of nodes) {
    const parent = nodes.find((item) => item.id === node.parentId)
    const parentLayout = parent?.layout ?? 'free'
    const sel = `[data-node="${cssIdent(node.id)}"]`
    rules.push(`${sel}{${boxRule(node.box.desktop, parentLayout)}${styleDeclarations(node.style)}}`)
    if (node.box.tablet) rules.push(`@media (max-width:1024px){${sel}{${boxRule(node.box.tablet, parentLayout)}${styleDeclarations(node.styleTablet)}}}`)
    if (node.box.mobile || node.styleMobile) {
      rules.push(`@media (max-width:760px){${sel}{${node.box.mobile ? boxRule(node.box.mobile, parentLayout) : ''}${styleDeclarations(node.styleMobile)}}}`)
    }
    if (node.layout === 'grid') {
      rules.push(`${sel}{grid-template-columns:repeat(${clampCols(node.columns)},minmax(0,1fr));gap:${num(node.gap)}px}`)
      const mobileCols = node.columns > 1 ? 1 : node.columns
      rules.push(`@media (max-width:760px){${sel}{grid-template-columns:repeat(${clampCols(mobileCols)},minmax(0,1fr))}}`)
    }
    if (node.layout === 'stack') rules.push(`${sel}{gap:${num(node.gap)}px}`)
    const rot = node.box.desktop.r || 0
    rules.push(`${sel} > .free-rot{transform:rotate(${num(rot)}deg)}`)
    if (node.box.tablet) rules.push(`@media (max-width:1024px){${sel} > .free-rot{transform:rotate(${num(node.box.tablet.r)}deg)}}`)
    if (node.box.mobile) rules.push(`@media (max-width:760px){${sel} > .free-rot{transform:rotate(${num(node.box.mobile.r)}deg)}}`)
  }
  return rules.join('\n')
}

export function projectFreeCss(pages: { blocks: { freeNodes?: FreeNode[] }[] }[]): string {
  return pages.map((page) => page.blocks.map((block) => freeCss(block.freeNodes ?? [])).join('\n')).join('\n')
}

function boxRule(box: FreeNode['box']['desktop'], parentLayout: string): string {
  if (parentLayout === 'grid' || parentLayout === 'stack') return `position:relative;z-index:${num(box.z)};`
  return `position:absolute;left:${num(box.x)}px;top:${num(box.y)}px;width:${num(box.w)}px;height:${num(box.h)}px;z-index:${num(box.z)};`
}

function num(value: number): number {
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : 0
}

function clampCols(value: number): number {
  return Math.min(6, Math.max(1, Math.round(value || 1)))
}

function cssIdent(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '')
}

export function freeNodeStyle(style: ElementStyle | undefined): string {
  return styleDeclarations(style)
}
