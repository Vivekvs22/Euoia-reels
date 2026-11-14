"""Storyboard sheet: labelled key frames with safe-area guides.
Usage: python tools/storyboard.py <stills dir> <out.jpg>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent.parent
SHOTS = [  # (time, no, time range, framing / move, line)
    (0.0, "1", "0.0–2.2", "Hook on frame 1 · phone idle", "Card “Therapy? Not for me…”; sprout drooped on it.\nMusic only: piano pickup, questioning chiptune."),
    (3.0, "2", "2.2–3.6", "Card flip · answer below the card", "“It’s too expensive.” over the real ₹99 price block.\nVO: “Your first session? Ninety-nine rupees.”"),
    (4.8, "3", "3.6–6.2", "Strike → swipe → push-in", "Struck in the pause; sprout hops onto ₹99, happy.\nStab hit + marker squeak, off the words."),
    (7.95, "4", "6.2–10.2", "Tap strikes the card", "“They won’t get me.” · tap Hindi = strike.\nVO: “Pick the language you think in.”"),
    (10.8, "5", "10.2–11.6", "Card over the checkout", "“Someone will find out.” · Secure checkout,\nmasked +91 98••• ••210. Drums drop to half."),
    (12.7, "6", "11.6–14.6", "Tilt up to the promise", "“Confidential video session · secure payment”.\nVO: “Confidential, one-on-one video sessions.”"),
    (15.5, "7", "14.6–16.0", "Quick taps under the card", "“It’s too much effort.” · Thu 19 → 6:00 PM → Continue.\nVO: “A few taps, and you’re booked.”"),
    (17.4, "8", "16.0–19.1", "Strike → “You’re booked.”", "Ticket Thu 19 Nov · 6:00 PM; sprout on the heading.\nTa-da chord in the pause, full groove."),
    (21.0, "9", "19.1–23.0", "CTA card · logo end screen", "“Book your ₹99 first session” · eunoia.care (held 3.9 s).\nVO: “Eunoia. Find your way back to yourself.”"),
]
W, H = 432, 768          # 0.4 × 1080×1920
PAD, LAB = 18, 150


def font(size, weight="Bold"):
    f = ImageFont.truetype(str(HERE / "fonts" / "Manrope-VF.ttf"), size)
    try:
        f.set_variation_by_name(weight)
    except Exception:
        pass
    return f


def main():
    src, out = Path(sys.argv[1]), sys.argv[2]
    cols, rows = 3, 3
    sheet = Image.new("RGB", (cols * (W + PAD) + PAD, rows * (H + LAB + PAD) + PAD + 70), "#F3F5F0")
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 22), "Eunoia reel 2 · “But therapy isn’t for me…” · storyboard (23 s, 1080×1920, 30 fps) · dashed = safe-area limits", font=font(24), fill="#0C3B2E")
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
        d.text((x + 12, y + H + 10), f"{no}", font=font(30), fill="#C8643B")
        d.text((x + 44, y + H + 12), f"{rng} s", font=font(17), fill="#0C3B2E")
        d.text((x + 44, y + H + 34), framing, font=font(15, "SemiBold"), fill="#56763F")
        d.multiline_text((x + 12, y + H + 64), line, font=font(14, "Medium"), fill="#24302B", spacing=6)
    sheet.save(out, quality=90)
    print(out, sheet.size)


main()
