// Praxyz reel B render loop, premium cut.
// World camera + 3D rig (window and instrument strip tilted in space, real shadow, glass reflection), background parallax,
// kinetic masked type, rolling numbers; effects only at hero moments (cell sweeps, turbulence, touchdown, panel slide, end sweep).
import { clamp, lerp, seg, hash } from '/core/lib.js';
import * as UI from './ui.js';
import * as FM from './film.js';

const Q = new URLSearchParams(location.search), NOSUBS = Q.has('nosubs');
const world = document.getElementById('prod'), hudEl = document.getElementById('hud'), bgp = document.getElementById('bgp');
const mbg = document.getElementById('mbg'), mbw = document.getElementById('mbw');
const { WIN, VIEW, STRIP, F, T, E8, EASE } = FM;
const WIDTH = { room: 780, roomT: 780, review: 620, certificates: 780 };
const SAFE_W = 860;

for (const f of ['700 80px SG', '600 40px SG', '600 40px Inter', '800 80px Inter', '400 16px DM', '700 16px DM', '600 20px Mono']) await document.fonts.load(f);
await new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = 'assets/avatars/rohan-35-depression.webp'; });

const FULL = { room: { t: 9, amp: 6, phase: 0, state: 'ready', msgs: FM.MSGS, caption: '', elapsed: '00:41', drawerOpen: false },
  roomT: { t: 9, amp: 6, phase: 0, state: 'ready', msgs: FM.MSGS, caption: '', elapsed: '00:41', drawerOpen: true }, review: {}, certificates: {} };
const SCREEN_OF = id => id === 'roomT' ? 'room' : id;
const PY = {};
{
  const m = document.createElement('div'); m.style.cssText = 'position:absolute;left:-4000px;top:0;visibility:hidden'; document.body.appendChild(m);
  for (const [id, st] of Object.entries(FULL)) {
    m.innerHTML = `<div style="width:${WIDTH[id]}px">${UI.SCREENS[SCREEN_OF(id)](st)}</div>`;
    const root = m.firstElementChild, base = root.getBoundingClientRect(), out = {};
    for (const el of root.querySelectorAll('[data-a]')) { const r = el.getBoundingClientRect(); out[el.dataset.a] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; }
    PY[id] = out;
  }
  m.remove();
}
const cv = document.createElement('canvas').getContext('2d');
function fitSize(lines, max, width = SAFE_W) {
  cv.font = '700 100px SG'; cv.letterSpacing = '-3.5px';
  const w = Math.max(...lines.map(l => cv.measureText(l.map(x => x[0]).join(' ')).width));
  return Math.min(max, Math.floor(100 * width / w));
}
for (const H of FM.HEADS) H.px = fitSize(H.lines, 150);
FM.HOOK.px = fitSize(FM.HOOK.lines, 150); FM.CTA.px = fitSize(FM.CTA.lines, 120);
const WM_PX = fitSize([[['Praxyz']]], 270, 760);

const words = await (await fetch('voice/words.json')).json();
const env = await (await fetch('voice/patient_env.json')).json();
FM.build(words, PY, env);
window.DUR = FM.DUR; window.EV = FM.EV.slice().sort((a, b) => a.t - b.t);

const expo = p => p >= 1 ? 1 : 1 - 2 ** (-10 * p);
const camT = c => `translate(${F.x}px,${F.y}px) scale(${c.s}) translate(${-c.x}px,${-c.y}px)`;

