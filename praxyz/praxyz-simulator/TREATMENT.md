# Praxyz reel B: "A flight simulator for therapists" (treatment)

26 s · 1080×1920 · 30 fps · Instagram Reels + LinkedIn · voices: the client's narrator.wav + patient.wav (no TTS)

## 1. The idea, and three structures

One idea: **Praxyz is a simulator.** One hero: the live session, where an AI patient pushes back. Everything else gets one beat.

1. **A training flight (chosen).** Hook → pre-flight checks (the instruments switch on around the app) → the flight (the live session, with turbulence when Rohan pushes back) → the landing report (the review) → hours logged → licence (the certificate) → end card. The aviation frame is carried by the type and the instrument strip, never by aircraft imagery, so it stays a product film.
2. **Split screen: cockpit vs. consulting room.** Rejected: it needs flight footage we don't have and must not invent, and it halves the UI in a vertical frame.
3. **Checklist countdown** ("Pre-flight: 4 items…"). Rejected: it repeats reel A's tour in a list, and the brief wants one hero, not a list.

## 2. Style and brand

The same visual system as reel A's polish cut, so the two read as one brand:
- near-black stage, film grain and soft vignette, no background grid
- Space Grotesk headlines, fitted to the safe width, with one teal word each
- the real Praxyz UI in the frameless window
- Rohan's portrait with its voice-driven glow
- the transcript-row caption, with "ROHAN · AI PATIENT" as the only tag
- hard cuts on the beat, word-by-word reveals, shot scale alternating full ↔ extreme close-up

**New in reel B: the instrument strip.** It's designed as real avionics typography, not a sci-fi HUD:
- one strip of four equal cells under the window, aligned to the window's edges (x 50–910)
- 1 px rules between cells, a small JetBrains Mono label at the top, a big Space Grotesk value below
- flat white/grey, teal for normal status ("Ready", "Live"), and amber only for the TURBULENCE annunciator
- no glow, no scanlines, no hexagons, no rotating rings, no fake data streams
- cells switch on hard, one per beat, each with a soft chime

**Truthful readouts:** only what the app shows. PATIENT, DIFFICULTY, MIC and TIMER during the session; HOURS PRACTISED only after it. There are no live score meters, because scores appear only after the session ends.

## 3. Frame and safe area

The safe column is x 0–940, y 250–1470. Lanes:

| Lane | y | Content |
|---|---|---|
| Headline | 290–565 | the hook and beat headlines (Space Grotesk 700, auto-fitted to 860 px wide); the TURBULENCE annunciator flashes here |
| Window | 600–1150 | the app |
| Instrument strip | 1170–1270 | the four readouts |
| Caption | 1300–1460 | the caption |

