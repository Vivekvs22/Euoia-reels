"""Praxyz reel B: a new original track + cockpit sound palette + the client's two voices → out/mix.wav (cued from events.json).
128 bpm, E minor (Em – C – G – D per bar) resolving to G(add9) on the end card. Tighter and more driving than reel A:
four-on-the-floor soft kick, offbeat hats, rolling 16th synth bass, short plucks. Every chime, warning and hit sits on a
visible event (events.json comes from the picture's own timeline). Usage: LIB=<library> python sound.py [STEMS=1]"""
import json, os, sys
import numpy as np, soundfile as sf, soxr

LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, brown
from core.audio import sampler as S   # note-name helpers and the room reverb only

HERE = os.path.dirname(os.path.abspath(__file__))
EVJ = json.load(open(os.path.join(HERE, 'events.json'), encoding='utf-8')); E = EVJ['ev']; DUR = EVJ['dur']
rng = np.random.default_rng(128)
NS = int((DUR + 1.0) * SR); B = 60 / 128; E16 = B / 4; BAR = 4 * B
hz = S.hz
def tt(d): return np.arange(int(round(d * SR))) / SR
def db(x): return 10 ** (x / 20)
def all_(tp): return [e for e in E if e['type'] == tp]
def first(tp): return all_(tp)[0]['t']

def sine(f, d, a=.003, tau=None, rel=.03):
    t = tt(d); x = np.sin(2 * np.pi * f * t); e = np.minimum(1, t / a) * np.clip((d - t) / rel, 0, 1)
    if tau: e = e * np.exp(-t / tau)
    return (x * e).astype(np.float32)
def saw(f, d, n=12): t = tt(d); return sum(np.sin(2 * np.pi * f * k * t) / k * (-1) ** (k + 1) for k in range(1, n))
def bass(p, d, v=.5, cut=700):
    f = hz(p); t = tt(d); x = saw(f, d, 9) + .7 * np.sin(2 * np.pi * f * t)
    e = np.minimum(1, t / .004) * np.clip((d - t) / .03, 0, 1) * np.exp(-t / .14)
    return (lp(x * e, cut) * v * .32).astype(np.float32)
def pluck(p, d=.25, v=.25, bright=1.):
    f = hz(p); t = tt(d); idx = 1.8 * bright * np.exp(-t / .05)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 2 * t))
    return (x * np.exp(-t / .1) * np.minimum(1, t / .002) * v).astype(np.float32)
def pad(ps, d, v=.1, att=.5, rel=.8, cut=1500):
    t = tt(d); x = np.zeros(len(t))
    for p in ps:
        for dt in (-.004, .004): x += saw(hz(p) * (1 + dt), d, 7)
    return (lp(x, cut) * np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1) * v / len(ps)).astype(np.float32)
def nz(d, lo, hi, v=1., tau=None):
    x = bp(rng.standard_normal(int(round(d * SR))), lo, hi) * v
    if tau: x *= np.exp(-tt(d)[:len(x)] / tau)
    return x.astype(np.float32)
def kick(v=1.):
    d = .3; t = tt(d); f = 48 + 130 * np.exp(-t / .025)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .1) * v + nz(d, 2500, 7000, .04 * v, .002)[:len(t)]).astype(np.float32)
def hat(v=.15, d=.045): return nz(d, 7500, 15000, v, .01)
def clap(v=.4):
    x = np.zeros(int(.16 * SR), np.float32)
    for k, o in enumerate((0, .009, .019)): s = nz(.14, 1000, 5500, v * (.6 if k < 2 else 1), .018 if k < 2 else .045); i = int(o * SR); x[i:i + len(s)] += s[:len(x) - i]
    return x
def chime(p1, p2, v=.2):   # instrument chime: two sine partials, centred, soft attack
    d = .9; t = tt(d); x = np.sin(2 * np.pi * hz(p1) * t) + .55 * np.sin(2 * np.pi * hz(p2) * t) * np.exp(-t / .3)
    return (x * np.exp(-t / .38) * np.minimum(1, t / .006) * v).astype(np.float32)
def caution(v=.3):   # the one warning: a low two-note caution tone, restrained
    out = np.zeros(int(.62 * SR), np.float32)
    for k, f in enumerate((hz('A4'), hz('F4'))):
        d = .26; t = tt(d); x = (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 3 * t)) * np.minimum(1, t / .01) * np.clip((d - t) / .05, 0, 1)
        i = int(k * .3 * SR); out[i:i + len(x)] += (x * v).astype(np.float32)[:len(out) - i]
    return out
