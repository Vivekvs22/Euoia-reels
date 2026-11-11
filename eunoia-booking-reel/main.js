import { clamp, seg, eo, hash } from '/core/lib.js';
import * as UI from './ui.js';
import * as SP from './sprout.js';
import * as FM from './film.js';

const Q = new URLSearchParams(location.search), NOSUBS = Q.has('nosubs');
const world = document.getElementById('world'), spr = document.getElementById('spr'), hudEl = document.getElementById('hud');
const mbg = document.getElementById('mbg'), mbw = document.getElementById('mbw');
const { SX, SY, SC, FX, FY } = FM;

await document.fonts.load('700 30px Caslon'); await document.fonts.load('400 16px Manrope'); await document.fonts.load('800 16px Manrope');
await Promise.all([...['assets/logo.png']].map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })));

// ── measure every layout once (deterministic: no frame depends on another)
const PY = {};
{
  const m = document.createElement('div'); m.className = 'scrwrap'; m.style.cssText = 'left:-3000px;top:0;visibility:hidden'; document.body.appendChild(m);
  for (const [name, S] of Object.entries(FM.LAYOUTS)) {
    m.innerHTML = `<div class="scr">${UI.screen({ ...S, scroll: 0 })}</div>`;
    const base = m.getBoundingClientRect(), page = m.querySelector('#page'), py = page ? page.getBoundingClientRect().top : base.top + 80, out = {};
    for (const el of m.querySelectorAll('[data-a]')) { const r = el.getBoundingClientRect(); out[el.dataset.a] = { x: r.left - base.left, y: r.top - py, w: r.width, h: r.height }; }
    PY[name] = out;
  }
  m.remove();
}
const words = await (await fetch('voice/words.json')).json();
FM.build(words, PY);
window.DUR = FM.DUR;
window.EV = FM.EV.slice().sort((a, b) => a.t - b.t);
window.SUBS = FM.SRT;
window.PY = PY;

const tf = ([cx, cy, z]) => `translate(${FX}px,${FY}px) scale(${z}) translate(${-cx}px,${-cy}px)`;
const phone = `<div id="wall"></div><div class="phone" style="left:${SX - 16}px;top:${SY - 16}px;width:${390 * SC + 32}px;height:${844 * SC + 32}px"></div>`;

