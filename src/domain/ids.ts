export function uid(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 10)
  const time = Date.now().toString(36).slice(-4)
  return `${prefix}-${rand}${time}`
}

export function slugify(input: string): string {
  const s = input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return s || 'page'
}

export function uniqueSlug(base: string, used: Set<string>): string {
  const root = slugify(base)
  if (!used.has(root) && root !== 'assets') return root
  let i = 2
  while (used.has(`${root}-${i}`)) i += 1
  return `${root}-${i}`
}

export function pageFile(slug: string): string {
  return slug === 'index' ? 'index.html' : `${slug}.html`
}
