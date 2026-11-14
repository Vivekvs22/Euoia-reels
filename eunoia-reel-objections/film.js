// Reel 2 "But therapy isn't for me…": timeline. Objection cards (HUD) + the real booking screens answering them.
// VO onsets measured from the client's narration (waveform + Whisper, voice/words.json). Strikes sit in the pauses of her lines.
import { clamp, lerp, seg, ss, eio, eo, hash } from '/core/lib.js';

export const DUR = 23.0;
export const SX = 80, SY = 110, SC = 2;          // phone screen origin (world px), CSS → world (same phone as reel 1)
export const FX = 470, FY = 800;                 // focus point: centre of the safe column

export const VO = { l1: 2.40, l2: 6.40, l3: 10.40, l4: 14.80, l5: 19.30 };
export const SUBS = [
  { t0: 2.35, t1: 5.65, text: 'Your first session? Ninety-nine rupees.' },
  { t0: 6.35, t1: 9.45, text: 'Pick the language you think in.' },
  { t0: 10.35, t1: 13.98, text: 'Confidential, one-on-one video sessions.' },
  { t0: 14.75, t1: 17.7, text: "A few taps, and you're booked." },
  { t0: 19.25, t1: 22.95, text: 'Eunoia. Find your way back to yourself.' },
];
export const SRT = SUBS;

// ───────── tempo map (see TREATMENT §7): [start, end, beat length]
export const TEMPO = [[0, 2.2, 2.2 / 4], [2.2, 6.2, 4 / 7], [6.2, 10.2, 4 / 7], [10.2, 14.6, 4.4 / 8], [14.6, 19.1, 4.5 / 8], [19.1, 23.5, .58]];
const offbeat = (sec, k) => { const [a, , b] = TEMPO[sec]; return +(a + (k + .5) * b).toFixed(3); };

// ───────── the objection deck
export const CARDS = [
  { t0: 0.0, lines: ['“Therapy?', 'Not for me…”'] },
  { t0: 2.2, lines: ['“It’s too', 'expensive.”'], strike: offbeat(1, 2) },          // 3.629: pause after "session?"
  { t0: 6.2, lines: ['“They won’t', 'get me.”'], strike: offbeat(2, 2) },            // 7.629: pause after "language"
  { t0: 10.2, lines: ['“Someone will', 'find out.”'], strike: offbeat(3, 2) },       // 11.575: comma after "Confidential,"
  { t0: 14.6, lines: ['“It’s too much', 'effort.”'], strike: offbeat(4, 2) },        // 16.006: pause after "taps,"
  { t0: 19.1, cta: true, lines: ['Book your ₹99', 'first session'] },
];
CARDS.forEach(c => { if (c.strike) c.swipe = +(c.strike + .32).toFixed(3); });
export const T = {
  hindi: CARDS[2].strike, tapDay: 14.95, tapSlot: 15.35, tapCont: 15.72, booked: 16.06, end: 19.1,
};

export const EV = [];
const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });

// ───────── layouts measured at start-up by main.js
export const LAYOUTS = {
  find0: { kind: 'find', find: { step: 0 } },
  pick0: { kind: 'booking', booking: { stage: 'pick' } },
  pick: { kind: 'booking', booking: { stage: 'pick', day: '19', slot: '6:00 PM' } },
  details: { kind: 'booking', booking: { stage: 'details' } },
  status: { kind: 'status', status: {} },
};
let PY = {};
const wp = (L, key, fx = .5, fy = .5, scroll = 0) => { const r = PY[L][key]; if (!r) throw new Error(`no ${key} in ${L}`);
  return { x: SX + SC * (r.x + r.w * fx), y: SY + SC * (80 + r.y + r.h * fy - scroll) }; };
// camera that puts world y `wy` at frame y `sy` with zoom z
const camFor = (wy, sy, z, dx = 0) => [FX + dx, wy - (sy - FY) / z, z];

