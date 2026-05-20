#!/usr/bin/env python3
"""Generate MATCH logo + M-icon favicon assets from the brand master file."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
# Master logo dropped in Cursor assets (JPEG); copy to public after processing.
SRC = PUBLIC / "match-logo-source.jpg"
# Cursor-uploaded master (outside repo) — used when seeding public for the first time
SRC_UPLOAD = Path(
    "/Users/mennanyelkenci/.cursor/projects/"
    "Users-mennanyelkenci-Documents-appify-all-omm-docs-omm-code-OMM-App/assets/"
    "logo-file-401dd167-fb04-42ef-9b28-4d4d10aef7b2.png"
)


def _is_ink(r: int, g: int, b: int, threshold: int = 235) -> bool:
    return r < threshold and g < threshold and b < threshold


def extract_icon_bounds(img: Image.Image) -> tuple[int, int, int, int]:
    """Crop the left M mark before the wordmark gap."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    col_counts = []
    for x in range(w):
        n = 0
        for y in range(h):
            r, g, b = rgb.getpixel((x, y))
            if _is_ink(r, g, b):
                n += 1
        col_counts.append(n)

    # Wordmark gap: consecutive columns with almost no ink between icon and text
    gap_start = None
    gap_end = None
    for x in range(int(w * 0.25), int(w * 0.7)):
        if col_counts[x] < h * 0.02:
            if gap_start is None:
                gap_start = x
            gap_end = x
        elif gap_start is not None and col_counts[x] > h * 0.05:
            break

    right = gap_start if gap_start and gap_start > w * 0.2 else int(w * 0.42)

    # Vertical bounds from ink in icon region only
    top, bottom = h, 0
    left = 0
    for y in range(h):
        for x in range(right):
            r, g, b = rgb.getpixel((x, y))
            if _is_ink(r, g, b):
                top = min(top, y)
                bottom = max(bottom, y)
                left = min(left, x) if y == top else left

    pad = int(h * 0.04)
    return (
        max(0, left - pad),
        max(0, top - pad),
        min(w, right + pad),
        min(h, bottom + pad),
    )


def to_square(img: Image.Image, fill: tuple[int, int, int] = (255, 255, 255)) -> Image.Image:
    w, h = img.size
    side = max(w, h)
    out = Image.new("RGB", (side, side), fill)
    ox = (side - w) // 2
    oy = (side - h) // 2
    out.paste(img, (ox, oy))
    return out


def write_ico(path: Path, sizes: list[int], source: Image.Image) -> None:
    images = [source.resize((s, s), Image.Resampling.LANCZOS) for s in sizes]
    images[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )


def main() -> None:
    src = SRC_UPLOAD if SRC_UPLOAD.exists() else SRC
    if not src.exists():
        raise SystemExit(f"Missing logo source (add {SRC} or upload asset)")

    master = Image.open(src).convert("RGB")
    master.save(PUBLIC / "match-logo.png", format="PNG", optimize=True)

    bounds = extract_icon_bounds(master)
    icon = master.crop(bounds)
    icon_sq = to_square(icon)

    icon_sq.save(PUBLIC / "match-icon.png", format="PNG", optimize=True)

    for size, name in [
        (16, "favicon-16.png"),
        (32, "favicon-32.png"),
        (180, "apple-touch-icon.png"),
        (192, "icon-192.png"),
        (512, "icon-512.png"),
    ]:
        icon_sq.resize((size, size), Image.Resampling.LANCZOS).save(
            PUBLIC / name, format="PNG", optimize=True
        )

    write_ico(PUBLIC / "favicon.ico", [16, 32, 48], icon_sq)

    # Simple SVG favicon — white tile + embedded icon reference for crisp scaling
    (PUBLIC / "favicon.svg").write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="MATCH">
  <rect width="32" height="32" fill="#fff"/>
  <image href="/match-icon.png" width="28" height="28" x="2" y="2"/>
</svg>
""",
        encoding="utf-8",
    )

    print("Wrote match-logo.png, match-icon.png, and favicons to", PUBLIC)


if __name__ == "__main__":
    main()
