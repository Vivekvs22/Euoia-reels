// Eunoia mobile UI (390 px), redrawn from the real React source:
// pages/FindTherapist.jsx, components/TherapistCard.jsx, pages/Booking.jsx, components/booking/SlotPicker.jsx,
// components/auth/OtpLogin.jsx + LoginDialog.jsx, pages/BookingStatus.jsx, components/booking/BookingCard.jsx.
// Brand rules: no therapist names or photos (botanical avatar), no session length, client "Ananya", masked phone.
import { clamp, eo } from '/core/lib.js';

export const PHONE = '+91 98••• ••210';
const svg = (d, s = 16, w = 2, col = 'currentColor', extra = '') =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
export const I = {
  right: (s, c) => svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', s, 2, c),
  left: (s, c) => svg('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>', s, 2, c),
  x: (s, c) => svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', s, 2, c),
  lang: (s, c) => svg('<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>', s, 2, c),
  lock: (s, c) => svg('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', s, 2, c),
  check: (s, c, w = 2) => svg('<path d="M20 6 9 17l-5-5"/>', s, w, c),
  pencil: (s, c) => svg('<path d="M12 20h9"/><path d="M16.4 3.6a1 1 0 0 1 3 3L7.4 18.6a2 2 0 0 1-.9.5l-2.9.8a.5.5 0 0 1-.6-.6l.8-2.9a2 2 0 0 1 .5-.9z"/>', s, 2, c),
  shield: (s, c) => svg('<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>', s, 2, c),
  mail: (s, c) => svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-9 5.7a2 2 0 0 1-2 0L2 7"/>', s, 2, c),
  video: (s, c) => svg('<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>', s, 2, c),
  menu: (s, c) => svg('<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>', s, 2, c),
  cal: (s, c) => svg('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M12 14v4"/><path d="M10 16h4"/>', s, 2, c),
  copy: (s, c) => svg('<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>', s, 2, c),
  chat: (s, c) => svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', s, 2, c),
  bell: (s, c) => svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>', s, 2, c),
  phone: (s, c) => svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>', s, 2, c),
  card: (s, c) => svg('<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>', s, 2, c),
};

// The site's own BotanicalArt "branch" variant (LIGHT palette), used in place of every therapist photo.
export const BRANCH = (w, h) => `<svg width="${w}" height="${h}" viewBox="40 60 340 340" aria-hidden="true">
<path d="M110 360 C 160 285, 225 205, 305 105" fill="none" stroke="#8FA37E" stroke-width="2.5" stroke-linecap="round"/>
<g fill="#B7C7A6"><ellipse cx="138" cy="322" rx="16" ry="8" transform="rotate(-40 138 322)"/><ellipse cx="176" cy="300" rx="16" ry="8" transform="rotate(25 176 300)"/>
<ellipse cx="196" cy="262" rx="15" ry="7.5" transform="rotate(-35 196 262)"/><ellipse cx="232" cy="238" rx="15" ry="7.5" transform="rotate(28 232 238)"/>
<ellipse cx="250" cy="198" rx="14" ry="7" transform="rotate(-30 250 198)"/><ellipse cx="282" cy="172" rx="14" ry="7" transform="rotate(30 282 172)"/>
<ellipse cx="294" cy="132" rx="12" ry="6" transform="rotate(-18 294 132)"/></g><circle cx="305" cy="105" r="4" fill="#A9BC98"/></svg>`;

