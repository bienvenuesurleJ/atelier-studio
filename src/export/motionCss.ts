export const MOTION_CSS = `
[data-fx] { --fx-dur: .7s; --fx-delay: 0s; --fx-ease: ease; --fx-dist: 28px; --fx-blur: 8px; --fx-rot: 8deg; --fx-scale: .92; }
[data-fx="fade"]:not(.fx-play):not(.fx-final) { opacity: 0; }
[data-fx="fade"].fx-play { animation: fxFade var(--fx-dur) var(--fx-ease) var(--fx-delay) var(--fx-count, 1) both; }
[data-fx="slide"]:not(.fx-play):not(.fx-final) { opacity: 0; transform: translate(var(--fx-x, 0), var(--fx-y, var(--fx-dist))); }
[data-fx="slide"].fx-play { animation: fxSlide var(--fx-dur) var(--fx-ease) var(--fx-delay) var(--fx-count, 1) both; }
[data-fx="zoom"]:not(.fx-play):not(.fx-final) { opacity: 0; transform: scale(var(--fx-scale)); }
[data-fx="zoom"].fx-play { animation: fxZoom var(--fx-dur) var(--fx-ease) var(--fx-delay) var(--fx-count, 1) both; }
[data-fx="blur"]:not(.fx-play):not(.fx-final) { opacity: 0; filter: blur(var(--fx-blur)); }
[data-fx="blur"].fx-play { animation: fxBlur var(--fx-dur) var(--fx-ease) var(--fx-delay) var(--fx-count, 1) both; }
[data-fx="rotate"]:not(.fx-play):not(.fx-final) { opacity: 0; transform: rotate(var(--fx-rot)); }
[data-fx="rotate"].fx-play { animation: fxRotate var(--fx-dur) var(--fx-ease) var(--fx-delay) var(--fx-count, 1) both; }
[data-fx="flip"] { perspective: 900px; }
[data-fx="flip"]:not(.fx-play):not(.fx-final) { opacity: 0; transform: rotateY(70deg); }
[data-fx="flip"].fx-play { animation: fxFlip var(--fx-dur) var(--fx-ease) var(--fx-delay) var(--fx-count, 1) both; }
[data-fx="tilt"]:not(.fx-play):not(.fx-final) { opacity: 0; transform: rotateX(18deg) rotateY(-12deg); }
[data-fx="tilt"].fx-play { animation: fxTilt var(--fx-dur) var(--fx-ease) var(--fx-delay) var(--fx-count, 1) both; }
[data-fx="mask"]:not(.fx-play):not(.fx-final) { clip-path: inset(var(--fx-clip, 100% 0 0 0)); }
[data-fx="mask"].fx-play { animation: fxMask var(--fx-dur) var(--fx-ease) var(--fx-delay) var(--fx-count, 1) both; }
[data-fx="letters"] .fx-bit, [data-fx="words"] .fx-bit { display: inline-block; opacity: 0; transform: translateY(.35em); }
[data-fx="letters"].fx-play .fx-bit, [data-fx="words"].fx-play .fx-bit { animation: fxFadeUp var(--fx-dur) var(--fx-ease) both; }
[data-fx="stagger"] > * { opacity: 0; transform: translateY(12px); }
[data-fx="stagger"].fx-play > * { animation: fxFadeUp var(--fx-dur) var(--fx-ease) both; }
[data-fx="marquee"].fx-play { animation: fxMarquee var(--fx-dur) linear var(--fx-delay) infinite; }
[data-fx="gradient"].fx-play { background-size: 200% 200%; animation: fxGradient var(--fx-dur) ease var(--fx-delay) infinite; }
[data-fx].fx-final, [data-fx].fx-final .fx-bit { opacity: 1 !important; transform: none !important; filter: none !important; clip-path: none !important; animation: none !important; }
@keyframes fxFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes fxFadeUp { from { opacity: 0; transform: translateY(.35em) } to { opacity: 1; transform: none } }
@keyframes fxSlide { from { opacity: 0; transform: translate(var(--fx-x, 0), var(--fx-y, var(--fx-dist))) } to { opacity: 1; transform: none } }
@keyframes fxZoom { from { opacity: 0; transform: scale(var(--fx-scale)) } to { opacity: 1; transform: none } }
@keyframes fxBlur { from { opacity: 0; filter: blur(var(--fx-blur)) } to { opacity: 1; filter: blur(0) } }
@keyframes fxRotate { from { opacity: 0; transform: rotate(var(--fx-rot)) } to { opacity: 1; transform: none } }
@keyframes fxFlip { from { opacity: 0; transform: rotateY(75deg) } to { opacity: 1; transform: none } }
@keyframes fxTilt { from { opacity: 0; transform: rotateX(18deg) rotateY(-12deg) } to { opacity: 1; transform: none } }
@keyframes fxMask { from { clip-path: inset(var(--fx-clip, 100% 0 0 0)) } to { clip-path: inset(0) } }
@keyframes fxMarquee { from { transform: translateX(0) } to { transform: translateX(-40%) } }
@keyframes fxGradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
body[data-preview="on"] .free-node.is-picked { outline: 1.5px solid #d7b07a; outline-offset: 2px; }
body[data-preview="on"] .fx-handle, body[data-preview="on"] .rot-handle { position: absolute; width: 10px; height: 10px; background: #fff; border: 1.5px solid #1a1612; border-radius: 2px; z-index: 40; }
body[data-preview="on"] .rot-handle { border-radius: 50%; background: #d7b07a; }
body[data-preview="on"] .guide-line { position: absolute; background: #ff3d8a; pointer-events: none; z-index: 50; }
body[data-preview="on"] .marquee-rect { position: absolute; border: 1px solid #d7b07a; background: rgba(215,176,122,.15); pointer-events: none; z-index: 45; }
.free-layer { position: absolute; inset: 0; }
.block[data-layout="free"] { position: relative; }
.block[data-layout="free"][data-hide-flow="1"] { min-height: var(--free-min, 480px); }
.free-node { box-sizing: border-box; }
.free-rot { width: 100%; height: 100%; transform-origin: center center; }
.free-node[data-kind="text"] .free-rot { display: flex; align-items: center; overflow: hidden; }
.free-node[data-kind="button"] .free-rot { display: flex; align-items: center; justify-content: center; }
.free-node[data-kind="button"] a { text-decoration: none; }
.free-node img, .free-node .media-fallback { width: 100%; height: 100%; object-fit: cover; }
.free-node[data-hidden="1"] { display: none !important; }
.free-node[data-layout="grid"] { display: grid; align-content: start; }
.free-node[data-layout="stack"] { display: flex; flex-direction: column; }
.free-node[data-layout="grid"] > .free-node, .free-node[data-layout="stack"] > .free-node { position: relative !important; left: auto !important; top: auto !important; width: auto; height: auto; }
.free-node[data-kind="divider"] .free-rot { background: currentColor; height: 2px; margin-top: 50%; }
body[data-preview="on"] .free-node[data-kind="container"], body[data-preview="on"] .free-node[data-kind="grid"] { outline: 1px dashed color-mix(in srgb, var(--primary) 55%, transparent); }
@media (prefers-reduced-motion: reduce) {
  [data-fx], [data-fx] .fx-bit, [data-fx] > * { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; filter: none !important; clip-path: none !important; }
}
`

