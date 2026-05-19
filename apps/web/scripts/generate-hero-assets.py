#!/usr/bin/env python3
"""Build transparent hero layers from FIND reference composites (one-time)."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
HERO = PUBLIC / "hero"
BUILDING_SRC = PUBLIC / "clouds" / "cloud-layer.png"
CLOUDS_SRC = PUBLIC / "clouds" / "cloud-mist.png"
OUT_BUILDING = HERO / "building.png"
OUT_CLOUD_BACK = HERO / "clouds-back.png"
OUT_CLOUD_FRONT = HERO / "clouds-front.png"


def make_cloud_canvas(width: int, height: int, seed: int) -> Image.Image:
    """Soft photographic-style cloud strip with real alpha."""
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    rng = np.random.default_rng(seed)
    blobs = [
        (0.50, 0.72, 0.55, 0.22),
        (0.22, 0.78, 0.32, 0.16),
        (0.78, 0.76, 0.36, 0.18),
        (0.38, 0.84, 0.28, 0.12),
        (0.62, 0.86, 0.30, 0.13),
        (0.12, 0.68, 0.22, 0.11),
        (0.88, 0.70, 0.24, 0.12),
    ]
    for cx, cy, rx, ry in blobs:
        w = int(width * rx * 2)
        h = int(height * ry * 2)
        x = int(width * cx - w / 2)
        y = int(height * cy - h / 2)
        layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.ellipse((x, y, x + w, y + h), fill=(255, 255, 255, int(200 + rng.integers(-25, 25))))
        layer = layer.filter(ImageFilter.GaussianBlur(radius=max(18, width // 28)))
        canvas = Image.alpha_composite(canvas, layer)
    return canvas


def extract_clouds_from_reference(path: Path, band: tuple[float, float]) -> Image.Image:
    """Pull bright cloud pixels from reference strip (y0–y1 as fractions)."""
    ref = Image.open(path).convert("RGBA")
    w, h = ref.size
    y0, y1 = int(h * band[0]), int(h * band[1])
    strip = ref.crop((0, y0, w, y1))
    arr = np.array(strip.convert("RGB"), dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    brightness = (r + g + b) / 3.0
    whiteness = np.minimum(r, np.minimum(g, b))
    # white fluffy clouds, not blue sky or brick
    mask = (brightness > 175) & (whiteness > 150) & (np.abs(r - g) < 35)
    alpha = np.clip((brightness - 160) * 3.2, 0, 255).astype(np.uint8)
    alpha = (alpha.astype(np.float32) * mask).astype(np.uint8)
    rgba = np.dstack([arr.astype(np.uint8), alpha])
    out = Image.fromarray(rgba, "RGBA")
    out = out.filter(ImageFilter.GaussianBlur(radius=1))
    return out


def cutout_building(path: Path) -> Image.Image:
    """Crop penthouse and key out sky (RGBA cutout)."""
    ref = Image.open(path).convert("RGB")
    w, h = ref.size
    crop = ref.crop((int(w * 0.10), int(h * 0.48), int(w * 0.90), int(h * 0.78)))
    arr = np.array(crop, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    brightness = (r + g + b) / 3.0
    is_sky = (b > r + 12) & (b > g - 5) & (brightness > 95)
    is_haze = brightness > 210
    alpha = np.where(is_sky | is_haze, 0, 255).astype(np.uint8)
    rgba = np.dstack([arr.astype(np.uint8), alpha])
    return Image.fromarray(rgba)


def main() -> None:
    HERO.mkdir(parents=True, exist_ok=True)

    print("→ building.png (cutout)")
    building = cutout_building(BUILDING_SRC)
    building.save(OUT_BUILDING, optimize=True)

    print("→ clouds-back.png")
    back = make_cloud_canvas(1440, 420, seed=7)
    back.save(OUT_CLOUD_BACK, optimize=True)

    print("→ clouds-front.png")
    front = make_cloud_canvas(1440, 360, seed=11)
    front.save(OUT_CLOUD_FRONT, optimize=True)

    print("Done:", HERO)


if __name__ == "__main__":
    main()
