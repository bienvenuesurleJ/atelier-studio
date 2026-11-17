import { describe, expect, it } from 'vitest'
import { fitCrop, focalDeclaration, fullCrop } from './imageFrame'

describe('cadrage image', () => {
  it('verrouille un recadrage carré dans le cadre', () => {
    const crop = fitCrop(1, { x: 0, y: 0, w: 80, h: 40 })
    expect(crop.w).toBeCloseTo(crop.h, 3)
    expect(crop.x).toBeGreaterThanOrEqual(0)
    expect(crop.y).toBeGreaterThanOrEqual(0)
    expect(crop.x + crop.w).toBeLessThanOrEqual(100)
  })

  it('écrit object-position en pourcentages', () => {
    expect(focalDeclaration({ x: 30, y: 70 })).toBe('object-position:30% 70%')
    expect(fullCrop()).toEqual({ x: 0, y: 0, w: 100, h: 100 })
  })
})