// ───────── camera
const EASE = { eio, ss, eo };
const CAM0 = [FX, FY, 1], MOVES = [];
const cam = (t0, d, to, e = 'eio') => MOVES.push({ t0, d, to, e });
export function camAt(t) {
  let v = CAM0.slice(); v[2] = Math.log(v[2]);
  for (const m of MOVES) { if (t <= m.t0) break; const p = EASE[m.e]((t - m.t0) / m.d);
    v = [lerp(v[0], m.to[0], p), lerp(v[1], m.to[1], p), lerp(v[2], Math.log(Math.max(1, m.to[2])), p)]; }
  return [v[0] + Math.sin(t * .8) * 1.4, v[1] + Math.sin(t * .6 + 1) * 1.1, Math.exp(v[2])];
}

// ───────── the sprout (reel 1's actor, smaller)
class Actor {
  constructor(px = 4) { this.px = px; this.segs = []; this.jumps = []; }
  add(s) { this.segs.push(s); return this; }
  stand(t0, t1, at, o = {}) { return this.add({ k: 'stand', t0, t1, at, ...o }); }
  jump(t0, t1, from, to, h = 50, o = {}) { this.jumps.push({ t0, t1, soft: o.soft }); ev(t0 - .02, 'jump', { d: t1 - t0 }); ev(t1, 'land', { v: o.soft ? .35 : .55 });
    return this.add({ k: 'jump', t0, t1, from, to, h, ...o }); }
  seg(t) { let s = null; for (const x of this.segs) { if (x.t0 <= t && t < x.t1) return x; if (x.t0 <= t) s = x; } return s; }
  eval(t, A, ctx) {
    const s = this.seg(t); if (!s) return null;
    const px = this.px; let pos, sq = 0, eyes = 'n', leaves = 'n', flip = false;
    const P = f => typeof f === 'function' ? f(A, t) : f;
    if (s.k === 'stand') pos = P(s.at);
    if (s.k === 'jump') { const a = P(s.from), b = P(s.to) || a; if (!a) return null; const p = seg(t, s.t0, s.t1);
      const ap = Math.min(a.y, b.y) - s.h, cy = 2 * ap - (a.y + b.y) / 2;
      pos = { x: lerp(a.x, b.x, ss(p)), y: (1 - p) ** 2 * a.y + 2 * (1 - p) * p * cy + p * p * b.y }; sq = p < .5 ? -.16 * (1 - p * 2) : -.08 * (p * 2 - 1); leaves = 'up'; flip = b.x < a.x - 2; }
    if (!pos) return null;
    for (const j of this.jumps) {
      if (t >= j.t0 - .1 && t < j.t0) sq = Math.max(sq, .2 * ss(seg(t, j.t0 - .1, j.t0)));
      if (t >= j.t1 && t < j.t1 + .22) { const k = seg(t, j.t1, j.t1 + .22); sq = .24 * (1 - k) * Math.cos(k * 7); }
    }
    if (s.k === 'stand') { const B = ctx.beat(t); if (B < .12) sq += .06 * Math.sin(B / .12 * Math.PI); }
    const bl = Math.floor(t / 2.3), bt = t - bl * 2.3 - hash(bl * 5.1) * 1.5; if (bt > 0 && bt < .1) eyes = 'blink';
    if (s.eyes) { const e = typeof s.eyes === 'function' ? s.eyes(t) : s.eyes; if (e && !(eyes === 'blink' && 'nlrud'.includes(e))) eyes = e; }
    if (s.leaves && s.k !== 'jump') leaves = typeof s.leaves === 'function' ? s.leaves(t) : s.leaves;
    const x = Math.round(pos.x / (px / 2)) * (px / 2), y = Math.round(pos.y / (px / 2)) * (px / 2);
    return { x, y, px, flip, sq, eyes, leaves, grow: 0, op: 1, clipY: null, shadow: s.k === 'jump' ? 0 : (s.shadow ?? 1) };
  }
}
class Touch {
  constructor() { this.moves = []; this.taps = []; this.vis = []; }
  show(t0, t1) { this.vis.push([t0, t1]); return this; }
  move(t0, t1, to, arc = 24) { this.moves.push({ t0, t1, to, arc }); return this; }
  tap(t, o = {}) { this.taps.push(t); ev(t, 'tap', o); return this; }
  eval(t, A) {
    let op = 0; for (const [a, b] of this.vis) op = Math.max(op, Math.min(seg(t, a, a + .1), 1 - seg(t, b - .12, b)));
    if (op <= 0) return null;
    let p = null, prev = null;
    for (const m of this.moves) { const to = m.to(A, t); if (!to) continue; if (t < m.t0 && prev) break;
      if (!prev) { p = to; prev = to; if (t < m.t0) break; continue; }
      const k = seg(t, m.t0, m.t1), e = eio(k), dx = to.x - prev.x, dy = to.y - prev.y, L = Math.hypot(dx, dy) || 1;
      p = { x: lerp(prev.x, to.x, e) - dy / L * m.arc * Math.sin(Math.PI * e), y: lerp(prev.y, to.y, e) + dx / L * m.arc * Math.sin(Math.PI * e) };
      if (k < 1) break; prev = to; }
    if (!p) return null;
    let sc = 1, ring = 0; for (const c of this.taps) { if (t >= c - .04 && t < c + .1) sc = .78; if (t >= c && t < c + .45) ring = seg(t, c, c + .45); }
    return { ...p, op, sc, ring };
  }
}
const at = (key, fx = .5, fy = 0, dx = 0, dy = 0) => { let last = null; return A => { const p = A(key, fx, fy); if (p) last = { x: p.x + dx, y: p.y + dy }; return last; }; };