export function motionRuntime(): string {
  return `function bootMotion() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-fx]').forEach(function (el) {
    if (reduce || !motionAllowed(el)) { el.classList.add('fx-final'); return; }
    var fx = el.getAttribute('data-fx');
    var dur = Number(el.getAttribute('data-duration') || '700');
    var delay = Number(el.getAttribute('data-delay') || '0');
    var ease = el.getAttribute('data-ease') || 'ease';
    var dist = Number(el.getAttribute('data-distance') || '28');
    var intensity = Number(el.getAttribute('data-intensity') || '1');
    var repeat = Number(el.getAttribute('data-repeat') || '1');
    var dir = el.getAttribute('data-dir') || 'up';
    el.style.setProperty('--fx-dur', dur + 'ms');
    el.style.setProperty('--fx-delay', delay + 'ms');
    el.style.setProperty('--fx-ease', ease === 'spring' ? 'linear' : ease);
    el.style.setProperty('--fx-dist', dist + 'px');
    el.style.setProperty('--fx-blur', Math.max(0, intensity) + 'px');
    el.style.setProperty('--fx-rot', (intensity * 12) + 'deg');
    el.style.setProperty('--fx-scale', String(fx === 'zoom' && intensity > 1 ? 1 : intensity || 0.92));
    el.style.setProperty('--fx-count', repeat === 0 ? 'infinite' : String(Math.max(1, repeat)));
    var shift = { up: ['0', dist + 'px'], down: ['0', (-dist) + 'px'], left: [dist + 'px', '0'], right: [(-dist) + 'px', '0'] }[dir] || ['0', dist + 'px'];
    el.style.setProperty('--fx-x', shift[0]);
    el.style.setProperty('--fx-y', shift[1]);
    if (dir === 'up') el.style.setProperty('--fx-clip', '100% 0 0 0');
    if (dir === 'down') el.style.setProperty('--fx-clip', '0 0 100% 0');
    if (dir === 'left') el.style.setProperty('--fx-clip', '0 100% 0 0');
    if (dir === 'right') el.style.setProperty('--fx-clip', '0 0 0 100%');
    if (fx === 'letters' || fx === 'words') splitText(el, fx);
    if (fx === 'gradient') {
      el.style.backgroundImage = 'linear-gradient(120deg, var(--primary), var(--accent), var(--primary))';
      el.style.backgroundSize = '200% 200%';
    }
    var trigger = el.getAttribute('data-trigger') || 'scroll';
    if (trigger === 'load') requestAnimationFrame(function () { playMotion(el); });
    else if (trigger === 'hover') {
      el.addEventListener('mouseenter', function () { playMotion(el); });
      el.addEventListener('mouseleave', function () { el.classList.remove('fx-play'); });
    } else if (trigger === 'click') {
      el.addEventListener('click', function () { playMotion(el); });
    } else if (trigger === 'scroll-link') bindScrollLink(el, dist, intensity, fx);
    else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { playMotion(el); io.unobserve(el); }
        });
      }, { threshold: 0.2 });
      io.observe(el);
    } else playMotion(el);
  });
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'atelier-replay') return;
    var target = document.querySelector('[data-node="' + event.data.id + '"], [data-bid="' + event.data.id + '"], [data-el="' + event.data.id + '"]');
    if (target) playMotion(target);
  });
}
function motionAllowed(el) {
  var w = window.innerWidth;
  if (w <= 760) return el.getAttribute('data-fx-mobile') !== '0';
  if (w <= 1024) return el.getAttribute('data-fx-tablet') !== '0';
  return el.getAttribute('data-fx-desktop') !== '0';
}
function playMotion(el) {
  if ((el.getAttribute('data-ease') || '') === 'spring') { runSpring(el); return; }
  el.classList.remove('fx-play');
  void el.offsetWidth;
  el.classList.add('fx-play');
}
function runSpring(el) {
  if (el._springFrame) cancelAnimationFrame(el._springFrame);
  var stiffness = Number(el.getAttribute('data-stiffness') || '180');
  var damping = Number(el.getAttribute('data-damping') || '22');
  var mass = Math.max(0.05, Number(el.getAttribute('data-mass') || '1'));
  var value = 0;
  var velocity = 0;
  var last = performance.now();
  function tick(now) {
    var dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
    last = now;
    var force = -stiffness * (value - 1);
    var acc = (force - damping * velocity) / mass;
    velocity += acc * dt;
    value += velocity * dt;
    paintSpring(el, value);
    if (Math.abs(1 - value) > 0.003 || Math.abs(velocity) > 0.02) el._springFrame = requestAnimationFrame(tick);
    else paintSpring(el, 1);
  }
  el._springFrame = requestAnimationFrame(tick);
}
function paintSpring(el, p) {
  var fx = el.getAttribute('data-fx') || 'fade';
  var dist = Number(el.getAttribute('data-distance') || '28');
  var dir = el.getAttribute('data-dir') || 'up';
  var remain = 1 - p;
  var x = 0;
  var y = 0;
  if (dir === 'up') y = remain * dist;
  if (dir === 'down') y = -remain * dist;
  if (dir === 'left') x = remain * dist;
  if (dir === 'right') x = -remain * dist;
  el.style.opacity = String(Math.max(0, Math.min(1, p)));
  if (fx === 'slide') el.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
  else if (fx === 'zoom') {
    var from = Number(el.getAttribute('data-intensity') || '0.92');
    el.style.transform = 'scale(' + (from + (1 - from) * p).toFixed(4) + ')';
  } else if (fx === 'rotate') el.style.transform = 'rotate(' + ((remain * 12 * Number(el.getAttribute('data-intensity') || '1')).toFixed(2)) + 'deg)';
  else if (fx === 'flip') el.style.transform = 'rotateY(' + (remain * 75).toFixed(2) + 'deg)';
  else if (fx === 'tilt') el.style.transform = 'rotateX(' + (remain * 18).toFixed(2) + 'deg) rotateY(' + (remain * -12).toFixed(2) + 'deg)';
  else if (fx === 'blur') el.style.filter = 'blur(' + Math.max(0, remain * Number(el.getAttribute('data-intensity') || '8')).toFixed(2) + 'px)';
  else if (fx === 'fade') el.style.transform = 'none';
}
function splitText(el, mode) {
  if (el.dataset.split === '1') return;
  var rot = el.querySelector('.free-rot') || el;
  var source = rot.textContent || '';
  var bits = mode === 'words' ? source.split(/(\\s+)/) : Array.from(source);
  rot.textContent = '';
  bits.forEach(function (bit, index) {
    var span = document.createElement('span');
    span.className = 'fx-bit';
    span.textContent = bit;
    span.style.animationDelay = (index * Number(el.getAttribute('data-stagger') || '40')) + 'ms';
    if (bit.trim() === '' && mode === 'words') span.style.whiteSpace = 'pre';
    rot.appendChild(span);
  });
  el.dataset.split = '1';
}
function bindScrollLink(el, dist, intensity, fx) {
  var onScroll = function () {
    var rect = el.getBoundingClientRect();
    var progress = 1 - Math.min(1, Math.max(0, (rect.top + rect.height) / (window.innerHeight + rect.height)));
    if (fx === 'parallax') el.style.transform = 'translateY(' + Math.round((0.5 - progress) * dist * 4 * intensity) + 'px)';
    else el.style.transform = 'translateY(' + Math.round((1 - progress) * dist) + 'px)';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
bootMotion();
`
}
