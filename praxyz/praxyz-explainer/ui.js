// Praxyz web app screens, redrawn from the real source (D:/EUNOIA/praxyz/praxyz-web) at app pixels (layout width 780):
// practice/page.js + PatientCard.js · SessionLobby.js + MicCheckPanel.js + MicLevelMeter.js · LiveSessionRoom.js + PatientAvatar.js
// + LiveTranscriptDrawer.js · session/[id]/review/page.js · analytics/page.js + RankCard.js · CertificateCard.js + CertificateDownload.js
// + certificate/[certId]/CertificatePublicView.js. Trainee: the fictional "Ishaan Rao". Price/credit amounts are kept off screen.
import { clamp, eo, hash } from '/core/lib.js';

const ic = (d, s = 16, c = 'currentColor', w = 2, fill = 'none') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const I = {
  mic: (s, c) => ic('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>', s, c),
  okc: (s, c) => ic('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', s, c),
  chev: (s, c) => ic('<path d="m6 9 6 6 6-6"/>', s, c),
  wind: (s, c) => ic('<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>', s, c),
  pause: (s, c) => ic('<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>', s, c),
  square: (s, c) => ic('<rect x="4" y="4" width="16" height="16" rx="2"/>', s, c, 2, c),
  align: (s, c) => ic('<path d="M15 12H3"/><path d="M17 18H3"/><path d="M21 6H3"/>', s, c),
  clock: (s, c) => ic('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', s, c),
  star: (s, c) => ic('<path d="M11.5 2.3a.5.5 0 0 1 1 0l2.3 4.7a2 2 0 0 0 1.6 1.1l5.2.8a.5.5 0 0 1 .3.9l-3.8 3.7a2 2 0 0 0-.6 1.9l.9 5.2a.5.5 0 0 1-.8.6l-4.6-2.5a2 2 0 0 0-2 0l-4.6 2.5a.5.5 0 0 1-.8-.6l.9-5.2a2 2 0 0 0-.6-1.9L1.1 9.8a.5.5 0 0 1 .3-.9l5.2-.8a2 2 0 0 0 1.6-1.1z"/>', s, c),
  warn: (s, c) => ic('<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>', s, c),
  trend: (s, c) => ic('<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>', s, c),
  msg: (s, c) => ic('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', s, c),
  trophy: (s, c) => ic('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.7V17c0 .6-.5 1-1 1.2C7.9 18.8 7 20.2 7 22"/><path d="M14 14.7V17c0 .6.5 1 1 1.2 1.2.5 2 2 2 3.8"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>', s, c),
  arrow: (s, c) => ic('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', s, c),
  down: (s, c) => ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>', s, c),
  link: (s, c) => ic('<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><path d="M8 12h8"/>', s, c),
  check: (s, c) => ic('<path d="M20 6 9 17l-5-5"/>', s, c),
  shield: (s, c) => ic('<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>', s, c),
  act: (s, c) => ic('<path d="M22 12h-2.5a2 2 0 0 0-1.9 1.5l-2.4 8.4a.3.3 0 0 1-.5 0L9.2 2.2a.3.3 0 0 0-.5 0l-2.3 8.4A2 2 0 0 1 4.5 12H2"/>', s, c),
  award: (s, c) => ic('<path d="m15.5 12.9 1.5 8.4a.5.5 0 0 1-.8.5l-3.6-2.7a1 1 0 0 0-1.2 0l-3.6 2.7a.5.5 0 0 1-.8-.5l1.5-8.4"/><circle cx="12" cy="8" r="6"/>', s, c),
  max: (s, c) => ic('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>', s, c),
};

