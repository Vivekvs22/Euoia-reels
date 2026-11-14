"""Align the user's narration with faster-whisper: word timings -> voice/words.json.

Usage: python tools/align.py <narration.wav> <out.json> [model]
"""
import json
import sys

from faster_whisper import WhisperModel

src, out = sys.argv[1], sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "small.en"
model = WhisperModel(model_name, device="cpu", compute_type="int8")
segments, _ = model.transcribe(
    src,
    language="en",
    word_timestamps=True,
    beam_size=5,
    vad_filter=False,
    initial_prompt="Eunoia. Find a therapist who speaks your language.",
)
words, lines = [], []
for seg in segments:
    lines.append({"t0": round(seg.start, 3), "t1": round(seg.end, 3), "text": seg.text.strip()})
    for w in seg.words:
        words.append({"t0": round(w.start, 3), "t1": round(w.end, 3), "w": w.word.strip(), "p": round(w.probability, 3)})
json.dump({"segments": lines, "words": words}, open(out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
for l in lines:
    print(f"{l['t0']:6.2f}-{l['t1']:6.2f}  {l['text']}")
print()
print(" ".join(f"{w['w']}@{w['t0']:.2f}" for w in words))
