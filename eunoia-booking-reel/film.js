// "The quiet path": timeline. VO onsets come from the client's own narration (waveform + Whisper, voice/words.json).
// Camera, sprout, touch, screen state, captions and sound events all hang off the times in T.
import { clamp, lerp, seg, ss, eio, eo, hash } from '/core/lib.js';
import { NOTES } from './ui.js';

export const DUR = 32.0;
export const SX = 80, SY = 110, SC = 2;          // phone screen origin in world px, CSS → world scale
export const FX = 470, FY = 800;                 // focus point on the frame (centre of the safe column, above the caption lane)

// ───────── voice: line onsets measured from the waveform (timing.md agrees to 0.1 s)
export const VO = { l1: 0.20, l2: 3.50, l3: 6.70, l4: 12.30, l5: 18.70, l6: 22.40, l7: 27.60 };
export const SUBS = [
  { t0: 0.05, t1: 3.55, text: 'Some weeks, everything feels too loud.' },
  { t0: 3.55, t1: 9.40, text: 'Find a therapist who speaks your language,<br>and gets what you’re going through.' },
  { t0: 12.25, t1: 15.0, text: 'Pick a time that works for you.' },
  { t0: 18.45, t1: 22.3, text: 'Your first session: just ₹99.' },
  { t0: 22.35, t1: 27.45, text: 'That first step is the hardest.<br>And you’ve taken it.' },
];
// the end-card line is on screen as the tagline: not burned in, but in the .srt
export const SRT = SUBS.map(s => ({ ...s, text: s.text.replace(/<br>/g, ' ') })).concat([{ t0: 27.6, t1: 31.2, text: 'Eunoia. Find your way back to yourself.' }]);

// ───────── key times
export const T = {
  peek: 2.55, swipe: 3.15, unlock0: 3.2, unlock1: 3.58,
  drag1: 4.3, drag1e: 4.9, tapLang: 6.13, out1: 6.40, in1: 6.85, in1e: 7.30, tapStress: 7.80, out2: 8.45, in2: 8.90, in2e: 9.35,
  drag2: 9.4, drag2e: 9.9, land: 10.67, tapBook: 11.33, nav1: 11.6,
  drag3: 12.55, drag3e: 12.95, tapDay: 13.33, tapSlot: 14.0, tapCont: 14.67, dlg: 14.85,
  dig0: 16.31, dstep: 0.3125, verify: 17.95, close: 18.15, toast: 18.1, details: 18.3,
  freeze0: 19.3, ninety: 20.50, rupees: 21.12, tapPay: 21.95, booked: 22.2, grow: 26.0,
  wipe: 27.0, calm: 27.3, eunoia: 27.6, end: 27.6, word: 27.9, tag: 28.1, url: 28.4, rest: 30.0,
};

export const EV = [];
const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });

// ───────── layouts measured at start-up (main.js renders each into a hidden phone and reads every [data-a])
export const LAYOUTS = {
  find0: { kind: 'find', find: { step: 0 } },
  find1: { kind: 'find', find: { step: 1 } },
  find2: { kind: 'find', find: { step: 2 } },
  pick: { kind: 'booking', booking: { stage: 'pick', day: '13', slot: '6:00 PM' } },
  details: { kind: 'booking', booking: { stage: 'details' } },
  status: { kind: 'status', status: {} },
  dialog: { kind: 'booking', booking: { stage: 'pick', day: '13', slot: '6:00 PM' }, dialog: { k: 1, n: 0 } },
};
let PY = {};
// world point of an element in a measured layout at a given page scroll (overlays: scroll 0)
const wp = (L, key, fx = .5, fy = .5, scroll = 0) => { const r = PY[L][key]; if (!r) throw new Error(`no ${key} in ${L}`);
  return { x: SX + SC * (r.x + r.w * fx), y: SY + SC * (80 + r.y + r.h * fy - scroll) }; };