// ───────── build
let S1, TOUCH, BEATS = [], SCROLL = [];
export function build(words, py) {
  PY = py; EV.length = 0; MOVES.length = 0; BEATS = []; SCROLL = [];
  S1 = new Actor(4); TOUCH = new Touch();
  for (const [id, t] of Object.entries(VO)) ev(t, 'vo', { id });
  for (const s of SRT) ev(s.t0, 'sub', { t1: s.t1, text: s.text });
  for (const [a, b, d] of TEMPO) for (let t = a; t < Math.min(b, DUR) - 1e-6; t += d) BEATS.push(+t.toFixed(3));
  CARDS.forEach((c, i) => { if (i) ev(c.t0, c.cta ? 'resolve' : 'flip', { i }); if (c.strike) { ev(c.strike, 'strike', { i }); ev(c.swipe, 'swipe', { i }); } });

  // scroll per beat, chosen so the answer sits below the card (y 600–1300)
  // nothing may straddle the navbar's bottom edge (vp 66): beat 1 parks the back link behind it and the eyebrow just below;
  // beat 3 parks the whole summary tile behind it, so "Your time" starts just under the nav
  const s1 = PY.pick0.h1book.y - 96, s2 = PY.find0.chips.y - 230, s3 = PY.details.ctime.y - 86, s4 = PY.pick.picker.y - 165;
  SCROLL = [[0, 0, 'find'], [2.2, s1, 'pick0'], [6.2, s2, 'find'], [10.2, s3, 'details'], [14.6, s4, 'pick'], [T.booked, 0, 'status'], [19.1, 0, 'end']];

  const card = fx => at('objcard', fx, 0);                  // the sprout stands on the card's top edge
  const droop = { eyes: t => (t % 1.6 < .8 ? 'd' : 'l'), leaves: 'droop' };

  // ═ hook (0–2.2): frame 1 already shows the card; the sprout sits drooped on it
  S1.stand(0, 2.2, card(.8), droop);
  cam(0, 2.2, [FX, FY - 10, 1.02], 'ss');

  // ═ cost (2.2–6.2)
  const c1 = CARDS[1];
  S1.stand(2.2, c1.strike + .02, card(.8), { ...droop, eyes: t => t < 2.9 ? 'u' : 'd' });
  S1.jump(c1.strike + .02, c1.strike + .4, card(.8), at('sumprice', .86, 0), 16);
  S1.stand(c1.strike + .4, 6.2, at('sumprice', .86, 0), { eyes: t => t < 4.6 ? 'wide' : 'happy', leaves: 'up' });
  ev(5.1, 'note', { n: 0 });
  const pr = wp('pick0', 'sumprice', .5, .5, s1);
  const hb = wp('pick0', 'h1book', .5, 1, s1).y, et = wp('pick0', 'h1book', .5, 0, s1).y - 52, pb = wp('pick0', 'sumprice', .5, 1, s1).y;
  cam(2.2, .25, camFor(hb, 575, 1.0), 'eo');                          // the heading hides wholly behind the card
  cam(c1.swipe, .6, camFor((et + pb) / 2, 800, 1.2), 'eio');           // then eyebrow → ₹99 block, all in frame

  // ═ language (6.2–10.2): tapping Hindi strikes the objection
  const c2 = CARDS[2];
  S1.jump(6.2, 6.5, at('sumprice', .86, 0), card(.8), 90);      // back up onto the new card as it lands
  S1.stand(6.5, c2.strike + .03, card(.8), droop);
  S1.jump(c2.strike + .03, c2.strike + .4, card(.8), at('chip-Hindi', .5, 0), 12);
  S1.stand(c2.strike + .4, 10.2, at('chip-Hindi', .5, 0), { eyes: 'happy', leaves: t => t < 9.0 ? 'up' : 'n' });
  TOUCH.show(7.05, 8.1).move(7.05, 7.06, A => { const p = A('chip-Kannada', .5, .5); return p && { x: p.x + 40, y: p.y + 170 }; }).move(7.15, 7.52, at('chip-Hindi', .5, .55), 30).tap(T.hindi, { v: .6 });
  ev(T.hindi + .05, 'note', { n: 1 });
  const ch = wp('find0', 'chips', .5, .5, s2), q1 = wp('find0', 'q1', .5, .5, s2);
  const q1top = wp('find0', 'q1', .5, 0, s2);
  cam(6.2, .25, camFor(q1top.y, 650, 1.0), 'eo');                      // the whole question sits just below the card
  cam(c2.swipe, .6, camFor((ch.y + q1.y) / 2, 760, 1.2, 6), 'eio');

  // ═ privacy (10.2–14.6): masked mobile, secure checkout, then a tilt up to "Confidential video session"
  const c3 = CARDS[3];
  S1.jump(10.2, 10.5, at('chip-Hindi', .5, 0), card(.8), 90);
  S1.stand(10.5, c3.strike + .03, card(.8), droop);
  S1.jump(c3.strike + .03, c3.strike + .42, card(.8), at('row-mobile', .5, 0), 12);
  S1.stand(c3.strike + .42, 14.6, at('row-mobile', .5, 0), { eyes: t => t < 12.6 ? 'u' : 'happy', leaves: 'n' });
  const ct = wp('details', 'ctime', .5, 0, s3), pay = wp('details', 'pay', .5, 1, s3);
  cam(10.2, .25, [FX, FY, 1.0], 'eo');                                // "Your time" hidden behind the card, checkout below it
  cam(c3.swipe, .8, camFor((ct.y + pay.y) / 2, 800, 1.08), 'eio');     // then "Your time" → Pay securely, all above the caption

  // ═ effort (14.6–19.1): three quick taps, then "You're booked."
  const c4 = CARDS[4];
  S1.jump(14.6, 14.9, at('row-mobile', .5, 0), card(.8), 100);
  S1.stand(14.9, c4.strike + .03, card(.8), { ...droop, eyes: t => t < 15.0 ? 'd' : t < 15.4 ? 'r' : 'd' });
  TOUCH.show(14.7, 15.95).move(14.7, 14.71, A => { const p = A('day-19', .5, .5); return p && { x: p.x + 50, y: p.y + 150 }; }).move(14.74, 14.9, at('day-19', .5, .55), 16).tap(T.tapDay, { v: .5 })
    .move(15.05, 15.3, at('slot-600PM', .5, .5), 20).tap(T.tapSlot, { v: .5 }).move(15.45, 15.67, at('continue', .45, .5), 20).tap(T.tapCont, { v: .6 });
  ev(T.tapDay + .03, 'note', { n: 2 }); ev(T.tapSlot + .03, 'note', { n: 3 }); ev(T.tapCont + .03, 'note', { n: 4 });
  S1.jump(c4.strike + .03, c4.strike + .45, card(.8), at('booked', .9, 0), 12);
  S1.stand(c4.strike + .45, 19.1, at('booked', .9, 0), { eyes: 'happy', leaves: t => t < 17.6 ? 'up' : 'n' });
  ev(c4.strike, 'tada');
  const pk = wp('pick', 'picker', .5, 0, s4);
  cam(14.6, .25, camFor(pk.y, 610, 1.0), 'eo');
  const mk = wp('status', 'okmark', .5, 0, 0), bk = wp('status', 'booked', .5, .5, 0);
  cam(T.booked, .01, camFor(bk.y, 760, 1.0));
  cam(c4.swipe, .7, camFor((mk.y + bk.y) / 2 + 200, 760, 1.0), 'eio');

  // ═ call to action (19.1–23)
  S1.jump(19.1, 19.55, at('booked', .9, 0), at('endlogo', .5, 0), 110);
  S1.stand(19.55, DUR + 1, at('endlogo', .5, 0), { eyes: t => t > 21.8 ? 'happy' : 'u', leaves: 'up' });
  cam(19.1, .3, [FX, FY, 1.0], 'eo');
  cam(19.4, 3.6, [FX, FY - 10, 1.03], 'ss');
}

