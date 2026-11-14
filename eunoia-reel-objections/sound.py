"""Reel 2 score + foley + the client's narration → out/mix.wav, all cued from events.json.
A new composition in F major (no material from reel 1): Salamander piano, a plucked synth bass, light synth drums,
and a square/pulse voice for the sprout. Tempo map 105–109 bpm (see TREATMENT §7); a hit on every card flip and strike.
Usage: LIB=<library> python sound.py   (STEMS=1 also writes out/{music,fx,vo}.wav)"""
import json, os, sys
import numpy as np, soundfile as sf, soxr

LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click as sclick, brown
from core.audio import sampler as S

HERE = os.path.dirname(os.path.abspath(__file__))
EVJ = json.load(open(os.path.join(HERE, 'events.json'), encoding='utf-8')); E = EVJ['ev']; DUR = EVJ['dur']
rng = np.random.default_rng(23); S.seed(23)
NS = int((DUR + 1.0) * SR)
hz = S.hz
def tt(d): return np.arange(int(round(d * SR))) / SR
def db(x): return 10 ** (x / 20)
def all_(tp): return [e for e in E if e['type'] == tp]
def nm(m): return S.name(m)
def up(p, k): return S.name(S.midi(p) + k)

# ───────── synthesis helpers (tools reused; the music is new)
def pulse(f, d, duty=.25, vol=1., att=.004, rel=.05, slide=None):
    t = tt(d); fr = np.full(len(t), float(f)) if slide is None else f * (slide ** (t / d))
    ph = np.cumsum(fr) / SR; x = np.zeros(len(t))
    for k in range(1, 20): x += (fr * k < 15000) * (np.sin(np.pi * k * duty) / k) * np.cos(2 * np.pi * k * (ph - duty / 2))
    return (x * np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1) * vol * .5).astype(np.float32)
def nz(d, lo, hi, vol=1., tau=None):
    x = bp(rng.standard_normal(int(round(d * SR))), lo, hi) * vol
    if tau: x *= np.exp(-tt(d)[:len(x)] / tau)
    return x.astype(np.float32)
def kick(v=1.):
    d = .32; t = tt(d); f = 52 + 110 * np.exp(-t / .035)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .11) * v + nz(d, 1500, 5000, .08 * v, .004)[:len(t)]).astype(np.float32)
def snap(v=.6):
    d = .12; x = nz(d, 1800, 6500, 1., .018) * .7 + nz(d, 700, 1500, .5, .01) * .3
    return (x * v).astype(np.float32)
def shaker(v=.25, d=.07): x = nz(d, 5000, 12000, 1.); t = tt(d)[:len(x)]; return (x * np.sin(np.pi * t / d) ** 1.5 * v).astype(np.float32)
def tom(v=.7, f0=150):
    d = .4; t = tt(d); f = 58 + f0 * np.exp(-t / .06)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .13) * v).astype(np.float32)
def bass(p, d, v=.5):      # plucked synth bass: saw-ish with a closing filter, 2nd/3rd harmonics so it speaks on phones
    t = tt(d); f = hz(p); x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.3 for k in range(1, 9))
    env = np.exp(-t / .28) * np.minimum(1, t / .004) * np.clip((d - t) / .04, 0, 1)
    return (lp(x * env, 1400) * v * .35).astype(np.float32)
def swell(d=.35, v=.3):   # air rising into a flip
    x = rng.standard_normal(int(d * SR)); t = tt(d)[:len(x)]
    return (bp(x, 900, 7000) * (t / d) ** 2.5 * v).astype(np.float32)
def whoosh(d=.32, v=.3, lo=500, hi=5000):
    x = rng.standard_normal(int(d * SR)); t = tt(d)[:len(x)]
    return (bp(x, lo, hi) * np.sin(np.pi * t / d) ** 2 * v).astype(np.float32)
def squeak(v=.3):          # felt-tip marker drawn across a card
    d = .2; t = tt(d); x = rng.standard_normal(len(t)); f = 2600 + 1400 * t / d
    y = np.zeros(len(t)); seg = int(.02 * SR)
    for i in range(0, len(t), seg): y[i:i + seg] = bp(x[i:i + seg + 400], f[i] * .8, f[i] * 1.25)[:len(y[i:i + seg])]
    return (y * np.sin(np.pi * t / d) * v).astype(np.float32)

music = np.zeros((NS, 2), np.float32); drums = np.zeros((NS, 2), np.float32); chip = np.zeros((NS, 2), np.float32); fx = np.zeros((NS, 2), np.float32)
EVN = []
def P(t, p, d, v, pan=-.1): EVN.append((t, 'piano', p, d, v, pan))
def chord(t, ps, d, v, pan=-.05, strum=.012):
    for j, p in enumerate(ps): P(t + j * strum, p, d, v * (1 - .06 * j), pan)
