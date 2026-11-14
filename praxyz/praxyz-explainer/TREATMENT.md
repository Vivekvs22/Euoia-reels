# Praxyz explainer: "Before it's real" (treatment)

43 s · 1080×1920 · 30 fps · Instagram Reels + LinkedIn · voices: the client's narrator.wav + patient.wav (no TTS)

## 1. Style: Dark Tech Keynote (proposed)

Praxyz is software for a careful, high-stakes skill. **Dark Tech Keynote** (Lemo-Opuscar `dark-keynote`) is built for exactly that: the interface as the hero on a near-black stage, one luminous accent, snap-grid motion that lands on the beat, and one giant number. It matches Praxyz's own dark theme and teal glow, and it shares nothing with the Eunoia reels (no phone, no mascot, no warm palette, no serif, no piano).

**Kept from the style:**
- the stage: near-black with a radial lift, a cool glow and a 48 px hairline grid
- one accent: Praxyz teal #00BFA5, reserved for the product's verbs (the live dot, the CTA, the score lock, the certificate seal)
- snap-grid motion with a small overshoot on the beat; every shot change is a UI expand / collapse, with no fades and no blank frames
- the native moves: snap grid, number from glyph noise, light reveal

**Where the brief overrides the style (brand and platform win):**
- **Fonts:** Space Grotesk (headlines), Inter (display numbers), DM Sans (UI body), with JetBrains Mono for timestamps and labels, as the app uses `font-mono` for them. The style's Inter Tight is not used.
- **Frame rate:** 30 fps instead of 24.
- **UI:** the real Praxyz UI, redrawn, instead of an invented UI kit. It's shown in frameless floating windows, cropped and zoomed for the vertical frame.
- **App colours that stay real:** the score colours (green ≥ 75, amber ≥ 50), the category badges, and Rohan's blue avatar glow (Depression). These are accent exceptions taken from the product itself.

## 2. Three structures

1. **One session, end to end (chosen).** Follow a single trainee, Ishaan Rao, through one real loop: pick a patient → speak → get scored → see feedback → track progress → earn proof. Each beat is one screen of the real app; the camera dives from screen to screen through UI elements, so the reel feels like one continuous product. It suits an explainer: viewers see the whole loop once, in order.
2. **Before / after split.** Left, a nervous first real session; right, the 6th Praxyz session. Rejected: it needs invented clinic footage, and the split halves the UI in a vertical frame.
3. **Countdown to day one.** "7 days until your first client", each day a feature. Rejected: it implies a schedule and a guarantee the brief rules out, and the date device fights the timing.md beats.

## 3. Logline and arc

*A graduate who is scared of their first client gets to practise on AI patients first, by voice, scored, with proof, until it's real.*

- **Setup (0–2.5):** the fear, as type. "Your first client won't wait till you feel ready." is on screen from frame 1.
- **The loop (2.5–38):** library → live voice session (Rohan speaks, out of the app) → a giant score → feedback down to the moment → a rising trend → a certificate employers can open.
- **Ending (38–43):** the Praxyz wordmark is lit by a light sweep, with "Start with 30 free minutes" · praxyz.tech held 3 s+.

## 4. Benchmark

| Reference | Learn | Don't take |
|---|---|---|
| Keynote-grade software reveals (black stage, one line per screen, the lone big number) | light as the reveal tool; one focal element per shot | any company's names, UI, fonts, melodies |
| Linear / Stripe-style launch films | snap-grid motion, 1 px borders, one accent, beat-locked cuts | their UI, type, colours |
| Short-form SaaS explainers that work on mute | 2–5 word headlines that carry the story alone; a change every 2–3 s | testimonials, claims, stock footage |

## 5. Frame and safe area

Unsafe zones are the top 250, bottom 450 and right 140 px, so the safe column is x 0–940, y 250–1470. Three fixed lanes, which never overlap:

| Lane | y | What |
|---|---|---|
| Headline | 285–480 | bold 2–5 word idea per beat: Space Grotesk 700, 84 px, white, one accent word in teal |
| Product | 500–1255 | a frameless floating window (radius 28, 1 px border at ~8 % white, inner top highlight, deep shadow) with the real UI at 1.5–2.2× its desktop size; the camera pushes and dives inside it |
| Caption | 1290–1460 | the Praxyz caption (below) |

