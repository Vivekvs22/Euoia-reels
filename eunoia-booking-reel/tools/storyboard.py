"""Storyboard sheet: labelled key frames with safe-area guides.
Usage: python tools/storyboard.py <stills dir> <out.jpg>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent.parent
SHOTS = [  # (time, no, time range, framing / move, line)
    (2.95, "1", "0.0–3.4", "Medium · slow push-in", "Notifications pile up; the sprout peeks out, wilted.\nVO: “Some weeks, everything feels too loud.”"),
    (5.95, "2", "3.4–6.6", "Swipe-unlock → push-in to chips", "Tap “Hindi”; the sprout hops onto it.\nVO: “Find a therapist who speaks your language,”"),
    (7.95, "3", "6.6–10.0", "Follow the sprout down the list", "Tap “Stress & burnout” (real counts for Hindi).\nVO: “…and gets what you’re going through.”"),
    (10.95, "4", "10.0–12.0", "Push-in on the match", "Real card layout + tags, botanical avatar, no name.\nMusic only: piano phrase, chiptune answer."),
    (14.55, "5", "12.0–16.0", "Medium · day → time → Continue", "Fri 13 · 6:00 PM; the sprout rides the Continue press.\nVO: “Pick a time that works for you.”"),
    (17.25, "6", "16.0–18.5", "Whip up · close on the code", "Karaoke hops, one per digit; masked +91 98••• ••210.\nMusic only: square arpeggio, key HUD."),
    (20.6, "7", "18.5–22.2", "Push-in + vignette freeze", "“₹99 · first session” · Pay securely. Near-silence first.\nVO: “Your first session: just ninety-nine rupees.”"),
    (26.75, "8", "22.2–27.3", "Pull back to the confirmation", "“You’re booked.” A new leaf unfurls on “taken it”.\nVO: “That first step is the hardest. And you’ve taken it.”"),
    (29.6, "9", "27.3–32.0", "Pixel wipe → one calm notification → end card", "Its icon grows into the logo; the sprout rests on it.\nVO: “Eunoia. Find your way back to yourself.”"),
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
    d.text((PAD, 22), "Eunoia · “The quiet path” · storyboard (32 s, 1080×1920, 30 fps) · dashed = safe-area limits", font=font(24), fill="#0C3B2E")
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
