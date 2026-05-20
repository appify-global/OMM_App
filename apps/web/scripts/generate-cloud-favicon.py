#!/usr/bin/env python3
"""Generate favicon assets from hero/cloud.png (MATCH sky + cloud UI)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SRC = PUBLIC / "hero" / "cloud.png"
SKY = (95, 168, 222)  # #5fa8de — matches about-hero / hero sky


def load_cloud_square() -> Image.Image:
    img = Image.open(SRC).convert("RGB")
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    square = img.crop((left, top, left + side, top + side))

    # Swap near-black sky plate for brand sky blue
    px = square.load()
    for y in range(square.height):
        for x in range(square.width):
            r, g, b = px[x, y]
            if r < 48 and g < 48 and b < 48:
                px[x, y] = SKY
    return square


def write_png_rgba(path: Path, img: Image.Image) -> None:
    img.save(path, format="PNG", optimize=True)


def write_ico(path: Path, sizes: list[int], source: Image.Image) -> None:
    images = [source.resize((s, s), Image.Resampling.LANCZOS) for s in sizes]
    images[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )


def write_favicon_svg(path: Path) -> None:
    """Vector favicon — cloud ellipses on MATCH sky (matches hero cloud UI)."""
    path.write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="MATCH">
  <rect width="32" height="32" fill="#5fa8de"/>
  <ellipse cx="16" cy="17" rx="11" ry="6.5" fill="#fff" fill-opacity="0.96"/>
  <ellipse cx="10" cy="19" rx="5.5" ry="3.8" fill="#fff" fill-opacity="0.92"/>
  <ellipse cx="22" cy="18.5" rx="6" ry="4" fill="#fff" fill-opacity="0.9"/>
  <ellipse cx="16" cy="20.5" rx="7" ry="2.8" fill="#fff" fill-opacity="0.88"/>
</svg>
""",
        encoding="utf-8",
    )


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source image: {SRC}")

    cloud = load_cloud_square()

    write_png_rgba(PUBLIC / "favicon-16.png", cloud.resize((16, 16), Image.Resampling.LANCZOS))
    write_png_rgba(PUBLIC / "favicon-32.png", cloud.resize((32, 32), Image.Resampling.LANCZOS))
    write_png_rgba(
        PUBLIC / "apple-touch-icon.png",
        cloud.resize((180, 180), Image.Resampling.LANCZOS),
    )
    write_png_rgba(PUBLIC / "icon-192.png", cloud.resize((192, 192), Image.Resampling.LANCZOS))
    write_png_rgba(PUBLIC / "icon-512.png", cloud.resize((512, 512), Image.Resampling.LANCZOS))
    write_ico(PUBLIC / "favicon.ico", [16, 32, 48], cloud)
    write_favicon_svg(PUBLIC / "favicon.svg")

    print("Wrote cloud favicons to", PUBLIC)


if __name__ == "__main__":
    main()
