# Praxyz explainer reel: brief

A 43-second vertical explainer reel (1080×1920, 30 fps) for **Praxyz**, Eunoia's clinical-training
product: a web app where psychology graduates and junior therapists practise therapy by voice with
AI patients, get scored, and earn a certificate.

Audience: psychology graduates and early-career therapists in India. Their pain: "clinics want
practical experience, and I'm scared of my first real client." Platforms: Instagram Reels and LinkedIn.

## This must NOT look like the Eunoia reels
The team wants Praxyz to have its own identity. Do not reuse anything from D:/EUNOIA/Eunoia-reels/eunoia-booking-reel or
D:/EUNOIA/Eunoia-reels/eunoia-reel-objections: no sprout or any mascot, no phone frame, no frosted caption pill, no piano
or chiptune, no Libre Caslon / Manrope, no warm cream/green palette. Start a fresh project folder
D:/EUNOIA/Eunoia-reels/praxyz/praxyz-explainer. Choose a Lemo-Opuscar style that fits a modern, precise, tech-meets-care product
(a different style from Living Screencast is welcome); propose it in the treatment.

## Source material
- Web app (real UI to redraw): D:/EUNOIA/praxyz/praxyz-web
  - Patient library: app/(dashboard)/practice, components/practice/PatientCard.js
  - Live session: components/session/ (SessionLobby, MicCheckPanel, LiveSessionRoom, VoiceVisualizer, LiveTranscriptDrawer)
  - Scorecard and feedback: app/(dashboard)/session/[sessionId]/review
  - Progress: app/(dashboard)/analytics, components/dashboard/RankCard.js, app/(dashboard)/leaderboard
  - Certificate: components/certificates/, app/certificate/[certId] (public view)
  - Patient data: data/patients.seed.json · patient portraits: public/avatars/*.webp
- Marketing copy and scoring explanation: D:/EUNOIA/praxyz/praxyz-landing (components/landing/ScoringSection.jsx,
  HowItWorksSection.jsx, LiveSessionDemo.jsx)
- Brand: dark theme. Background #0D1117 / #1A1A2E, teal glow #00BFA5, primary #004D40 / #00695C.
  Fonts: Space Grotesk (headings), Inter (display), DM Sans (body). Wordmark "Praxyz".
- Praxyz is a desktop-first web app: show it on a laptop/desktop screen (or a frameless floating
  browser window), cropped and zoomed so the UI reads clearly in a vertical frame.

## Voice
Use my own voice files in D:/EUNOIA/Eunoia-reels/praxyz/voiceover. Do NOT generate TTS.
- narrator.wav (narrator) and patient.wav (the AI patient Rohan), time-aligned; voice.wav is both mixed.
- Follow voiceover/timing.md for every beat. Align with Whisper for captions, but captions must use
  the exact script text from timing.md (Whisper for timing only). The narrator says "Praxyz" like
  "praxis"; always spell it "Praxyz" on screen.
- Rohan's line should feel like it is coming out of the app's live session (it is the product's own
  patient voice), synced to the voice visualizer, with his words appearing in the live transcript.

## Beats (see voiceover/timing.md for exact times)
1. 0–2.5 s **Hook**, on frame 1, no fade-in: "Your first client won't wait till you feel ready."
2. 2.5–7 s **AI patient library**: cards for Ankita (28, Anxiety), Rohan (35, Depression),
   Meera (55, Grief), Vikram (45, Addiction) with Easy / Medium / Hard difficulty.
3. 7–16.5 s **Live voice session**: tap Rohan → quick mic check → live room; the voice visualizer
   reacts to Rohan's voice; the trainee's reply appears in the transcript as text only
   (e.g. "When did you start feeling that way?").
4. 16.5–23 s **Scorecard**: overall score counts up; the six skills fill: Empathy, Active listening,
   Question quality, Therapeutic technique, Rapport, Clinical accuracy (names from ScoringSection.jsx).
5. 23–29 s **Feedback**: Strengths, Areas to improve, then one Moment Feedback item tied to a
   transcript timestamp.
6. 29–33.5 s **Progress**: analytics chart rising over sessions; rank card.
7. 33.5–38 s **Certificate**: a Praxyz certificate, then its public profile page being shared.
   (This feature launches soon; show it as part of the product.)
8. 38–43 s **End card**: "Start with 30 free minutes" + praxyz.tech + Praxyz wordmark. Hold about 3 s.

## Social rules (must work on mute)
- Bold on-screen text carries each beat's idea in 2–5 words (e.g. "Real voice. Real pushback.",
  "6 skills. Scored.", "Proof employers can see."), plus burned-in captions for the spoken lines,
  in a caption style unique to Praxyz. The two never overlap.
- Fast, confident pacing; a strong visual change every 2–3 s.
- Safe area: keep text and key UI out of the top 250 px, bottom 450 px and right 140 px.
- Export a cover frame showing the hook text.

## Content rules
- Use the real app UI, copy and patient names. AI patients are fictional; show them as AI patients.
- Use a fictional trainee name (e.g. "Ishaan Rao") anywhere a user name appears. No real people,
  no testimonials.
- Price: say only "30 free minutes" (the app gives 30 free credits, 1 credit = 1 minute). No per-minute
  price or packs. Don't claim partnerships, hiring guarantees or that it replaces supervision or a degree.

## Music and sound
An original modern electronic score: clean pulse around 110–120 bpm, subtle synth bass, glassy UI
sounds, a lift into the scorecard and a resolve on the end card. Nothing like the Eunoia reels.
Duck the music under both voices. Master to −14 LUFS.

## Process
Show me the treatment and storyboard first and wait for my approval before rendering.
