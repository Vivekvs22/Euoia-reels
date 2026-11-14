"""Praxyz explainer: an original electronic score + UI foley + the client's two voice tracks → out/mix.wav (cued from events.json).
120 bpm (beat 0.5 s, bar 2 s), D minor → F major resolve. All synthesized: sine sub pulse, saw synth bass, glassy FM plucks,
soft pads, a noise-hat kit. No piano, no chiptune. Rohan's voice is played "out of the app" (band-limited, short room).
Usage: LIB=<library> python sound.py   (STEMS=1 also writes out/{music,fx,vo}.wav)"""
import json, os, sys
import numpy as np, soundfile as sf, soxr

LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, brown
from core.audio import sampler as S   # only for note-name helpers and the room reverb (no samples are played)

HERE = os.path.dirname(os.path.abspath(__file__))
EVJ = json.load(open(os.path.join(HERE, 'events.json'), encoding='utf-8')); E = EVJ['ev']; DUR = EVJ['dur']
rng = np.random.default_rng(43)
NS = int((DUR + 1.0) * SR); B = .5; BAR = 2.0
hz = S.hz
def tt(d): return np.arange(int(round(d * SR))) / SR
def db(x): return 10 ** (x / 20)
def all_(tp): return [e for e in E if e['type'] == tp]
def first(tp): return all_(tp)[0]['t']

# ───────── synths
def sine(f, d, a=.003, tau=None, rel=.03):
    t = tt(d); x = np.sin(2 * np.pi * f * t); e = np.minimum(1, t / a) * np.clip((d - t) / rel, 0, 1)
    if tau: e = e * np.exp(-t / tau)
    return (x * e).astype(np.float32)
def pluck(p, d=.5, v=.3, bright=1.):         # glassy FM pluck: carrier + 3.5× modulator with a decaying index
    f = hz(p); t = tt(d); idx = (2.2 * bright) * np.exp(-t / .07)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t)) + .25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / .12)
    return (x * np.exp(-t / .18) * np.minimum(1, t / .002) * v).astype(np.float32)
def saw(f, d, n=14):
    t = tt(d); return sum(np.sin(2 * np.pi * f * k * t) * (1 / k) * (-1) ** (k + 1) for k in range(1, n))
def bass(p, d, v=.5, cut=900):
    f = hz(p); t = tt(d); x = saw(f, d, 10) + .6 * np.sin(2 * np.pi * f * t)
    e = np.minimum(1, t / .006) * np.clip((d - t) / .05, 0, 1) * (.65 + .35 * np.exp(-t / .2))
    return (lp(x * e, cut) * v * .3).astype(np.float32)
def pad(ps, d, v=.12, att=.6, rel=.8, cut=1600):
    t = tt(d); x = np.zeros(len(t))
    for p in ps:
        f = hz(p)
        for dt in (-.005, .005): x += saw(f * (1 + dt), d, 8)
    e = np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1)
    return (lp(x, cut) * e * v / len(ps)).astype(np.float32)
def nz(d, lo, hi, v=1., tau=None):
    x = bp(rng.standard_normal(int(round(d * SR))), lo, hi) * v
    if tau: x *= np.exp(-tt(d)[:len(x)] / tau)
    return x.astype(np.float32)
def kick(v=1.):
    d = .35; t = tt(d); f = 46 + 120 * np.exp(-t / .03)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .12) * v + nz(d, 2000, 6000, .05 * v, .003)[:len(t)]).astype(np.float32)
def hat(v=.2, open_=False): return nz(.22 if open_ else .05, 7000, 15000, v, .06 if open_ else .012)
def clap(v=.5):
    x = np.zeros(int(.18 * SR), np.float32)
    for k, o in enumerate((0, .011, .022)): s = nz(.16, 900, 5000, v * (.6 if k < 2 else 1), .02 if k < 2 else .05); i = int(o * SR); x[i:i + len(s)] += s[:len(x) - i]
    return x
