import type { Project, ShopProduct } from '../domain/types'
import { cartMessage, collectionsOf, money, shopProducts, unitPrice, unitStock } from '../domain/shop'
import { esc } from './html'
import { renderCustomPage } from './render'
import type { PageOptions } from './render'

export function shopFiles(project: Project, options: PageOptions): { path: string; html: string }[] {
  const products = shopProducts(project)
  if (!products.length) return []
  return [
    { path: 'boutique.html', html: renderCustomPage(project, 'boutique', `Boutique — ${project.business.name}`, boutiqueMain(project, products), options) },
    { path: 'panier.html', html: renderCustomPage(project, 'panier', `Panier — ${project.business.name}`, cartMain(project), options) },
    ...products.map((product) => ({
      path: `produit-${product.slug}.html`,
      html: renderCustomPage(project, `produit-${product.slug}`, `${product.name} — ${project.business.name}`, productMain(project, product), options),
    })),
  ]
}

function boutiqueMain(project: Project, products: ShopProduct[]): string {
  const collections = collectionsOf(products)
  const filters = ['tout', ...collections].map((name) => `<option value="${esc(name)}">${name === 'tout' ? 'Toutes les collections' : esc(name)}</option>`).join('')
  const cards = products.map((product) => {
    const price = unitPrice(product)
    const stock = unitStock(product)
    const photo = product.images[0] ? `<img src="${esc(product.images[0])}" alt="">` : `<div class="media-fallback"><span>${esc(product.name.slice(0, 1))}</span></div>`
    const compare = product.compareAt > price ? `<s class="muted">${money(product.compareAt)}</s>` : ''
    return `<article class="card shop-card" data-product-card data-collection="${esc(product.collection)}" data-name="${esc(product.name.toLowerCase())}" data-price="${price}" data-stock="${stock}">
      <a href="produit-${esc(product.slug)}.html">${photo}<h3>${esc(product.name)}</h3></a>
      <p class="muted">${esc(product.collection)}</p>
      <p><strong>${money(price)}</strong> ${compare}</p>
      <p class="muted">${stock > 0 ? `${stock} en stock` : 'Rupture'}</p>
      <a class="btn btn-small" href="produit-${esc(product.slug)}.html">Voir la fiche</a>
    </article>`
  }).join('')
  return `<div class="wrap">
    <p class="kicker">Boutique</p>
    <h1>${esc(project.business.name)}</h1>
    <div class="cluster shop-filters">
      <label>Collection <select data-shop-collection>${filters}</select></label>
      <label>Tri <select data-shop-sort><option value="prix-asc">Prix croissant</option><option value="prix-desc">Prix décroissant</option><option value="nom">Nom</option><option value="stock">Stock</option></select></label>
      <label>Recherche <input data-shop-search placeholder="Nom, matière…"></label>
    </div>
    <div class="catalog-grid" data-shop-grid>${cards}</div>
    <p class="muted"><a href="panier.html">Voir le panier</a>. Le paiement, s’il y en a un, se fait chez Stripe, PayPal ou SumUp. Ce site ne dit jamais qu’un paiement a réussi.</p>
  </div>`
}

function productMain(project: Project, product: ShopProduct): string {
  const photos = product.images.length
    ? `<div class="shop-gallery">${product.images.map((src, index) => `<img src="${esc(src)}" alt="${esc(product.name)}" ${index === 0 ? '' : 'hidden'} data-shop-photo>`).join('')}<div class="cluster">${product.images.map((_, index) => `<button type="button" class="btn btn-ghost btn-small" data-shop-thumb="${index}">${index + 1}</button>`).join('')}</div></div>`
    : `<div class="media-fallback"><span>${esc(product.name.slice(0, 1))}</span></div>`
  const variants = product.variants.length
    ? `<label>Variante <select data-shop-variant>${product.variants.map((variant) => `<option value="${esc(variant.id)}" data-price="${variant.price}" data-stock="${variant.stock}" data-label="${esc(variant.name)}">${esc(variant.name)} — ${money(variant.price)} · ${variant.stock > 0 ? `${variant.stock} en stock` : 'rupture'}</option>`).join('')}</select></label>`
    : ''
  const pay = safePay(product.paymentLink)
  return `<div class="wrap grid-2 shop-product" data-shop-product="${esc(product.id)}">
    ${photos}
    <div>
      <p class="kicker">${esc(product.collection)}</p>
      <h1>${esc(product.name)}</h1>
      <p data-shop-price><strong>${money(unitPrice(product))}</strong>${product.compareAt > unitPrice(product) ? ` <s class="muted">${money(product.compareAt)}</s>` : ''}</p>
      <p>${esc(product.description)}</p>
      <p class="muted" data-shop-stock>${unitStock(product) > 0 ? `${unitStock(product)} en stock` : 'Rupture'}</p>
      ${variants}
      <div class="cluster">
        <button type="button" class="btn" data-shop-add data-id="${esc(product.id)}" data-name="${esc(product.name)}" data-price="${unitPrice(product)}" data-variant="" data-variant-name="" data-stock="${unitStock(product)}">Ajouter au panier</button>
        ${pay ? `<a class="btn btn-ghost" href="${esc(pay)}" target="_blank" rel="noopener">Payer ce produit</a>` : ''}
      </div>
      <p class="muted">Ajouter au panier ne paie rien. ${pay ? 'Le bouton Payer ouvre le lien que vous avez collé (Stripe, PayPal.me ou SumUp).' : `Sans lien de paiement, la commande part par ${project.ordering.mode === 'whatsapp' ? 'WhatsApp' : 'e-mail'}.`}</p>
      <p><a href="boutique.html">Retour à la boutique</a> · <a href="panier.html">Panier</a></p>
    </div>
  </div>`
}

function cartMain(project: Project): string {
  const pay = safePay(project.ordering.paymentLink)
  return `<div class="wrap" data-cart-page="1">
    <p class="kicker">Panier</p>
    <h1>Votre sélection</h1>
    <div id="cart-root"></div>
    <p class="muted" id="cart-total"></p>
    <div class="cluster">
      <button type="button" class="btn" data-cart-send>Envoyer le récap</button>
      ${pay ? `<a class="btn btn-ghost" data-pay-all href="${esc(pay)}" target="_blank" rel="noopener">Ouvrir le lien de paiement</a>` : ''}
    </div>
    <p class="muted">Le récap part par ${project.ordering.mode === 'whatsapp' ? 'WhatsApp' : 'e-mail'}. ${pay ? 'Le lien de paiement est celui collé dans le studio : le montant doit correspondre à ce que vous avez réglé chez le prestataire.' : 'Aucun paiement n’est encaissé par ce site.'} ${esc(cartMessage([]).split('\n').at(-1) || '')}</p>
    <p><a href="boutique.html">Continuer</a></p>
  </div>`
}

function safePay(value: string): string {
  const url = value.trim()
  return /^https?:\/\//i.test(url) ? url : ''
}
