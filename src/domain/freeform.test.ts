import { describe, expect, it } from 'vitest'
import { alignBoxes, distributeBoxes, groupNodes, nudgeBox, snapPoint } from './freeform'
import type { FreeBox, FreeNode } from './types'

const box = (x: number, y: number, w = 100, h = 40): FreeBox => ({ x, y, w, h, r: 0, z: 1 })

describe('placement libre', () => {
  it('aligne, distribue et accroche', () => {
    const aligned = alignBoxes([box(10, 0), box(40, 20), box(5, 8)], 'left')
    expect(aligned.every((item) => item.x === 5)).toBe(true)
    const row = distributeBoxes([box(0, 0, 20, 10), box(50, 0, 20, 10), box(100, 0, 20, 10)], 'h')
    expect(row[0].x).toBe(0)
    expect(row[2].x).toBe(100)
    expect(row[1].x).toBeGreaterThan(20)
    expect(row[1].x).toBeLessThan(80)
    const snapped = snapPoint(10, 14, 40, 20, [48], [0])
    expect(snapped.x).toBe(8)
    expect(snapped.guidesX).toContain(48)
    expect(nudgeBox(box(10, 10), 'ArrowRight', 10).x).toBe(20)
  })

  it('groupe des éléments et ramène leurs coordonnées au groupe', () => {
    const nodes = [node('a', 10, 10), node('b', 80, 30)]
    const grouped = groupNodes(nodes, ['a', 'b'], 'g')
    const group = grouped.find((item) => item.id === 'g')
    const child = grouped.find((item) => item.id === 'a')
    expect(group?.kind).toBe('container')
    expect(child?.parentId).toBe('g')
    expect(child?.box.desktop.x).toBe(0)
    expect(group?.box.desktop.x).toBe(10)
  })
})

function node(id: string, x: number, y: number): FreeNode {
  return {
    id,
    parentId: null,
    kind: 'text',
    name: id,
    text: id,
    href: '',
    src: '',
    alt: '',
    locked: false,
    hidden: false,
    layout: 'free',
    columns: 2,
    gap: 12,
    box: { desktop: box(x, y) },
    style: {},
    motion: null,
  }
}