// ───────── real data (data/patients.seed.json; portraits from public/avatars)
const CAT = {
  Anxiety: { av: 'linear-gradient(135deg,rgba(45,212,191,.5),rgba(34,211,238,.35))', avb: 'rgba(94,234,212,.4)', bb: 'rgba(94,234,212,.45)', bg: 'rgba(20,184,166,.15)', tx: '#99F6E4' },
  Depression: { av: 'linear-gradient(135deg,rgba(96,165,250,.5),rgba(56,189,248,.35))', avb: 'rgba(147,197,253,.4)', bb: 'rgba(147,197,253,.45)', bg: 'rgba(59,130,246,.15)', tx: '#BFDBFE' },
  Addiction: { av: 'linear-gradient(135deg,rgba(251,113,133,.5),rgba(248,113,113,.35))', avb: 'rgba(253,164,175,.4)', bb: 'rgba(253,164,175,.45)', bg: 'rgba(244,63,94,.15)', tx: '#FECDD3' },
  Grief: { av: 'linear-gradient(135deg,rgba(251,191,36,.5),rgba(251,146,60,.35))', avb: 'rgba(252,211,77,.4)', bb: 'rgba(252,211,77,.45)', bg: 'rgba(245,158,11,.15)', tx: '#FDE68A' },
};
const DIFF = { Easy: '#22C55E', Medium: '#F59E0B', Hard: '#EF4444' };
export const PATIENTS = [
  { id: 'ankita', name: 'Ankita', age: 28, g: 'F', cat: 'Anxiety', diff: 'Easy', res: 1, img: 'ankita-28-anxiety', prob: 'Persistent anxiety and fear of being alone — avoids returning home, struggles to initiate social connections' },
  { id: 'rohan', name: 'Rohan', age: 35, g: 'M', cat: 'Depression', diff: 'Medium', res: 2, img: 'rohan-35-depression', prob: 'Low motivation and sleep issues after divorce' },
  { id: 'meera', name: 'Meera', age: 55, g: 'F', cat: 'Grief', diff: 'Medium', res: 2, img: 'meera-55-grief', prob: 'Grief and withdrawal after husband\'s death' },
  { id: 'vikram', name: 'Vikram', age: 45, g: 'M', cat: 'Addiction', diff: 'Hard', res: 3, img: 'vikram-45-addiction', prob: 'Alcohol use escalating, wife gave ultimatum' },
];
export const SKILLS = [   // the app's own Title Case labels (review/page.js DIMENSIONS); session 6 scores (mean 77.7 → 78)
  ['Empathy', 84, 'Warm, validating responses throughout.'], ['Active Listening', 81, 'Good reflections; summarise more often.'],
  ['Question Quality', 72, 'Mostly open questions, a few double ones.'], ['Therapeutic Technique', 69, 'Some leading statements.'],
  ['Rapport', 86, 'Rohan stayed engaged and opened up.'], ['Clinical Accuracy', 74, 'Explore symptoms more fully.'],
];
export const ROHAN_LINE = 'I do not know… I just stopped caring about things.';   // what Rohan actually says in patient.wav
export const YOU_LINE = 'When did you start feeling that way?';
export const PUSHBACK = 'Why does everyone keep asking me that?';
const scol = s => s >= 75 ? '#22C55E' : s >= 50 ? '#F59E0B' : '#EF4444';
const badge = (cat, up = true) => { const c = CAT[cat]; return `<span class="badge ${up ? 'up' : ''}" style="border-color:${c.bb};background:${c.bg};color:${c.tx}">${cat}</span>`; };
const diffPill = d => `<span class="badge" style="border-color:${DIFF[d]}73;background:${DIFF[d]}26;color:${DIFF[d]}">${d}</span>`;
const typed = (text, k) => { const n = Math.round(text.length * clamp(k)); return text.slice(0, n); };

// ───────── 1. Choose Your Patient (practice/page.js + PatientCard.js)
function patientCard(p, S) {
  const c = CAT[p.cat], k = S.snap ? S.snap[p.id] ?? 1 : 1;
  return `<article class="pcard ${S.hot === p.id ? 'hot' : ''}" data-a="card-${p.id}" style="visibility:${k > 0 ? 'visible' : 'hidden'}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="display:flex;align-items:center;gap:12px">
      <div class="av" style="background:${c.av};border-color:${c.avb}"><img src="assets/avatars/${p.img}.webp"></div>
      <div><h3 class="nm">${p.name}</h3><p class="ag">${p.age} • ${p.g}</p></div></div>${diffPill(p.diff)}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">${badge(p.cat)}
      <div class="dots"><em>resist.</em>${[1, 2, 3].map(i => `<span class="${i <= p.res ? 'on' : ''}"></span>`).join('')}</div></div>
    <p class="prob" style="margin-top:16px">${p.prob}</p>
    <div class="begin ${S.press === p.id ? 'press' : ''}" data-a="begin-${p.id}" style="margin-top:16px">Begin Session</div></article>`;
}
export function practice(S) {
  return `<div class="app dash" style="padding:24px;height:1500px">
    <header class="glass" data-a="phead" style="padding:24px"><div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div><h1 class="h1d">Choose Your Patient</h1><p class="sub">Review each profile carefully before selecting a case</p></div>
      <span style="border-radius:999px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);padding:4px 12px;font-size:14px;font-weight:500;color:rgba(255,255,255,.6);margin-top:4px">7 cases</span></div>
      <div style="margin-top:20px;display:grid;grid-template-columns:1fr;gap:16px">
        <div><p class="lab">Category</p><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${['All', 'Anxiety', 'Depression', 'Addiction', 'Grief'].map((x, i) => `<span class="pill ${i ? '' : 'on'}">${x}</span>`).join('')}</div></div>
        <div><p class="lab">Difficulty</p><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${['All', 'Easy', 'Medium', 'Hard'].map((x, i) => `<span class="pill ${i ? '' : 'on'}">${x}</span>`).join('')}</div></div></div></header>
    <div data-a="grid" style="margin-top:24px;display:grid;grid-template-columns:1fr;gap:20px">${PATIENTS.map(p => patientCard(p, S)).join('')}</div></div>`;
}