The extreme close-ups (Rohan's portrait, the 81, HOURS PRACTISED) use the full frame and keep the caption lane free.

## 4. Demo data (consistent with reel A)

- **Trainee:** Ishaan Rao.
- **Patient:** Rohan, 35, Depression, on **Hard** (the seed data has a Hard variant).
- **Session 7:**
  - skills in the app's Title Case: Empathy 86 · Active Listening 84 · Question Quality 78 · Therapeutic Technique 75 · Rapport 88 · Clinical Accuracy 76
  - overall **81** (the skill mean is 81.2)
- **Hours practised:** 3.9 → **4.2 h** (reel A ended at 3.5 h after session 6, plus this session).
- **Proficiency Certificate:** 7 sessions · 70/100 average ((6 × 68 + 81) / 7) · 4.2 h practice.
- **Kept out of frame:** credits, session length and prices, except "Start with 30 free minutes".

## 5. Shot list (128 bpm; beat 0.469 s; cuts on eighths, ≤ 0.09 s from the timing.md boundaries)

| # | Time | Picture | Why |
|---|---|---|---|
| 1 | 0.00–3.98 | **Hook on frame 1:** "Pilots train in / simulators. / Therapists start / on real people." Full text from the first frame, "simulators." in teal; a slow push only | readable on frame 1 |
| 2 | 3.98–7.03 | Hard cut: the live room ready (Rohan's portrait, "Rohan is ready to respond..."), the strip switching on one cell per beat: PATIENT Rohan, 35 · DIFFICULTY Hard · MIC Ready · TIMER 00:00. Headline "Practise **first.**" | pre-flight checks |
| 3 | 7.03–7.50 | Full: the room goes LIVE, TIMER starts counting, MIC turns "Live" | take-off |
| 4 | 7.50–9.38 | **ECU:** Rohan's portrait, the glow swelling with his voice. **TURBULENCE** annunciator (amber outline, flat) flashes once, 8.0–8.9 s, on his line. Caption "ROHAN · AI PATIENT" | the hero moment |
| 5 | 9.38–11.25 | Close: the Live Transcript: YOU "When did you start feeling that way?" then ROHAN "Why does everyone keep asking me that?", both whole. Headline "Your **simulator.**" | his words, in the app |
| 6 | 11.25–13.59 | Medium: the room + strip (TIMER running, MIC Live), Rohan listening. Headline "Patients who push **back.**" | AI patients who push back |
| 7 | 13.59–14.53 | **Touchdown → ECU:** the giant **81**, flat green, labels "LANDING REPORT" / "/ 100 · SESSION 7" | the landing |
| 8 | 14.53–18.05 | The real review: ring 81 + the six skills (Title Case) appearing one per eighth, bars filling. Headline "Full **debrief.**" | the debrief |
| 9 | 18.05–19.92 | **ECU instrument:** "HOURS PRACTISED", the value ticking 3.9 → 4.2 h on eighths | hours logged |
| 10 | 19.92–20.86 | The Proficiency Certificate, full. Headline "Log hours. Earn **proof.**" | the licence |
| 11 | 20.86–22.03 | **ECU:** "Proficiency Certificate / Ishaan Rao" | the name |
| 12 | 22.03–26.00 | End card, the same sign-off as reel A: "Praxyz" on the cut, "Start with 30 **free** minutes" word by word, praxyz.tech on the beat; held 3 s+ | the call to action |

## 6. Captions (exact script from timing.md; Whisper for timing)

1. "Pilots train in a simulator before they ever fly." (on-screen hook text and caption differ by design: the hook is the idea, the caption is the voice)
2. "Your first client shouldn't be your first practice."
3. ROHAN · AI PATIENT: "Why does everyone keep asking me that?"
4. "Praxyz is your simulator. AI patients who push back."
5. "Every session ends with a full debrief."
6. "Log your hours. Earn your certificate."
7. "Praxyz. Practise here, before it's real."

## 7. Music and sound: a new track

**Music:** 128 bpm, E minor, resolving to G major on the end card. A four-on-the-floor soft kick, offbeat hats, a rolling 16th synth bass and short plucks. It's tighter and more driving than reel A, with no material shared.

| Section | Music |
|---|---|
| Hook | bass pulse + hats only |
| Pre-flight | the kick enters; one soft instrument chime (two sine partials, centred) per readout |
| Live session | drums drop to the pulse under Rohan |
| TURBULENCE | one restrained warning tone (a low two-note caution chime) at 8.0 s, off his words' onsets |
| Landing report | a "touchdown" hit (sub thump + kick + short noise burst) on the 81, then the full groove |
| End card | resolve on G(add9); strip back to the pulse; ring out |

**Mix:** music ducks ~8 dB under both voices; master −14 LUFS. Grain strength is chosen to keep the file ≤ 25 MB.

## 8. Tone and claims

The hook is an observation about training, aimed at no one. No partnerships, guarantees or replacement claims. The certificate appears as a product feature.

## 9. Premium cut (supersedes §2–§5 where they differ)

- **Camera with intent:** a world camera with eased push-ins that settle, slow drifts, and fast whips with motion blur between sections. The only static moment is the deliberate hold on Rohan.
- **Depth:** the app window and the instrument strip sit in one tilted 3D plane, with a soft floor shadow and a faint glass reflection; the background moves at about 0.12× the camera (parallax).
- **Pre-flight:** a burst of extreme close-ups snapping cell to cell, one per beat (PATIENT → DIFFICULTY → MIC → TIMER). Each cell switches on with a thin light sweep, with shallow depth of field so the neighbouring cells and the window blur out and dim. A fast pull-back then reveals the full panel at take-off.
- **Instrument strip:** a 2 × 2 grid; values 76 px (2× the first cut), labels 28 px; kept clear of the caption lane.
- **Kinetic type:** headline words rise through masks; the 81 and the 4.2 h roll like odometers.
- **TURBULENCE:** an amber light pulse, a 3 px shake and a quick punch-in, all on the warning tone.
- **Touchdown:** the score ring flies forward and becomes the big 81, with fine teal particles on impact, a brief slow-motion beat, and "LANDING REPORT · SESSION 7" at 38 px.
- **Debrief:** the score card, then an eased push across to the six skills; the window is fitted so no neighbouring UI shows.
- **4.2 h:** slides aside like a panel to reveal the certificate, then an eased push-in to "Ishaan Rao".
- **End card:** a soft light sweep across the wordmark; the CTA rises word by word; the button settles in.
- **Voice:** the re-recorded lines 3 and 5; line 2 captioned as spoken ("should not").
- **Delivery:** grain at strength 3 keeps the file at 11 MB.
