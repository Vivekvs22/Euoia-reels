#!/bin/sh
# One command: events → picture → score/foley/voice mix → −14 LUFS mux → .srt → cover frames.
# Run from Git Bash:  sh build.sh
set -e
LIB=${LIB:-/d/devtools/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=praxyz-simulator
export LIB PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-'D:\devtools\ms-playwright'}
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 30 --size 1080x1920 --workers 3 --out "$HERE/out/video.mp4"
"$PY" "$HERE/sound.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 30 3   # film grain (strength 3; keeps the file under ~25 MB) added in ffmpeg
# subtitles: the same cues the page burns in (exported with the events), plus the end-card line
"$PY" -c "import json,sys; e=json.load(open(sys.argv[1],encoding='utf-8'))['ev']; json.dump([{'t0':x['t'],'t1':x['t1'],'text':x['text']} for x in e if x['type']=='sub'],open(sys.argv[2],'w',encoding='utf-8'),ensure_ascii=False)" "$HERE/events.json" "$HERE/out/cues.json"
"$PY" core/render/srt.py "$HERE/out/cues.json" "$HERE/$NAME.srt"
# cover frame: the full hook (readable from frame 1), with the film's grain
node core/render/still.mjs "$HERE" 1.5 --prefix cover_ --size 1080x1920 --out "$HERE/out"
ffmpeg -hide_banner -loglevel error -y -i "$HERE/out/cover_1.5.jpg" -vf "noise=c0s=4:allf=t" -q:v 2 "$HERE/poster.jpg"   # same grain as the film
echo "done: $HERE/$NAME.mp4"