def SQ(t, p, d, v=.16, pan=.2, duty=.25): add(chip, pulse(hz(p), d, duty, v), t, 1, pan)
TEMPO = [(0, 2.2, 2.2 / 4), (2.2, 6.2, 4 / 7), (6.2, 10.2, 4 / 7), (10.2, 14.6, 4.4 / 8), (14.6, 19.1, 4.5 / 8), (19.1, 23.5, .58)]
def beats(sec): a, b, d = TEMPO[sec]; return [a + k * d for k in range(int(round((b - a) / d)))], d

# ═ hook (0–2.2): piano F-major pickup, a questioning chiptune motif that stops on G (unresolved), shaker
bt, d = beats(0)
P(0.0, 'F2', 2.4, .42); P(0.0, 'C3', 2.2, .3)
for j, p in enumerate(['A4', 'C5', 'F5', 'C5', 'A4', 'C5', 'G5', 'C5']): P(j * d / 2 + .01, p, .5, .3 if j % 2 else .36, -.15)
for j, (p, dd) in enumerate([('C6', .5), ('A5', .5), ('C6', .5), ('G5', 1.6)]): SQ(.02 + j * d * .5 + (0 if j < 3 else .0), p, d * .5 * dd * 1.8 if j == 3 else d * .42, .12, .25)
for t in np.arange(0, 2.2, d / 2): add(drums, shaker(.16 if (t / (d / 2)) % 2 else .24), t, 1, .35)

