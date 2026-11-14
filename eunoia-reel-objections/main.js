// Reel 2 render loop (adapted from reel 1's main.js): phone world → objection card + captions (HUD) → sprout + touch.
import { clamp, seg, eo } from '/core/lib.js';
import * as UI from './ui.js';
import * as SP from './sprout.js';
import * as FM from './film.js';

const Q = new URLSearchParams(location.search), NOSUBS = Q.has('nosubs');
const world = document.getElementById('world'), spr = document.getElementById('spr'), hudEl = document.getElementById('hud');
const mbg = document.getElementById('mbg'), mbw = document.getElementById('mbw');
const { SX, SY, SC, FX, FY } = FM;

await document.fonts.load('700 30px Caslon'); await document.fonts.load('italic 700 88px Caslon'); await document.fonts.load('400 16px Manrope'); await document.fonts.load('800 16px Manrope');
await new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = 'assets/logo.png'; });

// measure every layout once (deterministic: no frame depends on another)
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

const tf = ([cx, cy, z]) => `translate(${FX}px,${FY}px) scale(${z}) translate(${-cx}px,${-cy}px)`;
const phone = `<div id="wall"></div><div class="phone" style="left:${SX - 16}px;top:${SY - 16}px;width:${390 * SC + 32}px;height:${844 * SC + 32}px"></div>`;

function render(t) {
  const F = FM.frame(t), [cx, cy, z] = F.cam;
  world.innerHTML = phone + `<div class="scrwrap" style="left:${SX}px;top:${SY}px;transform:scale(${SC})"><div class="scr">${UI.screen(F.S)}</div></div>`;
  world.style.transform = spr.style.transform = tf(F.cam);
  hud(F, t);
  // anchors: phone elements and the HUD card, returned in world coords
  const cache = {};
  const A = (key, fx = .5, fy = 0) => { const el = cache[key] !== undefined ? cache[key] : (cache[key] = world.querySelector(`[data-a="${key}"]`) || hudEl.querySelector(`[data-a="${key}"]`));
    if (!el) return null; const r = el.getBoundingClientRect(); if (!r.width) return null;
    return { x: (r.left + r.width * fx - FX) / z + cx, y: (r.top + r.height * fy - FY) / z + cy, w: r.width / z, h: r.height / z }; };
  const [px, py] = FM.camAt(t - 1 / 30), vx = (cx - px) * z, vy = (cy - py) * z;
  const bx = Math.min(30, Math.max(0, Math.abs(vx) - 45) * .3), by = Math.min(30, Math.max(0, Math.abs(vy) - 45) * .3);
  mbg.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`); mbw.style.filter = bx > .6 || by > .6 ? 'url(#mb)' : '';
  spr.innerHTML = sprites(F, t, A, z);
}

function sprites(F, t, A, z) {
  let h = '';
  const act = F.actor, c = act.eval(t, A, F.ctx);
  if (c) {
    h += SP.sprite(c);
    for (const j of act.jumps) if (t >= j.t1 && t < j.t1 + .35) { const L = act.eval(j.t1 + .001, A, F.ctx); if (L) h += SP.dust(L.x, L.y, seg(t, j.t1, j.t1 + .35), L.px * .8, 4, j.t1 * 10, '#C9D3BE'); }
    // a little sparkle each time the sprout perks up on an answer
    for (const cd of FM.CARDS) if (cd.strike && t > cd.strike + .4 && t < cd.strike + 1.1) { const k = seg(t, cd.strike + .4, cd.strike + 1.1), top = c.y - c.px * 20;
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * .8; h += SP.SPARK(c.x + Math.cos(a) * (20 + k * 34), top + 14 + Math.sin(a) * (14 + k * 26), 4, i % 2 ? '#F2C14E' : '#9CD46A', 1 - k); } }
  }
  const tu = F.touch.eval(t, A);
  if (tu) {
    const R = 34 / z * tu.sc;
    if (tu.ring > 0) { const rr = (34 + 46 * eo(tu.ring)) / z; h += `<div class="ripple" style="left:${tu.x - rr}px;top:${tu.y - rr}px;width:${rr * 2}px;height:${rr * 2}px;border-width:${3 / z}px;border-color:rgba(12,59,46,.55);opacity:${(1 - tu.ring) * tu.op}"></div>`; }
    h += `<div class="touch" style="left:${tu.x - R}px;top:${tu.y - R}px;width:${R * 2}px;height:${R * 2}px;opacity:${tu.op};background:rgba(12,59,46,.2);border:${3 / z}px solid rgba(255,255,255,.9);box-shadow:0 ${4 / z}px ${14 / z}px rgba(0,0,0,.22)"></div>`;
  }
  return h;
}

// the objection card (or the CTA card) and the caption pill: never in the same place
function card(K) {
  const c = K.c, quoteWrap = s => s.replace(/^“/, '<span class="q">“</span>').replace(/”$/, '<span class="q c">”</span>');
  const lines = c.lines.map((l, i) => `<span class="ln">${c.cta ? l : quoteWrap(l)}${K.strike && K.strike[i] > 0 ? `<i class="st" style="width:calc(${K.strike[i] * 100}% + 20px)"></i>` : ''}</span>`).join('<br>');
  const tr = `perspective(1400px) translateX(${K.tx || 0}px) rotate(${K.rot || 0}deg) rotateX(${K.rx || 0}deg)`;
  return `<div class="obj ${c.cta ? 'cta' : ''}" data-a="objcard" style="transform:${tr};opacity:${K.op ?? 1}">${lines}${c.cta ? '<div class="u">eunoia.care</div>' : ''}</div>`;
}
function hud(F, t) {
  const H = F.hud; let h = '';
  if (H.card) h += card(H.card);
  if (H.cap && !NOSUBS) h += `<div class="cap" style="opacity:${H.cap.op};transform:translate(-50%,${H.cap.y}px)">${H.cap.text}</div>`;
  hudEl.innerHTML = h;
}

window.render = render;
render(+(Q.get('t') || 0));
window.READY = true;
