"""Score + foley + the client's narration → out/mix.wav. Every cue is read from events.json (the picture's own timeline).
Two resolutions: Salamander grand piano (the world) and a band-limited square/pulse voice (the sprout).
A noise (0–3.4): phone buzzes, notification pings, a rising detuned square drone; cut on the swipe → near-silence.
B–D: soft piano in D major, square-wave answers on each tap and hop, tempo rising 82 → 90 bpm.
E: square arpeggio, one note per code digit (96 bpm). F: room tone, then a held pad; one piano note on "ninety-nine".
G: warm piano at 76 bpm, the square arpeggio joins as the leaf grows. H: D major resolve, piano + square in unison, ring out.
Usage: LIB=<library> python sound.py   (STEMS=1 also writes out/{music,fx,vo}.wav)"""
import json, os, sys
import numpy as np, soundfile as sf, soxr

LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click as sclick, brown
from core.audio import sampler as S

HERE = os.path.dirname(os.path.abspath(__file__))
EVJ = json.load(open(os.path.join(HERE, 'events.json'), encoding='utf-8')); E = EVJ['ev']; DUR = EVJ['dur']
rng = np.random.default_rng(11); S.seed(11)
NS = int((DUR + 1.0) * SR)
def tt(d): return np.arange(int(round(d * SR))) / SR
def db(x): return 10 ** (x / 20)
def first(tp): return next(e['t'] for e in E if e['type'] == tp)
def all_(tp): return [e for e in E if e['type'] == tp]
hz = S.hz

# ───────── pixel voice: band-limited pulse
def pulse(f, d, duty=.25, vol=1., att=.004, rel=.06, slide=None, vib=0.):
    t = tt(d); fr = np.full(len(t), float(f)) if slide is None else f * (slide ** (t / d))
    if vib: fr = fr * (1 + vib * np.sin(2 * np.pi * 5.5 * t))
    ph = np.cumsum(fr) / SR; x = np.zeros(len(t))
    for k in range(1, 20):
        m = fr * k < 15000
        x += m * (np.sin(np.pi * k * duty) / k) * np.cos(2 * np.pi * k * (ph - duty / 2))
    e = np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1)
    return (x * e * vol * .5).astype(np.float32)
def nz(d, lo, hi, vol=1., tau=None):
    x = bp(rng.standard_normal(int(round(d * SR))), lo, hi) * vol
    if tau: x *= np.exp(-tt(d)[:len(x)] / tau)
    return x.astype(np.float32)
def bell(f, d=.6, v=.3, tau=.22):      # notification ping: inharmonic sine partials
    t = tt(d); x = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / (tau * .4)) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / (tau * .2))
    return (x * np.exp(-t / tau) * np.minimum(1, t / .003) * v).astype(np.float32)
def buzz(v=.5):                         # vibration motor: two short pulses
    d = .5; t = tt(d); x = np.sign(np.sin(2 * np.pi * 168 * t)) * .6 + np.sin(2 * np.pi * 336 * t) * .3
    g = ((t < .18) | ((t > .26) & (t < .44))).astype(float)
    g = np.convolve(g, np.ones(240) / 240, 'same')
    return (lp(x * g, 900) * v).astype(np.float32)
def swish(d=.35, v=.5, lo=400, hi=4000):
    x = rng.standard_normal(int(round(d * SR))); t = tt(d)[:len(x)]; e = np.sin(np.pi * t / d) ** 2
    return (bp(x, lo, hi) * e * v).astype(np.float32)
def pad(notes, d, v=.18, att=.8, rel=1.2):
    t = tt(d); x = np.zeros(len(t))
    for n in notes:
        f = hz(n)
        for det in (-.004, .004):
            for k in range(1, 7): x += np.sin(2 * np.pi * f * (1 + det) * k * t + k) / k ** 1.6
    e = np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1)
    return (lp(x, 1400) * e * v / len(notes)).astype(np.float32)

music = np.zeros((NS, 2), np.float32); chip = np.zeros((NS, 2), np.float32); fx = np.zeros((NS, 2), np.float32)
fxa = np.zeros((NS, 2), np.float32)    # the opening's noise bus (buzzes, pings, swipe), balanced on its own
EVN = []
def P(t, p, d, v, pan=-.1): EVN.append((t, 'piano', p, d, v, pan))
def Pch(t, ps, d, v, pan=-.1, strum=.025):
    for j, p in enumerate(ps): P(t + j * strum, p, d, v * (1 - .08 * j), pan)