def riser(d=1.0, v=.25):
    x = rng.standard_normal(int(d * SR)); t = tt(d)[:len(x)]; y = np.zeros(len(x)); seg = int(.02 * SR)
    for i in range(0, len(x), seg): c = 800 + 9000 * (t[i] / d) ** 2; y[i:i + seg] = bp(x[i:i + seg + 300], c * .7, min(c * 1.4, 20000))[:len(y[i:i + seg])]
    return (y * (t / d) ** 2 * v).astype(np.float32)
def air(d=.3, v=.25, up=True):
    x = rng.standard_normal(int(d * SR)); t = tt(d)[:len(x)]; c = np.linspace(.3, 1, len(t)) if up else np.linspace(1, .3, len(t))
    return (bp(x, 600, 7000) * np.sin(np.pi * t / d) ** 2 * (.4 + .6 * c) * v).astype(np.float32)
def glass(p, v=.25, d=.6):   # UI tap: two bright partials, a soft transient
    f = hz(p); t = tt(d); x = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / .05) + .2 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t / .03)
    return (x * np.exp(-t / .16) * np.minimum(1, t / .001) * v).astype(np.float32)
def tick(v=.15): t = tt(.03); return (nz(.03, 2500, 9000, v, .004)[:len(t)] + np.sin(2 * np.pi * 3200 * t) * np.exp(-t / .004) * v * .5).astype(np.float32)

music = np.zeros((NS, 2), np.float32); drums = np.zeros((NS, 2), np.float32); fx = np.zeros((NS, 2), np.float32)
CH = {'Dm': ('D2', ['D3', 'F3', 'A3', 'C4'], ['D4', 'F4', 'A4', 'C5', 'A4', 'F4']), 'Bb': ('A#1', ['A#2', 'D3', 'F3', 'A3'], ['A#3', 'D4', 'F4', 'A4', 'F4', 'D4']),
      'F': ('F2', ['F3', 'A3', 'C4', 'E4'], ['F4', 'A4', 'C5', 'E5', 'C5', 'A4']), 'C': ('C2', ['C3', 'E3', 'G3', 'D4'], ['C4', 'E4', 'G4', 'D5', 'G4', 'E4']),
      'Gm': ('G1', ['G2', 'A#2', 'D3', 'F3'], ['G3', 'A#3', 'D4', 'F4', 'D4', 'A#3']), 'Fadd9': ('F1', ['F2', 'C3', 'G3', 'A3', 'C4', 'E4'], ['F4', 'G4', 'A4', 'C5', 'E5', 'G5'])}
