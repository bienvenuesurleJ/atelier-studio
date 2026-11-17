import { contrastColor, safeColor, safeCssToken, safeFont } from '../domain/color'
import { elementCss } from './elementCss'
import { projectFreeCss } from './freeCss'
import { MOTION_CSS } from './motionCss'
import { imageAdjustCss } from '../domain/imageFrame'
import { fontFaceCss } from '../domain/fonts'
import type { Project } from '../domain/types'

export function buildCss(project: Project): string {
  const tokens = project.tokens
  const bg = safeColor(tokens.bg, '#ffffff')
  const surface = safeColor(tokens.surface, '#f6f6f6')
  const text = safeColor(tokens.text, '#161616')
  const muted = safeColor(tokens.muted, '#5c5c5c')
  const primary = safeColor(tokens.primary, '#111111')
  const accent = safeColor(tokens.accent, '#8a6232')
  const border = safeColor(tokens.border, '#e4e4e4')
  const sectionY = tokens.spacing === 'compact' ? '3.4rem' : tokens.spacing === 'airy' ? '6.5rem' : '5rem'
  const root = `:root{
    --bg:${bg};
    --surface:${surface};
    --text:${text};
    --muted:${muted};
    --primary:${primary};
    --accent:${accent};
    --border:${border};
    --on-primary:${contrastColor(primary)};
    --on-accent:${contrastColor(accent)};
    --radius:${safeCssToken(tokens.radius, '12px')};
    --shadow:${safeCssToken(tokens.shadow, 'none')};
    --font-heading:${safeFont(tokens.fontHeadingCss, 'Georgia, serif')};
    --font-body:${safeFont(tokens.fontBodyCss, 'system-ui, sans-serif')};
    --heading-weight:${clampWeight(tokens.headingWeight)};
    --tracking:${safeCssToken(tokens.tracking, '-0.03em')};
    --section-y:${sectionY};
    --btn-radius:${safeCssToken(tokens.buttonRadius, '12px')};
  }`
  return `${root}\n${fontFaceCss(project.fonts)}\n${BASE_CSS}\n${MOTION_CSS}\n.crop-host{position:relative;display:block;width:100%;height:100%;overflow:hidden}\n.crop-host>img{width:100%;height:100%;object-fit:cover}\n${styleExtra(project.styleId)}\n${elementCss(project)}\n${projectFreeCss(project.pages)}\n${imageAdjustCss(project)}`
}

function clampWeight(value: number): number {
  if (!Number.isFinite(value)) return 600
  return Math.min(800, Math.max(400, Math.round(value)))
}

