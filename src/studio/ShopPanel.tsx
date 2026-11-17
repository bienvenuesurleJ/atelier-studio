import { useMemo, useState } from 'react'
import type { Project, ShopProduct } from '@/domain/types'
import { emptyProduct, money, parseProductCsv, shopProducts } from '@/domain/shop'
import { fileToDataUrl } from '@/studio/images'
import { shopFiles } from '@/export/shopHtml'
import { buildCss } from '@/export/css'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/field'

export function ShopPanel({ project, commit }: { project: Project; commit: (project: Project) => void }) {
  const products = shopProducts(project)
  const [csv, setCsv] = useState('nom,collection,prix,prixbarre,stock,description,lien,variantes\nChemise lin,Hauts,49,69,8,Lin lavé,https://paypal.me/exemple,"S:49:3|M:49:4|L:52:1"')
  const [preview, setPreview] = useState('')
  const save = (next: ShopProduct[]) => commit({ ...project, products: next, shop: next.length ? 'mini' : project.shop })
  const html = useMemo(() => {
    if (!preview) return ''
    const files = shopFiles(project, { linkMode: 'export', preview: false, inlineCss: buildCss(project) })
    return files.find((file) => file.path === (preview === 'panier' ? 'panier.html' : 'boutique.html'))?.html ?? ''
  }, [preview, project])
  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted">Fiches, variantes, collections. Le panier vit dans le navigateur du visiteur. Le paiement est un lien Stripe, PayPal.me ou SumUp, ou un récap WhatsApp / e-mail. Rien n’est marqué comme payé.</p>
      <Button size="sm" onClick={() => save([emptyProduct({ name: 'Nouveau produit', price: 12, stock: 5, collection: 'Général' }), ...products])}>Ajout rapide</Button>
      <ul className="grid gap-3">
        {products.map((product) => (
          <li key={product.id} className="grid gap-1 rounded-xl border border-line p-2">
            <Input aria-label="Nom" value={product.name} onChange={(event) => patch(product.id, { name: event.target.value })} />
            <div className="grid grid-cols-2 gap-1">
              <Input aria-label="Prix" type="number" value={product.price} onChange={(event) => patch(product.id, { price: Number(event.target.value) })} />
              <Input aria-label="Prix barré" type="number" value={product.compareAt} onChange={(event) => patch(product.id, { compareAt: Number(event.target.value) })} />
              <Input aria-label="Stock" type="number" value={product.stock} onChange={(event) => patch(product.id, { stock: Number(event.target.value) })} />
              <Input aria-label="Collection" value={product.collection} onChange={(event) => patch(product.id, { collection: event.target.value })} />
            </div>
            <Textarea aria-label="Description" value={product.description} onChange={(event) => patch(product.id, { description: event.target.value })} />
            <Input aria-label="Lien de paiement" placeholder="https://buy.stripe.com/… ou PayPal.me" value={product.paymentLink} onChange={(event) => patch(product.id, { paymentLink: event.target.value })} />
            <label className="text-xs text-muted">Variantes (Nom:prix:stock, séparées par |)
              <Input value={product.variants.map((variant) => `${variant.name}:${variant.price}:${variant.stock}`).join('|')} onChange={(event) => patch(product.id, { variants: event.target.value.split('|').filter(Boolean).map((part) => {
                const [name, price, stock] = part.split(':')
                return { id: `var-${name}`, name: name || 'Variante', price: Number(price) || product.price, compareAt: 0, stock: Number(stock) || 0 }
              }) })} />
            </label>
            <label className="text-xs text-muted">Photos
              <input type="file" accept="image/*" multiple onChange={async (event) => {
                const files = [...(event.target.files ?? [])]
                const images = []
                for (const file of files) images.push(await fileToDataUrl(file))
                patch(product.id, { images: [...product.images, ...images].slice(0, 6) })
              }} />
            </label>
            <p className="text-xs text-muted">{money(product.price)} · {product.variants.length} variante(s)</p>
            <Button size="sm" variant="danger" onClick={() => save(products.filter((item) => item.id !== product.id))}>Retirer</Button>
          </li>
        ))}
      </ul>
      {products.length === 0 ? <p className="text-sm text-muted">Aucun produit. Un ajout rapide suffit pour obtenir la boutique, les fiches et le panier dans le ZIP.</p> : null}
      <label className="grid gap-1 text-xs text-muted">Import CSV
        <Textarea value={csv} onChange={(event) => setCsv(event.target.value)} />
      </label>
      <Button size="sm" variant="quiet" onClick={() => save([...parseProductCsv(csv), ...products])}>Importer le CSV</Button>
      <div className="flex gap-2">
        <Button size="sm" variant="quiet" onClick={() => setPreview('boutique')}>Aperçu boutique</Button>
        <Button size="sm" variant="quiet" onClick={() => setPreview('panier')}>Aperçu panier</Button>
      </div>
      {preview && html ? <iframe title="Aperçu boutique" className="h-80 w-full rounded-lg border border-line bg-white" srcDoc={html} /> : null}
    </div>
  )

  function patch(id: string, partial: Partial<ShopProduct>) {
    save(products.map((item) => item.id === id ? { ...item, ...partial } : item))
  }
}

