// Praxyz explainer, polish cut. 120 bpm (beat 0.5 s, eighth 0.25 s). Every cut and every word lands on the grid.
// Hard cuts only (no fades, no slides); static framings with a slow 1.5 % drift; shot scale alternates full ↔ extreme close-up.
// Voice onsets from the client's narrator.wav / patient.wav waveforms; word timing inside lines from Whisper (voice/words.json);
// caption TEXT is the exact script (Rohan: what he actually says).
import { clamp, lerp, seg } from '/core/lib.js';
import { ROHAN_LINE } from './ui.js';

export const DUR = 43.0, BEAT = 0.5, E8 = 0.25;
export const WIN = { x: 40, y: 600, w: 860, h: 670, bar: 52 };             // the floating window, below the headline lane
export const VIEW = { w: WIN.w, h: WIN.h - WIN.bar };

// ───────── captions (narrator untagged; Rohan tagged)
export const LINES = [
  { id: 'n1', spk: '', t0: 2.70, end: 5.96, hold: [2.65, 6.6], text: 'Praxyz lets you practise therapy with AI patients first.' },
  { id: 'pt', spk: 'ROHAN · AI PATIENT', t0: 8.40, end: 11.18, hold: [8.25, 11.55], text: ROHAN_LINE },
  { id: 'n2', spk: '', t0: 11.60, end: 16.14, hold: [11.55, 16.5], text: 'Speak out loud. They answer, pause, even push back.' },
  { id: 'n3', spk: '', t0: 17.00, end: 20.50, hold: [16.95, 21.3], text: 'After every session, you’re scored on six real skills.' },
  { id: 'n4', spk: '', t0: 23.30, end: 27.20, hold: [23.25, 27.95], text: 'See exactly what worked, and the moment it slipped.' },
  { id: 'n5', spk: '', t0: 29.30, end: 31.52, hold: [29.25, 32.3], text: 'Track your progress, session by session.' },
  { id: 'n6', spk: '', t0: 33.80, end: 36.66, hold: [33.75, 37.4], text: 'Earn a certificate employers can actually see.' },
  { id: 'n7', spk: '', t0: 38.60, end: 41.98, hold: [38.55, 42.9], text: 'Praxyz. Practise here, before it’s real.' },
];
export function wordTimes(words) {
  for (const L of LINES) {
    const W = words[L.id] || [], toks = L.text.split(' ');
    L.words = toks.map((w, i) => { const j = W.length ? Math.round(i * (W.length - 1) / Math.max(1, toks.length - 1)) : 0;
      const t = W.length ? W[j].t0 : L.t0 + (L.end - L.t0) * i / toks.length; return { w, t: i === 0 ? L.t0 : Math.max(L.t0, Math.min(L.end, t)) }; });
  }
}

// ───────── headlines: deliberate line breaks, one teal word, words cut in on eighths from the shot's downbeat
export const HEADS = [
  { t0: 2.5, t1: 7.0, lines: [[['Practise'], ['on']], [['AI', 1], ['patients.']]] },
  { t0: 7.0, t1: 11.5, lines: [[['Talk'], ['to'], ['them.']], [['Out'], ['loud.', 1]]] },
  { t0: 11.5, t1: 16.5, lines: [[['Real'], ['voice.']], [['Real'], ['pushback.', 1]]] },
  { t0: 17.5, t1: 23.0, lines: [[['6'], ['skills.']], [['Scored.', 1]]] },
  { t0: 23.0, t1: 29.0, lines: [[['What'], ['worked.']], [['What'], ['slipped.', 1]]] },
  { t0: 29.0, t1: 33.5, lines: [[['Better'], ['every']], [['session.', 1]]] },
  { t0: 33.5, t1: 38.0, lines: [[['Proof'], ['employers']], [['can'], ['see.', 1]]] },
];
// hook (over Rohan) and CTA: [word, time, teal?]
export const HOOK = { lines: [[['Your', .75], ['first', 1.0], ['client', 1.25]], [['won’t', 1.5], ['wait', 1.75]], [['till', 2.0], ['you', 2.125], ['feel', 2.25], ['ready.', 2.375, 1]]] };
export const CTA = { lines: [[['Start', 38.5], ['with', 38.75]], [['30', 39.0], ['free', 39.25, 1], ['minutes', 39.5]]], button: 40.0 };

