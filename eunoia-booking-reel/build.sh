#!/bin/sh
# One command: events → picture → score/foley/voice mix → −14 LUFS mux → .srt → cover frames.
# Run from Git Bash:  sh build.sh
set -e
LIB=${LIB:-/d/devtools/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=eunoia-booking-reel
export LIB PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-'D:\devtools\ms-playwright'}
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 30 --size 1080x1920 --workers 3 --out "$HERE/out/video.mp4"
"$PY" "$HERE/sound.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 30 0
# subtitles: the same cues the page burns in (exported with the events), plus the end-card line
"$PY" -c "import json,sys; e=json.load(open(sys.argv[1],encoding='utf-8'))['ev']; json.dump([{'t0':x['t'],'t1':x['t1'],'text':x['text']} for x in e if x['type']=='sub'],open(sys.argv[2],'w',encoding='utf-8'),ensure_ascii=False)" "$HERE/events.json" "$HERE/out/cues.json"
"$PY" core/render/srt.py "$HERE/out/cues.json" "$HERE/$NAME.srt"
# cover frames: the end card (poster.jpg) and "You're booked." with the new leaf (cover-booked.jpg)
node core/render/still.mjs "$HERE" 29.6 26.9 --prefix cover_ --size 1080x1920 --out "$HERE/out"
cp "$HERE/out/cover_29.6.jpg" "$HERE/poster.jpg"
cp "$HERE/out/cover_26.9.jpg" "$HERE/cover-booked.jpg"
echo "done: $HERE/$NAME.mp4"