def SQ(t, p, d, v=.2, pan=.15, duty=.25): add(chip, pulse(hz(p), d, duty, v), t, 1, pan)

# ═ A. noise (0–3.4)
T_SWIPE = first('swipe')
pings = ['E6', 'B5', 'F6', 'C#6', 'G5', 'A#5', 'F#6', 'D#6', 'C6']
for e in all_('buzz'):
    if e.get('soft'): continue
    i = e['i']; add(fxa, buzz(.35 + .04 * i), e['t'], 1, (i % 3 - 1) * .3)
    add(fxa, bell(hz(pings[i]), .7, .16 + .015 * i), e['t'] + .03, 1, ((i * 5) % 7 / 3 - 1) * .5)
d = T_SWIPE + .05; t = tt(d)
drone = sum(pulse(hz(n) * (1 + dt), d, .4, 1.) for n, dt in (('D3', 0), ('D#3', .003), ('A2', -.002)))
cut = 250 + 2600 * (t / d) ** 2
drone = lp(drone, 1800) * (t / d) ** 2.2 * .16
add(music, drone.astype(np.float32), 0, 1, 0)
add(fxa, swish(.45, .4, 600, 6500), T_SWIPE - .05, 1, 0)      # swipe up

# ═ B. questions (3.4–10.0): 81.8 bpm, two beats per chord, soft broken chords
B1 = 60 / 81.8; t0 = 3.42
prog = [('D2', ['A3', 'D4', 'F#4', 'E5']), ('B1', ['F#3', 'B3', 'D4', 'A4']), ('G1', ['D3', 'G3', 'B3', 'F#4']), ('A1', ['E3', 'A3', 'C#4', 'D4'])]
for k in range(5):
    tc = t0 + k * 2 * B1; root, ch = prog[k % 4] if k < 4 else ('D2', ['A3', 'D4', 'F#4', 'A4'])
    P(tc, root, 2.4, .42); P(tc, S.name(S.midi(root) + 12), 2.2, .3)
    for j, p in enumerate([ch[0], ch[1], ch[2], ch[3], ch[2], ch[1]][:4 if k == 4 else 6]):
        if tc + j * B1 / 2 < 10.0: P(tc + j * B1 / 2 + .01, p, 1.4, .26 + (.06 if j == 0 else 0), -.15)
P(t0, 'F#5', 2.6, .3, -.05)                                     # the first chord after the silence carries a top note

# ═ C. the match (10.0–12.0): 90 bpm, piano phrase, square answer
B2 = 60 / 90
Pch(10.0, ['G2', 'D3', 'B3', 'F#4'], 2.0, .4)
for j, p in enumerate(['A5', 'F#5', 'D5']): P(10.0 + j * B2 / 2, p, .8, .34, .05)
for j, p in enumerate(['A5', 'B5', 'D6']): SQ(10.67 + j * B2 / 2, p, B2 / 2 * .8, .17, .25)
Pch(11.33, ['A2', 'E3', 'C#4', 'E4'], 1.2, .32)

# ═ D. pick a time (12.0–16.0): 90 bpm, left hand moves in eighths
for k, (root, ch) in enumerate([('G2', ['B3', 'D4', 'F#4']), ('A2', ['C#4', 'E4', 'A4']), ('B2', ['D4', 'F#4', 'A4']), ('G2', ['B3', 'D4', 'E4'])]):
    tc = 12.0 + k * 2 * B2
    P(tc, root, 1.4, .4)
    for j in range(4):
        if tc + j * B2 / 2 < 15.95: P(tc + j * B2 / 2, [S.name(S.midi(root) + 7), S.name(S.midi(root) + 12), ch[0], S.name(S.midi(root) + 12)][j], .5, .24, -.2)
    Pch(tc + .01, ch, 1.3, .25, 0, .015)
P(15.33, 'A2', 1.0, .3); Pch(15.34, ['C#4', 'E4', 'A4'], .9, .22)

# ═ E. the code (16.0–18.3): square arpeggio, one note per digit; piano holds
Pch(16.0, ['B1', 'F#3', 'B3', 'D4'], 2.2, .26)
for e, p in zip(sorted(all_('key'), key=lambda e: e['i']), ['D5', 'F#5', 'A5', 'B5', 'D6', 'F#6']):
    SQ(e['t'], p, .14, .19, .2 if e['i'] % 2 else .05, .125)
    add(fx, nz(.04, 2500, 7000, .25, .006), e['t'], 1, 0)       # soft key tick

