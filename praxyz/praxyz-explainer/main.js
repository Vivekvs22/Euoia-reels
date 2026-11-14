// Praxyz explainer render loop, polish cut: hard cuts, fitted type, word-by-word reveals on the grid, full-frame close-ups.
import { clamp, lerp, seg, eio, hash } from '/core/lib.js';
import * as UI from './ui.js';
import * as FM from './film.js';

const Q = new URLSearchParams(location.search), NOSUBS = Q.has('nosubs');
const prod = document.getElementById('prod'), hudEl = document.getElementById('hud'), curEl = document.getElementById('cur');
const { WIN, VIEW } = FM;
const WIDTH = { practice: 560, lobby: 780, room: 780, review: 620, analytics: 620, certificates: 780, publicCert: 780 };
const SAFE_W = 860;   // x 50 → 910, inside the right safe line (940)

for (const f of ['700 80px SG', '600 40px Inter', '800 80px Inter', '400 16px DM', '700 16px DM', '600 20px Mono']) await document.fonts.load(f);
await Promise.all(UI.PATIENTS.map(p => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = `assets/avatars/${p.img}.webp`; })));

// measure every screen once at its final state
const FULL = { practice: {}, lobby: { t: 0 }, room: { t: 9, amp: 6, phase: 0, state: 'ready', rohan: 1, you: 1, push: 1, caption: '', elapsed: '00:41', left: '14:50', drawer: 1 },
  review: {}, analytics: {}, certificates: {}, publicCert: {} };
const PY = {};
{
  const m = document.createElement('div'); m.style.cssText = 'position:absolute;left:-4000px;top:0;visibility:hidden'; document.body.appendChild(m);
  for (const [id, st] of Object.entries(FULL)) {
    m.innerHTML = `<div style="width:${WIDTH[id]}px">${UI.SCREENS[id](st)}</div>`;
    const root = m.firstElementChild, base = root.getBoundingClientRect(), out = {};
    for (const el of root.querySelectorAll('[data-a]')) { const r = el.getBoundingClientRect(); out[el.dataset.a] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; }
    PY[id] = out;
  }
  m.remove();
}
// fit type: font size so the longest line fills the safe width (Space Grotesk 700, −3.5 % tracking)
const cv = document.createElement('canvas').getContext('2d');
function fitSize(lines, max, width = SAFE_W) {
  cv.font = '700 100px SG'; cv.letterSpacing = '-3.5px';
  const w = Math.max(...lines.map(l => cv.measureText(l.map(x => x[0]).join(' ')).width));
  return Math.min(max, Math.floor(100 * width / w));
}
for (const H of FM.HEADS) H.px = fitSize(H.lines, 150);
FM.HOOK.px = fitSize(FM.HOOK.lines, 130); FM.CTA.px = fitSize(FM.CTA.lines, 120);
const WM_PX = fitSize([[['Praxyz']]], 270, 760);

const words = await (await fetch('voice/words.json')).json();
const env = await (await fetch('voice/patient_env.json')).json();
FM.build(words, PY, env);
window.DUR = FM.DUR; window.EV = FM.EV.slice().sort((a, b) => a.t - b.t); window.PY = PY;

function toFrame(s, ax, ay, t) { const [cx, cy, sc] = FM.camOf(s, t), W = { ...WIN, ...(s.win || {}) }; return [W.x + VIEW.w / 2 + (ax - cx) * sc, W.y + W.bar + (W.h - W.bar) / 2 + (ay - cy) * sc]; }
function anchor(key, t) {
  if (Array.isArray(key)) return key;
  const s = FM.shotAt(t); if (!s || s.kind !== 'win') return null; const r = PY[s.id][key]; if (!r) return null;
  return toFrame(s, r.x + r.w / 2, r.y + r.h / 2, t);
}

function render(t) {
  const F = FM.frame(t);
  prod.innerHTML = F.S ? windowHTML(F.S) : '';
  hudEl.innerHTML = hud(F.hud, t);
  curEl.innerHTML = cursor(t);
}

// the app window: a hard cut in, a static framing with a slow push
function windowHTML(S) {
  const id = S.id, [cx, cy, s] = S.cam, W = { ...WIN, ...(S.shot.win || {}) }, vh = W.h - W.bar;
  return `<div class="win" style="left:${W.x}px;top:${W.y}px;width:${W.w}px;height:${W.h}px">
    <div class="wbar" style="height:${WIN.bar}px"><div class="pg">P</div><div class="u"><b>praxyz.tech</b>${UI.URLS[id]}</div></div>
    <div class="wview" style="top:${WIN.bar}px"><div class="wcam" style="transform:translate(${VIEW.w / 2 - cx * s}px,${vh / 2 - cy * s}px) scale(${s})"><div style="width:${WIDTH[id]}px">${UI.SCREENS[id](S)}</div></div></div></div>`;
}

