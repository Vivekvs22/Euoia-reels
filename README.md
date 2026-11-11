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