// ───────── 2. Ready to join? (SessionLobby.js + MicCheckPanel.js + MicLevelMeter.js, 20 bars)
export function lobby(S) {
  const bars = Array.from({ length: 20 }, (_, i) => { const l = clamp(.18 + .75 * Math.abs(Math.sin(S.t * 9 + i * .7) * Math.sin(S.t * 3.1 + i * 1.9)) * (1 - Math.abs(i - 9.5) / 14));
    return `<i style="height:${Math.max(4, Math.round(l * 48))}px;background:rgba(0,191,165,${Math.max(.25, l)});box-shadow:${l > .5 ? '0 0 6px rgba(0,191,165,.4)' : 'none'}"></i>`; }).join('');
  return `<div class="app room" style="height:900px">
    <header class="lhead"><span class="brand">Praxyz</span><div style="display:flex;align-items:center;gap:8px;font-size:14px;color:rgba(255,255,255,.6)">Session: <b style="font-weight:500;color:rgba(255,255,255,.85)">Rohan</b>${badge('Depression', false)}</div></header>
    <div style="width:512px;margin:0 auto;padding:32px 0;display:flex;flex-direction:column;gap:16px">
      <div style="text-align:center"><h1 style="font:900 24px Inter;letter-spacing:-.025em;color:#fff">Ready to join?</h1><p style="margin-top:4px;font-size:14px;color:rgba(255,255,255,.55)">Check your microphone before entering the session</p></div>
      <div class="panel" style="display:flex;flex-direction:column;gap:16px" data-a="micpanel">
        <div style="display:flex;align-items:center;gap:12px"><div class="micic">${I.mic(18, '#00BFA5')}</div><div><p style="font-size:14px;font-weight:600;color:rgba(255,255,255,.9)">Microphone</p>
          <p style="font-size:12px;color:#22C55E;display:flex;align-items:center;gap:4px">${I.okc(11, '#22C55E')} Ready</p></div></div>
        <div style="border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);padding:16px 0"><div class="meter">${bars}</div></div>
        <div><p style="font-size:12px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.15em">Microphone</p>
          <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;border-radius:12px;padding:10px 16px;font-size:14px;background:var(--sbg);border:1px solid var(--b2)">Headset Microphone${I.chev(14, 'rgba(255,255,255,.4)')}</div></div></div>
      <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;background:rgba(0,77,64,.08);border:1px solid rgba(0,191,165,.15)">${I.wind(14, '#00BFA5')}<p style="font-size:12px;color:rgba(255,255,255,.65)">Quiet room + headset mic gives Rohan the clearest audio.</p></div>
      <div class="join ${S.press ? 'press' : ''}" data-a="join">Join Session →</div></div></div>`;
}