// cursor: moves between live targets inside one shot, presses on the click
function cursorPos(t) {
  const K = FM.CURSOR; let p = null, prev = null, click = 0;
  for (const m of K) {
    if (t < m.t0) break;
    const to = anchor(m.to, Math.min(t, m.t1)); if (!to) continue;
    if (!prev || m.t1 - m.t0 < .02) { p = { x: to[0], y: to[1] }; prev = p; continue; }
    const k = eio(seg(t, m.t0, m.t1)), dx = to[0] - prev.x, dy = to[1] - prev.y, L = Math.hypot(dx, dy) || 1, arc = 40 * Math.sin(Math.PI * k);
    p = { x: lerp(prev.x, to[0], k) - dy / L * arc, y: lerp(prev.y, to[1], k) + dx / L * arc };
    if (t < m.t1) break; prev = { x: to[0], y: to[1] }; p = prev;
  }
  for (const m of K) if (m.click && t >= m.t1 && t < m.t1 + .4) click = seg(t, m.t1, m.t1 + .4);
  return p && { ...p, click };
}
function cursor(t) {
  const vis = [[6.0, 7.0], [7.3, 8.0], [35.05, 36.0]].some(([a, b]) => t >= a && t < b); if (!vis) return '';
  const c = cursorPos(t); if (!c) return '';
  let h = '';
  if (c.click > 0) { const r = 16 + 40 * c.click; h += `<div class="ripple" style="left:${c.x - r}px;top:${c.y - r}px;width:${r * 2}px;height:${r * 2}px;opacity:${1 - c.click}"></div>`; }
  return h + `<svg class="cursor" style="left:${c.x - 6}px;top:${c.y - 4}px;transform:scale(${c.click > 0 && c.click < .3 ? .86 : 1});transform-origin:6px 4px" viewBox="0 0 22 30"><path d="M2 2 L2 24 L7.5 18.5 L11 27 L15 25.2 L11.6 17 L19 17 Z" fill="#fff" stroke="#0B0E14" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
}

// fitted type block; words appear (hard) once their time has come
function typeBlock(lines, px, top, isOn, extra = '') {
  return `<div class="fit" style="top:${top}px;font-size:${px}px;${extra}">${lines.map(l => l.map(w => `<span class="w ${isOn(w) ? 'on' : ''}">${w.teal ? `<em>${w.text}</em>` : w.text}</span>`).join(' ')).join('<br>')}</div>`;
}
const GLYPH = '0123456789';
function hud(H, t) {
  let h = '';
  if (H.ecu) {   // full-frame close-up: Rohan's portrait, the glow breathing (and swelling with his voice from 8.5 s)
    const sc = 3.3;
    h += `<div class="ecu"><div style="position:absolute;left:${540 - 156}px;top:${700 - 156}px;width:312px;height:312px;transform:scale(${sc * (1 + .012 * seg(t, H.shot.t0, H.shot.t1))});transform-origin:156px 156px">${UI.avatar({ ...H.ecu, noStatus: true })}</div></div>`;
    if (H.shot.t0 === 0) {   // the hook cuts in over him, word by word
      const L = FM.HOOK.lines.map(l => l.map(([text, at, teal]) => ({ text, at, teal })));
      const top = 1440 - L.length * FM.HOOK.px * .93;
      if (t >= .75) h += `<div style="position:absolute;left:0;right:0;top:${top - 160}px;bottom:0;background:linear-gradient(180deg,rgba(9,10,16,0),rgba(9,10,16,.82) 30%,rgba(9,10,16,.92))"></div>`;
      h += typeBlock(L, FM.HOOK.px, top, w => t >= w.at);
    }
  }
  if (H.head) {   // fitted headline, one word per eighth from the cut
    let k = 0; const lines = H.head.H.lines.map(l => l.map(([text, teal]) => ({ text, teal, i: k++ })));
    h += typeBlock(lines, H.head.H.px, 292, w => w.i < H.head.n);
  }
  if (H.giant) {   // ECU: the overall score from glyph noise, locking one digit per sixteenth
    const digits = ['7', '8'].map((d, i) => t < FM.T.lock[i] ? GLYPH[Math.floor(hash(Math.floor(t * 30) * 13.7 + i * 91.3) * 10)] : d).join('');
    h += `<div style="position:absolute;left:52px;top:330px;font:600 30px Mono;letter-spacing:.3em;color:rgba(255,255,255,.55)">OVERALL SCORE</div>
      <div style="position:absolute;left:0;width:940px;top:420px;text-align:center;font:800 760px/1 Inter;letter-spacing:-.06em;color:#22C55E">${digits}</div>
      <div style="position:absolute;left:52px;top:1220px;font:600 30px Mono;letter-spacing:.3em;color:rgba(255,255,255,.55)">/ 100 · SESSION 6</div>`;
  }
  if (H.shot.kind === 'end') {   // wordmark on the cut, the CTA word by word, the button on the beat
    const L = FM.CTA.lines.map(l => l.map(([text, at, teal]) => ({ text, at, teal })));
    const ctaTop = 400 + WM_PX * 1.02 + 40;
    h += `<div class="fit" style="top:400px;font-size:${WM_PX}px;letter-spacing:-.045em">Praxyz</div>`;
    h += typeBlock(L, FM.CTA.px, ctaTop, w => t >= w.at);
    if (t >= FM.CTA.button) h += `<div class="ctab" style="position:absolute;left:50px;top:${ctaTop + FM.CTA.px * 2 * .93 + 56}px;margin:0">praxyz.tech</div>`;
  }
  if (H.cap && !NOSUBS && !(H.ecu && H.shot.t0 === 0)) {
    const L = H.cap.L, tag = L.spk ? `<div class="tag">${L.spk}</div>` : '';
    h += `<div class="cap ${L.id === 'pt' ? 'pt' : ''}">${tag}<div class="tx">${L.words.map(w => `<span class="${t >= w.t ? 'on' : ''}">${w.w}</span>`).join(' ')}</div></div>`;
  }
  return h;
}

window.render = render;
render(+(Q.get('t') || 0));
window.READY = true;
