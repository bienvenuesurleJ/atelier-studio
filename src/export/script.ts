import { motionRuntime } from './motionCss'
import { freeEditorRuntime } from './freeEditor'

export function buildScript(): string {
  return `(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const preview = body.dataset.preview === 'on';

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('button');
    const panel = item.querySelector('.faq-panel');
    if (!button || !panel) return;
    if (item.closest('[data-variant="grid"]')) {
      panel.hidden = false;
      return;
    }
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
    });
  });

  if (!reduce) {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.16 });
      reveals.forEach((node) => io.observe(node));
    } else {
      reveals.forEach((node) => node.classList.add('is-inview'));
    }
  }

  if (!reduce && body.dataset.counters === 'on') {
    document.querySelectorAll('.counter').forEach((node) => {
      const target = Number(node.getAttribute('data-to') || '0');
      const suffix = node.getAttribute('data-suffix') || '';
      if (!Number.isFinite(target)) return;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 900);
        const value = Math.round(target * (1 - Math.pow(1 - p, 3)));
        node.textContent = String(value) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  const progress = document.querySelector('.scroll-progress');
  if (progress && body.dataset.progress === 'on') {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      progress.style.width = (ratio * 100) + '%';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (!reduce && body.dataset.parallax === 'on') {
    const nodes = document.querySelectorAll('.parallax');
    if (nodes.length) {
      const onScroll = () => {
        const y = window.scrollY;
        nodes.forEach((node) => {
          node.style.transform = 'translateY(' + Math.round(y * 0.12) + 'px)';
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  if (!reduce && body.dataset.typing === 'on') {
    document.querySelectorAll('.js-typing').forEach((node) => {
      const text = node.getAttribute('data-text') || node.textContent || '';
      node.textContent = '';
      let i = 0;
      const step = () => {
        i += 1;
        node.textContent = text.slice(0, i);
        if (i < text.length) window.setTimeout(step, 28);
      };
      step();
    });
  }

  document.querySelectorAll('.carousel').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.slide');
    if (!track || slides.length < 2) return;
    let index = 0;
    const go = (next) => {
      index = (next + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      carousel.querySelectorAll('.dot').forEach((dot, dotIndex) => {
        dot.classList.toggle('is-on', dotIndex === index);
      });
    };
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    if (prev) prev.addEventListener('click', () => go(index - 1));
    if (next) next.addEventListener('click', () => go(index + 1));
    const dots = carousel.querySelector('.carousel-dots');
    if (dots) {
      slides.forEach((_, dotIndex) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot' + (dotIndex === 0 ? ' is-on' : '');
        dot.setAttribute('aria-label', 'Diapositive ' + (dotIndex + 1));
        dot.addEventListener('click', () => go(dotIndex));
        dots.appendChild(dot);
      });
    }
    if (!reduce && carousel.getAttribute('data-autoplay') === 'true') {
      window.setInterval(() => go(index + 1), 5000);
    }
  });

  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const img = lightbox.querySelector('img');
    const close = () => { lightbox.hidden = true; };
    document.querySelectorAll('.shot').forEach((shot) => {
      shot.addEventListener('click', () => {
        const full = shot.getAttribute('data-full');
        if (!full || !img) return;
        img.src = full;
        img.alt = shot.getAttribute('data-alt') || '';
        lightbox.hidden = false;
      });
    });
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target.closest('.lightbox-close')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  }

  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const mode = form.getAttribute('data-form');
      const status = form.querySelector('.form-status');
      if (mode !== 'mailto') return;
      event.preventDefault();
      const email = form.getAttribute('data-email') || '';
      const subject = form.getAttribute('data-subject') || 'Message';
      if (!email) {
        if (status) status.textContent = 'Ajoutez l’e-mail du commerce dans les réglages du studio.';
        return;
      }
      const data = new FormData(form);
      const lines = [];
      data.forEach((value, key) => {
        if (typeof value === 'string' && value.trim()) lines.push(key + ' : ' + value.trim());
      });
      window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\\n'));
      if (status) status.textContent = 'Votre application e-mail va s’ouvrir avec le message.';
    });
  });

  const basket = [];
  const basketBar = document.querySelector('[data-basket]');
  const paintBasket = () => {
    if (!basketBar) return;
    basketBar.hidden = basket.length === 0;
    const count = basketBar.querySelector('[data-basket-count]');
    const total = basket.reduce((sum, entry) => sum + priceOf(entry.price), 0);
    const tax = Number(body.dataset.tax || '0');
    const shipping = Number(body.dataset.shipping || '0');
    const withTax = total * (1 + (Number.isFinite(tax) ? tax : 0) / 100) + (Number.isFinite(shipping) ? shipping : 0);
    if (count) count.textContent = String(basket.length) + (body.dataset.shop === 'full' ? ' · ' + withTax.toFixed(2).replace('.', ',') + ' €' : '');
  };
  const priceOf = (value) => {
    const n = parseFloat(String(value || '').replace(',', '.').replace(/[^\\d.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    basket.push({ name: button.getAttribute('data-name') || 'Article', price: button.getAttribute('data-price') || '' });
    paintBasket();
  });
  const checkout = document.querySelector('[data-checkout]');
  if (checkout) {
    checkout.addEventListener('click', () => {
      if (!basket.length) return;
      const lines = basket.map((entry, index) => (index + 1) + '. ' + entry.name + (entry.price ? ' — ' + entry.price : ''));
      const raw = basket.reduce((sum, entry) => sum + priceOf(entry.price), 0);
      const tax = Number(body.dataset.tax || '0');
      const shipping = Number(body.dataset.shipping || '0');
      const withTax = raw * (1 + (Number.isFinite(tax) ? tax : 0) / 100) + (Number.isFinite(shipping) ? shipping : 0);
      const text = 'Bonjour, je souhaite commander :\\n' + lines.join('\\n') + '\\nTotal indicatif : ' + withTax.toFixed(2) + ' €\\nCeci n’est pas un paiement confirmé.';
      const mode = body.dataset.order || 'email';
      if (mode === 'whatsapp') {
        const phone = (body.dataset.whatsapp || '').replace(/\\D/g, '');
        const intl = phone.startsWith('0') ? '33' + phone.slice(1) : phone;
        window.open('https://wa.me/' + intl + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        return;
      }
      const email = body.dataset.email || '';
      window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Commande') + '&body=' + encodeURIComponent(text);
    });
  }

  const loyaltyNode = document.getElementById('loyalty-config');
  if (loyaltyNode) {
    let config = { goal: 8, pin: '', reward: '' };
    try { config = JSON.parse(loyaltyNode.textContent || '{}'); } catch (error) { /* ignore */ }
    const key = 'atelier-loyalty-' + (config.title || 'carte');
    const read = () => Number(localStorage.getItem(key) || '0');
    const stamps = document.querySelector('.stamps');
    const status = document.querySelector('.loyalty-status');
    const paint = () => {
      if (!stamps) return;
      const count = read();
      stamps.innerHTML = '';
      for (let i = 0; i < config.goal; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'stamp' + (i < count ? ' on' : '');
        dot.textContent = i < count ? '✓' : String(i + 1);
        stamps.appendChild(dot);
      }
      if (status) {
        status.textContent = count >= config.goal ? config.reward : count + ' / ' + config.goal;
      }
    };
    paint();
    const add = document.getElementById('stamp-btn');
    const reset = document.getElementById('reset-btn');
    if (add) {
      add.addEventListener('click', () => {
        const code = window.prompt('Code commerçant');
        if (code === null) return;
        if (String(config.pin || '') !== code.trim()) {
          if (status) status.textContent = 'Code incorrect.';
          return;
        }
        const next = Math.min(config.goal, read() + 1);
        localStorage.setItem(key, String(next));
        paint();
      });
    }
    if (reset) {
      reset.addEventListener('click', () => {
        const code = window.prompt('Code commerçant pour remettre à zéro');
        if (code === null) return;
        if (String(config.pin || '') !== code.trim()) return;
        localStorage.removeItem(key);
        paint();
      });
    }
  }

  const install = document.getElementById('install-btn');
  let promptEvent = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    promptEvent = event;
    if (install) install.hidden = false;
  });
  if (install) {
    install.addEventListener('click', async () => {
      if (!promptEvent) return;
      promptEvent.prompt();
      await promptEvent.userChoice;
      promptEvent = null;
      install.hidden = true;
    });
  }

  if (body.dataset.pwa === 'on' && 'serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link) {
      const href = link.getAttribute('href') || '';
      if (preview && href.startsWith('#__page:')) {
        event.preventDefault();
        window.parent.postMessage({ type: 'atelier-nav', slug: href.slice(8) }, '*');
      }
    }
    if (preview) {
      const section = event.target.closest('[data-bid]');
      const pointed = event.target.closest('[data-el]');
      if (section && !event.target.closest('a, button, input, textarea, select, label')) {
        window.parent.postMessage({
          type: 'atelier-select',
          id: section.getAttribute('data-bid'),
          element: pointed ? pointed.getAttribute('data-el') : ''
        }, '*');
      }
    }
  });

  if (preview) {
    document.querySelectorAll('[data-el]').forEach((node) => {
      if (node.tagName === 'IMG' || node.classList.contains('media-fallback')) return;
      node.addEventListener('dblclick', (event) => {
        event.preventDefault();
        event.stopPropagation();
        node.setAttribute('contenteditable', 'true');
        node.focus();
      });
      node.addEventListener('blur', () => {
        if (node.getAttribute('contenteditable') !== 'true') return;
        node.removeAttribute('contenteditable');
        window.parent.postMessage({ type: 'atelier-edit', element: node.getAttribute('data-el'), value: (node.textContent || '').trim() }, '*');
      });
    });
    window.addEventListener('message', (event) => {
      if (!event.data || event.data.type !== 'atelier-highlight') return;
      document.querySelectorAll('[data-bid]').forEach((node) => {
        node.toggleAttribute('data-selected', node.getAttribute('data-bid') === event.data.id);
        if (event.data.scroll && node.getAttribute('data-bid') === event.data.id) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      document.querySelectorAll('[data-el]').forEach((node) => {
        node.toggleAttribute('data-selected-el', node.getAttribute('data-el') === event.data.element);
      });
    });
    bootFreeform();
  }
  ${motionRuntime()}
  ${freeEditorRuntime()}
  ${shopRuntime()}
})();
`
}