// ───────── 3. Live room (LiveSessionRoom.js + PatientAvatar.js blob + LiveTranscriptDrawer.js)
function blobPath(phase, amp, N = 16, C = 120, R = 90) {
  const P = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, r = R + Math.sin(a * 2 + phase) * amp + Math.sin(a * 3 - phase * .7) * amp * .6; P.push([C + Math.cos(a) * r, C + Math.sin(a) * r]); }
  let d = `M ${P[0][0]},${P[0][1]}`;
  for (let i = 0; i < N; i++) { const p0 = P[(i - 1 + N) % N], p1 = P[i], p2 = P[(i + 1) % N], p3 = P[(i + 2) % N];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`; }
  return d + ' Z';
}
export function avatar(S) {   // Depression palette from PatientAvatar.js CATEGORY_COLORS
  const A = { ring: '#60A5FA', bg: 'rgba(96,165,250,0.18)', text: '#93C5FD', a: '#818CF8', b: '#60A5FA', c: '#93C5FD' };
  const d1 = blobPath(S.phase, S.amp), d2 = blobPath(S.phase * 1.15 + 1.6, S.amp * .7);
  const status = S.state === 'speak' ? 'Rohan is speaking...' : S.state === 'think' ? 'Rohan is thinking...' : S.state === 'listen' ? 'Rohan is listening...' : 'Rohan is ready to respond...';
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:20px" data-a="avatar"><div style="position:relative;display:flex;align-items:center;justify-content:center;height:312px;width:312px">
    <svg width="312" height="312" viewBox="0 0 240 240" style="position:absolute;left:0;top:0"><defs>
      <radialGradient id="bg1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${A.a}" stop-opacity="0"/><stop offset="55%" stop-color="${A.a}" stop-opacity=".15"/><stop offset="88%" stop-color="${A.a}" stop-opacity=".95"/><stop offset="100%" stop-color="${A.b}" stop-opacity=".9"/></radialGradient>
      <radialGradient id="bg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${A.c}" stop-opacity="0"/><stop offset="55%" stop-color="${A.c}" stop-opacity=".1"/><stop offset="88%" stop-color="${A.c}" stop-opacity=".7"/><stop offset="100%" stop-color="${A.b}" stop-opacity=".6"/></radialGradient>
      <filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter><filter id="bls" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14"/></filter></defs>
      <path d="${d1}" fill="url(#bg1)" filter="url(#bls)" opacity=".5"/><path d="${d1}" fill="url(#bg1)" filter="url(#bl)"/><path d="${d2}" fill="url(#bg2)" filter="url(#bl)"/></svg>
    <div style="position:relative;width:160px;height:160px;border-radius:50%;overflow:hidden;background:${A.bg};border:2px solid ${A.ring}40;transform:scale(${S.state === 'speak' ? 1 + .015 * (1 + Math.sin(S.t * 3.5)) : 1})"><img src="assets/avatars/rohan-35-depression.webp" style="width:100%;height:100%;object-fit:cover;display:block"></div></div>
    ${S.noStatus ? '' : `<p style="font-size:14px;font-weight:500;color:${S.state === 'speak' ? A.text : 'rgba(255,255,255,.6)'}" data-a="status">${status}</p>`}</div>`;
}
const tmsg = (who, ts, text, user, key) => `<div class="msg ${user ? 'u' : 'b'}" data-a="${key}"><div class="who"><span style="color:${user ? '#2DD4BF' : '#FBBF24'}">${who}</span><span class="ts">${ts}</span></div><div class="bub">${text}</div></div>`;
export function room(S) {
  const M = [];
  if (S.rohan > 0) M.push(tmsg('Rohan', '00:41', typed(ROHAN_LINE, S.rohan), false, 'm-rohan'));
  if (S.you > 0) M.push(tmsg('You', '00:52', typed(YOU_LINE, S.you), true, 'm-you'));
  if (S.push > 0) M.push(tmsg('Rohan', '01:03', typed(PUSHBACK, S.push), false, 'm-push'));
  return `<div class="app room" style="height:900px;position:relative">
    <header class="rhead"><div style="display:flex;align-items:center;gap:16px"><span style="display:flex;align-items:center;gap:6px;font-size:14px;color:rgba(255,255,255,.5)">${I.square(12, 'rgba(255,255,255,.5)')} End</span>
      <span style="display:flex;align-items:center;gap:8px"><b style="font-size:14px;font-weight:600;color:rgba(255,255,255,.9)">Rohan</b>${badge('Depression', false)}</span></div>
      <div class="live" data-a="live"><i></i>Live</div><div class="timer">${S.left}<span>left</span></div></header>
    <main style="position:absolute;left:0;top:63px;width:400px;bottom:0;display:flex;flex-direction:column;align-items:center;padding:20px 24px;gap:12px">
      <p style="font:400 12px Mono;color:rgba(255,255,255,.25)">${S.elapsed} elapsed</p>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">${avatar(S)}
        <div style="width:100%;min-height:48px;display:flex;align-items:center;justify-content:center;padding:0 8px" data-a="roomcap">${S.caption ? `<p style="text-align:center;font-size:14px;line-height:1.6;color:rgba(255,255,255,.7)">${S.caption}</p>` : ''}</div></div>
      <div style="display:flex;align-items:center;gap:16px;padding-bottom:4px"><div class="ctrl">${I.pause(16, 'rgba(255,255,255,.6)')}</div><div class="micbig" data-a="mic">${I.mic(24, '#fff')}</div>
        <div class="ctrl" style="border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.1)">${I.square(16, '#EF4444')}</div>
        <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:12px;border:1px solid rgba(0,191,165,.4);background:rgba(0,77,64,.2);font-size:12px;font-weight:500;color:#00BFA5">${I.align(13, '#00BFA5')}Transcript ✓</div></div></main>
    <aside class="drawer" data-a="drawer"><div class="dhead"><div><p style="font-size:14px;font-weight:600;color:rgba(255,255,255,.9)">Live Transcript</p><p style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px">${M.length} messages</p></div></div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">${M.join('')}</div></aside></div>`;
}