// ───────── camera: [cx, cy, z] = world point at the focus, zoom ≥ 1; moves chain continuously
const EASE = { eio, ss, eo, whip: x => { x = clamp(x); return x < .5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2; } };
const CAM0 = [FX, FY, 1], MOVES = [];
const cam = (t0, d, to, e = 'eio') => MOVES.push({ t0, d, to, e });
export function camAt(t) {
  let v = CAM0.slice(); v[2] = Math.log(v[2]);
  for (const m of MOVES) { if (t <= m.t0) break; const p = EASE[m.e]((t - m.t0) / m.d);
    v = [lerp(v[0], m.to[0], p), lerp(v[1], m.to[1], p), lerp(v[2], Math.log(Math.max(1, m.to[2])), p)]; }
  return [v[0] + Math.sin(t * .6) * 1.4, v[1] + Math.sin(t * .47 + 1) * 1.1, Math.exp(v[2])];
}

// ───────── page scroll (CSS px), piecewise eased
let SCR = [];
const scrollKey = (t0, t1, to, e = eio) => SCR.push({ t0, t1, to, e });
export function scrollAt(t) { let v = 0; for (const s of SCR) { if (t <= s.t0) break; v = lerp(v, s.to, s.e(seg(t, s.t0, s.t1))); } return v; }

// ───────── the sprout
class Actor {
  constructor(px = 6) { this.px = px; this.segs = []; this.jumps = []; this.last = {}; }
  add(s) { this.segs.push(s); return this; }
  stand(t0, t1, at, o = {}) { return this.add({ k: 'stand', t0, t1, at, ...o }); }
  walk(t0, t1, from, to, o = {}) { for (let t = t0 + .05; t < t1; t += .14) ev(t, 'step', { v: .4 }); return this.add({ k: 'walk', t0, t1, from, to, ...o }); }
  jump(t0, t1, from, to, h = 60, o = {}) { this.jumps.push({ t0, t1, soft: o.soft }); ev(t0 - .02, 'jump', { d: t1 - t0, v: o.soft ? .4 : .7 }); ev(t1, 'land', { v: o.soft ? .35 : .6 });
    return this.add({ k: 'jump', t0, t1, from, to, h, ...o }); }
  hide(t0, t1) { return this.add({ k: 'hide', t0, t1 }); }
  seg(t) { let s = null; for (const x of this.segs) { if (x.t0 <= t && t < x.t1) return x; if (x.t0 <= t) s = x; } return s; }
  eval(t, A, ctx) {
    const s = this.seg(t); if (!s || s.k === 'hide') return null;
    const px = (s.px || this.px); let pos, flip = false, sq = 0, eyes = 'n', leaves = 'n';
    const P = f => typeof f === 'function' ? f(A, t, ctx) : f;
    if (s.k === 'stand') pos = P(s.at);
    if (s.k === 'walk') { const a = P(s.from), b = P(s.to); if (!a || !b) return null; const p = ss(seg(t, s.t0, s.t1)); pos = { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) }; flip = b.x < a.x; sq = Math.floor(t * 7) % 2 ? .05 : 0; }
    if (s.k === 'jump') { const a = P(s.from), b = P(s.to) || a; if (!a) return null; const p = seg(t, s.t0, s.t1);
      const ap = Math.min(a.y, b.y) - s.h, cy = 2 * ap - (a.y + b.y) / 2;
      pos = { x: lerp(a.x, b.x, ss(p)), y: (1 - p) ** 2 * a.y + 2 * (1 - p) * p * cy + p * p * b.y };
      sq = p < .5 ? -.16 * (1 - p * 2) : -.08 * (p * 2 - 1); leaves = 'up'; flip = b.x < a.x - 2; }
    if (!pos) return null;
    for (const j of this.jumps) {
      if (t >= j.t0 - .12 && t < j.t0) sq = Math.max(sq, (j.soft ? .14 : .22) * ss(seg(t, j.t0 - .12, j.t0)));
      if (t >= j.t1 && t < j.t1 + .24) { const k = seg(t, j.t1, j.t1 + .24); sq = (j.soft ? .16 : .26) * (1 - k) * Math.cos(k * 7); }
    }
    if (s.k === 'stand' && !s.still) { const B = ctx.beat(t); if (B < .14) sq += .05 * Math.sin(B / .14 * Math.PI); }   // breathes on the beat
    const bl = Math.floor(t / 2.7), bt = t - bl * 2.7 - hash(bl * 3.1) * 1.8; if (bt > 0 && bt < .1) eyes = 'blink';
    if (s.eyes) { const e = typeof s.eyes === 'function' ? s.eyes(t) : s.eyes; if (e && !(eyes === 'blink' && 'nlrud'.includes(e))) eyes = e; }
    if (s.leaves && s.k !== 'jump') leaves = typeof s.leaves === 'function' ? s.leaves(t) : s.leaves;
    if (s.sq) sq += s.sq(t);
    const x = Math.round(pos.x / (px / 2)) * (px / 2), y = Math.round(pos.y / (px / 2)) * (px / 2);
    return { x, y, px, flip, sq, eyes, leaves, grow: ctx.grow(t), op: s.op ? s.op(t) : 1, clipY: s.clip ? P(s.clip) : null, shadow: s.k === 'jump' ? 0 : (s.shadow ?? 1) };
  }
}