function scrollAt(t) { let v = 0, L = 'find'; for (const [t0, s, l] of SCROLL) { if (t < t0) break; v = s; L = l; } return v; }

export function frame(t) {
  const ctx = { beat: x => { let b = -1; for (const s of BEATS) { if (s > x) break; b = s; } return b < 0 ? 9 : x - b; } };
  // ── phone
  let S;
  if (t < 2.2) S = { kind: 'find', find: { step: 0 } };
  else if (t < 6.2) S = { kind: 'booking', booking: { stage: 'pick' } };
  else if (t < 10.2) { const f = { step: 0 }; if (t >= T.hindi) f.lang = 'Hindi'; if (t >= T.hindi && t < T.hindi + .3) f.press = 'Hindi'; S = { kind: 'find', find: f }; }
  else if (t < 14.6) S = { kind: 'booking', booking: { stage: 'details' } };
  else if (t < T.booked) { const b = { stage: 'pick' }; if (t >= T.tapDay) b.day = '19'; if (t >= T.tapSlot) b.slot = '6:00 PM'; if (t >= T.tapCont) b.press = 'continue'; S = { kind: 'booking', booking: b }; }
  else if (t < T.end) S = { kind: 'status', status: { a: t - T.booked + .25 } };
  else S = { kind: 'end', end: { k: .3 + .7 * seg(t, T.end, T.end + .35), t2: seg(t, T.end + .25, T.end + .6), logoY: 305 } };   // never a blank frame
  S.scroll = scrollAt(t);

  // ── HUD: the card
  const hud = {};
  let ci = 0; for (let i = 0; i < CARDS.length; i++) if (t >= CARDS[i].t0) ci = i;
  const c = CARDS[ci], prev = CARDS[ci - 1];
  if (ci === 1 && t < 2.2 + .3) {          // the hook card flips over into the first objection
    const a = 180 * eio(seg(t, 2.2, 2.5));
    hud.card = a < 90 ? { c: CARDS[0], rx: a } : { c, rx: a - 180 };
  } else if (ci > 0) {
    const k = seg(t, c.t0, c.t0 + .26), back = 1 + 2.4 * (k - 1) ** 3 + 1.4 * (k - 1) ** 2;   // drop-in flip with a small overshoot
    hud.card = { c, rx: -65 * (1 - Math.min(1, back)) + (k > .7 ? 4 * Math.sin((k - .7) / .3 * Math.PI) : 0), op: clamp(.55 + k * 3) };   // visible from its first frame
  } else hud.card = { c, rx: 0 };
  if (c.strike) {
    hud.card.strike = c.lines.map((_, i) => eo(seg(t, c.strike + i * .08, c.strike + i * .08 + .18)));
    const q = seg(t, c.swipe, c.swipe + .32);
    if (q >= 1) hud.card = null; else if (q > 0) Object.assign(hud.card, { tx: -1150 * q * q, rot: -9 * q });
  }
  const sub = SUBS.find(s => t >= s.t0 && t < s.t1);
  if (sub) hud.cap = { text: sub.text, op: Math.min(seg(t, sub.t0, sub.t0 + .12), 1 - seg(t, sub.t1 - .12, sub.t1)), y: (1 - eo(seg(t, sub.t0, sub.t0 + .18))) * 10 };
  return { cam: camAt(t), S, actor: S1, touch: TOUCH, hud, ctx, dark: false };
}
