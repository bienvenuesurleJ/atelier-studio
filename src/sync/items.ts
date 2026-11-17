import type { StudioState } from '@/domain/types'
import type { FilmLibrary } from '@/video/model'
import { canonicalJson, type StampItem } from './memory'

export function studioItems(state: StudioState): StampItem[] {
  return [
    ...state.projects.map((project) => ({ key: `project:${project.id}`, updatedAt: project.updatedAt, json: canonicalJson(project) })),
    ...state.prospects.map((prospect) => ({ key: `prospect:${prospect.id}`, updatedAt: prospect.updatedAt, json: canonicalJson(prospect) })),
    ...state.quotes.map((quote) => ({ key: `quote:${quote.id}`, json: canonicalJson(quote) })),
    ...state.plans.map((plan) => ({ key: `plan:${plan.id}`, json: canonicalJson(plan) })),
    { key: 'settings', json: canonicalJson({ agency: state.agency, rates: state.rates, checklist: state.checklist }) },
  ]
}

export function filmItems(library: FilmLibrary): StampItem[] {
  return library.films.map((film) => ({ key: `film:${film.id}`, updatedAt: film.updatedAt, json: canonicalJson(film) }))
}