# ═ grooves
def groove(sec, roots, chords, full=True, snaps=True):
    bt, d = beats(sec)
    for k, t in enumerate(bt):
        root, ch = roots[min(k // 2, len(roots) - 1)], chords[min(k // 2, len(chords) - 1)]
        if full and k % 2 == 0: add(drums, kick(.9 if k % 4 == 0 else .75), t, 1, 0)
        if full and snaps and k % 2 == 1: add(drums, snap(.55), t, 1, .12)
        for h in (0, .5): add(drums, shaker(.22 if h == 0 else .15), t + h * d, 1, .35)
        if full: add(music, bass(root, d * .9, .55), t, 1, 0); add(music, bass(up(root, 12), d * .4, .25), t + d * .5, 1, 0)
        else: add(music, bass(root, d * 1.9, .35), t, 1, 0) if k % 2 == 0 else None
        if full: chord(t + d * .5, ch, d * .45, .27, .05, .008)          # off-beat piano stabs
        elif k % 2 == 0: chord(t, ch, d * 2.0, .22, -.05, .03)            # held, intimate
# cost: F – C/E – Dm7 – B♭ (7 beats: 4 + 3)
groove(1, ['F2', 'E2', 'D2', 'A#1'], [['A3', 'C4', 'F4'], ['G3', 'C4', 'E4'], ['A3', 'C4', 'F4'], ['A#3', 'D4', 'F4']])
# language: B♭ – C – Am7 – Dm7
groove(2, ['A#1', 'C2', 'A1', 'D2'], [['A#3', 'D4', 'F4'], ['G3', 'C4', 'E4'], ['G3', 'C4', 'E4'], ['A3', 'C4', 'F4']])
# privacy: drums drop to shaker, held chords Gm7 – C – F/A – B♭
groove(3, ['G1', 'C2', 'A1', 'A#1'], [['F3', 'A#3', 'D4'], ['E3', 'G3', 'C4'], ['F3', 'A3', 'C4'], ['F3', 'A#3', 'D4']], full=False)
# effort: full groove, piano 8ths over F – B♭ – Gm7 – C
groove(4, ['F2', 'A#1', 'G1', 'C2'], [['A3', 'C4', 'F4'], ['A#3', 'D4', 'F4'], ['A#3', 'D4', 'G4'], ['G3', 'C4', 'E4']])
bt4, d4 = beats(4)
for k, t in enumerate(bt4):
    top = [['F5', 'C5'], ['F5', 'D5'], ['G5', 'D5'], ['E5', 'C5']][min(k // 2, 3)]
    P(t, top[0], .3, .2, .15); P(t + d4 / 2, top[1], .3, .16, .15)

# language: the sprout's answer after the tap
TH = all_('strike')[1]['t']
for j, p in enumerate(['F5', 'G5', 'A5', 'C6']): SQ(TH + .3 + j * .14, p, .11, .12, .25)

# ═ hits on the deck: a flip on every entry, a stab + marker on every strike, air on every swipe
for e in all_('flip'):
    add(fx, swell(.3, .22), e['t'] - .3, 1, 0); add(drums, tom(.75, 160), e['t'], 1, -.1); add(drums, snap(.5), e['t'] + .01, 1, .1)
    add(fx, whoosh(.18, .18, 1200, 6000), e['t'], 1, 0)
for e in all_('strike'):
    soft = e['i'] == 3
    chord(e['t'], {1: ['F4', 'A4', 'C5'], 2: ['A#3', 'D4', 'F4'], 3: ['C4', 'F4', 'A4'], 4: ['C4', 'E4', 'G4']}[e['i']], .3, .2 if soft else .44, 0, .004)
    add(fx, squeak(.12 if soft else .3), e['t'], 1, .15)
    SQ(e['t'] + .01, 'F6' if not soft else 'C6', .07, .1 if soft else .14, .2, .125)
for e in all_('swipe'): add(fx, whoosh(.34, .12 if e['i'] in (3, 4) else .26, 400, 4500), e['t'], 1, -.4)   # the privacy and effort swipes run over "one-on" and "booked": kept soft

# effort: ta-da on the strike (F major), the chip arpeggio after the line
TD = all_('tada')[0]['t']
chord(TD, ['F3', 'C4', 'F4', 'A4', 'C5'], .7, .32, 0, .02)
for j, p in enumerate(['F6', 'A6', 'C7', 'F7']): SQ(17.12 + j * .09, p, .08, .1, .3, .125)

# ═ call to action (19.1–23): F(add9) resolve hit, half-time pulse, then a new 4-note tag in unison
TR = all_('resolve')[0]['t']
add(drums, tom(.8, 140), TR, 1, 0); add(drums, kick(.9), TR, 1, 0); add(fx, swell(.3, .22), TR - .3, 1, 0)
P(TR, 'F1', 4.0, .45, 0); P(TR, 'F2', 4.0, .4, 0)
chord(TR + .02, ['C3', 'G3', 'A3', 'C4', 'F4', 'G4'], 3.6, .3, -.05, .04)
for k in range(6): t = TR + .58 * 2 * k + .58; (add(drums, snap(.35), t, 1, .1) if t < 22.3 else None)
for t in np.arange(TR, 22.4, .29): add(drums, shaker(.13), t, 1, .35)
for j, p in enumerate(['C5', 'F5', 'G5', 'A5']):
    tm = 22.42 + j * .13; P(tm, p, .9 if j == 3 else .3, .28, 0); SQ(tm, up(p, 12), .1 if j < 3 else .4, .1, .2)

music += S.render(EVN, dur=DUR + 1.0)[:NS]
music = S.room(music + chip, size=.35, mix=.14) + drums

# ═ foley from the picture
NOTE = {0: 'A5', 1: 'C6', 2: 'C6', 3: 'D6', 4: 'F6'}
for e in E:
    t0, tp = e['t'], e['type']
    if tp == 'tap': add(fx, (sclick(1.6, .8 * e.get('v', .5)) * .6).astype(np.float32), t0, .55, .1)
    elif tp == 'jump': add(fx, pulse(360, min(.1, e.get('d', .3) * .3), .25, .08, slide=2.0), t0, 1, .1)
    elif tp == 'land': add(fx, pulse(140, .045, .5, .12 * e.get('v', .5)), t0, 1, 0); add(fx, nz(.035, 400, 2600, .1 * e.get('v', .5), .01), t0, 1, 0)
    elif tp == 'note': SQ(t0, NOTE[e['n']], .14, .15, .2)

# room tone, added after balancing
tn = np.arange(NS) / SR
room = lp(brown(NS / SR), 700)[:NS]; room = room / (np.abs(room).max() + 1e-9) * db(-50)
room = np.stack([room, room], 1).astype(np.float32)

# ═ voice: the client's own recording
y, sr = sf.read(os.path.join(HERE, '..', 'voiceover-reel2', 'narration.wav'), dtype='float32')
if y.ndim > 1: y = y.mean(1)
y = soxr.resample(y, sr, SR).astype(np.float32); y = hp(y, 80).astype(np.float32); y = compress(y, .22, 2.6)
vo = np.zeros((NS, 2), np.float32); add(vo, y, 0, 1, 0)

# balance: music ~5 dB under the voice between lines (livelier than reel 1), ducked a further ~6 dB under speech
env = np.abs(vo[:, 0]); k = int(.15 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); env = np.clip(env / (env.max() * .2), 0, 1)
env = np.convolve(env, np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
speech = env > .3
def rms(x, m): return np.sqrt(np.mean(x[m] ** 2)) + 1e-9
vr = rms(vo[:, 0], speech)
music *= vr * db(-5) / rms(music[:, 0], (np.abs(music[:, 0]) > 1e-4) & ~speech)
music *= (1 - .5 * env)[:, None]
# the effort beat's full groove sits 4 dB lower while Neha speaks over it
eff = np.clip((tn - 14.7) / .1, 0, 1) * (1 - np.clip((tn - 17.05) / .3, 0, 1))
music *= (1 - eff * (1 - db(-4)))[:, None]
fx *= np.abs(vo).max() * db(-8) / (np.abs(fx).max() + 1e-9)
fx *= (1 - .6 * env)[:, None]                                         # foley ducks under speech too, so no word is masked
fx = fx + room * vr / db(-17)
mix = music + fx + vo
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
if os.environ.get('STEMS'):
    for n_, x in (('music', music), ('fx', fx), ('vo', vo)): sf.write(os.path.join(HERE, 'out', n_ + '.wav'), x[:int(DUR * SR)], SR)
fade = np.ones(NS); fo = int(.5 * SR); end = int(DUR * SR); fade[end - fo:end] = np.linspace(1, 0, fo) ** 1.5; fade[end:] = 0
mix = limit(mix * fade[:, None] / (np.abs(mix).max() + 1e-9) * .9, .95)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)], SR)
print('out/mix.wav', DUR, 's · piano notes', len(EVN))