def air(d=.3, v=.25):
    x = rng.standard_normal(int(d * SR)); t = tt(d)[:len(x)]
    return (bp(x, 500, 7000) * np.sin(np.pi * t / d) ** 2 * v).astype(np.float32)
def riser(d=.3, v=.25):
    x = rng.standard_normal(int(d * SR)); t = tt(d)[:len(x)]
    return (hp(x, 1500) * (t / d) ** 2.5 * v).astype(np.float32)
def thump(v=1.):   # touchdown: sub drop + kick + a short noise burst
    d = 1.1; t = tt(d); f = 34 + 60 * np.exp(-t / .12)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .45) * v * .9).astype(np.float32)
def glass(p, v=.18, d=.5):
    f = hz(p); t = tt(d); x = np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / .04)
    return (x * np.exp(-t / .14) * np.minimum(1, t / .001) * v).astype(np.float32)
def tick(v=.15): t = tt(.03); return (nz(.03, 2500, 9000, v, .004)[:len(t)] + np.sin(2 * np.pi * 3000 * t) * np.exp(-t / .004) * v * .5).astype(np.float32)

music = np.zeros((NS, 2), np.float32); drums = np.zeros((NS, 2), np.float32); fx = np.zeros((NS, 2), np.float32)
CH = {'Em': ('E2', ['E3', 'G3', 'B3', 'D4'], ['E4', 'G4', 'B4', 'D5']), 'C': ('C2', ['C3', 'E3', 'G3', 'B3'], ['C4', 'E4', 'G4', 'B4']),
      'G': ('G1', ['G2', 'B2', 'D3', 'F#3'], ['G4', 'B4', 'D5', 'F#5']), 'D': ('D2', ['D3', 'F#3', 'A3', 'E4'], ['D4', 'F#4', 'A4', 'E5']),
      'Gadd9': ('G1', ['G2', 'D3', 'A3', 'B3', 'D4', 'F#4'], ['G4', 'A4', 'B4', 'D5', 'F#5', 'A5'])}