// ───────── shots: hard cuts on the grid. kind: ecu (full-frame portrait), win (the app window), giant, end
export const SHOTS = [
  { t0: 0.0, t1: 2.5, kind: 'ecu' },                                                            // Rohan's portrait, glow breathing; the hook cuts in over him
  { t0: 2.5, t1: 3.5, kind: 'win', id: 'practice', fit: 'phead' },                             // the library header, the window fitted to it
  { t0: 3.5, t1: 4.0, kind: 'win', id: 'practice', fit: 'card-ankita' },                        // one card per beat, the window fitted to the card
  { t0: 4.0, t1: 4.5, kind: 'win', id: 'practice', fit: 'card-meera' },
  { t0: 4.5, t1: 5.0, kind: 'win', id: 'practice', fit: 'card-vikram' },
  { t0: 5.0, t1: 7.0, kind: 'win', id: 'practice', fit: 'card-rohan' },                         // then Rohan, held
  { t0: 7.0, t1: 8.0, kind: 'win', id: 'lobby', cam: ['micpanel', .5, .72, 1.5] },              // the mic check
  { t0: 8.0, t1: 8.5, kind: 'win', id: 'room', cam: ['avatar', .5, .6, 1.2] },                  // full: the live room
  { t0: 8.5, t1: 10.0, kind: 'ecu' },                                                           // ECU: the glow reacting to Rohan's voice
  { t0: 10.0, t1: 11.5, kind: 'win', id: 'room', cam: ['drawer', .5, .2, 1.9] },                // his words in the transcript
  { t0: 11.5, t1: 13.5, kind: 'win', id: 'room', cam: ['drawer', .5, .26, 1.9] },               // the trainee's reply
  { t0: 13.5, t1: 15.0, kind: 'win', id: 'room', cam: ['avatar', .5, .6, 1.55] },               // Rohan thinking
  { t0: 15.0, t1: 16.5, kind: 'win', id: 'room', cam: ['drawer', .5, .33, 1.9] },               // the pushback
  { t0: 16.5, t1: 17.5, kind: 'giant' },                                                        // ECU: 78
  { t0: 17.5, t1: 19.5, kind: 'win', id: 'review', cam: ['hero', .5, 1.15, 1.3] },              // full: ring + skills fill
  { t0: 19.5, t1: 23.0, kind: 'win', id: 'review', cam: ['dims', .5, .5, 1.38] },               // the six skills
  { t0: 23.0, t1: 25.5, kind: 'win', id: 'review', cam: ['fbrow', .5, .5, 1.48] },              // strengths + areas
  { t0: 25.5, t1: 26.5, kind: 'win', id: 'review', cam: ['moment', .5, .5, 1.36] },             // the moment, whole sentence in frame
  { t0: 26.5, t1: 27.5, kind: 'win', id: 'review', cam: 'chipECU' },                            // ECU: 2:14, nothing else in frame
  { t0: 27.5, t1: 29.0, kind: 'win', id: 'review', cam: ['row2', .5, .5, 1.6] },                // the transcript moment it points to
  { t0: 29.0, t1: 31.5, kind: 'win', id: 'analytics', cam: ['trend', .5, .4, 1.34] },           // full: the trend
  { t0: 31.5, t1: 33.5, kind: 'win', id: 'analytics', cam: 'trendRank' },                       // the drawn trend + #12 · Skilled
  { t0: 33.5, t1: 34.25, kind: 'win', id: 'certificates', cam: ['cert', .5, .5, 1.06] },        // full: the certificate
  { t0: 34.25, t1: 35.0, kind: 'win', id: 'certificates', cam: 'nameECU' },                     // ECU: "Ishaan Rao"
  { t0: 35.0, t1: 36.0, kind: 'win', id: 'certificates', cam: ['cert', .5, .66, 1.08] },        // card + Copy Link
  { t0: 36.0, t1: 38.0, kind: 'win', id: 'publicCert', cam: ['cert', .5, .52, 1.06] },          // the public page
  { t0: 38.0, t1: 43.5, kind: 'end' },
];
export const T = { clickBegin: 7.0, clickJoin: 8.0, rohan0: 8.40, rohan1: 11.18, you0: 11.7, you1: 13.1, think0: 13.5, think1: 14.9, push0: 15.0, push1: 15.8,
  giant: 16.5, lock: [16.875, 17.0], ring: 17.5, chip: 26.5, copy: 35.5, end: 38.0 };