// ───────── real data
export const LANGS = ['No preference', 'English', 'Gujarati', 'Hindi', 'Kannada', 'Malayalam', 'Punjabi', 'Tamil'];
// counts are the real ones for Hindi speakers (data/therapists.js)
export const CONCERNS = [
  ['anxiety', 'Anxiety & overthinking', 'Racing thoughts, worry loops, restlessness', 4],
  ['stress', 'Stress & burnout', 'Work, studies, or just running on empty', 4],
  ['relationships', 'Relationships', 'Partners, family, friendships, patterns', 5],
  ['self-esteem', 'Self-worth & identity', 'Self-doubt, image, not feeling enough', 4],
  ['trauma', 'Grief & difficult experiences', 'Loss, or something from the past', 3],
  ['unsure', "I'm not sure yet", "That's completely fine — we'll figure it out", null],
];
// the first matching card: real tags, no name
const CARD = { cred: 'MSc Psychology', langs: ['English', 'Hindi', 'Punjabi'], tags: ['Stress management', 'Relationship dynamics'], more: 2 };
const CARD2 = { cred: 'M.Sc (Clinical Psychology)', langs: ['English', 'Tamil', 'Malayalam', 'Hindi', 'Kannada'], tags: ['CBT, REBT & ACT', 'Trauma-informed psychotherapy'], more: 2 };
// slot picker days (Wed 11 Nov 2026 is "today"); Fri 13 has afternoon + evening openings
export const DAYS = [['Thu', '12', 'Nov'], ['Fri', '13', 'Nov'], ['Sat', '14', 'Nov'], ['Sun', '15', 'Nov', 'off'], ['Mon', '16', 'Nov'], ['Tue', '17', 'Nov']];
export const SLOTS = { Afternoon: ['2:00 PM', '4:00 PM', '5:00 PM'], Evening: ['6:00 PM', '7:00 PM'] };

const sl = (k, x = 40) => { const e = eo(k); return `opacity:${e};transform:translateX(${(1 - e) * x}px)`; };
const rise = (k, y = 24) => { const e = eo(k); return `opacity:${e};transform:translateY(${(1 - e) * y}px)`; };

// ───────── chrome
const statusBar = (light, time = '11:48') => `<div class="status ${light ? 'lt' : ''}"><span>${time}</span><span class="ic">
  <svg width="17" height="11" viewBox="0 0 17 11"><g fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></g></svg>
  <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.2c2.2 0 4.1.8 5.6 2.2l1.2-1.2A9.6 9.6 0 0 0 7.5.5 9.6 9.6 0 0 0 .7 3.2l1.2 1.2a7.9 7.9 0 0 1 5.6-2.2zm0 3.4c1.2 0 2.3.5 3.2 1.2l1.2-1.2a6.3 6.3 0 0 0-8.8 0l1.2 1.2c.9-.8 2-1.2 3.2-1.2zm0 3.3c.4 0 .8.2 1.1.4L7.5 10.5 6.4 9.3c.3-.3.7-.4 1.1-.4z" fill="currentColor"/></svg>
  <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="15" height="8" rx="2" fill="currentColor"/><rect x="22.6" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".5"/></svg></span></div>`;
const urlBar = path => `<div class="urlbar"><div class="f">${I.lock(13, '#56763F')}<span><b>eunoia.care</b>${path}</span></div><div class="tb">2</div>${I.menu(20, '#3A4541')}</div>`;
const nav = () => `<div class="nav"><span class="lg">Eunoia<sup>™</sup></span><span class="mn">${I.menu(20, '#10231B')}</span></div>`;

// ───────── lock screen: the notification pile (opening) and one calm notification (ending)
export const NOTES = [
  ['#3B6FD9', 'chat', 'Work chat', 'now', '23 new messages in #launch-war-room'],
  ['#E0533D', 'cal', 'Calendar', 'now', 'Review moved to 9:00 AM tomorrow'],
  ['#2E9D5B', 'chat', 'Family group', 'now', '48 new messages'],
  ['#D9A21B', 'bell', 'Reminder', 'now', 'Rent due in 2 days'],
  ['#3B6FD9', 'mail', 'Mail', 'now', 'RE: RE: Urgent — deck by EOD?'],
  ['#E0533D', 'phone', 'Phone', 'now', '3 missed calls'],
  ['#7A5AD8', 'chat', 'Team', 'now', 'Can you hop on a quick call?'],
  ['#3B6FD9', 'mail', 'Mail', 'now', 'Your password expires in 1 day'],
  ['#D9A21B', 'bell', 'Reminder', 'now', 'Reply to Riya about Saturday'],
];
const icon = (k, s, c) => (I[k] || I.bell)(s, c);
export function lock(L) {
  let h = `<div class="lock ${L.calm ? 'calm' : ''}"><div class="dt">${L.calm ? 'Wednesday, 11 November' : 'Tuesday, 10 November'}</div><div class="clk">${L.calm ? '12:04' : '11:48'}</div>`;
  for (const n of L.cards || []) {
    const [col, ic, app, when, msg] = n.d;
    h += `<div class="ntf" data-a="${n.key || ''}" style="top:${n.y}px;transform:translate(${n.x || 0}px,0) rotate(${n.rot || 0}deg) scale(${n.sc || 1});opacity:${n.op ?? 1};z-index:${n.z || 1}">
      <div class="ap" style="background:${col}">${icon(ic, 20, '#fff')}</div><div class="tx"><div class="a">${app}<span>${when}</span></div><div class="m">${msg}</div></div></div>`;
  }
  if (L.single) {   // the one quiet notification at the end: Eunoia's own session update, logo as its icon
    const k = L.single;
    h += `<div class="ntf solid" data-a="note1" style="top:${300 + (1 - eo(k)) * -40}px;opacity:${L.noteOp ?? clamp(k * 2)}">
      <img src="assets/logo.png" class="ap" data-a="noteicon" style="width:38px;height:38px;border-radius:10px;opacity:${L.iconHide ? 0 : 1}"><div class="tx"><div class="a">Eunoia<span style="opacity:.55">now</span></div>
      <div class="m" style="opacity:.8">You're booked · Fri, 13 Nov, 6:00 PM</div></div></div>`;
  }
  return h + '</div>';
}

