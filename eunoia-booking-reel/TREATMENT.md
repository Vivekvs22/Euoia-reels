# Eunoia: "The quiet path" (treatment)

32 s · 1080×1920 · 30 fps · Living Screencast · English (Indian), the client's own narration (`voiceover/narration.wav`)

## 1. Three structures

1. **The quiet path (chosen).** One continuous take through the real mobile flow. It opens in noise: a night lock screen buried under notifications. One swipe clears it and the rest is a single calm thread: language, need, match, time, login, ₹99, booked. The sprout carries the arc: leaves droop in the noise, perk up as each step resolves, and a new leaf grows when the booking lands. The ending bookends the opening: the same lock screen, now holding **one** quiet notification, and that notification's icon becomes the end card.
2. **The race.** A split screen, with the loud notification feed on the left and the Eunoia flow on the right; the sprout crosses from one to the other. Rejected because a 390 px UI in half of a vertical frame is unreadable, and the brief's beats are one flow.
3. **Six taps.** A tap counter ("1 of 6") ticking through the booking to stress how little it takes. Rejected because it adds overlay text the style forbids, and it sells speed when the brand sells calm.

**Why 1:** the voiceover is itself an arc from noise to calm ("too loud" → "find your way back to yourself"), and the style's two actors map onto it exactly. The touch indicator is Ananya; the sprout is Eunoia, quietly doing the matching and holding the place.

## 2. Logline and arc

*On a week when everything is too loud, a small sprout leads Ananya from a buried lock screen to a booked first session in six calm taps.*

- **Setup (0–3.4):** noise. The notification pile grows; the sprout peeks out, wilted.
- **Turn (3.4–22.2):** one swipe and the noise is gone. Two gentle questions, a match, a time, a code, ₹99. Each tap is answered by the sprout.
- **Ending (22.2–32):** "You're booked." A new leaf. The lock screen returns with one quiet notification, which opens into the Eunoia end card.

## 3. Benchmark

| Reference | Learn | Don't take |
|---|---|---|
| Screen Studio-style mobile recordings | touch indicator grammar, auto-zoom to the touch point, spring easing on scroll | their wallpapers, their UI |
| Apple "Guided Tour" films | one idea per sentence, long calm holds, real UI | device marketing look (no 9:41, no Apple chrome) |
| Headspace onboarding motion | a character that slows the viewer down; soft acting, small amplitudes | characters, colours, music |

## 4. Brand rules applied