function render(t) {
  const F = FM.frame(t), [cx, cy, z] = F.cam;
  world.innerHTML = phone + `<div class="scrwrap" style="left:${SX}px;top:${SY}px;transform:scale(${SC})"><div class="scr">${UI.screen(F.S)}</div></div>`;
  world.style.transform = spr.style.transform = tf(F.cam);
  const cache = {};
  const A = (key, fx = .5, fy = 0) => { const el = cache[key] !== undefined ? cache[key] : (cache[key] = world.querySelector(`[data-a="${key}"]`));
    if (!el) return null; const r = el.getBoundingClientRect(); if (!r.width) return null;
    return { x: (r.left + r.width * fx - FX) / z + cx, y: (r.top + r.height * fy - FY) / z + cy, w: r.width / z, h: r.height / z }; };
  // motion blur from camera speed (whips only)
  const [px, py] = FM.camAt(t - 1 / 30), vx = (cx - px) * z, vy = (cy - py) * z;
  const bx = Math.min(30, Math.max(0, Math.abs(vx) - 45) * .3), by = Math.min(30, Math.max(0, Math.abs(vy) - 45) * .3);   // only whips smear
  mbg.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`); mbw.style.filter = bx > .6 || by > .6 ? 'url(#mb)' : '';
  spr.innerHTML = sprites(F, t, A, z);
  hud(F, t, A, z, cx, cy);
}

function sprites(F, t, A, z) {
  let h = '';
  const act = F.actor, c = act.eval(t, A, F.ctx);
  if (c) {
    h += SP.sprite(c);
    for (const j of act.jumps) if (t >= j.t1 && t < j.t1 + .4) { const L = act.eval(j.t1 + .001, A, F.ctx); if (L) h += SP.dust(L.x, L.y, seg(t, j.t1, j.t1 + .4), L.px * .7, j.soft ? 4 : 6, j.t1 * 10, F.dark ? '#7E8C84' : '#C9D3BE'); }
    const top = c.y - c.px * 20;
    // the new leaf: a few pixel sparks as it opens
    if (t > FM.T.grow + .45 && t < FM.T.grow + 1.3) { const k = seg(t, FM.T.grow + .45, FM.T.grow + 1.3);
      for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * .7; h += SP.SPARK(c.x + Math.cos(a) * (30 + k * 50), top + 20 + Math.sin(a) * (20 + k * 40), 5, i % 2 ? '#F2C14E' : '#9CD46A', 1 - k); } }
    // "ninety-nine": one note pops
    if (t > FM.T.rupees && t < FM.T.rupees + .9) { const k = seg(t, FM.T.rupees, FM.T.rupees + .9); h += SP.NOTE(c.x + 30, top + 10 - k * 40, 5, 1 - k * k); }
    // rest: a slow "z"-less breath, eyes shut (no props)
  }
  // touch indicator: constant on-screen size
  const tu = F.touch.eval(t, A);
  if (tu) {
    const R = 34 / z * tu.sc, dk = F.dark;
    if (tu.ring > 0) { const rr = (34 + 46 * eo(tu.ring)) / z; h += `<div class="ripple" style="left:${tu.x - rr}px;top:${tu.y - rr}px;width:${rr * 2}px;height:${rr * 2}px;border-width:${3 / z}px;border-color:${dk ? 'rgba(255,255,255,.7)' : 'rgba(12,59,46,.55)'};opacity:${(1 - tu.ring) * tu.op}"></div>`; }
    h += `<div class="touch" style="left:${tu.x - R}px;top:${tu.y - R}px;width:${R * 2}px;height:${R * 2}px;opacity:${tu.op};background:${dk ? 'rgba(255,255,255,.34)' : 'rgba(12,59,46,.2)'};border:${3 / z}px solid rgba(255,255,255,.9);box-shadow:0 ${4 / z}px ${14 / z}px rgba(0,0,0,.22)"></div>`;
  }
  return h;
}

function hud(F, t, A, z, cx, cy) {
  const H = F.hud; let h = '';
  const scr = p => ({ x: (p.x - cx) * z + FX, y: (p.y - cy) * z + FY });
  if (H.spot && H.spot.op > 0) { const p = A(H.spot.key, .5, .5); if (p) { const s = scr(p), r = Math.max(p.w, p.h) * z * .62 + 60;
    h += `<div class="spot" style="opacity:${H.spot.op};background:radial-gradient(ellipse ${r * 1.9}px ${r * 1.15}px at ${s.x}px ${s.y}px, transparent 0, transparent 48%, rgba(4,22,15,.38) 72%, rgba(4,22,15,.72) 100%)"></div>`; } }
  if (H.keys) h += `<div class="keys" style="opacity:${H.keys.op}">${H.keys.keys.map((k, i, a) => `<i class="${H.keys.dn && i === a.length - 1 ? 'dn' : ''}">${k}</i>`).join('')}</div>`;
  if (H.cap && !NOSUBS) h += `<div class="cap" style="opacity:${H.cap.op};transform:translate(-50%,${H.cap.y}px)">${H.cap.text}</div>`;
  if (H.wipe != null) h += wipe(H.wipe);
  if (H.fade) h += `<div class="fade" style="opacity:${H.fade}"></div>`;
  hudEl.innerHTML = h;
}
// pixel wipe in the brand greens with a few terracotta pixels: covers bottom-up, reveals bottom-up
function wipe(p) {
  const S = 60, cols = 18, rows = 32; let s = '<div class="wipe">';
  const pal = ['#0C3B2E', '#14493A', '#1F5444', '#56763F', '#0C3B2E', '#C8643B'];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const d = ((rows - r) / rows) * .55 + (c / cols) * .15 + hash(c * 13.1 + r * 7.7) * .14;
    const a = clamp((p / .45 - d) / .2), b = clamp(((p - .5) / .45 - d) / .2), k = a * (1 - b);
    if (k <= 0) continue; const sz = S * k, ci = hash(c * 3.7 + r * 11.3);
    s += `<b style="left:${c * S + (S - sz) / 2}px;top:${r * S + (S - sz) / 2}px;width:${sz + .5}px;height:${sz + .5}px;background:${pal[ci > .96 ? 5 : Math.floor(ci * 5)]}"></b>`;
  }
  return s + '</div>';
}

window.render = render;
render(+(Q.get('t') || 0));
window.READY = true;
