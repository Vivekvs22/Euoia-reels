# Praxyz reel B brief: "A flight simulator for therapists"

A 26-second vertical reel (1080×1920, 30 fps) for Praxyz. The second Praxyz reel. Reel A
(D:/EUNOIA/Eunoia-reels/praxyz/praxyz-explainer) was the full feature tour. Reel B is NOT a tour:
it sells one idea, the simulator, through one hero feature, the live session with a patient who
pushes back. Everything else gets a single beat.

Audience: psychology graduates and early-career therapists in India. Platforms: Instagram Reels, LinkedIn.

## Project
Start a new project folder D:/EUNOIA/Eunoia-reels/praxyz/praxyz-simulator.
Reuse reel A's Praxyz pieces (the redrawn app UI, fonts, Rohan's portrait and voice-driven glow,
grain, caption style without the "NARRATOR" tag, the "ROHAN · AI PATIENT" tag) so the two reels read
as one brand. Real UI source if needed: D:/EUNOIA/praxyz/praxyz-web.

## Voice
Use my own voice files in D:/EUNOIA/Eunoia-reels/praxyz/voiceover-b. Do NOT generate TTS.
narrator.wav and patient.wav are time-aligned (voice.wav is both mixed). Follow voiceover-b/timing.md
for every beat. Captions use the exact script text from timing.md (Whisper for timing only); always
spell "Praxyz" on screen. Rohan's line comes out of the live session (his glow reacts to his voice,
his words appear in the transcript).

## Beats (exact times in timing.md)
1. 0–3.9 s **Hook**, readable on frame 1: "Pilots train in simulators. / Therapists start on real people."
   Frame 1 must already show content (no black or empty frame).
2. 3.9–7 s **Instruments boot**: the cockpit-style readouts switch on around the Praxyz app window,
   one per beat: PATIENT Rohan, 35 · DIFFICULTY Hard · MIC ready · TIMER 00:00.
3. 7–13.5 s **Hero: live session**. Rohan pushes back ("Why does everyone keep asking me that?");
   a "TURBULENCE" warning flashes once on his line. This is the longest beat; use a close-up on his
   portrait and the transcript.
4. 13.5–18 s **Landing report**: the app's real review screen, overall score and the six skills
   (app Title Case), framed as the debrief.
5. 18–22 s **Hours logged → certificate**: a "HOURS PRACTISED" readout ticks up, then the
   Proficiency Certificate with "Ishaan Rao".
6. 22–26 s **End card**: "Start with 30 free minutes" (one teal word) + praxyz.tech + Praxyz wordmark. Hold about 3 s.

## The cockpit overlay: make it look designed, not AI-generated
This is the reel's signature, and a sci-fi HUD is the most clichéd AI-video look there is. Rules:
- Think real avionics / instrument panel typography, not a sci-fi HUD: thin rules, small mono labels
  (JetBrains Mono), big clear values, sparse and aligned to a strict grid. No glow, no scanlines, no
  hexagons, no rotating circles, no lens flares, no fake data streams.
- Flat colour: white and grey, teal for normal status, amber only for the TURBULENCE warning.
- Truthful: the readouts show only things the real app shows (patient, difficulty, mic status, session
  timer, hours practised after the session). No live score meters during the session: in the real app,
  scores appear only after the session ends.
- Keep reel A's polish rules: near-black background with grain and vignette, no background grid, one teal
  word per headline, big headlines that fill the safe width, hard cuts on the beat, word-by-word reveals,
  varied shot scale with extreme close-ups, no truncated text, no half-cut neighbouring UI.

## Demo data (keep consistent with reel A)
Trainee "Ishaan Rao". Rohan on Hard. Use a new session for the landing report (e.g. session 7, overall
score 81, built from the six skill scores), hours practised 4.2h, rank "#12 · Skilled" if shown,
Proficiency Certificate. Hide credits, session length and prices except "Start with 30 free minutes".

## Tone and claims
- The hook is an observation, not a dig at therapists, universities or internships.
- No partnership claims, no hiring guarantees, no claim that it replaces supervision or a degree.
  The certificate is shown as a feature (it launches soon).

## Music and sound
A new original track, different from reel A's: a tighter, more driving electronic pulse (around 124–128 bpm),
with a cockpit sound palette: soft instrument chimes when readouts switch on, one restrained warning
tone on TURBULENCE, a "touchdown" hit into the landing report, and a resolve on the end card.
Duck the music under both voices. Master to −14 LUFS.

## Delivery
- Safe area: keep text and key UI out of the top 250 px, bottom 450 px and right 140 px.
- Cover frame: a frame where the full hook text is visible.
- Keep the file under about 25 MB if the grain allows (Instagram recompresses heavily).

## Process
Show me the treatment and key frames first and wait for my approval before rendering.
