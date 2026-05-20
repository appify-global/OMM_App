#!/usr/bin/env python3
"""Download a luxury glass residential tower from Unsplash, remove background, export hero cutout."""

from __future__ import annotations

import sys
import urllib.request
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
HERO = ROOT / "public" / "hero"

# Luxury glass residential high-rise — balconies + glass facade (Unsplash License)
# https://unsplash.com/photos/4ZeTJcaspAk (Aalo Lens)
SOURCE_URL = (
    "https://images.unsplash.com/photo-1758448511487-15f69dd6107b"
    "?auto=format&fit=crop&w=2200&q=92"
)
SOURCE_PATH = HERO / "tower-source.jpg"
OUT_PATH = HERO / "tower.png"


def crop_for_hero(im: Image.Image) -> Image.Image:
    """FIND-style: zoom into the top few floors, wide framing — not full tower."""
    w, h = im.size
    # Tight: middle-upper portion only, full width
    left, right = 0, w
    top = int(h * 0.18)
    bottom = int(h * 0.62)
    return im.crop((left, top, right, bottom))


def apply_sunset_grade(im: Image.Image) -> Image.Image:
    """Warm the building so it reads like golden hour, not flat daylight."""
    rgba = np.array(im).astype(np.float32)
    rgb, alpha = rgba[..., :3], rgba[..., 3:4]
    # Warm tint: lift R, slight lift G, dampen B
    rgb[..., 0] = np.clip(rgb[..., 0] * 1.08 + 8, 0, 255)
    rgb[..., 1] = np.clip(rgb[..., 1] * 1.02 + 2, 0, 255)
    rgb[..., 2] = np.clip(rgb[..., 2] * 0.92, 0, 255)
    out = Image.fromarray(np.concatenate([rgb, alpha], axis=2).astype(np.uint8))
    out = ImageEnhance.Contrast(out).enhance(1.06)
    out = ImageEnhance.Color(out).enhance(1.12)
    return out


def trim_alpha(im: Image.Image, pad: int = 10) -> Image.Image:
    arr = np.array(im)
    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 12)
    if len(xs) == 0:
        return im
    x0, x1 = max(0, xs.min() - pad), min(im.width, xs.max() + pad)
    y0, y1 = max(0, ys.min() - pad), min(im.height, ys.max() + pad)
    return im.crop((x0, y0, x1, y1))


def crop_bottom_fringe(im: Image.Image, threshold: int = 20) -> Image.Image:
    arr = np.array(im)
    h = arr.shape[0]
    cut = h
    for y in range(h - 1, max(0, h - 48), -1):
        if arr[y, :, 3].max() > threshold:
            cut = y + 1
            break
    if cut < h:
        return im.crop((0, 0, im.width, cut))
    return im


def normalize_hero_proportions(im: Image.Image, min_ratio: float = 1.85) -> Image.Image:
    w, h = im.size
    ratio = w / h
    if ratio >= min_ratio:
        return im
    target_w = int(h * min_ratio)
    pad = (target_w - w) // 2
    canvas = Image.new("RGBA", (target_w, h), (0, 0, 0, 0))
    canvas.paste(im, (pad, 0), im)
    return canvas


def main() -> None:
    HERO.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {SOURCE_URL} …")
    urllib.request.urlretrieve(SOURCE_URL, SOURCE_PATH)

    src = Image.open(SOURCE_PATH).convert("RGB")
    print(f"Source size: {src.size}")
    src = crop_for_hero(src)
    print(f"Cropped size: {src.size}")

    print("Removing background (rembg) …")
    cutout = remove(src)
    if isinstance(cutout, bytes):
        cutout = Image.open(BytesIO(cutout)).convert("RGBA")
    else:
        cutout = cutout.convert("RGBA")

    cutout = trim_alpha(cutout)
    cutout = crop_bottom_fringe(cutout)
    cutout = normalize_hero_proportions(cutout)
    cutout = apply_sunset_grade(cutout)

    target_w = 1600
    if cutout.width != target_w:
        ratio = target_w / cutout.width
        target_h = max(1, int(cutout.height * ratio))
        cutout = cutout.resize((target_w, target_h), Image.Resampling.LANCZOS)

    cutout.save(OUT_PATH, optimize=True)
    print(f"Saved {OUT_PATH} ({cutout.size[0]}×{cutout.size[1]})")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
