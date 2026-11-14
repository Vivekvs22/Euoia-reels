// Praxyz reel B "A flight simulator for therapists", premium cut. 128 bpm: beat 0.46875 s, eighth 0.234375 s.
// A world camera with intent (eased push-ins that settle, slow drifts, fast whips), a 3D-tilted app window with a real shadow
// and a glass reflection, parallax, kinetic type and rolling numbers; effects only at the hero moments.
// Voice onsets from the client's narrator.wav / patient.wav (voiceover-b, re-recorded lines); caption text = the script as spoken.
import { clamp, lerp, seg } from '/core/lib.js';

export const DUR = 26.0, BEAT = 60 / 128, E8 = BEAT / 2;
export const g = n => +(n * E8).toFixed(4);
export const F = { x: 470, y: 935 };                        // camera focus on the frame (identity = layout as drawn)
export const WIN = { x: 40, y: 590, w: 860, h: 420, bar: 52 };   // strip shots; taller when the strip is out (winH)
export const VIEW = { w: WIN.w, h: WIN.h - WIN.bar };
export const STRIP = { x: 50, y: 1022, w: 860, h: 250, cols: 2, rows: 2 };   // 125 px cells: 28 px labels, 76 px values
export const cellCenter = i => ({ x: STRIP.x + STRIP.w / 4 + (i % 2) * STRIP.w / 2, y: STRIP.y + STRIP.h / 4 + Math.floor(i / 2) * STRIP.h / 2 });

export const LINES = [
  { id: 'n1', spk: '', t0: 0.30, end: 3.74, hold: [0.25, 3.98], text: 'Pilots train in a simulator before they ever fly.' },
  { id: 'n2', spk: '', t0: 4.00, end: 6.86, hold: [3.98, 7.03], text: 'Your first client should not be your first practice.' },
  { id: 'pt', spk: 'ROHAN · AI PATIENT', t0: 7.40, end: 9.12, hold: [7.36, 9.48], text: 'Why does everyone keep asking me that?' },
  { id: 'n3', spk: '', t0: 9.50, end: 13.36, hold: [9.48, 13.594], text: 'Praxyz is your simulator. AI patients who push back.' },
  { id: 'n4', spk: '', t0: 13.90, end: 16.54, hold: [13.86, 17.2], text: 'Every session ends with a full debrief.' },
  { id: 'n5', spk: '', t0: 18.30, end: 21.44, hold: [18.26, 22.03], text: 'Log your practice hours. Earn your certificate.' },
  { id: 'n6', spk: '', t0: 22.40, end: 25.78, hold: [22.36, 25.98], text: 'Praxyz. Practise here, before it’s real.' },
];
export function wordTimes(words) {
  for (const L of LINES) {
    const W = words[L.id] || [], toks = L.text.split(' ');
    L.words = toks.map((w, i) => { const j = W.length ? Math.round(i * (W.length - 1) / Math.max(1, toks.length - 1)) : 0;
      const t = W.length ? W[j].t0 : L.t0 + (L.end - L.t0) * i / toks.length; return { w, t: i === 0 ? L.t0 : Math.max(L.t0, Math.min(L.end, t)) }; });
  }
}

export const HOOK = { lines: [[['Pilots'], ['train'], ['in']], [['simulators.', 1]], [['Therapists'], ['start']], [['on'], ['real'], ['people.']]] };
export const HEADS = [
  { t0: g(17), t1: g(30), lines: [[['Practise']], [['first.', 1]]] },
  { t0: g(40), t1: g(48), lines: [[['Your']], [['simulator.', 1]]] },
  { t0: g(48), t1: g(58), lines: [[['Patients'], ['who']], [['push'], ['back.', 1]]] },
  { t0: g(62), t1: g(77), lines: [[['Full']], [['debrief.', 1]]] },
  { t0: g(85), t1: g(94), lines: [[['Log'], ['hours.']], [['Earn'], ['proof.', 1]]] },
];
export const CTA = { lines: [[['Start', g(96)], ['with', g(97)]], [['30', g(98)], ['free', g(99), 1], ['minutes', g(100)]]], button: g(102) };