// ───────── Find a therapist (FindTherapist.jsx), mobile
function q1(S) {
  return `<h2 class="h2" data-a="q1">Which language would you be most comfortable in?</h2>
  <div class="chips" style="margin-top:32px" data-a="chips">${LANGS.map(l => `<span class="chip ${S.press === l ? 'press' : S.lang === l ? 'sel' : ''}" data-a="chip-${l}">${l}</span>`).join('')}</div>
  <div class="lnk" style="margin-top:24px;padding:8px 0">Not sure? Browse all therapists instead</div>`;
}
function q2(S) {
  return `<h2 class="h2" data-a="q2">What would you like support with?</h2>
  <p class="small" style="margin-top:12px">Showing what our Hindi-speaking therapists support.</p>
  <div style="margin-top:32px;display:grid;gap:16px">${CONCERNS.map(([id, label, hint, n]) => `<div class="ccard ${S.press === id ? 'press' : ''}" data-a="card-${id}">
    <p class="t">${label}</p><p class="h">${hint}</p>${n != null ? `<p class="n">${n} therapists</p>` : ''}</div>`).join('')}</div>`;
}
function tcard(c, key, press) {
  return `<article class="tcard" data-a="${key}"><div class="ph">${BRANCH(200, 200)}</div><div class="bd" data-a="${key}-bd">
    <p class="cr">${c.cred}</p><p class="lg">${I.lang(14, '#56763F')}${c.langs.join(' · ')}</p>
    <ul class="tags">${c.tags.map(t => `<li>${t}</li>`).join('')}<li class="more">+${c.more} more</li></ul>
    <div class="btn2"><span class="v">View profile</span><span class="b ${press ? 'press' : ''}" data-a="${key}-book">Book ${I.right(14, '#fff')}</span></div></div></article>`;
}
function results(S) {
  return `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px"><h2 class="h2" data-a="res">Therapists who fit what you told us.</h2>
    <span class="lnk" style="padding:8px 0">Start over</span></div>
  <div style="margin-top:20px;display:flex;flex-wrap:wrap;align-items:center;gap:8px"><span style="font-size:12px;font-weight:600;color:var(--mfg)">4 matches for</span>
    <span class="fchip">Stress &amp; burnout ${I.x(14, '#5F6A5C')}</span><span class="fchip">Hindi ${I.x(14, '#5F6A5C')}</span>
    <span style="padding:8px;font-size:12px;font-weight:700;color:var(--accent)">Clear filters</span></div>
  <p class="small" style="margin-top:12px">Take your time. Read their profiles, notice who you feel drawn to — that instinct matters more than any resume.</p>
  <p style="margin-top:8px;font-size:14px;font-weight:600;line-height:20px;color:hsl(155 37% 10% / .8)">Your first session is ₹99 with any therapist.</p>
  <div style="margin-top:40px;display:grid;gap:24px">
    <div style="${rise(S.card1 ?? 1, 32)}">${tcard(CARD, 'tc1', S.press === 'book')}</div>
    <div style="${rise(S.card2 ?? 1, 32)}">${tcard(CARD2, 'tc2')}</div></div>`;
}
export function find(S) {
  let step = '';
  // AnimatePresence mode="wait": the old step exits (x → -40, fade), then the new one enters (x 40 → 0)
  const body = s => s === 0 ? q1(S) : s === 1 ? q2(S) : results(S);
  if (S.out != null && S.out < 1) step = `<div style="opacity:${1 - eo(S.out)};transform:translateX(${-40 * eo(S.out)}px)">${body(S.step - 1)}</div>`;
  else step = `<div style="${sl(S.in ?? 1)}">${body(S.step)}</div>`;
  const showStep = S.step < 2 || (S.out != null && S.out < 1);
  const stepNo = S.out != null && S.out < 1 ? S.step - 1 : S.step;
  return `<div class="pc" style="padding-top:130px;padding-bottom:120px">
    <p class="eyeline"><i></i> Therapist matching</p>
    <h1 class="h1f" style="margin-top:24px" data-a="h1find">Let's find someone who feels right for you.</h1>
    <p class="lead" style="margin-top:24px">Two gentle questions — your language, then what's on your mind. No sign-up, no commitment — just a quieter way to see who you might feel comfortable talking to.</p>
    <div style="margin-top:56px">
      ${showStep ? `<div class="prog" style="margin-bottom:40px"><i class="on"></i><i class="${stepNo >= 1 ? 'on' : ''}"></i><span>Step ${stepNo + 1} of 2</span></div>` : ''}
      ${step}</div></div>`;
}