The hook and end card use the full safe column; their captions, if any, stay in the caption lane.

**The Praxyz caption (unique to this reel)** is built like a row of the app's live transcript, and it's not a pill:
- a JetBrains Mono speaker tag: "NARRATOR" in teal, or "ROHAN · AI PATIENT" in amber, the app's own colours for the patient voice
- a 3 px teal left rule (from the certificate's stat rule)
- the line in Inter 600 at 42 px, left-aligned at x 64
- words light from 35 % to 100 % white as they're spoken, timed by Whisper, with the text always the exact script line from timing.md

Hold rule: ≥ max(1.8 s, speech + 0.6 s).

## 6. Content and brand rules

- **Real data:**
  - The four seed patients with their real portraits, ages, genders, categories, difficulty (Ankita Easy, Rohan Medium, Meera Medium, Vikram Hard), resistance dots and presenting problems.
  - Skill names in the app UI use the app's own Title Case (review page, certificate); headlines stay sentence case.
  - Real app copy: "Choose Your Patient", "Begin Session", "Ready to join?", "Microphone · Ready", "Join Session →", "Live", "Rohan is speaking...", "Live Transcript", "Overall Score", "Skill Breakdown", "Strengths", "Areas to Improve", "Moment Feedback", "Score Trend", "Your Rank", "Proficiency Certificate", "Verified Certificate", "Copy Link → Copied!".
- **AI patients:** the headline says "AI patients", and Rohan's caption tag reads "ROHAN · AI PATIENT".
- **Trainee:** "Ishaan Rao" wherever a name appears. No real people and no testimonials.
- **Price:** only "30 free minutes". The lobby's "40 minutes / credits" summary, the per-session credits, and the live room's credit balance are kept out of frame.
- **No claims:** no partnerships, no hiring guarantee, no replacing supervision or a degree.
- **Consistent numbers:**
  - Session 6 overall 78/100, with skills Empathy 84 · Active listening 81 · Question quality 72 · Therapeutic technique 69 · Rapport 86 · Clinical accuracy 74 (mean 77.7).
  - Score trend 58 → 63 → 67 → 70 → 74 → 78; Avg Score 68; 6 sessions.
  - Rank "#12 · Skilled", 68 composite score.
  - A Proficiency certificate (the real rule: ≥ 5 sessions and avg ≥ 65) reading "6 Sessions · 68/100 Avg. score · 3.5 h Practice".
- **The live visualizer:** the current live room animates PatientAvatar's breathing blob (VoiceVisualizer.js's bars aren't mounted there), so the blob around Rohan's portrait swells with the real amplitude of patient.wav, alongside "Rohan is speaking...".
- **Transcript lines:** Rohan's words, as he actually says them ("I do not know… I just stopped caring about things."), appear in the Live Transcript and his caption (amber "ROHAN" tag, mono timestamp). The trainee's reply "When did you start feeling that way?" appears as text only (teal "YOU"). One short pushback line from Rohan, "Why does everyone keep asking me that?", appears as text to show "even push back". It's never spoken.

## 7. Shot list

| # | Time | Lane content · move | Why |
|---|---|---|---|
| 1 | 0.0–2.5 | Full-frame hook type, 4 lines, "won't wait" in teal; a tiny live dot and a mono timer "00:00" breathing above it. Locked frame. | Frame 1 is the hook |
| 2 | 2.5–4.9 | The hook collapses into a point; the library window expands from it. "Choose Your Patient" header, then four cards **snap into the column** on the beat (the app's one-column layout below 768 px), then the camera reads Ankita + Rohan and tracks down to Meera + Vikram at a size readable on a phone. Headline "Practise on **AI patients**." | The whole library in one motion |
| 3 | 4.9–7.0 | Push-in on Rohan's card (Medium · Depression · resist ●●○); the cursor reaches "Begin Session". | Choosing the case |
| 4 | 7.0–8.2 | Click → the lobby expands from the button: "Ready to join?", the mic panel (Ready ✓, teal level meter dancing), click "Join Session →". | The quick mic check |
| 5 | 8.2–11.4 | The live room expands from the button: header (Rohan · Depression · ● LIVE · 14:52 left), the portrait with the blob swelling to his voice, "Rohan is speaking...", his line in the room's caption and in the Live Transcript drawer. Headline "Real voice. Out loud." Locked, slight push. | His voice comes out of the app |
| 6 | 11.4–16.5 | Pull to the transcript: the teal "YOU" bubble types "When did you start feeling that way?"; Rohan "is thinking..." (blob slows); the pushback bubble lands. Headline flips to "Real voice. Real **pushback**." | Answer, pause, push back |
| 7 | 16.5–17.6 | **Number from glyph noise**: a giant "78" scrambles and locks, one digit per sixteenth, under "OVERALL SCORE / 100". Full frame, no other text. Music lifts. | The one number |
| 8 | 17.6–23.0 | The number collapses into the score ring of the hero card; the six skill cards **snap in** and their bars fill on the beat. Headline "**6 skills.** Scored." | Six named skills |
| 9 | 23.0–26.2 | Lateral track: Strengths (green) and Areas to Improve (amber) write in. Headline "What worked. What **slipped**." | The specifics |
| 10 | 26.2–29.0 | Dive into the Moment Feedback timestamp chip "02:14" → match cut to the transcript row it points to, highlighted. | Down to the moment |
| 11 | 29.0–33.5 | Analytics: the Score Trend line draws 58 → 78 left to right; stat cards count; the Your Rank card pops ("#12 · Skilled"). Headline "Better every **session**." | Progress |
| 12 | 33.5–36.0 | **Light reveal** across the Proficiency Certificate (Ishaan Rao · Verified · 6 sessions · 68/100). Headline "Proof employers **can see**." | Proof |
| 13 | 36.0–38.0 | The certificate shrinks into its public page (praxyz.tech/certificate/8F3K2Q9A, "Verified Certificate" stamp); cursor clicks Copy Link → "Copied!". | Shared publicly |
| 14 | 38.0–43.0 | The page collapses into a teal point that grows into the wordmark; a light sweep lights "Praxyz", then "Start with **30 free minutes**" and the teal "praxyz.tech" button. Held 3.4 s. | The resolve and the CTA |

**Camera moves:** expand / collapse transitions, push-in, snap grid, dive + match cut, lateral track, light-reveal presentation, and a return to the centre on the end card.

## 8. Beat sheet (VO onsets from the waveform; words within lines from Whisper)

| t | Picture | Sound |
|---|---|---|
| 0.0 | Hook type on frame 1 | sub pulse + glassy arp start, no drums |
| 2.5 | Collapse → library expands; cards snap at 3.0 | transition whoosh + kick enters; 4 glass taps on the snap |
| 2.7–6.0 | | narrator "Praxyz lets you practise therapy with AI patients first." |
| 5.0 | Push to Rohan | |
| 7.0 | Click Begin Session → lobby | click + window expand |
| 7.5 | Mic meter dances | soft ticks |
| 8.0 | Join Session → live room expands (8.2) | drums drop to the pulse only |
| 8.4–11.2 | Blob swells to his voice; transcript bubble types | patient (from the app) |
| 11.6–16.1 | "YOU" bubble types; Rohan thinking; pushback lands at 15.2 | narrator "Speak out loud. They answer, pause, even push back." |
| 16.5 | Giant 78 scrambles, locks at 17.0 | riser + **lift**: full beat returns; digit grains |
| 17.0–20.5 | Ring + skill cards snap and fill on beats | narrator "After every session, you're scored on six real skills." · 6 glass taps |
| 23.0 | Track to feedback | transition |
| 23.3–27.2 | Strengths / improve write in; chip dive at 26.2 | narrator "See exactly what worked, and the moment it slipped." |
| 29.0 | Analytics; the line draws; rank pops at 31.5 | narrator "Track your progress, session by session." |
| 33.5 | Light sweep over the certificate | shimmer |
| 33.8–36.7 | Public page, Copy Link → Copied! (37.2) | narrator "Earn a certificate employers can actually see." |
| 38.0 | Wordmark light reveal; CTA | **resolve** chord, the beat strips back |
| 38.6–42.0 | | narrator "Praxyz. Practise here, before it's real." |
| 43.0 | Hold | tail |

## 9. Cue map: an original electronic score

120 bpm (beat 0.5 s, bar 2 s). Every beat boundary in timing.md falls exactly on a beat. Key: D minor → resolve to F major (a relative-major lift on the end card).

| Section | Time | Music |
|---|---|---|
| Hook | 0–2.5 | sub-bass pulse (sine, 8ths), glassy plucked arpeggio (filtered), no drums; tension |
| Library | 2.5–7.0 | kick on 1 and 3, closed hats in 8ths, synth bass D–B♭–F–C, arp opens up |
| Live room | 7.0–16.5 | drums out at 8.2 (the room is intimate): pulse + pad; under Rohan only a pad; ticks on the typed transcript |
| Lift / score | 16.5–23.0 | riser into 16.5, full beat + clap on 2 and 4, a brighter arp; glass taps on each skill bar |
| Feedback | 23.0–29.0 | groove continues, bass to Gm – B♭ – F – C |
| Progress | 29.0–33.5 | arp climbs with the line chart (one note per data point) |
| Certificate | 33.5–38.0 | hats thin out, shimmer on the light sweep |
| End | 38.0–43.0 | resolve on F(add9), the beat strips to the pulse, ring out |

All synthesized: sine sub, saw / pulse synth bass, glassy FM-style plucks, a noise-hat kit, pads. No piano, no chiptune. The music ducks ~8 dB under the narrator and Rohan; foley ducks ~4 dB; master −14 LUFS / −1 dBTP.

## 10. Sound design

| Section | Foley |
|---|---|
| UI | glassy taps for card snaps and skill fills; a soft click for each cursor click; an air whoosh for window expand / collapse; digit grains for the score scramble; typing ticks for the transcript bubbles |
| Live room | Rohan's voice played as if from the app: slight band-limit (120 Hz – 7 kHz) and a short room; a "connected" chime at 8.2 |
| Certificate | light-sweep shimmer; a "Copied!" glass ping |

## 11. Type

| Use | Font |
|---|---|
| Headlines | Space Grotesk 700, 84 px, −1.5 % tracking |
| The giant score | Inter 800, ~520 px, −4 % tracking |
| UI | DM Sans (body) and Inter (display), at the app's own sizes × the window scale |
| Labels / timestamps | JetBrains Mono |
| Captions | as in §5 |
| End card | "Praxyz" in Space Grotesk 700 at 150 px; CTA in Space Grotesk 600 at 64 px; "praxyz.tech" in Inter 700 at 40 px on a teal button |

## 12. Polish cut (supersedes §5–§7 where they differ)

- **Look:** no hairline grid; a near-black stage with a soft vignette and film grain (added in ffmpeg at mux, strength 4). Flat colour only: no glow on any text, the window or the 2:14 chip.
- **Type:** headlines are auto-fitted so the longest line fills the safe width (x 50–910), with deliberate two-line breaks, always at the same position, and exactly one teal word each.
- **Captions:** the "NARRATOR" tag is dropped; only "ROHAN · AI PATIENT" keeps a tag. Rohan's line reads as he says it: "I do not know… I just stopped caring about things."
- **Motion:** hard cuts only, every cut on the 120 bpm grid; headline words cut in one per eighth note; UI elements appear on the beat (no fades, no slides); a 1.5 % push within held shots (fitted shots stay locked).
- **Shot scale:** full shots alternate with isolated extreme close-ups: Rohan's portrait glow (0–2.5 s and 8.5–10 s, where the headline steps aside), the 78, the 2:14 chip alone, and "Ishaan Rao" with the certificate title.
- **Library:** the window fits one element at a time (the header, then one card per beat: Ankita → Meera → Vikram → Rohan), so nothing neighbouring is in frame.
- **Opening:** frame 1 is the close-up of Rohan's portrait with the glow breathing. From 0.8 s, "Your first client / won't wait / till you feel ready." cuts in word by word over him (eighths, then sixteenths into the cut), with only "ready." in teal.
- **End card:** "Praxyz" on the cut; "Start with 30 free minutes" word by word with "free" in teal; the praxyz.tech button on the beat at 40.0 s.
- **Foley:** crisp cut ticks (a low thud on scene changes), one glass tap per library card, soft ticks on the hook words, glass pings for messages, the button and the stamp.