function styleExtra(id: string): string {
  if (id === 'luxe') {
    return `body[data-style="luxe"] .kicker{font-family:var(--font-heading);font-style:italic;letter-spacing:.04em;text-transform:none;font-size:1.15rem}
      body[data-style="luxe"] .site-header{border-bottom-color:color-mix(in srgb, var(--primary) 35%, var(--border))}`
  }
  if (id === 'glass') {
    return `body[data-style="glass"]{background:
      radial-gradient(900px 420px at 8% -10%, color-mix(in srgb, var(--primary) 35%, transparent), transparent 60%),
      radial-gradient(700px 380px at 100% 0%, color-mix(in srgb, var(--accent) 32%, transparent), transparent 55%),
      var(--bg)}
      body[data-style="glass"] .card,body[data-style="glass"] .panel,body[data-style="glass"] .price-card,body[data-style="glass"] .site-header{
        background:color-mix(in srgb, var(--surface) 72%, transparent);backdrop-filter:blur(16px)}`
  }
  if (id === 'brutal') {
    return `body[data-style="brutal"] .card,body[data-style="brutal"] .panel,body[data-style="brutal"] .price-card,body[data-style="brutal"] .btn,body[data-style="brutal"] .link-pill{
      border:3px solid var(--text);box-shadow:5px 5px 0 var(--text);border-radius:0}
      body[data-style="brutal"] .btn:hover{transform:translate(-2px,-2px)}
      body[data-style="brutal"] h1,body[data-style="brutal"] h2{text-transform:uppercase}`
  }
  if (id === 'neon') {
    return `body[data-style="neon"]{background-color:var(--bg);background-image:
      linear-gradient(color-mix(in srgb, var(--primary) 22%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--primary) 22%, transparent) 1px, transparent 1px);background-size:52px 52px}
      body[data-style="neon"] .btn{box-shadow:0 0 24px color-mix(in srgb, var(--primary) 45%, transparent)}
      body[data-style="neon"] .card{box-shadow:0 0 0 1px color-mix(in srgb, var(--primary) 50%, transparent)}`
  }
  if (id === 'retro') {
    return `body[data-style="retro"] .card{border:2px solid color-mix(in srgb, var(--text) 25%, var(--border))}
      body[data-style="retro"] .kicker{font-family:var(--font-heading)}`
  }
  if (id === 'corporate') {
    return `body[data-style="corporate"] .card{border-top:3px solid var(--primary);border-radius:var(--radius)}`
  }
  if (id === 'playful') {
    return `body[data-style="playful"] .shot:nth-child(2n){transform:rotate(-1.2deg)}
      body[data-style="playful"] .shot:nth-child(3n){transform:rotate(1.2deg)}`
  }
  if (id === 'nature') {
    return `body[data-style="nature"] .media-fallback{border-radius:40% 40% 18px 18px}`
  }
  if (id === 'minimal') {
    return `body[data-style="minimal"] .card{box-shadow:none}`
  }
  return ''
}

