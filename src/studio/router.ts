export type Route =
  | { name: 'dashboard' }
  | { name: 'projects' }
  | { name: 'new' }
  | { name: 'editor'; id: string }
  | { name: 'films' }
  | { name: 'business' }
  | { name: 'settings' }
  | { name: 'admin' }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  if (path === '/projets') return { name: 'projects' }
  if (path === '/nouveau') return { name: 'new' }
  if (path === '/activite') return { name: 'business' }
  if (path === '/reglages') return { name: 'settings' }
  if (path === '/admin') return { name: 'admin' }
  if (path === '/video' || path.startsWith('/video/') || (path.startsWith('/projet/') && path.endsWith('/video'))) return { name: 'films' }
  if (path.startsWith('/projet/')) return { name: 'editor', id: decodeURIComponent(path.slice('/projet/'.length)) }
  return { name: 'dashboard' }
}

export function toHash(route: Route): string {
  if (route.name === 'projects') return '/projets'
  if (route.name === 'new') return '/nouveau'
  if (route.name === 'business') return '/activite'
  if (route.name === 'settings') return '/reglages'
  if (route.name === 'admin') return '/admin'
  if (route.name === 'editor') return `/projet/${encodeURIComponent(route.id)}`
  if (route.name === 'films') return '/video'
  return '/'
}