// ───────── Booking (Booking.jsx + SlotPicker.jsx), mobile
function picker(S) {
  const days = DAYS.map(([w, d, m, off]) => `<div class="day ${S.day === d ? 'on' : off ? 'off' : ''}" data-a="day-${d}"><span class="w">${w}</span><span class="d">${d}</span><span class="mo">${m}</span></div>`).join('');
  const parts = Object.entries(SLOTS).map(([lbl, ts]) => `<div><p class="eb">${lbl}</p><div class="slots">${ts.map(t => `<span class="slot ${S.slot === t ? 'on' : ''}" data-a="slot-${t.replace(/\W/g, '')}">${t}</span>`).join('')}</div></div>`).join('<div style="height:20px"></div>');
  return `<div class="tile" data-a="picker"><div class="thd"><p class="eb">Choose a time · IST</p><p class="m">₹99</p></div>
    <div style="padding:20px"><div class="days" data-a="days">${days}</div><div style="height:24px"></div>${S.day ? parts : ''}</div></div>`;
}
const cbar = S => `<div class="tile cbar" data-a="cbar" style="margin-top:20px"><div class="tx" style="opacity:${S.slot ? 1 : .6}">
  <p class="eb">${S.slot ? 'Your time' : 'No time picked yet'}</p><p class="tm">${S.slot ? `Fri, 13 Nov · ${S.slot}` : 'Choose a day and time above'}</p></div>
  <span class="pbtn ${S.slot ? '' : 'dis'} ${S.press === 'continue' ? 'press' : ''}" data-a="continue">Continue ${I.right(16, '#fff')}</span></div>`;
const summary = () => `<div class="tile" data-a="summary"><div style="display:flex;align-items:center;gap:16px;padding:20px">
  <span class="avatar">${BRANCH(44, 44)}</span><p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--mfg)">MSc Psychology</p></div>
  <div class="price"><p class="eb ac">Your first session</p><p class="p">₹99<span> · first session</span></p></div>
  <p class="lockln">${I.lock(14, '#56763F')} Confidential video session · secure payment</p></div>`;
