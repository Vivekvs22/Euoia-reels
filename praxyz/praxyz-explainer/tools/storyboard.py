"""Storyboard sheet: labelled key frames with safe-area guides.
Usage: python tools/storyboard.py <stills dir> <out.jpg>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent.parent
SHOTS = [  # (time, no, time range, framing / move, line)
    (0.0, "1", "0.0-0.8", "ECU, frame 1: Rohan's portrait", "The glow breathing. No black first frame."),
    (2.45, "2", "0.8-2.5", "Hook cuts in word by word (8ths, then 16ths)", "Your first client / won't wait / till you feel ready."),
    (3.7, "3", "2.5-5.0", "Hard cut: library, then one card per beat", "Ankita, Meera, Vikram, Rohan: name, age, category, difficulty."),
    (9.3, "4", "8.5-10.0", "ECU: the glow reacting to his voice", "ROHAN - AI PATIENT: I do not know... (no headline over the ECU)"),
    (12.6, "5", "10.0-16.5", "Transcript close / room, cut on the beat", "Real voice. Real pushback.  YOU: When did you start feeling that way?"),
    (17.1, "6", "16.5-17.5", "ECU: 78, digits lock on 16ths", "Flat green, no glow. Music lifts on the cut."),
    (21.0, "7", "17.5-23.0", "Full: ring + six skills (app Title Case)", "6 skills. Scored.  Bars fill on each beat."),
    (26.0, "8", "25.5-26.5", "Medium: the whole Moment Feedback sentence", "Nothing cut off before the close-up."),
    (26.9, "9", "26.5-27.5", "ECU: 2:14, isolated", "Frame edge sits in the gap: no partial words."),
    (32.4, "10", "31.5-33.5", "Close: Your Rank", "#12 - Skilled, whole card in frame."),
    (34.6, "11", "34.25-35.0", "ECU: Ishaan Rao + certificate title", "Inside the right safe line; description line excluded."),
    (40.5, "12", "38.0-43.0", "End card: wordmark on the cut, CTA word by word", "Start with 30 free minutes (only 'free' in teal) - praxyz.tech"),
]
W, H = 432, 768          # 0.4 × 1080×1920
PAD, LAB = 18, 150


def font(size, weight="Bold"):
    f = ImageFont.truetype(str(HERE / "fonts" / "DMSans-VF.ttf"), size)
    try:
        f.set_variation_by_name(weight)
    except Exception:
        pass
    return f


def main():
    src, out = Path(sys.argv[1]), sys.argv[2]
    cols, rows = 4, 3
    sheet = Image.new("RGB", (cols * (W + PAD) + PAD, rows * (H + LAB + PAD) + PAD + 70), "#EEF2F3")
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 22), "Praxyz explainer · polish cut · key frames (grain as in the final) · dashed = safe-area limits", font=font(24), fill="#00695C")
    for i, (t, no, rng, framing, line) in enumerate(SHOTS):
        c, r = i % cols, i // cols
        x, y = PAD + c * (W + PAD), 70 + PAD + r * (H + LAB + PAD)
        im = Image.open(src / f"sb_{t:g}.jpg").convert("RGB").resize((W, H), Image.LANCZOS)
        g = ImageDraw.Draw(im)
        s = W / 1080
        for (x0, y0, x1, y1) in [(0, 250 * s, W, 250 * s), (0, (1920 - 450) * s, W, (1920 - 450) * s), ((1080 - 140) * s, 0, (1080 - 140) * s, H)]:
            n = int(max(abs(x1 - x0), abs(y1 - y0)) // 8)
            for k in range(0, n, 2):
                a, b = k / n, (k + 1) / n
                g.line([(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a), (x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)], fill=(214, 72, 50), width=1)
        sheet.paste(im, (x, y))
        d.rounded_rectangle([x, y + H, x + W, y + H + LAB - 4], 0, fill="#FFFFFF")
        d.text((x + 12, y + H + 10), f"{no}", font=font(30), fill="#00BFA5")
        d.text((x + 44, y + H + 12), f"{rng} s", font=font(17), fill="#00695C")
        d.text((x + 44, y + H + 34), framing, font=font(15, "SemiBold"), fill="#00695C")
        d.multiline_text((x + 12, y + H + 64), line, font=font(14, "Medium"), fill="#24302B", spacing=6)
    sheet.save(out, quality=90)
    print(out, sheet.size)


main()
