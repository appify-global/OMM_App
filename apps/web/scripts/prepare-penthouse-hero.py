#!/usr/bin/env python3
"""Convert white-background penthouse render → transparent PNG (preserves cream walls)."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
HERO = ROOT / "public" / "hero"
SOURCE = HERO / "penthouse-source.png"
OUT = HERO / "penthouse.png"


def key_background(im: Image.Image) -> Image.Image:
    """Auto-detect white or black background, key it out, preserve building."""
    src = im.convert("RGBA") if im.mode != "RGBA" else im
    arr = np.array(src).astype(np.int16)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

    # Sample the 4 corners to figure out background colour
    corners = [
        (r[0, 0], g[0, 0], b[0, 0]),
        (r[0, -1], g[0, -1], b[0, -1]),
        (r[-1, 0], g[-1, 0], b[-1, 0]),
        (r[-1, -1], g[-1, -1], b[-1, -1]),
    ]
    avg = np.mean(corners, axis=0)
    bg_is_white = avg.mean() > 200
    print(f"Detected background: {'white' if bg_is_white else 'black'} (corner avg={avg})")

    spread = np.maximum.reduce([np.abs(r - g), np.abs(g - b), np.abs(r - b)])

    if bg_is_white:
        # Wider threshold catches the soft halo around trees/edges
        is_bg = (r > 230) & (g > 230) & (b > 230) & (spread < 18)
        luma = (0.299 * r + 0.587 * g + 0.114 * b)
        # Steeper ramp: anything > 215 luma fades to transparent
        soft = np.clip((230 - luma) * 8, 0, 255).astype(np.uint8)
        alpha = np.where(is_bg, 0, soft).astype(np.uint8)
        # Floor solid building pixels at 255 (anything clearly not background)
        solid = (luma < 200) & ~is_bg
        alpha = np.where(solid, 255, alpha).astype(np.uint8)
    else:
        # Black/dark background: alpha from luma
        luma = (0.299 * r + 0.587 * g + 0.114 * b)
        is_bg = (r < 18) & (g < 18) & (b < 18) & (spread < 8)
        soft = np.clip((luma - 8) * 6, 0, 255).astype(np.uint8)
        alpha = np.where(is_bg, 0, np.maximum(soft, 220)).astype(np.uint8)

    # Respect any pre-existing alpha mask
    if im.mode == "RGBA":
        alpha = np.minimum(alpha, a).astype(np.uint8)

    rgba = np.dstack([arr[..., :3].astype(np.uint8), alpha])
    out = Image.fromarray(rgba, "RGBA")

    # Slight alpha blur softens any remaining halo / aliased pixels
    r2, g2, b2, a2 = out.split()
    a2 = a2.filter(ImageFilter.GaussianBlur(radius=0.7))
    return Image.merge("RGBA", (r2, g2, b2, a2))


def trim_alpha(im: Image.Image, pad: int = 4) -> Image.Image:
    arr = np.array(im)
    alpha = arr[..., 3]
    ys, xs = np.where(alpha > 20)
    if len(xs) == 0:
        return im
    x0, x1 = max(0, xs.min() - pad), min(im.width, xs.max() + pad)
    y0, y1 = max(0, ys.min() - pad), min(im.height, ys.max() + pad)
    return im.crop((x0, y0, x1, y1))


def main() -> None:
    if not SOURCE.exists():
        print(f"Missing {SOURCE}", file=sys.stderr)
        sys.exit(1)

    src = Image.open(SOURCE)
    print(f"Source: {src.size} mode={src.mode}")

    cutout = key_background(src)
    cutout = trim_alpha(cutout)

    cutout.save(OUT, optimize=True)
    print(f"Saved {OUT} ({cutout.size[0]}×{cutout.size[1]})")


if __name__ == "__main__":
    main()
