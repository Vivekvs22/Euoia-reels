"""Storyboard sheet: labelled key frames with safe-area guides.
Usage: python tools/storyboard.py <stills dir> <out.jpg>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent.parent
SHOTS = [  # (time, no, time range, framing / move, line)
    (0.0, "1", "0.00-3.98", "Hook on frame 1, slow push, whip out", "Pilots train in simulators. / Therapists start on real people."),
    (4.6, "2", "4.45", "Pre-flight burst: ECU PATIENT + light sweep", "Cells snap one per beat; everything else sinks into the dark."),
    (5.95, "3", "5.86", "ECU TIMER switches on", "Values 76 px (2x), labels 28 px, 2x2 strip."),
    (6.55, "4", "6.33-6.80", "Fast pull-back (motion blur) to the full panel", "Window tilted in space: shadow, glass reflection, parallax."),
    (7.3, "5", "7.03-7.50", "Take-off: LIVE, timer running", "Strip kept clear of the caption lane."),
    (8.05, "6", "7.97", "TURBULENCE: amber pulse + 3 px shake + punch-in", "On the warning tone; Rohan held, slow push."),
    (10.3, "7", "9.38-11.25", "Whip into the Live Transcript", "Your simulator.  Both lines whole."),
    (13.8, "8", "13.59-13.83", "Touchdown: the score ring flies forward", "Accelerating toward the lens, digits rolling."),
    (14.2, "9", "13.83-14.30", "Impact: big 81, teal particles, slow motion", "LANDING REPORT - SESSION 7"),
    (16.9, "10", "14.53-18.05", "Debrief: score card, eased push to six skills", "App Title Case; window fitted to the grid."),
    (19.8, "11", "19.62-19.92", "4.2 h slides aside like a panel", "...revealing the certificate behind it."),
    (22.6, "12", "22.03-26.00", "Wordmark light sweep, CTA rises", "Start with 30 free minutes - praxyz.tech"),
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
    d.text((PAD, 22), "Praxyz reel B · premium cut · key frames (grain as in the final) · dashed = safe-area limits", font=font(24), fill="#00695C")
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