function shopRuntime(): string {
  return `
  const shopKey = 'atelier-cart-' + (location.pathname || 'boutique');
  const readCart = () => { try { return JSON.parse(localStorage.getItem(shopKey) || '[]'); } catch (error) { return []; } };
  const writeCart = (lines) => { localStorage.setItem(shopKey, JSON.stringify(lines)); paintCart(); };
  const euros = (value) => value.toFixed(2).replace('.', ',') + ' €';
  const paintCount = () => {
    const count = readCart().reduce((sum, line) => sum + line.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = String(count); });
  };
  const paintCart = () => {
    paintCount();
    const root = document.getElementById('cart-root');
    const total = document.getElementById('cart-total');
    if (!root) return;
    const lines = readCart();
    if (!lines.length) { root.innerHTML = '<p>Le panier est vide.</p>'; if (total) total.textContent = ''; return; }
    root.innerHTML = lines.map((line, index) => '<article class="card"><p><strong>' + line.name + '</strong>' + (line.variantName ? ' · ' + line.variantName : '') + '</p><p>' + euros(line.price) + '</p><div class="cluster"><button type="button" data-qty="-1" data-index="' + index + '">−</button><span>' + line.qty + '</span><button type="button" data-qty="1" data-index="' + index + '">+</button><button type="button" data-remove="' + index + '">Retirer</button></div></article>').join('');
    const sum = lines.reduce((acc, line) => acc + line.price * line.qty, 0);
    if (total) total.textContent = 'Total : ' + euros(Math.round(sum * 100) / 100);
  };
  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-shop-variant]');
    if (!select) return;
    const option = select.selectedOptions[0];
    const button = select.closest('.shop-product')?.querySelector('[data-shop-add]');
    if (!button || !option) return;
    button.setAttribute('data-price', option.getAttribute('data-price') || '0');
    button.setAttribute('data-stock', option.getAttribute('data-stock') || '0');
    button.setAttribute('data-variant', option.value);
    button.setAttribute('data-variant-name', option.getAttribute('data-label') || '');
    const price = select.closest('.shop-product')?.querySelector('[data-shop-price]');
    const stock = select.closest('.shop-product')?.querySelector('[data-shop-stock]');
    if (price) price.innerHTML = '<strong>' + euros(Number(option.getAttribute('data-price') || '0')) + '</strong>';
    if (stock) stock.textContent = Number(option.getAttribute('data-stock') || '0') > 0 ? option.getAttribute('data-stock') + ' en stock' : 'Rupture';
  });
  document.addEventListener('click', (event) => {
    const thumb = event.target.closest('[data-shop-thumb]');
    if (thumb) {
      const photos = [...document.querySelectorAll('[data-shop-photo]')];
      photos.forEach((photo, index) => { photo.hidden = String(index) !== thumb.getAttribute('data-shop-thumb'); });
    }
    const add = event.target.closest('[data-shop-add]');
    if (add) {
      const stock = Number(add.getAttribute('data-stock') || '0');
      if (stock <= 0) return;
      const lines = readCart();
      const variant = add.getAttribute('data-variant') || '';
      const found = lines.find((line) => line.productId === add.getAttribute('data-id') && line.variantId === variant);
      if (found) found.qty += 1;
      else lines.push({ productId: add.getAttribute('data-id'), variantId: variant, name: add.getAttribute('data-name'), variantName: add.getAttribute('data-variant-name') || '', price: Number(add.getAttribute('data-price') || '0'), qty: 1 });
      writeCart(lines);
    }
    const qty = event.target.closest('[data-qty]');
    if (qty) {
      const lines = readCart();
      const line = lines[Number(qty.getAttribute('data-index'))];
      if (line) line.qty = Math.max(1, line.qty + Number(qty.getAttribute('data-qty')));
      writeCart(lines);
    }
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      const lines = readCart().filter((_, index) => index !== Number(remove.getAttribute('data-remove')));
      writeCart(lines);
    }
  });
  document.addEventListener('input', (event) => {
    const grid = document.querySelector('[data-shop-grid]');
    if (!grid) return;
    const collection = document.querySelector('[data-shop-collection]')?.value || 'tout';
    const sort = document.querySelector('[data-shop-sort]')?.value || 'prix-asc';
    const text = (document.querySelector('[data-shop-search]')?.value || '').toLowerCase();
    const cards = [...grid.querySelectorAll('[data-product-card]')];
    cards.forEach((card) => {
      const okCollection = collection === 'tout' || card.getAttribute('data-collection') === collection;
      const okText = !text || (card.getAttribute('data-name') || '').includes(text);
      card.hidden = !(okCollection && okText);
    });
    const visible = cards.filter((card) => !card.hidden);
    visible.sort((a, b) => {
      if (sort === 'nom') return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || '', 'fr');
      if (sort === 'stock') return Number(b.getAttribute('data-stock')) - Number(a.getAttribute('data-stock'));
      const diff = Number(a.getAttribute('data-price')) - Number(b.getAttribute('data-price'));
      return sort === 'prix-desc' ? -diff : diff;
    });
    visible.forEach((card) => grid.appendChild(card));
  });
  const send = document.querySelector('[data-cart-send]');
  if (send) send.addEventListener('click', () => {
    const lines = readCart();
    if (!lines.length) return;
    const rows = lines.map((line, index) => (index + 1) + '. ' + line.name + (line.variantName ? ' (' + line.variantName + ')' : '') + ' × ' + line.qty + ' — ' + euros(line.price * line.qty));
    const sum = lines.reduce((acc, line) => acc + line.price * line.qty, 0);
    const text = 'Bonjour, je souhaite commander :\\n' + rows.join('\\n') + '\\nTotal : ' + euros(sum) + '\\nCeci n’est pas un paiement confirmé.';
    const mode = body.dataset.order || 'email';
    if (mode === 'whatsapp') {
      const phone = (body.dataset.whatsapp || '').replace(/\\D/g, '');
      const intl = phone.startsWith('0') ? '33' + phone.slice(1) : phone;
      window.open('https://wa.me/' + intl + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      return;
    }
    window.location.href = 'mailto:' + (body.dataset.email || '') + '?subject=' + encodeURIComponent('Commande') + '&body=' + encodeURIComponent(text);
  });
  paintCart();
`
}