function checkout(S) {
  return `<div class="tile ctime" data-a="ctime"><span class="ck">${I.check(16, '#56763F')}</span><div style="flex:1;min-width:0"><p class="eb">Your time</p>
    <p class="tm" style="font-size:14px;font-weight:700">Fri, 13 Nov · 6:00 PM</p></div><span class="ch">${I.pencil(14)} Change</span></div>
  <div class="tile" data-a="checkout" style="margin-top:20px"><div class="thd"><p class="eb">Your details</p><p class="m">${I.lock(12, '#56763F')} Secure checkout</p></div>
    <div class="drow"><span>Name</span><b>Ananya</b></div><div class="drow"><span>Mobile</span><b>${PHONE}</b></div>
    <div class="price" data-a="price" style="border-top:0"><p class="eb ac">Your first session</p><p class="p">₹99<span> · first session</span></p></div>
    <div class="paybtn ${S.press === 'pay' ? 'press' : ''}" data-a="pay">${I.lock(16, '#fff')} Pay securely</div></div>`;
}
export function booking(S) {
  const r = k => rise(S.vis ?? 1, 24);
  return `<div class="pc" style="padding-top:106px;padding-bottom:200px">
    <span class="lnk" style="display:inline-flex;align-items:center;gap:8px">${I.left(16)} Back</span>
    <div style="${r()}"><p class="eb ac" style="margin-top:32px">Book a session</p>
      <h1 class="h1b" style="margin-top:12px" data-a="h1book">A time that works for you.</h1></div>
    <div style="margin-top:32px;${r()}">${summary()}</div>
    <div style="margin-top:20px;${r()}" data-a="pickzone">${S.stage === 'details' ? checkout(S) : picker(S) + cbar(S)}</div></div>`;
}

// ───────── login dialog (LoginDialog.jsx + OtpLogin.jsx CodeStep)
export function dialog(D) {
  const k = eo(clamp(D.k)), digits = '482916'.slice(0, D.n);
  const boxes = [0, 1, 2, 3, 4, 5].map(i => `<i data-a="otp${i}" class="${i === D.n && !D.busy ? 'act' : ''}">${digits[i] || (i === D.n && !D.busy ? '<span class="cr"></span>' : '')}</i>`).join('');
  return `<div class="ovl" style="opacity:${k}"></div>
  <div class="dlg" data-a="dlg" style="top:250px;opacity:${k};transform:scale(${.95 + .05 * k})"><span class="x">${I.x(16)}</span>
    <h2 class="tt">Log in or get started</h2><p class="ds">One number, one account. Returning? You'll see all your sessions right where you left them.</p>
    <p class="small" style="margin-top:20px">Enter the 6-digit code sent to <b style="color:var(--fg)">${PHONE}</b></p>
    <div class="otp" data-a="otp">${boxes}</div>
    ${D.busy ? `<p class="small" style="margin-top:16px;text-align:center">Verifying…</p>` : `<div class="orow"><span style="color:var(--mfg)">Change number</span><span style="color:var(--mfg)">Resend in 24s</span></div>`}</div>`;
}
export const toast = k => `<div class="toast" style="opacity:${clamp(k * 3)};transform:translateY(${(1 - eo(clamp(k * 2))) * 20}px)">${I.check(16, '#008A2E', 2.5)} Welcome to Eunoia</div>`;