const BASE_CSS = `
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:1.05rem;line-height:1.6}
img{max-width:100%;display:block}
button,input,textarea,select{font:inherit;color:inherit}
a{color:inherit}
h1,h2,h3,h4{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--tracking);line-height:1.08;margin:0 0 .45em}
h1{font-size:clamp(2.7rem,7vw,5.6rem)}
h2{font-size:clamp(1.8rem,3.4vw,3.1rem)}
h3{font-size:1.35rem}
p{margin:0 0 .8rem}
.skip{position:absolute;left:1rem;top:-4rem;background:var(--text);color:var(--bg);padding:.5rem .8rem;z-index:70}
.skip:focus{top:1rem}
.scroll-progress{position:fixed;inset:0 auto auto 0;height:3px;width:0;background:var(--accent);z-index:60}
.wrap{width:min(1120px,calc(100% - 2rem));margin-inline:auto}
.block{padding:var(--section-y) 0}
.block[data-pad="sm"]{padding-block:calc(var(--section-y)*.55)}
.block[data-pad="lg"]{padding-block:calc(var(--section-y)*1.25)}
.block[data-bg="surface"]{background:var(--surface)}
.block[data-bg="primary"]{background:var(--primary);color:var(--on-primary)}
.block[data-bg="accent"]{background:var(--accent);color:var(--on-accent)}
.block[data-bg="default"]{background:var(--bg)}
.block[data-align="center"]{text-align:center}
.block[data-align="center"] .section-head,.block[data-align="center"] .hero-copy{margin-inline:auto}
.block[data-align="center"] .hero-actions,.block[data-align="center"] .cluster{justify-content:center}
.block[data-width="narrow"] .wrap{max-width:740px}
.block[data-width="full"] .wrap{max-width:none;width:min(1400px,calc(100% - 2rem))}
.kicker{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:650;margin:0 0 .8rem}
.section-head{max-width:40rem;margin-bottom:1.8rem}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;background:var(--primary);color:var(--on-primary);text-decoration:none;border:1px solid transparent;border-radius:var(--btn-radius);padding:.9rem 1.25rem;font-weight:650;line-height:1;cursor:pointer}
.btn-ghost{background:transparent;color:inherit;border-color:var(--border)}
.btn-small{padding:.55rem .8rem;font-size:.92rem}
.btn-on-primary{background:var(--on-primary);color:var(--primary)}
.cluster,.hero-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.2rem}
.card,.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow)}
.card{padding:1.2rem}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.grid-2{display:grid;grid-template-columns:1.1fr .9fr;gap:2rem;align-items:center}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.site-header{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.site-header[data-variant="overlay"]{position:absolute;left:0;right:0;background:transparent;border-bottom:0}
.header-inner{display:flex;align-items:center;justify-content:space-between;min-height:76px;gap:1rem;position:relative}
.site-header[data-variant="center"] .header-inner{flex-direction:column;padding:1rem 0 .8rem}
.brand{display:flex;align-items:center;gap:.7rem;text-decoration:none;font-family:var(--font-heading);font-size:1.35rem;letter-spacing:var(--tracking)}
.brand-logo,.footer-logo{width:var(--logo-size,42px);height:var(--logo-size,42px);object-fit:contain;border-radius:12px}
.footer-brand{display:flex;align-items:center;gap:.7rem;margin-bottom:.4rem}
.site-nav{display:flex;align-items:center;gap:1.1rem}
.site-nav a{text-decoration:none}
.nav-toggle{display:none;background:transparent;border:1px solid var(--border);border-radius:var(--btn-radius);padding:.45rem .7rem}
.header-phone{text-decoration:none;color:var(--muted)}
.announce{background:var(--primary);color:var(--on-primary);text-align:center;padding:.45rem 1rem;font-size:.92rem}
.hero-media img,.media-fallback{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.media-fallback{display:grid;place-items:center;background:linear-gradient(160deg,color-mix(in srgb,var(--primary) 78%,#000),color-mix(in srgb,var(--accent) 55%,var(--primary)));color:#fff;font-family:var(--font-heading);font-size:clamp(3rem,8vw,6rem)}
.hero[data-variant="center"]{text-align:center}
.hero[data-variant="center"] .hero-copy{margin-inline:auto;max-width:46rem}
.hero[data-variant="center"] .hero-actions{justify-content:center}
.hero[data-variant="center"] .hero-media{margin-top:2rem}
.hero[data-variant="center"] .hero-media img,.hero[data-variant="center"] .media-fallback{aspect-ratio:16/8}
.hero[data-variant="overlay"]{position:relative;min-height:92vh;display:grid;align-items:end;padding:0}
.block.hero[data-variant="overlay"]{padding:0}
.hero[data-variant="overlay"] .hero-media{position:absolute;inset:0}
.hero[data-variant="overlay"] .hero-media img,.hero[data-variant="overlay"] .media-fallback{height:100%;min-height:92vh;border-radius:0;aspect-ratio:auto}
.hero[data-variant="overlay"] .hero-copy{position:relative;z-index:1;margin:12vh 4vw 8vh;max-width:40rem;padding:1.5rem;background:color-mix(in srgb,var(--bg) 88%,transparent);border-radius:var(--radius);backdrop-filter:blur(8px)}
.feature-list{display:grid;gap:1.2rem}
.feature-list article{display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:start}
.index-no{font-family:var(--font-heading);font-size:1.4rem;color:var(--accent)}
.menu-group{margin-bottom:1.8rem}
.menu-item{display:grid;grid-template-columns:1fr auto;gap:.2rem 1rem;padding:.95rem 0;border-bottom:1px solid var(--border)}
.menu-item .price{font-variant-numeric:tabular-nums}
.tag{display:inline-block;border:1px solid var(--border);border-radius:999px;padding:.05rem .45rem;font-size:.75rem;letter-spacing:.04em;margin-left:.4rem}
.price-card{padding:1.3rem;display:flex;flex-direction:column;gap:.6rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow)}
.price-card[data-highlight="true"]{background:var(--primary);color:var(--on-primary)}
.price-card ul{margin:.2rem 0 0;padding-left:1.1rem}
.price-value{font-family:var(--font-heading);font-size:2.4rem;letter-spacing:var(--tracking)}
blockquote{margin:0}
.quote{font-family:var(--font-heading);font-size:clamp(1.5rem,3vw,2.3rem);line-height:1.2}
.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem}
.shot{padding:0;border:0;background:none;cursor:pointer;text-align:left;color:inherit}
.shot img,.shot .media-fallback{aspect-ratio:1;border-radius:calc(var(--radius)*.8)}
.block.gallery[data-variant="mosaic"] .gallery-grid{grid-auto-rows:160px}
.block.gallery[data-variant="mosaic"] .shot:first-child{grid-column:span 2;grid-row:span 2}
.block.gallery[data-variant="mosaic"] .shot:first-child img,.block.gallery[data-variant="mosaic"] .shot:first-child .media-fallback{height:100%;aspect-ratio:auto}
.timeline{list-style:none;margin:0;padding:0;display:grid;gap:1rem}
.timeline li{display:grid;grid-template-columns:5rem 1fr;gap:1rem}
.year{font-family:var(--font-heading);color:var(--accent)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.stat-value{font-family:var(--font-heading);font-size:clamp(2rem,4vw,3.2rem);letter-spacing:var(--tracking)}
.faq-item{border-bottom:1px solid var(--border)}
.faq-item button{width:100%;text-align:left;background:none;border:0;padding:1rem 0;display:flex;justify-content:space-between;gap:1rem;cursor:pointer;font-weight:650}
.faq-panel[hidden]{display:none}
.faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.block.cta[data-variant="band"][data-bg="inherit"]{background:var(--primary);color:var(--on-primary)}
.block.cta[data-variant="band"] .kicker{color:inherit;opacity:.75}
.form-grid{display:grid;gap:.75rem}
label span{display:block;font-size:.92rem;margin-bottom:.3rem}
input,textarea,select{width:100%;padding:.8rem .9rem;border-radius:calc(var(--btn-radius)*.6);border:1px solid var(--border);background:var(--bg)}
textarea{min-height:8rem;resize:vertical}
.form-status{min-height:1.2rem;color:var(--muted)}
.map-frame{width:100%;min-height:320px;border:0;border-radius:var(--radius);background:var(--surface)}
.hours-table{width:100%;border-collapse:collapse}
.hours-table th,.hours-table td{text-align:left;padding:.7rem 0;border-bottom:1px solid var(--border);font-weight:500}
.logo-row{display:flex;flex-wrap:wrap;gap:.8rem 1.4rem;align-items:center}
.logo-row span,.logo-chip{opacity:.8;font-weight:650}
.logo-row img{height:42px;width:auto;object-fit:contain}
.steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;counter-reset:step}
.steps li{counter-increment:step}
.steps li::before{content:counter(step);display:grid;place-items:center;width:2rem;height:2rem;border-radius:50%;background:var(--primary);color:var(--on-primary);margin-bottom:.6rem;font-weight:700}
.block.steps[data-variant="stacked"] .steps{grid-template-columns:1fr}
.catalog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.shop-card img,.shop-gallery img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--radius)}
.shop-filters{align-items:end;margin:1rem 0}
.shop-filters label{display:grid;gap:.3rem;font-size:.85rem}
.product img,.product .media-fallback{aspect-ratio:1;border-radius:calc(var(--radius)*.7);margin-bottom:.8rem}
.badge{display:inline-block;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.site-footer{border-top:1px solid var(--border)}
.footer-grid{display:grid;grid-template-columns:1.4fr .8fr .8fr;gap:1.5rem}
.footer-links{display:grid;gap:.35rem}
.footer-links a{text-decoration:none}
.center-footer{text-align:center}
.carousel{position:relative;overflow:hidden}
.carousel-track{display:flex;transition:transform .45s ease}
.slide{min-width:100%;padding:1rem 3rem}
.carousel-prev,.carousel-next{position:absolute;top:50%;transform:translateY(-50%);border:1px solid var(--border);background:var(--bg);border-radius:50%;width:2.4rem;height:2.4rem;cursor:pointer}
.carousel-prev{left:.4rem}.carousel-next{right:.4rem}
.carousel-dots{display:flex;gap:.4rem;justify-content:center}
.dot{width:.55rem;height:.55rem;border-radius:50%;border:0;background:var(--border);cursor:pointer}
.dot.is-on{background:var(--primary)}
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.82);display:grid;place-items:center;z-index:50;padding:2rem}
.lightbox[hidden]{display:none}
.lightbox img{max-height:80vh;border-radius:var(--radius)}
.lightbox-close{position:absolute;top:1rem;right:1rem}
.video-frame{aspect-ratio:16/9;width:100%;border:0;border-radius:var(--radius);background:#000}
.pass{max-width:440px;margin:0 auto;padding:1.5rem;border-radius:28px;color:#fff;background:
  radial-gradient(420px 180px at 100% 0%, color-mix(in srgb, var(--accent) 75%, white), transparent 60%),
  linear-gradient(165deg, var(--primary), color-mix(in srgb, var(--primary) 35%, #000));
  box-shadow:0 30px 70px color-mix(in srgb, var(--primary) 35%, transparent)}
.pass .kicker,.pass p{color:inherit}
.stamps{display:flex;flex-wrap:wrap;gap:.55rem;margin:1rem 0}
.stamp{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;border:2px dashed rgba(255,255,255,.7);font-size:.8rem}
.stamp.on{background:#fff;color:var(--primary);border-style:solid}
.linkhub{max-width:460px;margin:0 auto;text-align:center}
.avatar,.avatar-fallback{width:96px;height:96px;border-radius:50%;margin:0 auto 1rem;object-fit:cover}
.avatar-fallback{display:grid;place-items:center;background:var(--primary);color:var(--on-primary);font-family:var(--font-heading);font-size:2.4rem}
.link-stack{display:grid;gap:.7rem;margin-top:1.2rem}
.link-pill{display:flex;justify-content:space-between;gap:1rem;align-items:center;text-decoration:none;padding:1rem 1.1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--btn-radius)}
.basket-bar{position:sticky;bottom:1rem;display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:.8rem 1rem;background:var(--text);color:var(--bg);border-radius:var(--btn-radius);margin-top:1rem}
.basket-bar[hidden]{display:none}
.prose{max-width:68ch}
.article-hero img,.article-hero .media-fallback{aspect-ratio:16/8;border-radius:var(--radius);margin-bottom:1rem}
body[data-gradient="on"] .hero[data-variant="center"],body[data-gradient="on"] .hero[data-variant="split"]{
  background-image:linear-gradient(120deg,color-mix(in srgb,var(--primary) 18%,var(--bg)),var(--bg) 42%,color-mix(in srgb,var(--accent) 20%,var(--bg)));
  background-size:200% 200%;animation:gradientShift 14s ease infinite}
body[data-transition="on"]{animation:pageIn .5s ease both}
body[data-micro="on"] .btn{transition:transform .18s ease,box-shadow .18s ease}
body[data-micro="on"] .btn:hover{transform:translateY(-2px)}
body[data-hover="lift"] .card,body[data-hover="lift"] .price-card,body[data-hover="lift"] .link-pill{transition:transform .2s ease}
body[data-hover="lift"] .card:hover,body[data-hover="lift"] .price-card:hover,body[data-hover="lift"] .link-pill:hover{transform:translateY(-4px)}
body[data-hover="glow"] .card:hover{box-shadow:0 0 0 1px var(--primary),0 18px 40px color-mix(in srgb,var(--primary) 28%,transparent)}
.js .reveal{opacity:0;transform:translateY(28px)}
.js .reveal[data-reveal="fade"]{transform:none}
.js .reveal[data-reveal="zoom"]{transform:scale(.96)}
.js .reveal.is-inview{opacity:1;transform:none;transition:opacity .7s ease,transform .7s ease}
body[data-preview="on"] [data-bid]{outline:2px solid transparent;outline-offset:4px;cursor:pointer}
body[data-preview="on"] [data-bid]:hover{outline-color:color-mix(in srgb,var(--primary) 65%,transparent)}
body[data-preview="on"] [data-selected]{outline-color:var(--primary)}
body[data-preview="on"] [data-selected-el]{outline:2px solid var(--accent);outline-offset:3px}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes pageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}
  .js .reveal{opacity:1 !important;transform:none !important}
}
@media (max-width: 900px){
  .grid-3,.grid-4,.stats,.catalog-grid,.gallery-grid,.faq-grid,.footer-grid,.steps{grid-template-columns:1fr}
  .grid-2,.hero[data-variant="split"] .hero-grid,.timeline li{grid-template-columns:1fr}
  .block.gallery[data-variant="mosaic"] .shot:first-child{grid-column:auto;grid-row:auto}
  .nav-toggle{display:inline-flex}
  .site-nav{display:none;position:absolute;top:100%;right:0;left:0;flex-direction:column;align-items:flex-start;padding:1rem;background:var(--bg);border-bottom:1px solid var(--border)}
  .site-nav.is-open{display:flex}
  .site-header[data-variant="center"] .site-nav{position:static;border:0;padding:0}
}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:2.5rem;align-items:center}
.block-hero[data-variant="center"]{text-align:center}
.block-hero[data-variant="center"] .hero-copy{margin-inline:auto;max-width:46rem}
.block-hero[data-variant="center"] .hero-actions{justify-content:center}
.block-hero[data-variant="stack"] .hero-media{margin-bottom:1.4rem}
.block-hero[data-variant="overlay"]{min-height:28rem}
.block-hero[data-variant="overlay"] .hero-media img,.block-hero[data-variant="overlay"] .hero-media .media-fallback{min-height:28rem;aspect-ratio:auto}
.block-hero[data-variant="overlay"] .hero-copy{position:absolute;left:8%;right:8%;bottom:12%;color:#fff;text-shadow:0 1px 12px rgba(0,0,0,.35)}
body.has-backdrop{background-image:var(--site-bg);background-size:cover;background-position:var(--site-pos,50% 50%);background-attachment:var(--site-attach,scroll)}
body.has-backdrop::before{content:"";position:fixed;inset:0;background:var(--site-overlay,#1c1712);opacity:var(--site-opacity,.4);pointer-events:none;z-index:0}
body.has-backdrop .site-header,body.has-backdrop main{position:relative;z-index:1}
.block.has-photo{background-image:var(--section-bg);background-size:cover;background-position:var(--section-pos,50% 50%);background-attachment:var(--section-attach,scroll)}
.block.has-photo::before{content:"";position:absolute;inset:0;background:var(--section-overlay,#1c1712);opacity:var(--section-opacity,.4);pointer-events:none}
.block.has-photo .wrap,.block.has-photo .hero-copy,.block.has-photo .hero-media{position:relative;z-index:1}
.grid-2-eq{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.block-gallery[data-variant="mosaic"] .gallery-grid{grid-auto-rows:160px}
.block-gallery[data-variant="mosaic"] .shot:first-child{grid-column:span 2;grid-row:span 2}
.block-gallery[data-variant="mosaic"] .shot:first-child img,.block-gallery[data-variant="mosaic"] .shot:first-child .media-fallback{height:100%;aspect-ratio:auto}
.block-gallery[data-variant="bande"] .gallery-grid{display:flex;overflow:auto;gap:.7rem}
.block-gallery[data-variant="bande"] .shot{min-width:220px}
.block-testimonials[data-variant="rangee"] .quote-row{display:flex;gap:1rem;overflow:auto}
.block-testimonials[data-variant="rangee"] .card{min-width:260px}
.price-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.price-row .price-card{border:0;border-radius:0;border-right:1px solid var(--border)}
.contact-band .panel{margin-top:1rem}
@media (max-width: 900px){
  .grid-2-eq{grid-template-columns:1fr}
}
`