# ═ F. the promise (18.3–22.2): near-silence, then a held pad; one piano note on "ninety-nine"
T99, TPAY = first('piano1'), 21.95
add(music, pad(['D3', 'A3', 'F#4'], 3.6, .12, 1.2, 1.0), 18.75, 1, 0)
P(T99 - .02, 'D5', 2.0, .36, 0); P(T99, 'A4', 2.0, .24, 0)

# ═ G. booked (22.2–27.3): 76 bpm, warm, then the arpeggio joins on the leaf
B3 = 60 / 76; T_OK = first('success'); T_GROW = first('grow')
for k, (root, ch) in enumerate([('G1', ['D3', 'B3', 'D4', 'F#4', 'A4']), ('F#2', ['D3', 'A3', 'D4', 'F#4']), ('E2', ['D3', 'G3', 'B3', 'E4']), ('A1', ['E3', 'A3', 'C#4', 'E4'])]):
    tc = T_OK + k * 2 * B3
    P(tc, root, 2.0, .44); P(tc, S.name(S.midi(root) + 12), 1.8, .28)
    Pch(tc + .03, ch, 1.9, .27, -.1, .05)
    P(tc + B3, ch[-1], .9, .2, .1); P(tc + B3 * 1.5, ch[-2], .9, .17, .1)
for j, p in enumerate(['A5', 'C#6', 'E6', 'A6', 'E6', 'C#6', 'E6', 'A6']): SQ(T_GROW + .1 + j * B3 / 4, p, B3 / 4 * .8, .14, .3)

# ═ H. the end (27.3–32): resolve on "Eunoia", unison motif on "yourself", ring out
T_EU = first('resolve'); T_REST = first('rest')
P(T_EU, 'D1', 4.4, .4, 0); P(T_EU, 'D2', 4.4, .4, 0)
Pch(T_EU + .02, ['A2', 'F#3', 'A3', 'C#4', 'E4', 'A4'], 4.4, .3, -.05, .045)
for j, (p, dd) in enumerate([('F#5', .4), ('E5', .4), ('A5', 1.4)]):
    tm = T_REST - .35 + j * .42; P(tm, p, dd + .8, .3, .0); SQ(tm, p, dd * .9, .12, .2)
Pch(T_REST + .9, ['D3', 'A3', 'D4', 'F#4'], 2.4, .22, 0, .06)

music += S.render(EVN, dur=DUR + 1.0)[:NS]
music = S.room(music + chip, size=.42, mix=.16)

# ═ foley from the picture's events
def tap(v=.5): return (sclick(1.6, v * .8) * .6).astype(np.float32)
NOTE = {0: 'A5', 1: 'B5', 2: 'D6', 3: 'F#5', 4: 'A5', 5: 'A5'}
for e in E:
    t0, tp = e['t'], e['type']
    if tp == 'tap': add(fx, tap(e.get('v', .5)), t0, .55, .1)
    elif tp == 'swish': add(fx, swish(.42, .22 * e.get('v', .5) * 2, 300, 3000), t0, 1, -.1)
    elif tp == 'whoosh': add(fx, swish(.55, .32, 400, 5500), t0 - .05, 1, 0)
    elif tp == 'jump': dd = min(.12, e.get('d', .3) * .35); add(fx, pulse(300, dd, .25, .1 * e.get('v', .6) / .6, slide=2.2), t0, 1, .1)
    elif tp == 'land': add(fx, pulse(120, .05, .5, .14 * e.get('v', .6)), t0, 1, 0); add(fx, nz(.04, 300, 2500, .12 * e.get('v', .6), .012), t0, 1, 0)
    elif tp == 'step': add(fx, nz(.02, 1500, 6000, .05, .005), t0, 1, .1)
    elif tp == 'note': SQ(t0, NOTE[e['n']], .16, .17, .2)
    elif tp == 'chip': SQ(t0, NOTE[e['n']], .2, .15, .2)
    elif tp == 'peek': SQ(t0, 'E5', .1, .08, .3, .125); SQ(t0 + .1, 'D5', .14, .07, .3, .125)
    elif tp == 'shudder': add(fxa, buzz(.4), t0, 1, 0)
    elif tp == 'chime': add(fx, bell(hz('A5'), .6, .14, .2), t0, 1, .1); add(fx, bell(hz('D6'), .7, .12, .25), t0 + .09, 1, .1)
    elif tp == 'success':
        for j, p in enumerate(['D6', 'F#6', 'A6']): add(fx, bell(hz(p), .9, .12, .35), t0 + .08 + j * .07, 1, .05)
    elif tp == 'grow':
        for j in range(8): add(fx, pulse(rng.uniform(1500, 3200), .03, .125, .2), t0 + .45 + j * .05, 1, (j % 2 - .5))
    elif tp == 'wipe':
        add(fx, swish(.7, .28, 500, 6000), t0, 1, 0)
        for j in range(14): add(fx, pulse(400 * 2 ** (j / 8), .03, .25, .05), t0 + j * .035, 1, (j % 2 - .5) * .6)
    elif tp == 'buzz' and e.get('soft'): add(fx, buzz(.18), t0, 1, 0); add(fx, bell(hz('D6'), .8, .1, .3), t0 + .03, 1, 0)
    elif tp == 'rest': SQ(t0 + .9, 'D6', .25, .08, .2); SQ(t0 + 1.2, 'A5', .5, .07, .2)