// ───────── the touch indicator (the user): spring paths, press, ripple, drags
class Touch {
  constructor() { this.moves = []; this.taps = []; this.vis = []; }
  show(t0, t1) { this.vis.push([t0, t1]); return this; }
  move(t0, t1, to, arc = 30) { this.moves.push({ t0, t1, to, arc }); return this; }
  tap(t, o = {}) { this.taps.push(t); ev(t, 'tap', o); return this; }
  eval(t, A) {
    let op = 0; for (const [a, b] of this.vis) op = Math.max(op, Math.min(seg(t, a, a + .12), 1 - seg(t, b - .15, b)));
    if (op <= 0) return null;
    let p = null, prev = null;
    for (const m of this.moves) { const to = m.to(A, t); if (!to) continue; if (t < m.t0 && prev) break;
      if (!prev) { p = to; prev = to; if (t < m.t0) break; continue; }
      const k = seg(t, m.t0, m.t1), e = eio(k), dx = to.x - prev.x, dy = to.y - prev.y, L = Math.hypot(dx, dy) || 1;
      p = { x: lerp(prev.x, to.x, e) - dy / L * m.arc * Math.sin(Math.PI * e), y: lerp(prev.y, to.y, e) + dx / L * m.arc * Math.sin(Math.PI * e) };
      if (k < 1) break; prev = to; }
    if (!p) return null;
    let sc = 1, ring = 0; for (const c of this.taps) { if (t >= c - .04 && t < c + .12) sc = .78; if (t >= c && t < c + .5) ring = seg(t, c, c + .5); }
    return { ...p, op, sc, ring };
  }
}

// anchors: live DOM, last position kept while an element is briefly absent
const at = (key, fx = .5, fy = 0, dx = 0, dy = 0) => { let last = null; return A => { const p = A(key, fx, fy); if (p) last = { x: p.x + dx, y: p.y + dy }; return last; }; };
const pt = (x, y) => () => ({ x, y });

// ───────── notification pile
const NT = [0.05, 0.42, 0.78, 1.08, 1.34, 1.58, 1.80, 2.0, 2.2];
function pile(t) {
  const n = NT.filter(x => t >= x).length, cards = [];
  const fling = seg(t, T.unlock0 - .02, T.unlock0 + .3);
  for (let j = 0; j < n; j++) {
    const i = n - 1 - j, sp = lerp(84, 36, clamp((n - 1) / 8)), k = eo(seg(t, NT[j], NT[j] + .28)), mess = clamp((n - 3) / 6);
    let y = 200 + i * sp - (1 - k) * 70, x = (hash(j * 3.3) - .5) * 14 * mess, rot = (hash(j * 7.1) - .5) * 5 * mess;
    if (j === 8 && t > 2.72 && t < 2.95) y -= 6 * Math.sin(seg(t, 2.72, 2.95) * Math.PI);   // "loud": the pile shudders
    if (fling > 0) { const f = ei3(clamp(fling * 1.25 - i * .06)); y -= f * 900; rot += f * (hash(j) - .5) * 30; }
    cards.push({ d: NOTES[j], y, x, rot, op: k * (1 - clamp(fling * 1.4 - i * .05 - .3)), sc: 1 - i * .006, z: 10 + j, key: j === n - 1 ? 'top' : '' });
  }
  return cards;
}
const ei3 = x => x * x * x;

