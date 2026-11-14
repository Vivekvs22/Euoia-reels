# Euoia-reels

Short vertical reels for Eunoia (eunoia.care), made entirely in code.

## eunoia-booking-reel: "The quiet path"

32 s · 1080×1920 · 30 fps. The booking flow of the Eunoia website (find a therapist → pick a time → verify → ₹99 first session → booked), redrawn from the site's real React UI inside a phone frame, with a pixel sprout mascot and the client's own narration.

| File | What |
|---|---|
| `eunoia-booking-reel/eunoia-booking-reel.mp4` | the finished reel (−14 LUFS) |
| `eunoia-booking-reel/eunoia-booking-reel.srt` | subtitles |
| `eunoia-booking-reel/poster.jpg`, `cover-booked.jpg` | cover frames |
| `eunoia-booking-reel/storyboard.jpg`, `TREATMENT.md` | the approved plan |
| `eunoia-booking-reel/CREDITS` | third-party material and licences (the Salamander piano is CC BY 3.0: credit it where the reel is posted) |
| `voiceover/` | narration and timing |

### Rebuild

Needs Node 20+, ffmpeg 7+, Python 3.11+, and the Lemo-Opuscar film library with its packages and the `salamander` piano samples installed.

```sh
LIB=/path/to/lemo-opuscar sh eunoia-booking-reel/build.sh
```

Source: `index.html`, `main.js` (render loop), `film.js` (timeline), `ui.js` (Eunoia screens), `sprout.js` (mascot), `sound.py` (score, foley, mix).

## eunoia-reel-objections: "But therapy isn't for me…"

23 s · 1080×1920 · 30 fps · second reel in the series. Four common reasons people put off therapy, each shown as a large on-screen card and answered by the real booking screen (₹99 first session, your language, confidential checkout, a few taps to booked), ending on "Book your ₹99 first session · eunoia.care". Built to work on mute; new F-major score.

| File | What |
|---|---|
| `eunoia-reel-objections/eunoia-reel-objections.mp4` | the finished reel (−14 LUFS) |
| `eunoia-reel-objections/eunoia-reel-objections.srt` | subtitles (exact script text) |
| `eunoia-reel-objections/poster.jpg` | cover frame (the hook) |
| `eunoia-reel-objections/storyboard.jpg`, `TREATMENT.md`, `CREDITS` | plan and licences |
| `voiceover-reel2/` | narration and timing |

Rebuild: `LIB=/path/to/lemo-opuscar sh eunoia-reel-objections/build.sh`