// ───────── 4. Session Review (review/page.js): hero + score ring, Skill Breakdown, Strengths, Areas to Improve, Moment Feedback, Transcript
function ring(score, k) {
  const size = 120, sw = 8, r = (size - sw) / 2, c = 2 * Math.PI * r, col = scol(score), shown = Math.round(score * k);
  return `<div style="position:relative;width:${size}px;height:${size}px;flex:none" data-a="ring"><svg width="${size}" height="${size}" style="transform:rotate(-90deg)"><circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="${sw}"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="${score / 100 * c * k} ${c}" stroke-linecap="round"/></svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font:700 30px Inter;color:${col}">${shown}</span><span style="font-size:12px;color:rgba(255,255,255,.3);margin-top:-2px">/ 100</span></div></div>`;
}
export function review(S) {
  const dims = SKILLS.map(([l, s, f], i) => { const k = S.dims ? clamp(S.dims[i]) : 1, col = scol(s);
    return `<div class="dim" data-a="dim${i}" style="visibility:${k > 0 ? 'visible' : 'hidden'}"><div style="display:flex;justify-content:space-between;align-items:center"><p style="font-size:12px;font-weight:500;color:rgba(255,255,255,.6)">${l}</p>
      <span style="display:flex;align-items:center;gap:6px"><b style="font:700 18px Inter;color:${col}">${Math.round(s * eo(k))}</b>${I.max(11, 'rgba(255,255,255,.2)')}</span></div>
      <div class="bar"><i style="width:${s * eo(k)}%;background:${col}"></i></div><p style="font-size:11px;line-height:1.6;color:rgba(255,255,255,.4)">${f}</p></div>`; }).join('');
  const li = (txt, icn, k) => `<li style="visibility:${k > 0 ? 'visible' : 'hidden'}">${icn}<span>${typed(txt, k * 1.4)}</span></li>`;
  const fb = S.fb ?? [1, 1, 1, 1];
  return `<div class="app dash" style="padding:24px;display:flex;flex-direction:column;gap:20px">
    <p style="font-size:14px;color:rgba(255,255,255,.4)">History <span style="margin:0 6px">/</span><span style="color:rgba(255,255,255,.7)">Session Review</span></p>
    <div class="hero" data-a="hero"><div style="display:flex;align-items:center;gap:24px">${ring(78, S.ring ?? 1)}
      <div style="flex:1"><div>${badge('Depression', false)}</div><h1 style="font:700 20px DM;color:rgba(255,255,255,.9);margin-top:4px">Rohan</h1>
        <div style="display:flex;align-items:center;gap:20px;margin-top:12px"><span style="display:flex;align-items:center;gap:6px;font-size:14px;color:rgba(255,255,255,.5)">${I.clock(14, 'rgba(255,255,255,.5)')}18:42</span>
        <span style="font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;border:1px solid rgba(34,197,94,.2);background:rgba(34,197,94,.1);color:#22C55E">Completed</span></div></div>
      <div style="text-align:right"><p style="font:700 36px Inter;color:#22C55E">${Math.round(78 * (S.ring ?? 1))}</p><p style="font-size:12px;color:rgba(255,255,255,.3);margin-top:2px">Overall Score</p></div></div></div>
    <div><p class="lab" style="color:rgba(255,255,255,.3);letter-spacing:.15em;margin-bottom:12px">Skill Breakdown</p><div data-a="dims" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${dims}</div></div>
    <div data-a="fbrow" style="display:grid;grid-template-columns:1fr;gap:16px">
      <div class="fbox" style="border:1px solid rgba(34,197,94,.2);background:rgba(34,197,94,.05)"><p style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#22C55E;margin-bottom:12px">${I.okc(15, '#22C55E')}Strengths</p>
        <ul style="display:flex;flex-direction:column;gap:8px">${li('Reflected Rohan’s loss of interest without rushing to fix it', I.star(11, '#22C55E'), fb[0])}${li('Open questions kept him talking', I.star(11, '#22C55E'), fb[1])}</ul></div>
      <div class="fbox" style="border:1px solid rgba(251,191,36,.2);background:rgba(245,158,11,.05)"><p style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#FBBF24;margin-bottom:12px">${I.trend(15, '#FBBF24')}Areas to Improve</p>
        <ul style="display:flex;flex-direction:column;gap:8px">${li('Stay with emotional disclosures before changing topic', I.warn(11, '#FBBF24'), fb[2])}${li('Summarise more often to show you’re listening', I.warn(11, '#FBBF24'), fb[3])}</ul></div></div>
    <div class="fbox" data-a="moment" style="border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);visibility:${(S.mom ?? 1) > 0 ? 'visible' : 'hidden'}"><p style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:12px">${I.clock(15, 'rgba(255,255,255,.4)')}Moment Feedback</p>
      <ul><li>${I.warn(11, '#FBBF24')}<span style="flex:1">Rohan opened up about the divorce here — stay with it before moving on to sleep.</span><span class="tsb ${S.chipHot ? 'hot' : ''}" data-a="chip">2:14</span></li></ul></div>
    <div style="border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);overflow:hidden" data-a="transcript">
      <div style="display:flex;align-items:center;gap:8px;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.06)">${I.msg(14, 'rgba(255,255,255,.4)')}<p style="font-size:14px;font-weight:500;color:rgba(255,255,255,.7)">Transcript</p></div>
      ${[['0:41', 'Rohan', ROHAN_LINE], ['0:52', 'You', YOU_LINE], ['2:14', 'Rohan', 'Since the divorce, I guess. Anyway…'], ['2:19', 'You', 'Okay. How have you been sleeping?']].map(([ts, who, tx], i) =>
        `<div class="trow ${S.rowHot && i === 2 ? 'hot' : ''}" data-a="row${i}"><span style="font:400 11px Mono;color:rgba(255,255,255,.3);width:34px;flex:none;padding-top:2px">${ts}</span><div><p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:${who === 'You' ? '#2DD4BF' : '#FBBF24'}">${who}</p><p style="font-size:14px;line-height:1.55;color:rgba(255,255,255,.75)">${tx}</p></div></div>`).join('')}</div></div>`;
}