export const T = {
  cells: [g(19), g(21), g(23), g(25)], pull: [g(27), g(29)], live: g(30), ecuR: g(32), rohan0: 7.40, rohan1: 9.12,
  turb0: g(34), turb1: g(38), trans: g(40), room2: g(48), land: g(58), impact: g(59), slowEnd: g(61), deb: g(62),
  hours: g(77), hourSteps: [g(78), g(79.5), g(81)], slide: [g(85) - .3, g(85)], certPush: [g(89), g(91)], end: g(94),
};
export const SHOTS = [
  { t0: 0, t1: g(17), kind: 'hook' },
  { t0: g(17), t1: g(32), kind: 'world', screen: 'room', drawer: false, strip: true },          // pre-flight ECUs → pull-back → take-off
  { t0: g(32), t1: g(40), kind: 'ecu' },                                                         // Rohan, held; TURBULENCE
  { t0: g(40), t1: g(48), kind: 'world', screen: 'room', drawer: true },                          // his words in the transcript (strip out of frame)
  { t0: g(48), t1: g(58), kind: 'world', screen: 'room', drawer: false, strip: true },            // Rohan listening, the timer running
  { t0: g(58), t1: g(62), kind: 'world', screen: 'review', touchdown: true },                     // the ring flies forward → the big 81
  { t0: g(62), t1: g(77), kind: 'world', screen: 'review' },                                      // the debrief
  { t0: g(77), t1: g(94), kind: 'world', screen: 'certificates', hours: true },                   // 4.2 h, then it slides aside: the certificate
  { t0: g(94), t1: 26.5, kind: 'end' },
];
export const shotAt = t => SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ───────── world camera: keys [t, cam, ease]; ease shapes the move INTO that key
const BASE = { x: F.x, y: F.y, s: 1, rx: 5, ry: -8 };
const cc = i => ({ ...cellCenter(i), s: 1.95, rx: 9, ry: -12 });
export const EASE = {
  settle: p => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2; },
  out: p => 1 - (1 - p) ** 4, drift: p => p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2,
  whip: p => p < .5 ? 16 * p ** 5 : 1 - (-2 * p + 2) ** 5 / 2, snap: p => p === 1 ? 1 : 1 - 2 ** (-11 * p),
};
const K = [
  [g(17), { ...cc(0), s: 2.1 }, 'snap'], [g(19) - .04, cc(0), 'drift'],
  [g(21) - .12, cc(0), 'drift'], [g(21), cc(1), 'whip'], [g(23) - .12, { ...cc(1), s: 2.0 }, 'drift'],
  [g(23), cc(2), 'whip'], [g(25) - .12, { ...cc(2), s: 2.0 }, 'drift'],
  [g(25), cc(3), 'whip'], [g(27), { ...cc(3), s: 2.05 }, 'drift'],
  [g(29), { ...BASE, s: .96 }, 'whip'], [g(32), { ...BASE, s: 1.04, ry: -10 }, 'settle'],
  [g(40), { ...BASE, y: 915, s: 1.04, rx: 3, ry: -5 }, 'settle'], [g(48), { ...BASE, y: 915, s: 1.075, rx: 3, ry: -4 }, 'drift'],
  [g(48) + .3, { ...BASE, s: 1.0, ry: -11 }, 'whip'], [g(58), { ...BASE, s: 1.03, ry: -8 }, 'drift'],
  [g(58) + .01, { ...BASE, y: 915, s: 1.02, rx: 4, ry: 7 }, 'snap'], [g(62), { ...BASE, y: 915, s: 1.02, rx: 4, ry: 7 }, 'drift'],
  [g(62) + .32, { ...BASE, y: 915, s: 1.04, rx: 4, ry: 8 }, 'whip'], [g(77), { ...BASE, y: 915, s: 1.075, rx: 3, ry: 6 }, 'drift'],
  [g(77) + .01, { ...BASE, y: 915, s: 1.02, rx: 4, ry: -6 }, 'snap'], [g(89), { ...BASE, y: 915, s: 1.05, rx: 3, ry: -5 }, 'drift'], [g(94), { ...BASE, y: 915, s: 1.075, rx: 2, ry: -4 }, 'drift'],
];
const lerpCam = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), p)), rx: lerp(a.rx, b.rx, p), ry: lerp(a.ry, b.ry, p) });
export function camAt(t) {
  if (t <= K[0][0]) return { ...K[0][1] };
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const p = EASE[K[i][2]](seg(t, K[i - 1][0], K[i][0])); return lerpCam(K[i - 1][1], K[i][1], p); }
  return { ...K[K.length - 1][1] };
}

