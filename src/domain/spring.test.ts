import { describe, expect, it } from 'vitest'
import { simulateSpring } from './spring'

describe('ressort physique', () => {
  it('dépasse la cible quand l’amortissement est faible, puis se rapproche', () => {
    const values = simulateSpring(0, 1, { stiffness: 220, damping: 8, mass: 1 })
    expect(Math.max(...values)).toBeGreaterThan(1.05)
    expect(values.at(-1)!).toBeGreaterThan(0.9)
    expect(values.at(-1)!).toBeLessThan(1.1)
  })

  it('reste sous la cible avec un amortissement fort', () => {
    const values = simulateSpring(0, 1, { stiffness: 120, damping: 40, mass: 1 })
    expect(Math.max(...values)).toBeLessThanOrEqual(1.02)
    expect(values.at(-1)!).toBeGreaterThan(0.95)
  })
})