export const EV = [];
const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });

let PY = {}, VIEWS = {};
const C = (L, key, fx = .5, fy = .5) => { const r = PY[L]?.[key]; if (!r) throw new Error(`no ${key} in ${L}`); return [r.x + r.w * fx, r.y + r.h * fy]; };
function resolveCam(s) {
  if (s.cam === 'trendRank') {   // from the chart's top to the rank card's bottom, all in frame
    const a = PY.analytics.trend, b = PY.analytics.rank, h = b.y + b.h - a.y + 24, sc = Math.min(1.45, VIEW.h / h, (VIEW.w - 24) / a.w);
    return [a.x + a.w / 2, (a.y + b.y + b.h) / 2, sc];
  }
  if (s.cam === 'chipECU') {   // view's left edge 6 px left of the chip (the comment's last word ends ≥ 10 px before it): the chip alone
    const r = PY.review.chip, sc = 7.5; return [r.x - 6 + VIEW.w / 2 / sc, r.y + r.h / 2, sc];
  }
  if (s.cam === 'nameECU') {   // bottom edge in the gap between the name and the description line; the Verified pill stays out at the right
    const n = PY.certificates.certname, ti = PY.certificates.certtitle, sc = 2.9;
    return [ti.x - 12 + VIEW.w / 2 / sc, n.y + n.h + 3 - VIEW.h / 2 / sc, sc];
  }
  const [key, fx, fy, sc] = s.cam; const [x, y] = C(s.id, key, fx, fy); return [x, y, sc];
}
export function camOf(s, t) {   // a static framing with a slow push (1.5 % over the shot)
  const c = VIEWS[SHOTS.indexOf(s)]; if (!c) return [390, 300, 1];
  return [c[0], c[1], c[2] * (s.fit ? 1 : 1 + .015 * seg(t, s.t0, s.t1))];   // fitted shots stay locked so no neighbour drifts in
}
export const shotAt = t => SHOTS.find(s => t >= s.t0 && t < s.t1);

export const CURSOR = [];
function cur(t0, t1, to, click = false) { CURSOR.push({ t0, t1, to, click }); if (click) ev(t1, 'click'); }
let ENV = [];
export function build(words, py, env) {
  PY = py; ENV = env; EV.length = 0; CURSOR.length = 0; wordTimes(words);
  SHOTS.forEach((s, i) => { if (s.kind !== 'win') return;
    if (s.fit) {   // window fitted to one element: 8 px of air around it inside the view, nothing neighbouring in frame
      const r = PY[s.id][s.fit], sc = Math.min(1.7, (VIEW.w - 28) / r.w), vh = (r.h + 16) * sc;
      s.win = { h: Math.round(vh + WIN.bar), y: Math.round(935 - (vh + WIN.bar) / 2) }; VIEWS[i] = [r.x + r.w / 2, r.y + r.h / 2, sc];
    } else VIEWS[i] = resolveCam(s); });
  for (const L of LINES) { ev(L.t0, 'vo', { id: L.id }); ev(L.hold[0], 'sub', { t1: L.hold[1], text: L.text.replace('’', "'") }); }
  SHOTS.forEach((s, i) => { if (i) ev(s.t0, 'cut', { kind: s.kind, big: SHOTS[i - 1].id !== s.id }); });
  for (const H of HEADS) H.lines.flat().forEach((_, i) => ev(H.t0 + i * E8, 'word'));
  HOOK.lines.flat().forEach(w => ev(w[1], 'word', { hook: 1 })); CTA.lines.flat().forEach(w => ev(w[1], 'word'));
  ['ankita', 'rohan', 'meera', 'vikram'].forEach((_, i) => ev(2.75 + i * E8, 'snap', { i }));
  cur(6.0, 6.01, [860, 1250]); cur(6.15, 6.8, 'begin-rohan'); cur(6.85, T.clickBegin, 'begin-rohan', true);
  cur(7.3, 7.31, [820, 1250]); cur(7.4, 7.85, 'join'); cur(7.9, T.clickJoin, 'join', true);
  cur(35.05, 35.06, [820, 1250]); cur(35.1, 35.4, 'copy'); cur(35.42, T.copy, 'copy', true);
  [18.0, 18.5, 19.0, 19.5, 20.0, 20.5].forEach((t, i) => ev(t, 'skill', { i }));
  ev(T.giant, 'lift'); T.lock.forEach((t, i) => ev(t, 'digit', { i }));
  ev(8.0, 'connected'); ev(T.chip, 'chipdive'); ev(T.copy + .05, 'copied'); ev(T.end, 'resolve'); ev(CTA.button, 'button');
  ev(11.75, 'msg'); ev(15.25, 'msg');
  for (let i = 0; i < 6; i++) ev(29.25 + i * E8, 'point', { i });
  ev(31.5, 'rank'); ev(36.5, 'stamp');
}

