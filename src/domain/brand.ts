import type { Project } from './types'
import type { Film } from '../video/model'

export function applyBrandToFilm(film: Film, project: Project): Film {
  return {
    ...film,
    brand: {
      ...film.brand,
      name: project.business.name || film.brand.name,
      city: project.business.city || film.brand.city,
      primary: project.tokens.primary,
      accent: project.tokens.accent,
      bg: project.tokens.bg,
      text: project.tokens.text,
      font: project.tokens.fontHeadingCss || film.brand.font,
      logo: project.logo || film.brand.logo,
    },
  }
}
