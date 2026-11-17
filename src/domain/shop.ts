import type { ProductVariant, Project, ShopProduct } from './types'

export interface CartLine {
  productId: string
  variantId: string
  name: string
  variantName: string
  price: number
  qty: number
}

export function shopProducts(project: Project): ShopProduct[] {
  return Array.isArray(project.products) ? project.products : []
}

export function money(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`
}

export function activeVariant(product: ShopProduct, variantId?: string): ProductVariant | null {
  if (!product.variants.length) return null
  return product.variants.find((item) => item.id === variantId) ?? product.variants[0]
}

export function unitPrice(product: ShopProduct, variantId?: string): number {
  return activeVariant(product, variantId)?.price ?? product.price
}

export function unitStock(product: ShopProduct, variantId?: string): number {
  const variant = activeVariant(product, variantId)
  return variant ? variant.stock : product.stock
}

export function cartTotal(lines: CartLine[]): number {
  return Math.round(lines.reduce((sum, line) => sum + line.price * line.qty, 0) * 100) / 100
}

export function collectionsOf(products: ShopProduct[]): string[] {
  return [...new Set(products.map((product) => product.collection.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'))
}

export function filterProducts(
  products: ShopProduct[],
  query: { collection?: string; sort?: 'prix-asc' | 'prix-desc' | 'nom' | 'stock'; text?: string },
): ShopProduct[] {
  const text = (query.text ?? '').trim().toLowerCase()
  const list = products.filter((product) => {
    if (query.collection && query.collection !== 'tout' && product.collection !== query.collection) return false
    if (!text) return true
    return `${product.name} ${product.description} ${product.collection}`.toLowerCase().includes(text)
  })
  const price = (product: ShopProduct) => unitPrice(product)
  if (query.sort === 'prix-desc') list.sort((a, b) => price(b) - price(a))
  else if (query.sort === 'nom') list.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  else if (query.sort === 'stock') list.sort((a, b) => unitStock(b) - unitStock(a))
  else list.sort((a, b) => price(a) - price(b))
  return list
}

export function emptyProduct(partial: Partial<ShopProduct> = {}): ShopProduct {
  const name = partial.name?.trim() || 'Nouveau produit'
  return {
    id: partial.id || `prd-${Math.random().toString(36).slice(2, 8)}`,
    name,
    slug: partial.slug || slugify(name),
    description: partial.description ?? '',
    price: numberOr(partial.price, 0),
    compareAt: numberOr(partial.compareAt, 0),
    stock: numberOr(partial.stock, 0),
    collection: partial.collection?.trim() || 'Général',
    images: partial.images ?? [],
    paymentLink: partial.paymentLink ?? '',
    variants: partial.variants ?? [],
  }
}

export function parseProductCsv(raw: string): ShopProduct[] {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const header = splitCsv(lines[0]).map((cell) => cell.toLowerCase())
  const index = (name: string) => header.indexOf(name)
  return lines.slice(1).map((line) => {
    const cells = splitCsv(line)
    const pick = (name: string) => cells[index(name)] ?? ''
    const variants = pick('variantes')
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, price, stock] = part.split(':')
        return {
          id: `var-${Math.random().toString(36).slice(2, 6)}`,
          name: name?.trim() || 'Variante',
          price: numberOr(Number(price), numberOr(Number(pick('prix')), 0)),
          compareAt: 0,
          stock: numberOr(Number(stock), 0),
        }
      })
    return emptyProduct({
      name: pick('nom') || pick('name'),
      collection: pick('collection') || 'Général',
      price: Number(String(pick('prix') || pick('price')).replace(',', '.')),
      compareAt: Number(String(pick('prixbarre') || pick('compare')).replace(',', '.')),
      stock: Number(pick('stock')),
      description: pick('description'),
      paymentLink: pick('lien') || pick('paiement'),
      variants,
    })
  }).filter((product) => product.name && product.name !== 'Nouveau produit')
}

export function cartMessage(lines: CartLine[]): string {
  const rows = lines.map((line, index) => `${index + 1}. ${line.name}${line.variantName ? ` (${line.variantName})` : ''} × ${line.qty} — ${money(line.price * line.qty)}`)
  return `Bonjour, je souhaite commander :\n${rows.join('\n')}\nTotal : ${money(cartTotal(lines))}\nCeci n’est pas un paiement confirmé.`
}

function splitCsv(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (const char of line) {
    if (char === '"') quoted = !quoted
    else if ((char === ',' || char === ';') && !quoted) {
      cells.push(current.trim())
      current = ''
    } else current += char
  }
  cells.push(current.trim())
  return cells
}

function slugify(value: string): string {
  const slug = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return slug || 'produit'
}

function numberOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}