// ───────── 5. Analytics (analytics/page.js) + Your Rank (RankCard.js; tier "Skilled" from lib/rankingTiers.js)
const TREND = [58, 63, 67, 70, 74, 78];
export function analytics(S) {
  const w = 530, h = 230, pad = 34, xs = i => pad + i * (w - pad - 14) / 5, ys = v => 12 + (h - 40) * (1 - v / 100);
  const p = clamp(S.line ?? 1), last = p * 5, pts = TREND.map((v, i) => [xs(i), ys(v)]);
  let d = `M ${pts[0][0]},${pts[0][1]}`; for (let i = 1; i <= Math.ceil(last) && i < 6; i++) { const f = Math.min(1, last - (i - 1)); const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f; d += ` L ${x},${y}`; }
  const grid = [0, 25, 50, 75, 100].map(v => `<line x1="${pad}" x2="${w - 14}" y1="${ys(v)}" y2="${ys(v)}" stroke="rgba(255,255,255,.1)"/><text x="${pad - 8}" y="${ys(v) + 4}" fill="rgba(255,255,255,.4)" font-size="11" text-anchor="end">${v}</text>`).join('')
    + TREND.map((_, i) => `<text x="${xs(i)}" y="${h - 8}" fill="rgba(255,255,255,.4)" font-size="11" text-anchor="middle">#${i + 1}</text>`).join('');
  const dots = pts.filter((_, i) => i <= last + 1e-6).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#00BFA5"/>`).join('');
  const stat = (lab, val, icn) => `<div class="stat"><div style="display:flex;justify-content:space-between"><p>${lab}</p>${icn}</div><b>${val}</b></div>`;
  const rk = clamp(S.rank ?? 1);
  return `<div class="app dash" style="padding:24px;display:flex;flex-direction:column;gap:16px">
    <div><h1 style="font:700 24px Inter;color:var(--t1)">Analytics</h1><p style="font-size:14px;margin-top:4px;color:var(--t3)">Track your progress and skill development</p></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">${stat('Total Sessions', Math.round(6 * p) || 1, I.act(16, 'rgba(0,191,165,.7)'))}${stat('Avg Score', Math.round(58 + 10 * p), I.award(16, 'rgba(0,191,165,.7)'))}${stat('Hours Practiced', (3.5 * p).toFixed(1) + 'h', I.clock(16, 'rgba(0,191,165,.7)'))}</div>
    <div class="stat" data-a="trend" style="padding:20px"><p style="font-size:14px;font-weight:600;text-transform:none;letter-spacing:0;color:var(--t2);margin-bottom:12px">Score Trend</p>
      <svg width="${w}" height="${h}" font-family="DM, sans-serif">${grid}<path d="${d}" fill="none" stroke="#00BFA5" stroke-width="2.5" style="filter:drop-shadow(0 0 6px rgba(0,191,165,.6))"/>${dots}</svg></div>
    <div class="stat rk" data-a="rank" style="position:relative;overflow:hidden;padding:20px;visibility:${rk > 0 ? 'visible' : 'hidden'}">
      <div style="position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,191,165,.45),transparent)"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2 style="font:600 16px DM;color:var(--t1)">Your Rank</h2><span style="display:flex;align-items:center;gap:4px;font-size:12px;color:rgba(0,191,165,.7)">View leaderboard ${I.arrow(12, 'rgba(0,191,165,.7)')}</span></div>
      <div style="display:flex;align-items:center;gap:12px"><div style="width:44px;height:44px;border-radius:16px;border:1px solid #00BFA566;background:#00BFA51A;display:grid;place-items:center">${I.trophy(20, '#00BFA5')}</div>
        <div><p style="font:700 18px DM;color:var(--t1)">#12 · <span style="color:#00BFA5">Skilled</span></p><p style="font-size:12px;color:var(--t3)">68 composite score</p></div></div></div></div>`;
}