function render(t) {
  const O = FM.frame(t);
  const c = O.cam || { x: F.x, y: F.y, s: 1 };
  bgp.style.transform = `translate(${-(c.x - F.x) * .12}px,${-(c.y - F.y) * .12}px) scale(${1 + (c.s - 1) * .12})`;   // parallax
  world.innerHTML = O.win ? rig(O) : '';
  world.style.transform = O.cam ? camT(O.cam) : '';
  let bx = 0, by = 0;   // motion blur on whips only
  if (O.cam) { const p = FM.camAt(t - 1 / 30), vx = (c.x - p.x) * c.s, vy = (c.y - p.y) * c.s, vz = Math.abs(Math.log(c.s / p.s)) * 900;
    bx = Math.min(26, Math.max(0, Math.abs(vx) + vz * .3 - 40) * .28); by = Math.min(26, Math.max(0, Math.abs(vy) + vz * .3 - 40) * .28); }
  mbg.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`); mbw.style.filter = bx > .6 || by > .6 ? 'url(#mb)' : '';
  hudEl.innerHTML = hud(O, t);
}

// the rig: window + instrument strip in one tilted plane, a soft shadow on the floor
function rig(O) {
  const c = O.cam, W = O.win, [cx, cy, s] = W.inner, t = O.t, vh = W.h - WIN.bar;
  let h = `<div class="floor" style="left:${WIN.x + 60}px;top:${(O.strip ? STRIP.y + STRIP.h : WIN.y + W.h) + 30}px;width:${WIN.w - 120}px"></div>`;
  h += `<div class="rig" style="transform-origin:${F.x}px ${F.y}px;transform:perspective(2200px) rotateX(${c.rx}deg) rotateY(${c.ry}deg)">`;
  const D = dof(t);
  h += `<div class="win" style="left:${WIN.x}px;top:${WIN.y}px;width:${WIN.w}px;height:${W.h}px;${D.k > 0 ? `filter:blur(${6 * D.k}px);opacity:${1 - .55 * D.k}` : ''}">
    <div class="wbar" style="height:${WIN.bar}px"><div class="pg">P</div><div class="u"><b>praxyz.tech</b>${UI.URLS[W.screen]}</div></div>
    <div class="wview" style="top:${WIN.bar}px"><div class="wcam" style="transform:translate(${VIEW.w / 2 - cx * s}px,${vh / 2 - cy * s}px) scale(${s})"><div style="width:${WIDTH[W.id]}px">${UI.SCREENS[W.screen](W.S)}</div></div></div>
    <div class="glass"></div></div>`;
  if (O.strip) h += strip(O.strip, t);
  return h + '</div>';
}
// pre-flight burst: which cell is in focus, and how much the rest is defocused (1 = fully)
function dof(t) {
  if (t < FM.g(17) || t >= T.pull[0] + .3) return { focus: -1, k: 0 };
  return { focus: t < T.cells[1] - .12 ? 0 : t < T.cells[2] - .12 ? 1 : t < T.cells[3] - .12 ? 2 : 3, k: 1 - seg(t, T.pull[0], T.pull[0] + .3) };
}
// instrument strip: 2 × 2 cells, thin rules, mono labels, big values; each switches on with a thin light sweep
function strip(cells, t) {
  const cw = STRIP.w / 2, ch = STRIP.h / 2;
  return `<div class="strip" style="left:${STRIP.x}px;top:${STRIP.y}px;width:${STRIP.w}px;height:${STRIP.h}px">${cells.map((c, i) => {
    const on = t >= c.on, k = seg(t, c.on, c.on + .3), sweep = k > 0 && k < 1 ? `<i class="sweep" style="left:${-120 + k * (cw + 160)}px"></i>` : '';
    const D = dof(t), nb = D.k > 0 && i !== D.focus ? D.k : 0;   // a neighbour: shallow depth of field, unreadable
    return `<div class="cell" data-cell="${i}" style="left:${(i % 2) * cw}px;top:${Math.floor(i / 2) * ch}px;width:${cw}px;height:${ch}px;${nb ? `filter:blur(${9 * nb}px);opacity:${1 - .88 * nb}` : ''}">
      <div class="lbl" style="color:${on ? 'rgba(255,255,255,.62)' : 'rgba(255,255,255,.2)'}">${c.label}</div>
      <div class="val" style="color:${!on ? 'transparent' : c.ok ? '#00BFA5' : '#F3F4F6'}">${c.value}</div>${sweep}</div>`; }).join('')}</div>`;
}
// kinetic type: each word rises through its own mask, one per eighth; exits upward the same way
function kinetic(t, lines, px, top, inAt, outAt, extra = '') {
  return `<div class="fit kin" style="top:${top}px;font-size:${px}px;${extra}">${lines.map(l => l.map(w => {
    const a = inAt(w), ki = expo(seg(t, a, a + .3)), ko = outAt == null ? 0 : expo(seg(t, outAt + w.i * .03, outAt + w.i * .03 + .18));
    return `<span class="mw"><span class="mi" style="transform:translateY(${(1 - ki) * 108 - ko * 108}%)">${w.teal ? `<em>${w.text}</em>` : w.text}</span></span>`; }).join(' ')).join('<br>')}</div>`;
}
// rolling digits: an odometer column per digit (pos may be fractional)
const column = pos => `<span class="odo"><span style="transform:translateY(${-(((pos % 10) + 10) % 10) / 11 * 100}%)">${'01234567890'.split('').map(d => `<b>${d}</b>`).join('')}</span></span>`;
function odometer(V, dec = 0) {
  const ones = V % 10, tens = Math.floor(V / 10) + Math.max(0, ones - 9);
  return dec ? `${column(tens)}<span class="odot">.</span>${column(ones)}` : `${column(tens)}${column(ones)}`;
}
function hud(O, t) {
  let h = '';
  const sh = O.shot;
  // pre-flight cell close-ups: everything but the focused cell sinks into the dark
  if (sh.kind === 'world' && t < T.pull[1] && t >= FM.g(17)) {
    const el = world.querySelector(`[data-cell="${t < T.cells[1] - .12 ? 0 : t < T.cells[2] - .12 ? 1 : t < T.cells[3] - .12 ? 2 : 3}"]`), fade = 1 - seg(t, T.pull[0], T.pull[0] + .3);
    if (el && fade > 0) { const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      h += `<div class="focus" style="opacity:${fade};background:radial-gradient(ellipse ${r.width * .78}px ${r.height * 1.2}px at ${x}px ${y}px, rgba(6,7,10,0) 58%, rgba(6,7,10,.9) 100%)"></div>`; }
  }
  if (sh.kind === 'hook') {   // readable on frame 1; a slow push, then out on the whip
    const L = FM.HOOK.lines.map(l => l.map(([text, teal]) => ({ text, teal }))), hgt = L.length * FM.HOOK.px * .93, p = seg(t, 0, FM.g(17)), out = seg(t, FM.g(17) - .14, FM.g(17));
    h += `<div style="position:absolute;inset:0;transform:translateY(${-14 * p - out * out * 420}px) scale(${1 + .03 * p});transform-origin:470px 780px;filter:blur(${out * 10}px)">
      <div class="fit" style="top:${Math.round(780 - hgt / 2)}px;font-size:${FM.HOOK.px}px">${L.map(l => l.map(w => w.teal ? `<em>${w.text}</em>` : w.text).join(' ')).join('<br>')}</div></div>`;
  }
  if (sh.kind === 'ecu') {   // Rohan, held: a slow push. TURBULENCE: amber light pulse + 3 px shake + quick punch-in, on the warning tone
    const A = FM.avatarState(t), d = t - T.turb0, hit = d >= 0 && d < .6 ? Math.exp(-d * 7) : 0;
    const punch = d >= 0 ? .07 * Math.exp(-d * 5) * (1 - Math.exp(-d * 60)) : 0, shx = hit * 3 * Math.sin(d * 95), shy = hit * 2.4 * Math.cos(d * 77);
    const sc = 3.25 * (1 + .03 * seg(t, sh.t0, sh.t1)) * (1 + punch);
    h += `<div class="ecu" style="transform:translate(${shx}px,${shy}px)"><div style="position:absolute;left:${540 - 156}px;top:${730 - 156}px;width:312px;height:312px;transform:scale(${sc});transform-origin:156px 156px">${UI.avatar({ ...A, noStatus: true })}</div></div>`;
    if (hit > .01) h += `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 900px 1300px at 470px 700px, rgba(245,158,11,${.26 * hit}), rgba(245,158,11,${.1 * hit}) 60%, rgba(245,158,11,0))"></div>`;
    if (t >= T.turb0 && t < T.turb1) h += `<div class="annun" style="transform:translate(${shx}px,${shy}px)">TURBULENCE</div>`;
  }
  const H = FM.HEADS.find(x => t >= x.t0 && t < x.t1);
  if (H && sh.kind === 'world' && !sh.touchdown && !(sh.hours && t < T.slide[1])) { let i = 0; const L = H.lines.map(l => l.map(([text, teal]) => ({ text, teal, i: i++ }))); h += kinetic(t, L, H.px, 292, w => H.t0 + w.i * E8, H.t1 - .2); }
  if (sh.touchdown) h += touchdown(t);
  if (sh.hours) h += hours(t);
  if (sh.kind === 'end') {   // a soft light sweep across the wordmark; the CTA rises word by word; the button settles in
    let i = 0; const L = FM.CTA.lines.map(l => l.map(([text, at, teal]) => ({ text, at, teal, i: i++ }))), ctaTop = 400 + WM_PX * 1.02 + 40;
    const p = seg(t, T.end + .12, T.end + 1.0), fr = -20 + p * 140;
    const glint = p > 0 && p < 1 ? `<div class="fit" style="top:400px;font-size:${WM_PX}px;letter-spacing:-.045em;color:transparent;background:linear-gradient(100deg,transparent ${fr - 14}%,rgba(230,255,250,.55) ${fr - 4}%,transparent ${fr + 3}%);-webkit-background-clip:text;background-clip:text">Praxyz</div>` : '';
    h += `<div class="fit" style="top:400px;font-size:${WM_PX}px;letter-spacing:-.045em">Praxyz</div>${glint}`;
    h += kinetic(t, L, FM.CTA.px, ctaTop, w => w.at, null);
    const b = seg(t, FM.CTA.button, FM.CTA.button + .35);
    if (b > 0) h += `<div class="ctab" style="position:absolute;left:50px;top:${ctaTop + FM.CTA.px * 2 * .93 + 56}px;margin:0;transform:scale(${EASE.settle(b) * .12 + .88});transform-origin:0 50%;opacity:${clamp(b * 4)}">praxyz.tech</div>`;
  }
  if (!NOSUBS) {
    const L = FM.LINES.find(l => t >= l.hold[0] && t < l.hold[1]);
    if (L) { const tag = L.spk ? `<div class="tag">${L.spk}</div>` : ''; h += `<div class="cap ${L.id === 'pt' ? 'pt' : ''}">${tag}<div class="tx">${L.words.map(w => `<span class="${t >= w.t ? 'on' : ''}">${w.w}</span>`).join(' ')}</div></div>`; }
  }
  return h;
}
// touchdown: the session's score ring flies forward and becomes the big 81; fine teal particles on impact; a brief slow-motion hit
function touchdown(t) {
  const ringEl = world.querySelector('[data-a="ring"]'); let h = '';
  const R = 380, C = { x: 470, y: 860 }, k = seg(t, T.land, T.impact), fly = k * k * k;
  let x = C.x, y = C.y, r = R;
  if (ringEl && k < 1) { const b = ringEl.getBoundingClientRect(), r0 = b.width / 2; x = lerp(b.left + r0, C.x, fly); y = lerp(b.top + r0, C.y, fly); r = lerp(r0, R, fly); }
  const after = t >= T.impact, tau = .32 * (Math.min(t, T.slowEnd) - T.impact) + Math.max(0, t - T.slowEnd);
  const rr = r * (after ? 1 + .02 * clamp(tau / .6) : 1), sw = Math.max(6, 28 * r / R);
  const V = 81 * (1 - (1 - seg(t, T.land, T.impact + .18)) ** 3);
  h += `<div class="tddim" style="opacity:${clamp(k * 1.4) * .84}"></div>`;
  h += `<svg style="position:absolute;left:${x - rr - sw}px;top:${y - rr - sw}px" width="${2 * (rr + sw)}" height="${2 * (rr + sw)}"><g transform="translate(${rr + sw},${rr + sw}) rotate(-90)">
    <circle r="${rr}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="${sw}"/><circle r="${rr}" fill="none" stroke="#22C55E" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * rr * .81} ${2 * Math.PI * rr}"/></g></svg>`;
  h += `<div class="big81" style="left:${x}px;top:${y}px;font-size:${420 * r / R}px">${odometer(V)}</div>`;
  if (after) {
    for (let i = 0; i < 90; i++) { const a = hash(i * 1.7) * Math.PI * 2, v = 260 + 620 * hash(i * 3.3), d = R + v * (1 - Math.exp(-tau * 2.2)) * .9, sz = 2 + 4 * hash(i * 5.1), op = clamp(1 - tau / (.6 + .6 * hash(i * 9.1)));
      if (op > 0) h += `<i class="ptc" style="left:${C.x + Math.cos(a) * d}px;top:${C.y + Math.sin(a) * d}px;width:${sz}px;height:${sz}px;opacity:${op}"></i>`; }
    h += `<div class="mlabel" style="top:322px;font-size:38px;letter-spacing:.2em;color:rgba(255,255,255,.88);opacity:${clamp(tau * 4)}">LANDING REPORT · SESSION 7</div>`;
  }
  return h;
}
// 4.2 h: an instrument panel with rolling digits; then it slides aside to reveal the certificate
function hours(t) {
  let V = 39; T.hourSteps.forEach(a => { V += 1 - (1 - seg(t, a, a + .22)) ** 3; });
  const sl = seg(t, T.slide[0], T.slide[1]); if (sl >= 1) return '';
  const e = sl < .5 ? 4 * sl ** 3 : 1 - (-2 * sl + 2) ** 3 / 2, push = 1 + .025 * seg(t, T.hours, T.slide[0]);
  return `<div class="hpanel" style="transform:translateX(${-1180 * e}px) scale(${push});transform-origin:470px 800px">
    <div class="mlabel" style="top:330px">HOURS PRACTISED</div><i class="hr" style="top:400px"></i>
    <div class="hval">${odometer(V, 1)}<span class="hu">h</span></div>
    <i class="hr" style="top:1150px"></i><div class="mlabel" style="top:1180px">7 SESSIONS · ISHAAN RAO</div></div>`;
}

window.render = render;
render(+(Q.get('t') || 0));
window.READY = true;