// ───────── You're booked (BookingStatus.jsx, fresh)
export function status(S) {
  const a = S.a ?? 1, m = clamp(a / 1.6), dk = clamp((a - .35) / .6);   // SuccessMark: ring pulse 1.6 s, check path draws after .35 s
  const ring = m < .5 ? .6 + (1.35 - .6) * eo(m * 2) : 1.35 - .15 * eo((m - .5) * 2), ro = m < .5 ? .8 * eo(m * 2) : .8 * (1 - eo((m - .5) * 2));
  const d1 = clamp(a / .6), b1 = rise(clamp(a / .8), 28), b2 = rise(clamp((a - .12) / .8), 28), b3 = rise(clamp((a - .22) / .8), 28);
  return `<div class="pc" style="padding-top:130px;padding-bottom:160px"><div style="${b1}">
    <div class="ok" data-a="okmark"><span class="rg" style="transform:scale(${ring});opacity:${ro}"></span>
      <span class="dot" style="transform:scale(${.5 + .5 * eo(d1)});opacity:${eo(d1)}"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke-dasharray="22" stroke-dashoffset="${22 * (1 - eo(dk))}"/></svg></span></div>
    <h1 class="h1s" style="margin-top:24px"><span data-a="booked">You're booked.</span></h1>
    <p class="lead" style="margin-top:16px">That first step is the hardest one, and you've taken it.</p></div>
  <div class="tile ticket" style="${b2}"><div class="thead"><div class="leaf"><span class="mo">Nov</span><span class="d">13</span><span class="w">Fri</span></div>
      <div style="flex:1;min-width:0"><p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.6)">In 2 days</p>
      <p style="margin-top:4px;font-family:Caslon;font-size:24px;font-weight:700;letter-spacing:-.025em">Your first session</p></div></div>
    <div style="padding:24px"><dl>
      <div class="srow"><dt>Status</dt><dd><span class="badge"><i></i>Confirmed</span></dd></div>
      <div class="srow"><dt>Date</dt><dd>Fri, 13 Nov 2026</dd></div>
      <div class="srow"><dt>Time (IST)</dt><dd>6:00 PM</dd></div>
      <div class="srow"><dt>Amount paid</dt><dd>₹99<span style="font-weight:400;color:var(--mfg)"> · first-session offer</span></dd></div>
      <div class="srow"><dt>Reference</dt><dd style="font-family:monospace;font-size:12px;letter-spacing:.1em">A1C9E27F</dd></div></dl></div></div>
  <ul style="list-style:none;margin-top:24px;display:grid;gap:16px;${b3}">
    <li class="nstep">${I.mail(16, '#56763F')}<p style="margin-top:12px;font-size:14px;font-weight:700">Check your email</p><p style="margin-top:4px;font-size:12px;line-height:1.6;color:var(--mfg)">Your confirmation and the video link are on their way.</p></li></ul></div>`;
}

// ───────── end card (inside the phone)
export function endCard(E) {
  const k = eo(clamp(E.k)), t1 = eo(clamp(E.t1)), t2 = eo(clamp(E.t2));
  return lock({ calm: true, single: 1, iconHide: true, noteOp: 1 - clamp(E.bg * 1.6) }) + `<div class="endc" style="opacity:${E.bg}"></div>
  <div class="ecw" style="position:absolute;left:0;right:0;top:${E.logoY}px;display:flex;flex-direction:column;align-items:center">
    <img src="assets/logo.png" data-a="endlogo" style="width:${E.logoS}px;height:${E.logoS}px;border-radius:${E.logoS * .22}px;transform:translateX(${E.logoX}px);box-shadow:0 18px 40px -18px rgba(12,59,46,${.5 * E.bg})">
    <div class="wm" style="margin-top:22px;opacity:${k};transform:translateY(${(1 - k) * 14}px)">Eunoia<sup>™</sup></div>
    <div class="tg" style="opacity:${t1};transform:translateY(${(1 - t1) * 12}px)">Find your way back to yourself.</div>
    <div class="url" style="opacity:${t2}">eunoia.care</div></div>`;
}

// ───────── one screen
export function screen(S) {
  let h = '';
  if (S.kind === 'lock') return statusBar(true, S.lock.calm ? '12:04' : '11:48') + `<div class="cam"></div>` + lock(S.lock) + `<div class="homebar"></div>`;
  if (S.kind === 'end') return endCard(S.end) + statusBar(S.end.bg < .5, '12:04') + `<div class="cam"></div>` + `<div class="homebar ${S.end.bg < .5 ? '' : 'dk'}"></div>`;
  const page = S.kind === 'find' ? find(S.find) : S.kind === 'booking' ? booking(S.booking) : status(S.status);
  const path = S.kind === 'find' ? '/find' : S.kind === 'booking' ? '/book' : '/booking';
  h += statusBar(false) + `<div class="cam"></div>` + urlBar(path);
  h += `<div class="vp"><div class="page" id="page" style="transform:translateY(${-(S.scroll || 0)}px)">${page}</div>${nav()}</div>`;
  if (S.dialog) h += dialog(S.dialog);
  if (S.toast) h += toast(S.toast);
  if (S.lockOver) h += `<div style="position:absolute;inset:0;z-index:60;transform:translateY(${S.lockOver.y}px)">${statusBar(true)}${lock(S.lockOver.lock)}<div class="homebar"></div></div>`;
  return h + `<div class="homebar dk"></div>`;
}
