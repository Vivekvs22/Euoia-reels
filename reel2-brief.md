# Reel 2 brief: "But therapy isn't for me…"

A 23-second vertical reel (1080×1920, 30 fps) in the Living Screencast style: the second reel in
the Eunoia booking-flow series. Reel 1 ("The quiet path") was an emotional arc from noise to calm.
This one is direct and relatable: four common reasons people put off therapy, each answered by the
real booking screen.

## Reuse from reel 1
The project ./eunoia-booking-reel already has the redrawn Eunoia mobile UI (ui.js), the sprout
mascot (sprout.js), fonts, the logo, the phone frame, captions and the sound pipeline. Make a new
project folder ./eunoia-reel-objections and reuse those pieces rather than rebuilding them.
Real UI source if needed: ../Eunoia-website/Eunoia-landing/frontend/src

## Structure and timing
Follow voiceover/timing.md in ./voiceover-reel2 exactly. The voiceover is ./voiceover-reel2/narration.wav
(my own file, Indian English, female). Do NOT generate TTS. Align it with Whisper for captions.

Each beat: the objection appears first as big on-screen text (in quotes, like an inner thought),
then the real booking screen answers it while Neha speaks.

| Time | On-screen objection | Booking screen | Voice |
|---|---|---|---|
| 0–2.2 s | "Therapy? Not for me…" | Phone, idle | music only |
| 2.2–6.2 s | "It's too expensive." | ₹99 first session block | "Your first session? Ninety-nine rupees." |
| 6.2–10.2 s | "They won't get me." | Language chips, tap Hindi | "Pick the language you think in." |
| 10.2–14.6 s | "Someone will find out." | Masked phone, "Your details · Secure checkout" | "Confidential, one-on-one video sessions." |
| 14.6–19.1 s | "It's too much effort." | Quick taps: time, Continue, booked | "A few taps, and you're booked." |
| 19.1–23 s | "Book your ₹99 first session" · eunoia.care | Logo + sprout end card | "Eunoia. Find your way back to yourself." |

## Social rules (this reel must work on mute)
- Frame 1 must already show the hook text "Therapy? Not for me…". No slow fade-in.
- The objection text is the hero: large (Libre Caslon Text, about 80–96 px), high contrast, readable
  in under 1 second. Each objection gets a quick, decisive transition (strike-through, swipe or
  card flip) when the screen answers it.
- Spoken lines also get burned-in captions in the pill style from reel 1, kept separate from the
  objection text so the two never overlap.
- The end card must carry the call to action "Book your ₹99 first session" plus eunoia.care. Hold it about 3 s.
- Do not let any toast or popup run underneath a caption.

## Brand rules (same as reel 1)
- No real therapist names or photos. Any therapist card uses the real layout and tags with the
  botanical line-art avatar and no name.
- Fictional client "Ananya"; phone shown masked as +91 98••• ••210.
- No Razorpay or Cal.id logos. Don't show a session length anywhere.
- Booked slot: Thursday 19 Nov, 6:00 PM (not Friday the 13th).
- Tone: warm and understanding, never mocking the objections. Don't promise anything the site
  doesn't (no "instant", no "in 60 seconds", no crisis help).

## Mascot
The pixel sprout in the terracotta pot returns as a smaller supporting character, so the reels read
as a series: it reacts to each objection (droops, then perks up as the screen answers) and sits on
the end card.

## Look, sound, safe area
- Brand green #0C3B2E, Libre Caslon Text + Manrope, the same phone frame as reel 1.
- Music must be a NEW, original score, not reel 1's. Do not reuse reel 1's music.wav, its cue map,
  chord progression (Dmaj9 → Bm7 → Gmaj7 → A) or melodies. The sound tools and instrument samples
  can be reused; the composition cannot.
- Character: livelier than reel 1, upbeat and warm, in a different key (e.g. F major), a light pulse
  around 100 bpm, with the chiptune voice for the sprout and a hit on each objection's transition.
  Duck the music under the voice. Master to −14 LUFS.
- Safe area: keep text and key UI out of the top 250 px, bottom 450 px and right 140 px.
- Export a cover frame that shows the hook text.

## Process
Show me the storyboard first and wait for my approval before rendering.