T_LIVE, T_IMP, T_END = first('live'), first('touchdown'), first('resolve')
def chord_at(t): return 'Gadd9' if t >= T_END else ['Em', 'C', 'G', 'D'][int(t // BAR) % 4]
for n in range(int(DUR / E16) + 1):                 # sixteenth grid
    t = n * E16; root, pc, arp = CH[chord_at(t)]; beat = n // 4; on4 = n % 4 == 0; off8 = n % 4 == 2
    rohan = 7.30 <= t < 9.30; end = t >= T_END
    slow = T_IMP <= t < T_IMP + .48                  # the slow-motion hit: the groove holds its breath
    # rolling 16th bass (hook: 8ths only; under Rohan: whole notes)
    if not end and not slow:
        if t < 3.98: (add(music, bass(root, E16 * 1.6, .38), t, 1, 0) if n % 2 == 0 else None)
        elif rohan: (add(music, bass(root, BAR * .9, .3, 400), t, 1, 0) if n % 16 == 0 else None)
        else: add(music, bass(root if n % 4 != 3 else S.name(S.midi(root) + 12), E16 * .9, .42 if on4 else .3), t, 1, 0)
    # drums: hats from the top; the kick enters with pre-flight; out under Rohan; back with the narrator
    if not end and not slow and not rohan:
        if off8: add(drums, hat(.17), t, 1, .3)
        elif n % 2 == 1 and t >= 3.98: add(drums, hat(.07, .03), t, 1, .3)
        if t >= 3.98 and on4: add(drums, kick(.9), t, 1, 0)
        if t >= 9.38 and on4 and beat % 2 == 1: add(drums, clap(.36), t, 1, .08)
    # pads by the bar, plucks on 8ths through the debrief
    if n % 16 == 0 and t < T_END: add(music, pad(pc, BAR + .2, .07 if not rohan else .1), t, 1, 0)
    if 9.38 <= t < 18.0 and n % 2 == 0 and not slow: add(music, pluck(arp[(n // 2) % 4], .22, .1, 1.), t, 1, -.3 + .2 * ((n // 2) % 4))
# end card: resolve on G(add9), the beat strips to the pulse, ring out
add(music, pad(CH['Gadd9'][1], 4.2, .16, .2, 2.0, 2200), T_END, 1, 0)
for j, p in enumerate(CH['Gadd9'][2][:5]): add(music, pluck(p, 1.2, .13, .8), T_END + j * E16, 1, -.3 + .15 * j)
for k in range(8): add(music, bass('G1', B * .8, .28, 500), T_END + k * B, 1, 0)
music = S.room(music, size=.35, mix=.15) + drums

# ═ cockpit sounds, each on a visible event
CELLS = [('B5', 'E6'), ('D6', 'G6'), ('E6', 'B6'), ('G6', 'D7')]
for e in E:
    t0, tp = e['t'], e['type']
    if tp == 'chime': add(fx, chime(*CELLS[e['i']], .2), t0, 1, 0)
    elif tp == 'snapcam': add(fx, air(.14, .14), t0 - .02, 1, 0)
    elif tp in ('whip', 'pullback'): add(fx, air(.32 if tp == 'pullback' else .24, .22), t0 - .1, 1, 0)
    elif tp == 'live': add(fx, glass('E6', .18), t0, 1, 0); add(fx, glass('B6', .14), t0 + .08, 1, 0)
    elif tp == 'warning': add(fx, caution(.3), t0, 1, 0)
    elif tp == 'lift': add(fx, riser(.24, .26), t0, 1, 0)
    elif tp == 'touchdown': add(fx, thump(1.0), t0, 1, 0); add(fx, kick(1.), t0, 1, 0); add(fx, nz(.5, 2000, 12000, .22, .12), t0, 1, 0)
    elif tp == 'skill': add(fx, glass(['B5', 'D6', 'E6', 'G6', 'B6', 'D7'][e['i']], .14), t0, 1, -.25 + .1 * e['i'])
    elif tp == 'tickup': add(fx, tick(.18), t0, 1, 0); add(fx, glass('E7', .08, .3), t0, 1, 0)
    elif tp == 'panel': add(fx, air(.4, .24), t0, 1, -.4)
    elif tp == 'push': add(fx, air(.5, .1), t0, 1, 0)
    elif tp == 'sweep': add(fx, nz(.9, 6000, 14000, .04) * np.sin(np.pi * tt(.9)[:int(.9 * SR)] / .9).astype(np.float32), t0, 1, 0)
    elif tp == 'button': add(fx, glass('G6', .16), t0, 1, 0); add(fx, glass('D7', .12), t0 + .06, 1, 0)
    elif tp == 'cut': add(fx, tick(.12), t0, 1, 0)
room_tone = lp(brown(NS / SR), 600)[:NS]; room_tone = room_tone / (np.abs(room_tone).max() + 1e-9) * db(-54)

def load(name):
    y, sr = sf.read(os.path.join(HERE, '..', 'voiceover-b', name), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    return soxr.resample(y, sr, SR).astype(np.float32)
nar = compress(hp(load('narrator.wav'), 80).astype(np.float32), .22, 2.6)
pat = compress(bp(load('patient.wav'), 140, 7000).astype(np.float32), .2, 2.4)
pat2 = S.room(np.stack([pat, pat], 1), size=.15, mix=.16).astype(np.float32)   # out of the app
vo = np.zeros((NS, 2), np.float32); add(vo, nar, 0, 1, 0); vo[:len(pat2)] += pat2[:NS] * .95

env = np.abs(vo[:, 0]); k = int(.15 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); env = np.clip(env / (env.max() * .2), 0, 1)
env = np.convolve(env, np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); speech = env > .3
def rms(x, m): return np.sqrt(np.mean(x[m] ** 2)) + 1e-9
vr = rms(vo[:, 0], speech)
music *= vr * db(-5) / rms(music[:, 0], (np.abs(music[:, 0]) > 1e-4) & ~speech)
music *= (1 - (1 - db(-8)) * env)[:, None]
fx *= np.abs(vo).max() * db(-7) / (np.abs(fx).max() + 1e-9)
fx *= (1 - (1 - db(-4)) * env)[:, None]
fx = fx + np.stack([room_tone, room_tone], 1).astype(np.float32) * vr / db(-17)
mix = music + fx + vo
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
if os.environ.get('STEMS'):
    for n_, x in (('music', music), ('fx', fx), ('vo', vo)): sf.write(os.path.join(HERE, 'out', n_ + '.wav'), x[:int(DUR * SR)], SR)
fade = np.ones(NS); fo = int(.6 * SR); end = int(DUR * SR); fade[end - fo:end] = np.linspace(1, 0, fo) ** 1.5; fade[end:] = 0
mix = limit(mix * fade[:, None] / (np.abs(mix).max() + 1e-9) * .9, .95)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)], SR)
print('out/mix.wav', DUR, 's')