def bar_chord(t):   # progression by section (bar = 2 s)
    k = int(t // BAR)
    if t < 23.0: return ['Dm', 'Bb', 'F', 'C'][k % 4]
    if t < 38.0: return ['Gm', 'Bb', 'F', 'C'][(k - 11) % 4]
    return 'Fadd9'

# ═ score, beat by beat
for n in range(int(DUR / (B / 2)) + 1):           # eighth-note grid
    t = n * B / 2; root, pc, arp = CH[bar_chord(t)]; beat = n // 2; on = n % 2 == 0; inbar = beat % 4
    room = 8.2 <= t < 16.0; live_voice = 8.3 <= t < 11.3; end = t >= 38.0
    # sub pulse (8ths), the heartbeat of the whole film
    if not (live_voice and not on):
        add(music, sine(hz(root) * (2 if hz(root) < 50 else 1), .2, .004, .09) * (.32 if not room else .2), t, 1, 0)
    # synth bass on the beat (out in the live room and on the hook)
    if 2.5 <= t < 8.2 or 16.5 <= t < 38.0:
        if on: add(music, bass(root, .42, .5 if t >= 16.5 else .42), t, 1, 0)
    if end and on and inbar == 0 and t < 41.5: add(music, bass(root, 1.6, .4, 700), t, 1, 0)
    # drums: hook none; library groove; live room out; lift + full beat from 16.5; thin hats on the certificate; out on the end card
    if 2.5 <= t < 8.2 or 16.5 <= t < 38.0:
        if on and inbar in (0, 2): add(drums, kick(.85), t, 1, 0)
        if t >= 16.5 and on and inbar in (1, 3) and not (33.5 <= t < 38): add(drums, clap(.42), t, 1, .08)
        if not (33.5 <= t < 38) or on: add(drums, hat(.16 if on else .11), t, 1, .3)
        if t >= 16.5 and not on and inbar == 3 and not (33.5 <= t < 38): add(drums, hat(.1, True), t, 1, .3)
    # pads (whole bars)
    if n % 8 == 0:
        if t < 2.5: add(music, pad(pc[:3], 2.5, .07, .4), t, 1, 0)
        elif room or t >= 16.5 and t < 38: add(music, pad(pc, BAR + .3, .09 if room else .06), t, 1, 0)
    # glassy arpeggio (16ths), filtered by section
    for h in (0, 1):
        ts = t + h * B / 4; i = (n * 2 + h) % len(arp)
        if ts < 2.5: add(music, pluck(arp[i], .3, .1, .5), ts, 1, -.25 + .5 * (i % 2))
        elif 2.5 <= ts < 8.2 and h == 0: add(music, pluck(arp[i], .32, .1, .7), ts, 1, -.3 + .6 * (i % 2))
        elif 16.5 <= ts < 33.5: add(music, pluck(arp[i], .3, .11 if h == 0 else .07, 1.), ts, 1, -.35 + .7 * (i % 2))

# lift into the scorecard: riser, then a crash-like air burst and an octave stab on the downbeat
add(drums, riser(1.4, .3), first('lift') - 1.4, 1, 0)
add(drums, nz(1.2, 4000, 14000, .25, .45), first('lift'), 1, 0); add(drums, kick(1.), first('lift'), 1, 0)
for p in ('D3', 'D4', 'A4', 'F5'): add(music, pluck(p, .9, .16, 1.2), first('lift'), 1, 0)
# progress: one arp note per data point, climbing with the line
for e, p in zip(sorted(all_('point'), key=lambda e: e['i']), ['F4', 'A4', 'C5', 'E5', 'F5', 'A5']): add(music, pluck(p, .5, .16, 1.1), e['t'], 1, .15)
# end card: F(add9) resolve, pulse only, ring out
TR = first('resolve')
add(music, pad(CH['Fadd9'][1], 5.0, .16, .25, 2.2, 2400), TR, 1, 0)
for j, p in enumerate(['F4', 'G4', 'A4', 'C5', 'E5']): add(music, pluck(p, 1.4, .13, .9), TR + j * .125, 1, -.3 + .15 * j)
add(drums, nz(1.6, 3000, 12000, .16, .6), TR, 1, 0)

music = S.room(music, size=.4, mix=.18) + drums

# ═ foley (one glassy family, in key)
KEY = ['A5', 'C6', 'D6', 'F6', 'A6', 'C7']
for e in E:
    t0, tp = e['t'], e['type']
    if tp == 'cut': add(fx, tick(.22 if e.get('big') else .12), t0, 1, 0); (add(fx, sine(110, .08, .001, .03) * .3, t0, 1, 0) if e.get('big') else None)   # hard cut: a crisp transient, a low thud on scene changes
    elif tp == 'word' and e.get('hook'): add(fx, tick(.08), t0, 1, .1)
    elif tp == 'msg': add(fx, glass('D6', .16), t0, 1, .2)
    elif tp == 'button': add(fx, glass('F6', .18), t0, 1, 0); add(fx, glass('C7', .14), t0 + .06, 1, 0)
    elif tp == 'stamp': add(fx, glass('A6', .15), t0, 1, .1)
    elif tp == 'click': add(fx, tick(.3), t0, 1, .1); add(fx, sine(180, .05, .001, .015) * .25, t0, 1, 0)
    elif tp == 'snap': add(fx, glass(KEY[e['i']], .18), t0, 1, -.3 + .2 * e['i'])
    elif tp == 'skill': add(fx, glass(KEY[e['i']], .18), t0, 1, -.3 + .12 * e['i'])
    elif tp == 'ring': add(fx, glass('D6', .2, .9), t0, 1, 0)
    elif tp == 'digit': add(fx, glass('A6' if e['i'] else 'F6', .22), t0, 1, 0)
    elif tp == 'connected': add(fx, glass('D6', .16), t0, 1, 0); add(fx, glass('A6', .14), t0 + .09, 1, 0)
    elif tp == 'chipdive': add(fx, air(.3, .18), t0 - .1, 1, 0); add(fx, glass('C7', .14), t0 + .2, 1, .2)
    elif tp == 'copied': add(fx, glass('F6', .2), t0, 1, .2); add(fx, glass('C7', .16), t0 + .07, 1, .2)
    elif tp == 'type': add(fx, tick(.06 + .03 * rng.random()), t0, 1, .2)
    elif tp == 'rank': add(fx, glass('A6', .18), t0, 1, .1)
# the digit scramble: a burst of tiny grains before the locks
for k in range(10): add(fx, tick(.05), 16.5 + k * .035, 1, rng.uniform(-.4, .4))
tn = np.arange(NS) / SR
room_tone = lp(brown(NS / SR), 600)[:NS]; room_tone = room_tone / (np.abs(room_tone).max() + 1e-9) * db(-54)

# ═ voices: the client's narrator + Rohan, both time-aligned to 0
def load(name):
    y, sr = sf.read(os.path.join(HERE, '..', 'voiceover', name), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    return soxr.resample(y, sr, SR).astype(np.float32)
nar = compress(hp(load('narrator.wav'), 80).astype(np.float32), .22, 2.6)
pat = load('patient.wav'); pat = bp(pat, 140, 7000).astype(np.float32); pat = compress(pat, .2, 2.4)
pat2 = np.stack([pat, pat], 1); pat2 = (S.room(pat2, size=.15, mix=.16)).astype(np.float32)   # "out of the app"
vo = np.zeros((NS, 2), np.float32); add(vo, nar, 0, 1, 0); vo[:len(pat2)] += pat2[:NS] * .95

# balance: music ~6 dB under the voices between lines, ducked ~8 dB more under speech; foley peaks −8 dB re voice, ducked 4 dB
env = np.abs(vo[:, 0]); k = int(.15 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); env = np.clip(env / (env.max() * .2), 0, 1)
env = np.convolve(env, np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); speech = env > .3
def rms(x, m): return np.sqrt(np.mean(x[m] ** 2)) + 1e-9
vr = rms(vo[:, 0], speech)
music *= vr * db(-6) / rms(music[:, 0], (np.abs(music[:, 0]) > 1e-4) & ~speech)
music *= (1 - (1 - db(-8)) * env)[:, None]
fx *= np.abs(vo).max() * db(-8) / (np.abs(fx).max() + 1e-9)
fx *= (1 - (1 - db(-4)) * env)[:, None]
fx = fx + np.stack([room_tone, room_tone], 1).astype(np.float32) * vr / db(-17)
mix = music + fx + vo
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
if os.environ.get('STEMS'):
    for n_, x in (('music', music), ('fx', fx), ('vo', vo)): sf.write(os.path.join(HERE, 'out', n_ + '.wav'), x[:int(DUR * SR)], SR)
fade = np.ones(NS); fo = int(.8 * SR); end = int(DUR * SR); fade[end - fo:end] = np.linspace(1, 0, fo) ** 1.5; fade[end:] = 0
mix = limit(mix * fade[:, None] / (np.abs(mix).max() + 1e-9) * .9, .95)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)], SR)
print('out/mix.wav', DUR, 's')