let PY = {};
export const winH = shot => shot.strip ? WIN.h : shot.screen === 'review' ? WIN.bar + 474 : 640;   // the debrief window fits the skills grid exactly
function inner(id, t, vh = VIEW.h) {
  const VIEW = { w: WIN.w, h: vh };
  const C = (L, k, fx = .5, fy = .5) => { const r = PY[L][k]; return [r.x + r.w * fx, r.y + r.h * fy]; };
  if (id === 'roomT') { const d = PY.roomT.drawer, m = PY.roomT.msgs, top = d.y, bot = m.y + m.h, sc = Math.min(1.75, VIEW.h / (bot - top + 24)); return [d.x + d.w / 2, (top + bot) / 2, sc]; }
  if (id === 'room') { const [x, y] = C('room', 'avatar', .5, .45); return [x, y, 1.05]; }
  if (id === 'review') {   // the score card first, then an eased push across to the six skills
    const a = PY.review.hero, b = PY.review.dims;
    const hero = [a.x + a.w / 2, a.y + a.h / 2, Math.min(1.3, (VIEW.w - 30) / a.w, VIEW.h / (a.h + 30))], dims = [b.x + b.w / 2, b.y + b.h / 2, Math.min(1.3, (VIEW.w - 30) / b.w, VIEW.h / (b.h + 24))];
    if (t < g(62)) return hero;
    const p = EASE.settle(seg(t, g(65), g(66.5)));
    return [lerp(hero[0], dims[0], p), lerp(hero[1], dims[1], p), Math.exp(lerp(Math.log(hero[2]), Math.log(dims[2]), p))];
  }
  if (id === 'certificates') {
    const c = PY.certificates.cert, n = PY.certificates.certname, ti = PY.certificates.certtitle;
    const full = [c.x + c.w / 2, c.y + c.h * .4, Math.min(1.0, VIEW.h / (c.h * .8))], s2 = 2.4, name = [ti.x - 12 + VIEW.w / 2 / s2, n.y + n.h + 3 - VIEW.h / 2 / s2, s2];
    const p = EASE.settle(seg(t, T.certPush[0], T.certPush[1]));
    return [lerp(full[0], name[0], p), lerp(full[1], name[1], p), Math.exp(lerp(Math.log(full[2]), Math.log(name[2]), p))];
  }
  return [390, 300, 1];
}
export const MSGS = [
  { who: 'You', ts: '00:52', text: 'When did you start feeling that way?', user: true, key: 'm-you' },
  { who: 'Rohan', ts: '01:03', text: 'Why does everyone keep asking me that?', user: false, key: 'm-push' },
];
export const EV = [];
const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
let ENV = [];
export function build(words, py, env) {
  PY = py; ENV = env; EV.length = 0; wordTimes(words);
  for (const L of LINES) { ev(L.t0, 'vo', { id: L.id }); ev(L.hold[0], 'sub', { t1: L.hold[1], text: L.text.replace('’', "'") }); }
  // sound locked to picture: every event below has a visible counterpart
  ev(g(17), 'whip'); T.cells.forEach((t, i) => ev(t, 'chime', { i })); [g(21), g(23), g(25)].forEach(t => ev(t - .1, 'snapcam'));
  ev(T.pull[0], 'pullback'); ev(T.live, 'live'); ev(T.ecuR, 'cut'); ev(T.turb0, 'warning'); ev(T.trans, 'whip'); ev(g(48), 'whip');
  ev(T.land, 'lift'); ev(T.impact, 'touchdown'); ev(T.deb, 'whip'); [0, 1, 2, 3, 4, 5].forEach(i => ev(g(66 + i), 'skill', { i }));   // skills appear as the camera arrives on them
  ev(T.hours, 'cut'); T.hourSteps.forEach((t, i) => ev(t, 'tickup', { i })); ev(T.slide[0], 'panel'); ev(T.certPush[0], 'push');
  ev(T.end, 'resolve'); ev(T.end + .12, 'sweep'); CTA.lines.flat().forEach(w => ev(w[1], 'word')); ev(CTA.button, 'button');
  HEADS.forEach(H => H.lines.flat().forEach((_, i) => ev(H.t0 + i * E8, 'word')));
}
const envAt = t => { const i = Math.floor(t * 30); return ENV[Math.max(0, Math.min(ENV.length - 1, i))] || 0; };
export function avatarState(t) {
  const speak = t >= T.rohan0 && t < T.rohan1 + .1, listen = t >= g(48);
  const e = envAt(t), amp = speak ? 8 + 26 * Math.min(1, e * 3.2) : 7 + 2.5 * Math.sin(t * 2.2);
  const phase = t * 60 * .012 + Math.max(0, Math.min(t, T.rohan1) - T.rohan0) * 60 * .02;
  return { t, amp, phase, state: speak ? 'speak' : listen ? 'listen' : 'ready' };
}
const mmss = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
export function stripState(t) {
  const live = t >= T.live;
  return [
    { label: 'PATIENT', value: 'Rohan, 35', on: T.cells[0] },
    { label: 'DIFFICULTY', value: 'Hard', on: T.cells[1] },
    { label: 'MIC', value: live ? 'Live' : 'Ready', on: T.cells[2], ok: true },
    { label: 'TIMER', value: mmss(live ? Math.floor(t - T.live) : 0), on: T.cells[3] },
  ];
}
export function frame(t) {
  const shot = shotAt(t), out = { shot, t };
  if (shot.kind === 'world') {
    let id = shot.screen; if (id === 'room' && shot.drawer) id = 'roomT';
    let S = {};
    if (shot.screen === 'room') S = { ...avatarState(t), msgs: t >= g(40) ? MSGS : [], live: t >= T.live, caption: '', elapsed: mmss(Math.max(0, Math.floor(t - T.live))), drawerOpen: !!shot.drawer };
    else if (shot.screen === 'review') S = shot.touchdown ? { ring: 1, dims: [0, 0, 0, 0, 0, 0] } : { ring: 1, dims: [0, 1, 2, 3, 4, 5].map(i => { const a = g(66 + i); return t >= a ? Math.min(1, .35 + seg(t, a, a + .28)) : 0; }) };
    const wh = winH(shot); out.win = { id, screen: shot.screen, S, h: wh, inner: inner(id, t, wh - WIN.bar) };
    out.cam = camAt(t);
    if (shot.strip) {   // keep the strip clear of the caption lane once the close-ups are over (the camera rises instead)
      out.strip = stripState(t);
      if (t >= T.pull[1]) { const bottom = STRIP.y + STRIP.h, lim = 1288; /* caption lane starts at 1300 */ if ((bottom - out.cam.y) * out.cam.s + F.y > lim) out.cam.y = bottom - (lim - F.y) / out.cam.s; }
    }
  }
  return out;
}