// ───────── build
let S1, TOUCH, BEATS = [];
export function build(words, py) {
  PY = py; EV.length = 0; MOVES.length = 0; SCR = []; BEATS = [];
  S1 = new Actor(6); TOUCH = new Touch();
  for (const [id, t] of Object.entries(VO)) ev(t, 'vo', { id });
  for (const s of SRT) ev(s.t0, 'sub', { t1: s.t1, text: s.text });

  // beat grid for the sprout's breathing (piano tempo map, see TREATMENT §9)
  const grid = [[3.4, 10.0, 60 / 81.8], [10.0, 16.0, 60 / 90], [16.0, 18.3, 60 / 96], [22.2, 27.3, 60 / 76], [27.3, 32, 60 / 70]];
  for (const [a, b, d] of grid) for (let t = a; t < b - 1e-6; t += d) BEATS.push(+t.toFixed(3));

  // scroll targets from the measured layouts
  const sQ1 = PY.find0.q1.y - 150, sRes = PY.find2.tc1.y - 150, sPick = PY.pick.picker.y - 100;
  scrollKey(T.drag1, T.drag1e, sQ1);
  scrollKey(T.out2 + .2, T.out2 + .21, sQ1, x => x);                        // results replace the step in place
  scrollKey(T.drag2, T.drag2e, sRes);
  scrollKey(T.nav1, T.nav1 + .01, 0, x => x);                               // new page opens at the top
  scrollKey(T.drag3, T.drag3e, sPick);
  scrollKey(T.booked, T.booked + .01, 0, x => x);

  // ═ A. noise (0–3.4): the pile grows, the camera leans in, the sprout peeks out wilted
  cam(0, 3.0, [FX, 760, 1.14], 'ss');
  NT.forEach((x, i) => ev(x, 'buzz', { i, v: .45 + i * .06 }));
  ev(2.72, 'shudder');
  const topCard = A => { const p = A('top', .78, 0); return p; };
  S1.hide(0, T.peek);
  S1.stand(T.peek, T.unlock0 + .02, A => { const p = topCard(A); if (!p) return null; const k = eo(seg(T.cur, T.peek, T.peek + .45)); return { x: p.x, y: p.y + (1 - k) * 130 + 14 }; },
    { clip: A => { const p = topCard(A); return p ? p.y : null; }, eyes: t => t < 2.9 ? 'u' : 'l', leaves: 'droop', shadow: 0, still: true });
  ev(T.peek + .1, 'peek');
  // swipe up to unlock
  TOUCH.show(2.85, 3.5).move(2.85, 2.86, pt(SX + SC * 195, SY + SC * 690)).move(3.05, 3.42, pt(SX + SC * 195, SY + SC * 240), 0);
  ev(T.swipe, 'swipe');
  cam(3.1, .5, [FX, FY, 1], 'eio');
  // the sprout hops out of the pile onto the page heading as the lock screen lifts
  S1.jump(T.unlock0 + .02, 3.62, A => ({ x: SX + SC * 300, y: SY + SC * 214 }), at('h1find', .82, 0), 120);

  // ═ B. questions (3.4–10.0)
  S1.stand(3.62, T.drag1 + .05, at('h1find', .82, 0), { eyes: t => t < 3.9 ? 'wide' : 'd', leaves: t => t < 4.0 ? 'up' : 'n' });
  // drag the page to the first question
  const dragY0 = SY + SC * 640;
  TOUCH.show(4.15, 5.0).move(4.15, 4.16, pt(SX + SC * 260, dragY0)).move(T.drag1, T.drag1e, pt(SX + SC * 260, dragY0 - SC * (sQ1 * .62)), 0);
  ev(T.drag1, 'swish', { v: .3 });
  S1.jump(T.drag1 + .05, 4.75, at('h1find', .82, 0), at('q1', .86, 0), 70);
  S1.stand(4.75, T.tapLang, at('q1', .86, 0), { eyes: t => t < 5.3 ? 'n' : 'd' });
  const chipsC = wp('find0', 'chips', .5, .5, sQ1);
  cam(4.85, .85, [FX + 6, chipsC.y - 60, 1.24], 'eio');
  TOUCH.show(5.45, 6.45).move(5.45, 5.46, A => { const p = A('chip-English', .5, .5); return p && { x: p.x + 20, y: p.y + 160 }; }).move(5.62, 6.05, at('chip-Hindi', .5, .55), 40).tap(T.tapLang, { v: .6 });
  S1.jump(T.tapLang + .02, 6.42, at('q1', .86, 0), at('chip-Hindi', .5, 0), 50);
  S1.stand(6.42, T.in1 - .02, at('chip-Hindi', .5, 0), { eyes: 'happy', leaves: 'up' });
  ev(T.tapLang + .05, 'note', { n: 0 }); ev(T.out1, 'swish');
  // step 2 slides in; the sprout climbs onto its heading and walks down to look
  const q2C = wp('find1', 'card-stress', .5, .5, sQ1);
  cam(6.5, .8, [FX, q2C.y - 260, 1.1], 'eio');
  S1.jump(T.in1 - .02, T.in1e, at('chip-Hindi', .5, 0), at('q2', .7, 0), 80);
  S1.stand(T.in1e, 7.36, at('q2', .7, 0), { eyes: 'd' });
  S1.jump(7.36, 7.66, at('q2', .7, 0), at('card-stress', .84, 0), 40, { soft: true });
  S1.stand(7.66, T.out2 + .02, at('card-stress', .84, 0), { eyes: t => t < 7.8 ? 'l' : 'happy', leaves: t => t > 7.8 ? 'up' : 'n' });
  TOUCH.show(7.2, 8.3).move(7.2, 7.21, A => { const p = A('card-anxiety', .4, .5); return p && { x: p.x, y: p.y + 40 }; }).move(7.35, 7.72, at('card-stress', .38, .5), 30).tap(T.tapStress, { v: .6 });
  ev(T.tapStress + .05, 'note', { n: 1 }); ev(T.out2, 'swish');
  // results
  S1.jump(T.out2 + .02, T.in2e - .05, at('card-stress', .84, 0), at('res', .8, 0), 90);
  S1.stand(T.in2e - .05, 9.4, at('res', .8, 0), { eyes: 'd' });
  const resAt = wp('find2', 'res', .8, 0, sQ1);                                   // take-off point frozen before the page scrolls away
  S1.jump(9.4, 9.9, () => resAt, at('tc1-bd', .8, 0), 30, { soft: true });
  S1.stand(9.9, 10.3, at('tc1-bd', .8, 0), { eyes: 'l' });
  cam(8.6, .7, [FX, wp('find2', 'res', .5, .5, sQ1).y + 120, 1.08], 'eio');
  TOUCH.show(9.25, 10.0).move(9.25, 9.26, pt(SX + SC * 300, SY + SC * 700)).move(T.drag2, T.drag2e, pt(SX + SC * 300, SY + SC * 700 - SC * (sRes - sQ1) * .6), 0);
  ev(T.drag2, 'swish', { v: .3 });

  // ═ C. the match (10.0–12.0, music only)
  const cardC = wp('find2', 'tc1', .5, .5, sRes);
  cam(9.85, .95, [FX, cardC.y - 30, 1.12], 'eio');
  S1.jump(10.3, T.land, at('tc1-bd', .8, 0), at('tc1-bd', .8, 0), 40);           // a small hop in place, landing on the downbeat
  S1.stand(T.land, T.tapBook + .1, at('tc1-bd', .8, 0), { eyes: t => t < 11.0 ? 'happy' : 'd', leaves: t => t < 11.0 ? 'up' : 'n' });
  ev(T.land + .02, 'chip', { n: 2 });
  TOUCH.show(10.85, 11.55).move(10.85, 10.86, A => { const p = A('tc1-book', .5, .5); return p && { x: p.x + 60, y: p.y + 120 }; }).move(10.95, 11.25, at('tc1-book', .5, .5), 20).tap(T.tapBook, { v: .6 });
  // the sprout hops to the booking page heading as it opens
  S1.jump(T.tapBook + .12, 12.0, at('tc1-bd', .8, 0), at('h1book', .7, 0), 130);
  cam(11.45, .6, [FX, FY - 40, 1.0], 'eio');

  // ═ D. pick a time (12.0–16.0)
  S1.stand(12.0, T.drag3 + .05, at('h1book', .7, 0), { eyes: 'd' });
  TOUCH.show(12.4, 13.05).move(12.4, 12.41, pt(SX + SC * 280, SY + SC * 690)).move(T.drag3, T.drag3e, pt(SX + SC * 280, SY + SC * 690 - SC * sPick * .55), 0);
  ev(T.drag3, 'swish', { v: .3 });
  S1.jump(T.drag3 + .05, 13.0, at('h1book', .7, 0), at('cbar', .9, 0), 80);
  S1.stand(13.0, 14.15, at('cbar', .9, 0), { eyes: t => t < 13.6 ? 'u' : t < 14.0 ? 'l' : 'happy' });
  const pickC = wp('pick', 'picker', .5, .55, sPick);
  cam(12.95, .7, [FX, pickC.y + 40, 1.06], 'eio');
  TOUCH.show(13.0, 14.95).move(13.0, 13.01, A => { const p = A('day-13', .5, .5); return p && { x: p.x + 40, y: p.y + 140 }; }).move(13.05, 13.26, at('day-13', .5, .55), 20).tap(T.tapDay, { v: .5 })
    .move(13.55, 13.92, at('slot-600PM', .5, .5), 30).tap(T.tapSlot, { v: .5 }).move(14.25, 14.58, at('continue', .45, .5), 30).tap(T.tapCont, { v: .7 });
  ev(T.tapDay + .04, 'note', { n: 3 }); ev(T.tapSlot + .04, 'note', { n: 4 });
  S1.jump(14.15, 14.5, at('cbar', .9, 0), at('continue', .5, 0), 40, { soft: true });
  // rides the Continue press, then springs up onto the login sheet as it opens (whip)
  S1.stand(14.5, 14.86, at('continue', .5, 0), { eyes: 'u', sq: t => t > T.tapCont && t < T.tapCont + .18 ? .18 * Math.sin(seg(t, T.tapCont, T.tapCont + .18) * Math.PI) : 0 });
  // karaoke hops ride the sheet's top edge, one column per digit, so the code line and the masked number stay readable
  const above = i => { let last = null; return A => { const o = A('otp' + i, .5, 0), d = A('dlg', .5, 0); if (o && d) last = { x: o.x, y: d.y }; return last; }; };
  S1.jump(14.86, 15.36, at('continue', .5, 0), above(0), 150);
  const otpC = wp('dialog', 'otp', .5, .5);
  cam(14.84, .5, [FX, otpC.y - 60, 1.2], 'whip');
  ev(14.86, 'whoosh');

  // ═ E. the code (16.0–18.3): one hop per digit
  S1.stand(15.36, T.dig0 + T.dstep - .26, above(0), { eyes: 'd' });
  for (let i = 0; i < 6; i++) ev(T.dig0 + i * T.dstep, 'key', { i });
  for (let i = 1; i < 6; i++) {
    const t1 = T.dig0 + i * T.dstep;
    S1.jump(t1 - .26, t1, above(i - 1), above(i), 26, { soft: true });
    S1.stand(t1, i < 5 ? t1 + T.dstep - .26 : T.close + .05, above(i), { eyes: i < 5 ? 'd' : 'happy', leaves: i === 5 ? 'up' : 'n' });
  }
  ev(T.toast, 'chime', { v: .4 });

  // ═ F. the promise (18.3–22.2)
  S1.jump(T.close + .05, 18.75, above(5), at('pay', .88, 0), 90);
  S1.stand(18.75, T.tapPay + .06, at('pay', .88, 0), { eyes: t => t < T.ninety - .05 ? 'l' : t < T.rupees + .5 ? 'wide' : 'happy', leaves: t => t > T.rupees ? 'up' : 'n',
    sq: t => t > T.tapPay && t < T.tapPay + .16 ? .12 * Math.sin(seg(t, T.tapPay, T.tapPay + .16) * Math.PI) : 0 });
  const priceC = wp('details', 'price', .5, .5, sPick), payC = wp('details', 'pay', .5, .5, sPick);
  cam(18.3, .6, [FX, (priceC.y + payC.y) / 2, 1.1], 'eio');
  cam(T.freeze0, 1.1, [FX + 4, priceC.y + 30, 1.28], 'eio');
  cam(21.25, .55, [FX, (priceC.y + payC.y) / 2 + 20, 1.2], 'eio');
  TOUCH.show(21.3, 22.15).move(21.3, 21.31, A => { const p = A('pay', .4, .5); return p && { x: p.x - 30, y: p.y + 130 }; }).move(21.45, 21.85, at('pay', .4, .5), 25).tap(T.tapPay, { v: .7 });
  ev(T.ninety, 'piano1'); ev(T.rupees, 'note', { n: 5 });

  // ═ G. booked (22.2–27.3)
  S1.jump(T.tapPay + .06, 22.62, at('pay', .88, 0), at('booked', .88, 0), 140);
  S1.stand(22.62, T.wipe + .3, at('booked', .88, 0), { eyes: t => t < 23.2 ? 'wide' : t > 26.0 && t < 26.7 ? 'u' : 'happy', leaves: t => t > 26.55 ? 'up' : 'n' });
  cam(22.0, .9, [FX, FY + 200, 1.0], 'eio');
  cam(23.4, 3.6, [FX, FY + 175, 1.05], 'ss');
  ev(T.booked, 'success'); ev(T.grow + .05, 'grow');
  // ═ H. the bookend (27.3–32): one quiet notification, its icon becomes the end card
  ev(T.wipe, 'wipe');
  S1.stand(T.wipe + .3, T.end + .05, at('note1', .82, 0), { eyes: 'happy', shadow: 0 });
  S1.stand(T.end + .05, DUR + 1, at('endlogo', .5, 0), { eyes: t => t > T.rest ? 'shut' : 'happy', leaves: t => t < T.rest ? 'up' : 'n' });
  cam(T.wipe + .2, .5, [FX, FY + 10, 1.0], 'eio');
  cam(28.2, 3.8, [FX, FY + 10, 1.04], 'ss');
  ev(T.calm + .1, 'buzz', { i: 0, v: .25, soft: 1 }); ev(T.eunoia, 'resolve'); ev(T.rest, 'rest');
}

