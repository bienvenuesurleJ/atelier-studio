import type { AnimSpec } from '../domain/types'
import { esc } from './html'

export function animDataAttrs(spec: AnimSpec | null | undefined): string {
  if (!spec || spec.effect === 'none') return ''
  return [
    ` data-fx="${esc(spec.effect)}"`,
    ` data-trigger="${esc(spec.trigger)}"`,
    ` data-duration="${num(spec.duration)}"`,
    ` data-delay="${num(spec.delay)}"`,
    ` data-ease="${esc(spec.easing)}"`,
    ` data-distance="${num(spec.distance)}"`,
    ` data-intensity="${num(spec.intensity)}"`,
    ` data-repeat="${num(spec.repeat)}"`,
    ` data-stagger="${num(spec.stagger)}"`,
    ` data-dir="${esc(spec.direction)}"`,
    ` data-stiffness="${num(spec.stiffness ?? 180)}"`,
    ` data-damping="${num(spec.damping ?? 22)}"`,
    ` data-mass="${num(spec.mass ?? 1)}"`,
    ` data-fx-desktop="${spec.desktop ? '1' : '0'}"`,
    ` data-fx-tablet="${spec.tablet ? '1' : '0'}"`,
    ` data-fx-mobile="${spec.mobile ? '1' : '0'}"`,
  ].join('')
}

function num(value: number): string {
  return String(Number.isFinite(value) ? value : 0)
}