const envAt = t => { const i = Math.floor(t * 30); return ENV[Math.max(0, Math.min(ENV.length - 1, i))] || 0; };
const mmss = n => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
const step = (t, a, d = E8) => Math.max(0, Math.floor((t - a) / d + 1e-6) + 1);   // grid steps passed since a (1 at a)
// Rohan's portrait + glow: idle breathing, swelling with his voice (patient.wav envelope)
export function avatarState(t) {
  const speak = t >= T.rohan0 && t < T.rohan1 + .1, think = t >= T.think0 && t < T.think1, listen = t >= T.you0 - .3 && t < T.you1 + .1;
  const e = envAt(t), amp = speak ? 8 + 26 * Math.min(1, e * 3.2) : think ? 9 : 7 + 2.5 * Math.sin(t * 2.2);
  const phase = t * 60 * .012 + Math.max(0, Math.min(t, T.rohan1) - T.rohan0) * 60 * .02 + Math.max(0, Math.min(t, T.think1) - T.think0) * 60 * .006;
  return { t, amp, phase, state: speak ? 'speak' : think ? 'think' : listen ? 'listen' : 'ready' };
}
export function frame(t) {
  const shot = shotAt(t) || SHOTS[SHOTS.length - 1];
  let S = null;
  if (shot.kind === 'win') {
    const id = shot.id;
    if (id === 'practice') { const n = step(t, 2.75); const snap = {}; ['ankita', 'rohan', 'meera', 'vikram'].forEach((k, i) => snap[k] = n > i ? 1 : 0);
      S = { snap, hot: t >= 5.0 ? 'rohan' : null, press: t >= T.clickBegin - .05 ? 'rohan' : null }; }
    else if (id === 'lobby') S = { t, press: t >= T.clickJoin - .05 };
    else if (id === 'room') { const A = avatarState(t), ru = seg(t, T.rohan0, T.rohan1), el = Math.floor(39 + (t - 8.0));
      S = { ...A, rohan: ru, you: t >= 11.75 ? 1 : 0, push: t >= 15.25 ? 1 : 0, caption: A.state === 'speak' ? ROHAN_LINE.slice(0, Math.round(ROHAN_LINE.length * ru)) : '',
        elapsed: `00:${String(el).padStart(2, '0')}`, left: mmss(892 - Math.floor(t - 8.0)), drawer: 1 }; }
    else if (id === 'review') S = { ring: seg(t, T.ring, T.ring + .5), dims: [18.0, 18.5, 19.0, 19.5, 20.0, 20.5].map(a => t >= a ? Math.min(1, .35 + seg(t, a, a + .3)) : 0),
      fb: [23.25, 23.75, 24.25, 24.75].map(a => t >= a ? seg(t, a - .3, a + .25) : 0), mom: t >= 25.5 ? 1 : 0, chipHot: t >= T.chip, rowHot: t >= 27.5 };
    else if (id === 'analytics') S = { line: clamp((step(t, 29.25) - 1) / 5), rank: t >= 31.5 ? 1 : 0 };   // one data point per eighth
    else if (id === 'certificates') S = { copied: t >= T.copy };
    else if (id === 'publicCert') S = { stamp: t >= 36.5 ? 1 : 0 };
    S = { ...S, id, cam: camOf(shot, t), shot };
  }
  const hud = { shot };
  if (shot.kind === 'ecu') hud.ecu = avatarState(t);
  const H = HEADS.find(h => t >= h.t0 && t < h.t1);
  if (H && shot.kind !== 'ecu') hud.head = { H, n: step(t, H.t0) };   // the full-frame close-up owns the frame
  if (shot.kind === 'giant') hud.giant = { t };
  const L = LINES.find(l => t >= l.hold[0] && t < l.hold[1]);
  if (L) hud.cap = { L };
  return { S, hud };
}