export function frame(t) {
  T.cur = t;   // read by anchor closures that animate with time
  const ctx = {
    beat: x => { let b = -1; for (const s of BEATS) { if (s > x) break; b = s; } return b < 0 ? 9 : x - b; },
    grow: x => seg(x, T.grow, T.grow + .6),
  };
  // ── screen state
  let S;
  if (t < T.unlock0) S = { kind: 'lock', lock: { cards: pile(t) } };
  else if (t < T.nav1) {
    const f = { step: 0 };
    if (t >= T.tapLang) f.lang = 'Hindi';
    if (t >= T.tapLang && t < T.out1) f.press = 'Hindi';
    if (t >= T.out1) { f.step = 1; f.out = seg(t, T.out1, T.in1); f.in = seg(t, T.in1, T.in1e); }
    if (t >= T.tapStress && t < T.out2) f.press = 'stress';
    if (t >= T.out2) { f.step = 2; f.out = seg(t, T.out2, T.in2); f.in = seg(t, T.in2, T.in2e); f.card1 = seg(t, 9.0, 9.7); f.card2 = seg(t, 9.08, 9.78); }
    if (t >= T.tapBook && t < T.tapBook + .2) f.press = 'book';
    S = { kind: 'find', find: f };
    if (t < T.unlock1) S.lockOver = { y: -844 * eio(seg(t, T.unlock0, T.unlock1)), lock: { cards: pile(t) } };
  } else if (t < T.booked) {
    const b = { stage: t >= T.details ? 'details' : 'pick', vis: seg(t, T.nav1, T.nav1 + .8) };
    if (t >= T.tapDay) b.day = '13';
    if (t >= T.tapSlot) b.slot = '6:00 PM';
    if (t >= T.tapCont && t < T.tapCont + .15) b.press = 'continue';
    if (t >= T.tapPay && t < T.tapPay + .15) b.press = 'pay';
    if (t >= T.details) b.vis = 1;
    S = { kind: 'booking', booking: b };
    if (t >= T.details) S.booking.vis = 1;
    if (t >= T.dlg && t < T.close + .2) {
      const n = clamp(Math.floor((t - T.dig0) / T.dstep) + 1, 0, 6);
      S.dialog = { k: Math.min(seg(t, T.dlg, T.dlg + .2), 1 - seg(t, T.close, T.close + .2)), n: t < T.dig0 ? 0 : n, busy: t >= T.verify };
    }
    if (t >= T.toast && t < T.toast + 1.6) S.toast = Math.min(seg(t, T.toast, T.toast + .4), 1 - seg(t, T.toast + 1.3, T.toast + 1.6));
  } else if (t < T.calm) S = { kind: 'status', status: { a: t - T.booked } };
  else if (t < T.end) S = { kind: 'lock', lock: { calm: true, single: seg(t, T.calm + .05, T.calm + .3) } };
  else {
    // logo grows out of the notification icon into the end card
    const k = eio(seg(t, T.end, T.end + .5));
    S = { kind: 'end', end: { k: seg(t, T.word, T.word + .4), t1: seg(t, T.tag, T.tag + .4), t2: seg(t, T.url, T.url + .4), logoS: lerp(38, 120, k), logoY: lerp(317, 250, k), logoX: lerp(-149, 0, k), bg: k } };
  }
  S.scroll = scrollAt(t);

  // ── HUD
  const hud = {};
  const sub = SUBS.find(s => t >= s.t0 && t < s.t1);
  if (sub) hud.cap = { text: sub.text, op: Math.min(seg(t, sub.t0, sub.t0 + .15), 1 - seg(t, sub.t1 - .15, sub.t1)), y: (1 - eo(seg(t, sub.t0, sub.t0 + .2))) * 10 };
  if (t > T.dig0 - .25 && t < T.verify + .2) { const n = clamp(Math.floor((t - T.dig0) / T.dstep) + 1, 0, 6), dn = ((t - T.dig0) % T.dstep) < .1 && t >= T.dig0;
    hud.keys = { keys: '482916'.slice(0, n).split('').slice(-4), dn, op: Math.min(seg(t, T.dig0 - .25, T.dig0 - .05), 1 - seg(t, T.verify, T.verify + .2)) }; }
  if (t > T.freeze0 && t < 21.7) hud.spot = { key: 'price', op: Math.min(eo(seg(t, T.freeze0 + .2, T.ninety)), 1 - seg(t, 21.3, 21.7)) * .9 };
  if (t > T.wipe - .05 && t < T.wipe + .65) hud.wipe = seg(t, T.wipe, T.wipe + .6);
  if (t < .35) hud.fade = 1 - eo(t / .35);
  return { cam: camAt(t), S, actor: S1, touch: TOUCH, hud, ctx, dark: S.kind === 'lock' || !!S.lockOver };
}