// ───────── 6. Certificate (CertificateCard.js, Proficiency tier) + CertificateDownload.js buttons + public view
const CERT_SK = [['Empathy', 74], ['Active Listening', 71], ['Question Quality', 64], ['Therapeutic Technique', 61], ['Rapport', 76], ['Clinical Accuracy', 62]];   // lib/certificates.js SKILL_LABELS
export const CERT_ID = '8f3k2q9a7c1d', CERT_SHORT = '8F3K2Q9A';
export function certCard(scale = 1) {
  const T = '#00897B', INK = '#0F1F1B', G = '#6B7C7A';
  const stats = [['6', 'Sessions'], ['68/100', 'Avg. score'], ['3.5 h', 'Practice']].map(([v, l]) => `<div style="display:flex;align-items:center;gap:12px"><div style="width:3px;height:18px;background:${T};border-radius:99px"></div><p style="font-size:13px"><strong style="font-size:15px;font-weight:700">${v}</strong> <span style="color:${G}">${l}</span></p></div>`).join('');
  const sk = CERT_SK.map(([l, s]) => `<div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:${G};font-size:9px;text-transform:uppercase;letter-spacing:.12em;font-weight:500">${l}</span><span style="font-size:10px;font-weight:700">${s}%</span></div>
    <div style="height:3px;background:#DDE8E6;border-radius:99px;overflow:hidden"><div style="width:${s}%;height:100%;background:${s >= 65 ? '#26A69A' : '#F59E0B'};border-radius:99px"></div></div></div>`).join('');
  return `<div class="cert" data-a="cert" style="zoom:${scale}"><div style="height:6px;background:linear-gradient(90deg,#004D40 0%,${T} 50%,#4DB6AC 100%)"></div>
    <div style="position:absolute;bottom:-60px;right:-60px">${[200, 150, 100].map((s, i) => `<div style="position:absolute;width:${s}px;height:${s}px;border-radius:50%;border:1px solid ${T}${['12', '18', '22'][i]};bottom:0;right:0;transform:translate(50%,50%)"></div>`).join('')}</div>
    <div style="padding:32px 36px;position:relative"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px"><div style="display:flex;align-items:center;gap:10px">
      <div style="width:36px;height:36px;border-radius:9px;background:${T};display:grid;place-items:center"><span style="color:#fff;font-size:15px;font-weight:800">P</span></div><span style="font-size:18px;font-weight:700;letter-spacing:-.02em">Praxyz</span></div>
      <div style="display:inline-flex;align-items:center;gap:6px;border:1.5px solid ${T};border-radius:999px;padding:5px 14px">${I.check(11, T)}<span style="color:${T};font-size:11px;font-weight:600">Verified</span></div></div>
      <p data-a="certtitle" style="color:${T};font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;margin-bottom:10px">Proficiency Certificate</p>
      <p data-a="certname" style="color:${INK};font-size:36px;font-weight:800;letter-spacing:-.02em;line-height:1.1;margin-bottom:8px;display:inline-block">Ishaan Rao</p><br>
      <p style="color:${G};font-size:13px">has demonstrated therapeutic proficiency in clinical practice</p>
      <div style="margin:24px 0 28px;display:flex;flex-direction:column;gap:12px">${stats}</div>
      <div style="background:#F4F8F7;border-radius:10px;padding:16px 18px;margin-bottom:24px"><p style="color:${G};font-size:9px;text-transform:uppercase;letter-spacing:.2em;margin-bottom:12px;font-weight:600">Skill Breakdown</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px">${sk}</div></div>
      <div style="border-top:1px solid #E2E8E6;padding-top:16px;display:flex;align-items:center;justify-content:space-between"><div style="display:flex;gap:24px">
        <div><span style="color:${G};font-size:9px;text-transform:uppercase;letter-spacing:.16em;font-weight:600">Issued </span><span style="font-size:11px;font-weight:500">14 November 2026</span></div>
        <div><span style="color:${G};font-size:9px;text-transform:uppercase;letter-spacing:.16em;font-weight:600">Credential ID </span><span style="font-size:11px;font-weight:500;font-family:Mono">${CERT_SHORT}</span></div></div>
        <span style="color:${T};font-size:11px;font-weight:600">praxyz.tech/certificate/${CERT_ID}</span></div></div></div>`;
}
export function certificates(S) {
  return `<div class="app dash" style="padding:32px 80px;display:flex;flex-direction:column;align-items:center;gap:20px">${certCard()}
    <div style="display:flex;gap:10px;align-self:flex-start;margin-left:0" data-a="certbtns"><span class="cbtn">${I.down(15)}PNG</span><span class="cbtn">${I.down(15)}PDF</span>
      <span class="cbtn ${S.copied ? 'on' : ''}" data-a="copy">${S.copied ? I.check(15) : I.link(15)}${S.copied ? 'Copied!' : 'Copy Link'}</span></div></div>`;
}
export function publicCert(S) {
  // header mark drawn as "P" to match the certificate (the live public view currently renders "TP")
  return `<div class="app" style="background:linear-gradient(160deg,#060e1a 0%,#0a1628 50%,#05111f 100%);min-height:900px">
    <header style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid rgba(255,255,255,.08)"><div style="display:flex;align-items:center;gap:10px">
      <div style="width:28px;height:28px;border-radius:8px;background:var(--p);border:1px solid rgba(0,191,165,.3);display:grid;place-items:center;color:#fff;font:700 11px Inter">P</div><span style="font-size:14px;font-weight:600;color:rgba(255,255,255,.8)">Praxyz</span></div>
      <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,.35)">${I.shield(12, 'rgba(255,255,255,.35)')}Verified Certificate</span></header>
    <main style="padding:40px 80px;display:flex;flex-direction:column;gap:24px;align-items:center">${certCard()}
      <div data-a="stamp" style="width:620px;border-radius:16px;border:1px solid rgba(16,185,129,.2);background:rgba(16,185,129,.05);padding:16px;display:flex;align-items:center;gap:12px;visibility:${(S.stamp ?? 1) > 0 ? 'visible' : 'hidden'}">
        <div style="width:36px;height:36px;border-radius:12px;border:1px solid rgba(16,185,129,.3);background:rgba(16,185,129,.1);display:grid;place-items:center">${I.shield(16, '#34D399')}</div>
        <div><p style="font-size:14px;font-weight:600;color:#34D399">Verified Certificate</p><p style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px">Issued by Praxyz · ID: <span style="font-family:Mono">${CERT_SHORT}</span> · 14 Nov 2026</p></div></div></main></div>`;
}

export const SCREENS = { practice, lobby, room, review, analytics, certificates, publicCert };
export const URLS = { practice: '/practice', lobby: '/practice/rohan-35-depression', room: '/practice/rohan-35-depression', review: '/session/s6/review', analytics: '/analytics', certificates: '/certificates', publicCert: `/certificate/${CERT_ID}` };