- No therapist names or photos anywhere. The therapist card keeps the real layout and real tags (credentials, languages, the first two specialities, "+2 more", View profile / Book) with a botanical line-art avatar (the site's own `BotanicalArt`, "branch") and no name line.
- Headings without a name: "A time that works for you." · "You're booked." The back link reads "Back" with no name.
- Client: Ananya, phone always `+91 98••• ••210`.
- Payment beat: "₹99 first session · Pay securely". No Razorpay or Cal.id marks. No session length anywhere: the slot-picker meta, the Continue bar and the confirmation's time row drop "· 30 min", and the price block uses the site's own fallback "₹99 · first session".
- Copy is taken from the source: "Which language would you be most comfortable in?", "What would you like support with?", "Showing what our Hindi-speaking therapists support.", "4 therapists", "Therapists who fit what you told us.", "4 matches for", "Choose a time · IST", "Your time", "Continue", "Log in or get started", "Enter the 6-digit code sent to", "Welcome to Eunoia", "Secure checkout", "You're booked.", "That first step is the hardest one, and you've taken it.", "Check your email". The concern counts are the real counts for Hindi.
- **Order note:** the real site verifies the phone *before* the time picker. timing.md places the OTP after Continue, and we follow timing.md. Flagged on the storyboard.

## 5. Frame, safe area, captions

- Unsafe: top 250, bottom 450, right 140. The safe column is x 0–940, y 250–1470; the phone is centred on x = 470, not 540.
- The phone screen is 390 × 844 CSS px drawn at 2× (780 × 1688 on screen). The bezel runs past the safe band top and bottom, as the device chrome only. The page scrolls inside the phone, and the camera moves, so that whatever is being discussed always sits in y 280–1290.
- Caption pill: dark frosted glass (rgba(10,32,26,.66), blur), white Manrope 800 at 44 px, centred on x = 470, bottom edge at y = 1455, max width 840. It never covers the element being discussed or the sprout; the layout reserves y 1300–1470 for it. The end-card line is not captioned, because the same words are on screen (the `.srt` still has it).
- The touch indicator stands in for the cursor: a soft translucent disc (spring path, small press-scale, ripple on tap). Never a hand. The OTP digits also show on a small key HUD pill.

## 6. The sprout (mascot)

A 13 × 17 sprite on a square-pixel grid: a terracotta pot (#C8643B, shade #9C4826, rim #DE8456) with two dark pixel eyes on the pot, a stem, and two leaves (#7DBE4E / #4F9634). Terracotta is used nowhere in the UI, so it finds the eye in every frame. Sprite pixel = 3 screen-px, so 6 video-px at base zoom.

- Leaves act as arms: drooped (overwhelmed) · neutral · lifted (cheer) · one leaf waving.
- Eyes: neutral / L / R / up / down / wide / happy (^ ^) / shut / blink.
- Acting is gentle: small hops with an anticipation crouch, a stretch on take-off and a soft landing squash with 2–3 dust pixels; idle breathing on the beat; irregular blinks. No pratfalls.
- It stands only on top edges of real elements, measured from the live DOM each frame.
- Third leaf: unfurls pixel by pixel (stem extends 2 px, then a 3-step leaf growth) on "taken it".

## 7. Shot list

| # | Time | Framing / move | Why |
|---|---|---|---|
| 1 | 0.0–3.4 | Medium on the lock screen; **slow push-in** 1.0→1.18 as the pile grows | pressure builds; the pile fills the frame |
| 2 | 3.2–3.6 | Touch swipe up; **whip** (blur) as the notifications fly off, revealing eunoia.care/find | one gesture ends the noise |
| 3 | 3.6–6.6 | **Push-in to the language chips** (1.0→1.32); tap "Hindi" | "this is where it happens" |
| 4 | 6.6–10.0 | Step slides in; **follow the sprout** down the concern list (camera tilts with it); tap "Stress & burnout" | the software working through options |
| 5 | 10.0–12.0 | Results; **push-in on the card** as it rises; sprout lands on the card top; tap "Book" | the match, held a moment (music only) |
| 6 | 12.0–16.0 | Picker, medium; tap a day, then a time; Continue; **signature: the sprout rides Continue** as the bar whips up into the login sheet | moving floor: the booking carries it forward |
| 7 | 16.0–18.5 | **Close** on the six OTP boxes; the sprout hops box to box as digits fill (karaoke hops); toast "Welcome to Eunoia" | fast, light, done |
| 8 | 18.5–22.2 | **Push-in + vignette freeze** on "₹99 · first session"; near-silence first; tap "Pay securely" | the one promise to remember |
| 9 | 22.2–27.3 | **Pull back** to the whole confirmation; check draws; sprout on "You're booked."; new leaf on "taken it" | the whole thing done, in view |
| 10 | 27.3–32.0 | **Pixel wipe** to the calm lock screen; one notification lands; its icon (logo.png) grows into the end card; slow **drift** at rest | the bookend: one quiet notification instead of a pile |

Moves used: push-in, whip with blur, follow, spotlight freeze, pull-back, drift, pixel wipe (6 kinds).

## 8. Beat sheet (VO onsets from the waveform; Whisper words used inside lines)

| t | Picture | Sound |
|---|---|---|
| 0.00 | Night lock screen; first notification drops | buzz |
| 0.2 | VO "Some weeks…" | |
| 0.3–2.9 | Pile grows, faster (9 cards); camera pushes | buzz/ping pile, rising cluster |
| 2.72 | "loud": pile peaks; sprout peeks out at the base, leaves drooped, eyes up | |
| 3.20 | Touch swipe up; cards whip off | whoosh, then near-silence 3.25–3.45 |
| 3.45 | eunoia.care/find, light; sprout drops onto the h2 | piano's first chord (first sound after silence) |
| 3.5 | VO "Find a therapist who speaks your language," | |
| 5.0 | Camera settles on the chips | |
| 6.13 | Tap "Hindi"; chip turns active; sprout hops onto it | tap + chip note (square) |
| 6.40 | Step 2 slides in (real stepAnim x 40 → 0) | swish |
| 6.7 | VO "and gets what you're going through." | |
| 6.9–7.6 | Sprout walks down the cards' top edges, looking | 8-bit steps |
| 7.80 | Tap "Stress & burnout" | tap + square note |
| 9.27 | Results slide in: "Therapists who fit what you told us." · 4 matches | swish |
| 10.0 | Card rises (real motion); camera pushes | piano phrase |
| 10.67 | Sprout lands on the card top, leaves lift | chiptune answer (duet) |
| 11.33 | Tap "Book" | tap |
| 12.0 | Booking page; "A time that works for you." | |
| 12.3 | VO "Pick a time that works for you." | |
| 12.67 | Tap Fri 13 | tap |
| 13.33 | Tap 6:00 PM; the Continue bar reads "Fri, 13 Nov · 6:00 PM" | tap |
| 14.0 | Sprout hops onto the Continue button | 8-bit hop |
| 14.67 | Tap Continue (button press); bar + sprout whip up | whoosh (L-cut into login) |
| 16.0 | Login sheet: "Enter the 6-digit code sent to +91 98••• ••210" | |
| 16.3–17.9 | Six digits fill; sprout hops box to box | soft keys + rising square notes |
| 18.1 | Toast "Welcome to Eunoia" | soft chime |
| 18.3–18.7 | Near-silence | room tone |
| 18.5 | Details: "Your time" tile, "Your details · Secure checkout", Ananya, masked phone | |
| 18.7 | VO "Your first session: just ninety-nine rupees." | held pad |
| 19.3–20.3 | Push-in, vignette on the ₹99 block | |
| 20.50 | "ninety-nine": spotlight full; sprout eyes wide | single piano note |
| 21.12 | "rupees": sprout's leaves lift | one square note |
| 21.95 | Tap "Pay securely" | tap (J-cut: success chime starts) |
| 22.2 | Confirmation; SuccessMark ring + check draws (real) | chime, warm piano at 76 bpm |
| 22.4 | VO "That first step is the hardest. And you've taken it." | |
| 22.8 | "You're booked." lands; sprout hops onto its top edge | |
| 26.15 | "taken it": new leaf unfurls | chiptune arpeggio joins the piano |
| 27.3 | Pixel wipe to the calm lock screen; one notification slides in | the same buzz as the opening, single and soft |
| 27.6 | VO "Eunoia." The notification icon (logo) grows into the end card | resolve chord |
| 28.4 | "Eunoia" wordmark · "Find your way back to yourself." · eunoia.care | |
| 30.0 | "yourself": sprout settles, eyes close, breathing | piano + square in unison, final motif |
| 32.0 | Hold | ring out |

## 9. Cue map

Tempo map (piano rubato, chiptune locked to the beats):

| Section | Time | Tempo | Instruments | Hits |
|---|---|---|---|---|
| A Noise | 0–3.4 | no pulse | buzz/ping cluster, low detuned square drone rising | pile peak 2.72; whoosh 3.20; silence 3.25–3.45 |
| B Questions | 3.4–10.0 | 81.8 bpm (9 beats of 0.733 s) | Salamander piano: sparse Dmaj9 → Bm7 → Gmaj7 → A; square echoes on taps | taps on beats 4 (6.13) and 6 (7.80); results on beat 8 (9.27) |
| C Match | 10.0–12.0 | 90 bpm (3 beats) | piano phrase + square answer (duet) | card 10.0, landing 10.67, Book 11.33 |
| D Time | 12.0–16.0 | 90 bpm (6 beats) | piano with a moving left hand (quicker) | taps 12.67, 13.33; Continue 14.67 |
| E Code | 16.0–18.3 | 96 bpm, eighths | square arpeggio up the scale, one note per digit | digits 16.31 + n·0.3125 |
| F Promise | 18.3–22.2 | free | room tone, then a held pad (sine + soft piano D), single note on "ninety-nine" | 20.50, 21.12, 21.95 |
| G Booked | 22.2–27.3 | 76 bpm (0.789 s) | full warm piano; square arpeggio joins on beat 5 | check 22.4; leaf 26.15 |
| H End | 27.3–32 | ritardando | D major resolve; piano and square in unison; ring out | logo 27.6; "yourself" 29.96 |

That's one acceleration (B→E, 82→96) and one deceleration (F freeze, G 76, H rit.).

## 10. Sound design

| Section | Bed | Foley | Music |
|---|---|---|---|
| A | night room tone | phone buzzes and pings, layered and accelerating; swipe whoosh | dissonant square drone rising |
| B–C | light room tone | touch taps (soft glass tick), chip select, step swish, 8-bit steps/hops | piano, square echoes |
| D | room tone | taps, button press thock, whoosh on the ride (L-cut over the cut) | piano, quicker |
| E | room tone | digit key ticks, toast chime | square arpeggio |
| F | near-silence → pad | tap on Pay | pad, single notes |
| G | room tone | success chime (J-cut, starts under the Pay tap), leaf "bloom" 8-bit sparkle | warm piano + arpeggio |
| H | quiet night tone | one soft buzz (an echo of the opening) | resolve |

Two silences: 3.25–3.45 and 18.3–18.7. Sound transitions: whoosh L-cut (14.67→16.0) and success chime J-cut (21.95→22.2). Music is ducked about 10 dB under the voice, foley is kept off word onsets, and the master is −14 LUFS with true peak −1 dBTP.

## 11. Type

UI: Libre Caslon Text (headings) and Manrope (body) at the site's real sizes, weights and tracking. Captions: Manrope 800, 44 px, white on dark frosted glass. End card: Libre Caslon Text 700 "Eunoia" at 96 px; Manrope 600 tagline at 40 px; "eunoia.care" in Manrope 800 with 0.08 em tracking, accent #4A6B3A on white. Fonts are self-hosted in `fonts/` (OFL).
