export function freeEditorRuntime(): string {
  return `function bootFreeform() {
  var selected = new Set();
  var drag = null;
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'atelier-reselect') return;
    selected.clear();
    (event.data.ids || []).forEach(function (id) { selected.add(id); });
    paint();
  });
  function nodeEls() { return Array.prototype.slice.call(document.querySelectorAll('.free-node')); }
  function byId(id) { return document.querySelector('.free-node[data-node="' + id + '"]'); }
  function layerOf(el) { return el.closest('.free-layer'); }
  function readBox(el) {
    return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, r: readRot(el), z: Number(el.style.zIndex || getComputedStyle(el).zIndex) || 1 };
  }
  function readRot(el) {
    var rot = el.querySelector('.free-rot');
    var tr = rot ? getComputedStyle(rot).transform : 'none';
    if (!tr || tr === 'none') return 0;
    var m = tr.match(/matrix\\(([^)]+)\\)/);
    if (!m) return 0;
    var p = m[1].split(',').map(Number);
    return Math.round(Math.atan2(p[1], p[0]) * 180 / Math.PI);
  }
  function apply(el, box) {
    el.style.left = box.x + 'px';
    el.style.top = box.y + 'px';
    el.style.width = box.w + 'px';
    el.style.height = box.h + 'px';
    el.style.zIndex = String(box.z);
    var rot = el.querySelector('.free-rot');
    if (rot) rot.style.transform = 'rotate(' + box.r + 'deg)';
  }
  function paint() {
    nodeEls().forEach(function (el) {
      var on = selected.has(el.dataset.node);
      el.classList.toggle('is-picked', on);
      el.querySelectorAll('.fx-handle, .rot-handle').forEach(function (handle) { handle.remove(); });
      if (!on || el.dataset.locked === '1') return;
      ['nw','n','ne','e','se','s','sw','w'].forEach(function (name) {
        var handle = document.createElement('span');
        handle.className = 'fx-handle';
        handle.dataset.handle = name;
        var pos = { nw:[0,0], n:['50%',0], ne:['100%',0], e:['100%','50%'], se:['100%','100%'], s:['50%','100%'], sw:[0,'100%'], w:[0,'50%'] }[name];
        handle.style.left = pos[0];
        handle.style.top = pos[1];
        handle.style.transform = 'translate(-50%, -50%)';
        el.appendChild(handle);
      });
      var rot = document.createElement('span');
      rot.className = 'rot-handle';
      rot.dataset.handle = 'rot';
      rot.style.left = '50%';
      rot.style.top = '-18px';
      rot.style.transform = 'translate(-50%, -50%)';
      el.appendChild(rot);
    });
    var first = selected.values().next().value;
    var host = first ? byId(first) : null;
    var block = host ? host.closest('[data-bid]') : null;
    window.parent.postMessage({ type: 'atelier-nodes', ids: Array.from(selected), blockId: block ? block.getAttribute('data-bid') : '' }, '*');
  }
  function commit(ids) {
    var boxes = ids.map(function (id) {
      var el = byId(id);
      return el ? Object.assign({ id: id }, readBox(el)) : null;
    }).filter(Boolean);
    var host = byId(ids[0]);
    var block = host ? host.closest('[data-bid]') : null;
    if (!block) return;
    window.parent.postMessage({ type: 'atelier-free-commit', blockId: block.getAttribute('data-bid'), boxes: boxes }, '*');
  }
  function targets(el) {
    var parent = el.parentElement;
    var xs = [0];
    var ys = [0];
    if (parent) {
      xs.push(parent.clientWidth / 2, parent.clientWidth);
      ys.push(parent.clientHeight / 2, parent.clientHeight);
      Array.prototype.forEach.call(parent.children, function (child) {
        if (!child.classList || !child.classList.contains('free-node') || child === el || selected.has(child.dataset.node)) return;
        xs.push(child.offsetLeft, child.offsetLeft + child.offsetWidth / 2, child.offsetLeft + child.offsetWidth);
        ys.push(child.offsetTop, child.offsetTop + child.offsetHeight / 2, child.offsetTop + child.offsetHeight);
      });
    }
    return { xs: xs, ys: ys };
  }
  function snap(x, y, w, h, el) {
    var t = targets(el);
    var guidesX = [];
    var guidesY = [];
    var nx = x;
    var ny = y;
    [[x, 0], [x + w / 2, -w / 2], [x + w, -w]].some(function (pair) {
      return t.xs.some(function (target) {
        if (Math.abs(pair[0] - target) <= 6) { nx = target + pair[1]; guidesX.push(target); return true; }
        return false;
      });
    });
    [[y, 0], [y + h / 2, -h / 2], [y + h, -h]].some(function (pair) {
      return t.ys.some(function (target) {
        if (Math.abs(pair[0] - target) <= 6) { ny = target + pair[1]; guidesY.push(target); return true; }
        return false;
      });
    });
    if (!guidesX.length) nx = Math.abs(x - Math.round(x / 8) * 8) <= 3 ? Math.round(x / 8) * 8 : x;
    if (!guidesY.length) ny = Math.abs(y - Math.round(y / 8) * 8) <= 3 ? Math.round(y / 8) * 8 : y;
    return { x: Math.round(nx), y: Math.round(ny), guidesX: guidesX, guidesY: guidesY };
  }
  function guides(layer, xs, ys) {
    layer.querySelectorAll('.guide-line').forEach(function (line) { line.remove(); });
    xs.forEach(function (x) {
      var line = document.createElement('i');
      line.className = 'guide-line';
      line.style.left = x + 'px';
      line.style.top = '0';
      line.style.width = '1px';
      line.style.height = '100%';
      layer.appendChild(line);
    });
    ys.forEach(function (y) {
      var line = document.createElement('i');
      line.className = 'guide-line';
      line.style.top = y + 'px';
      line.style.left = '0';
      line.style.height = '1px';
      line.style.width = '100%';
      layer.appendChild(line);
    });
  }
  document.addEventListener('pointerdown', function (event) {
    var handle = event.target.closest('[data-handle]');
    var node = event.target.closest('.free-node');
    var layer = event.target.closest('.free-layer');
    if (handle && node) {
      event.preventDefault();
      event.stopPropagation();
      drag = { mode: handle.dataset.handle, id: node.dataset.node, start: readBox(node), px: event.clientX, py: event.clientY, ids: Array.from(selected) };
      node.setPointerCapture(event.pointerId);
      return;
    }
    if (node) {
      var id = node.dataset.node;
      if (event.shiftKey) selected.has(id) ? selected.delete(id) : selected.add(id);
      else if (!selected.has(id)) { selected.clear(); selected.add(id); }
      paint();
      if (node.dataset.locked === '1') return;
      var starts = {};
      selected.forEach(function (sid) { var el = byId(sid); if (el && el.dataset.locked !== '1') starts[sid] = readBox(el); });
      drag = { mode: 'move', id: id, starts: starts, px: event.clientX, py: event.clientY, ids: Object.keys(starts) };
      return;
    }
    if (layer && event.target === layer) {
      selected.clear();
      paint();
      var rect = layer.getBoundingClientRect();
      drag = { mode: 'marquee', layer: layer, x: event.clientX - rect.left, y: event.clientY - rect.top, px: event.clientX, py: event.clientY };
      var box = document.createElement('div');
      box.className = 'marquee-rect';
      layer.appendChild(box);
      drag.box = box;
    }
  });
  document.addEventListener('pointermove', function (event) {
    if (!drag) return;
    var dx = event.clientX - drag.px;
    var dy = event.clientY - drag.py;
    if (drag.mode === 'move') {
      var primary = byId(drag.id);
      if (!primary) return;
      var origin = drag.starts[drag.id];
      var snapped = snap(origin.x + dx, origin.y + dy, origin.w, origin.h, primary);
      var sdx = snapped.x - origin.x;
      var sdy = snapped.y - origin.y;
      drag.ids.forEach(function (id) {
        var el = byId(id);
        var start = drag.starts[id];
        if (!el || !start) return;
        apply(el, Object.assign({}, start, { x: start.x + sdx, y: start.y + sdy }));
      });
      var layer = layerOf(primary);
      if (layer) guides(layer, snapped.guidesX, snapped.guidesY);
    } else if (drag.mode === 'marquee') {
      var rect = drag.layer.getBoundingClientRect();
      var x = Math.min(drag.x, event.clientX - rect.left);
      var y = Math.min(drag.y, event.clientY - rect.top);
      var w = Math.abs(event.clientX - rect.left - drag.x);
      var h = Math.abs(event.clientY - rect.top - drag.y);
      drag.box.style.left = x + 'px';
      drag.box.style.top = y + 'px';
      drag.box.style.width = w + 'px';
      drag.box.style.height = h + 'px';
    } else if (drag.mode === 'rot') {
      var elr = byId(drag.id);
      if (!elr) return;
      var bounds = elr.getBoundingClientRect();
      var angle = Math.atan2(event.clientY - (bounds.top + bounds.height / 2), event.clientX - (bounds.left + bounds.width / 2)) * 180 / Math.PI + 90;
      if (event.shiftKey) angle = Math.round(angle / 15) * 15;
      apply(elr, Object.assign({}, drag.start, { r: Math.round(angle) }));
    } else {
      var el = byId(drag.id);
      if (!el) return;
      var next = resizeBox(drag.start, drag.mode, dx, dy);
      if (event.shiftKey && drag.mode.length === 2) {
        var ratio = drag.start.w / Math.max(1, drag.start.h);
        next.h = Math.round(next.w / ratio);
      }
      next.w = Math.max(24, next.w);
      next.h = Math.max(16, next.h);
      apply(el, next);
    }
  });
  document.addEventListener('pointerup', function () {
    if (!drag) return;
    if (drag.mode === 'marquee') {
      var rect = drag.box.getBoundingClientRect();
      nodeEls().forEach(function (el) {
        if (el.dataset.hidden === '1') return;
        var b = el.getBoundingClientRect();
        var hit = !(b.right < rect.left || b.left > rect.right || b.bottom < rect.top || b.top > rect.bottom);
        if (hit && layerOf(el) === drag.layer) selected.add(el.dataset.node);
      });
      drag.box.remove();
      drag = null;
      paint();
      return;
    }
    var ids = drag.ids || [drag.id];
    document.querySelectorAll('.guide-line').forEach(function (line) { line.remove(); });
    drag = null;
    commit(ids);
    paint();
  });
  document.addEventListener('dblclick', function (event) {
    var node = event.target.closest('.free-node[data-kind="text"], .free-node[data-kind="button"]');
    if (!node) return;
    var rot = node.querySelector('.free-rot');
    if (!rot) return;
    event.stopPropagation();
    rot.setAttribute('contenteditable', 'true');
    rot.focus();
    var done = function () {
      rot.removeAttribute('contenteditable');
      window.parent.postMessage({ type: 'atelier-node-text', id: node.dataset.node, value: (rot.textContent || '').trim() }, '*');
      rot.removeEventListener('blur', done);
    };
    rot.addEventListener('blur', done);
  });
  window.addEventListener('keydown', function (event) {
    if (!selected.size) return;
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    var tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    event.preventDefault();
    var step = event.shiftKey ? 10 : 1;
    var ids = Array.from(selected);
    ids.forEach(function (id) {
      var el = byId(id);
      if (!el || el.dataset.locked === '1') return;
      var box = readBox(el);
      if (event.key === 'ArrowLeft') box.x -= step;
      if (event.key === 'ArrowRight') box.x += step;
      if (event.key === 'ArrowUp') box.y -= step;
      if (event.key === 'ArrowDown') box.y += step;
      apply(el, box);
    });
    commit(ids);
  });
  function resizeBox(start, mode, dx, dy) {
    var next = Object.assign({}, start);
    if (mode.indexOf('e') >= 0) next.w = start.w + dx;
    if (mode.indexOf('s') >= 0) next.h = start.h + dy;
    if (mode.indexOf('w') >= 0) { next.x = start.x + dx; next.w = start.w - dx; }
    if (mode.indexOf('n') >= 0) { next.y = start.y + dy; next.h = start.h - dy; }
    return next;
  }
}
`
}
