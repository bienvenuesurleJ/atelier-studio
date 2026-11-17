import { describe, expect, it } from 'vitest'
import { bring, defaultBox, smartOrigin, snapBox } from './placement'
import type { Clip } from './model'

const clip = { x: 10, y: 10, w: 20, h: 10, rotation: 0, opacity: 1 } as Clip

describe('calques vidéo', () => {
  it('décale un nouvel élément et l’aimante au centre', () => {
    expect(smartOrigin(0)).toEqual({ x: 10, y: 12 })
    expect(smartOrigin(1).x).toBeGreaterThan(smartOrigin(0).x)
    const snapped = snapBox({ x: 39, y: 10, w: 20, h: 10, rotation: 0, opacity: 1 }, [])
    expect(snapped.box.x).toBe(40)
    expect(defaultBox(clip, 'text').x).toBe(10)
  })

  it('réordonne un calque vers l’avant', () => {
    const ranks = bring([{ id: 'a', z: 0 }, { id: 'b', z: 1 }, { id: 'c', z: 2 }], 'a', 'front')
    expect(ranks.at(-1)?.id).toBe('a')
    expect(ranks.map((item) => item.z)).toEqual([0, 1, 2])
  })
})