# room tone (brown noise, a little louder at night), never fully silent
tn = np.arange(NS) / SR
room = lp(brown(NS / SR), 700)[:NS]; room = room / (np.abs(room).max() + 1e-9)
rg = np.where(tn < 3.4, db(-44), db(-50)); room = np.stack([room * rg, room * rg], 1).astype(np.float32)   # added after balancing

# ═ voice: the client's own recording, gently compressed
y, sr = sf.read(os.path.join(HERE, '..', 'voiceover', 'narration.wav'), dtype='float32')
if y.ndim > 1: y = y.mean(1)
y = soxr.resample(y, sr, SR).astype(np.float32)
y = hp(y, 80).astype(np.float32); y = compress(y, .22, 2.6)
vo = np.zeros((NS, 2), np.float32); add(vo, y, 0, 1, 0)

# balance: music about 6 dB under the voice where there is no speech, then ducked a further ~6 dB under speech
env = np.abs(vo[:, 0]); k = int(.15 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); env = np.clip(env / (env.max() * .2), 0, 1)
k2 = int(.25 * SR); env = np.convolve(env, np.ones(k2) / k2, 'same')
speech = env > .3
def rms(x, m): return np.sqrt(np.mean(x[m] ** 2)) + 1e-9
vr = rms(vo[:, 0], speech)
mus_on = (np.abs(music[:, 0]) > 1e-4) & ~speech
music *= vr * db(-6) / rms(music[:, 0], mus_on)
music *= (1 - .5 * env)[:, None]
a0, a1 = int(.3 * SR), int(3.1 * SR)
fxa *= vr * db(-8.5) / (np.sqrt(np.mean(fxa[a0:a1, 0] ** 2)) + 1e-9)          # the noise sits ~8 dB under the voice
fx *= np.abs(vo).max() * db(-7) / (np.abs(fx).max() + 1e-9)                    # foley peaks ~7 dB under the voice's peaks
fx = fx + fxa + room * vr / db(-17)
# silence before the promise: music out 18.15–18.7 (room tone stays)
gate = 1 - np.clip((tn - 18.05) / .15, 0, 1) * (1 - np.clip((tn - 18.6) / .2, 0, 1))
gate *= 1 - np.clip((tn - (T_SWIPE + .08)) / .06, 0, 1) * (1 - np.clip((tn - 3.4) / .03, 0, 1))
music *= gate[:, None]
mix = music + fx + vo
if os.environ.get('STEMS'):
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    for nm, x in (('music', music), ('fx', fx), ('vo', vo)): sf.write(os.path.join(HERE, 'out', nm + '.wav'), x[:int(DUR * SR)], SR)
fade = np.ones(NS); fo = int(1.0 * SR); end = int(DUR * SR); fade[end - fo:end] = np.linspace(1, 0, fo) ** 1.5; fade[end:] = 0
mix = limit(mix * fade[:, None] / (np.abs(mix).max() + 1e-9) * .9, .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)], SR)
print('out/mix.wav', DUR, 's · piano notes', len(EVN))
