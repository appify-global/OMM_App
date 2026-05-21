#!/usr/bin/env python3
"""Generate MATCH logo + M-icon favicon assets from the brand master file.

The source can ship on either a black or white background. We auto-detect,
strip the background, and produce transparent PNGs in brand charcoal so the
logo sits cleanly on the sky hero, white panels, etc.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SRC = PUBLIC / "match-logo-source.jpg"
# Latest Cursor-uploaded master.
SRC_UPLOAD = Path(
    "/Users/mennanyelkenci/.cursor/projects/"
    "Users-mennanyelkenci-Documents-appify-all-omm-docs-omm-code-OMM-App/assets/"
    "logo-file-0077500d-4949-4e2f-8905-66ac88c61d14.png"
)

# Brand charcoal — matches the source ink so colour stays consistent.
INK = (15, 23, 42)


def _sample_background(rgb: Image.Image) -> tuple[int, int, int]:
    w, h = rgb.size
    pts = [
        rgb.getpixel((1, 1)),
        rgb.getpixel((w - 2, 1)),
        rgb.getpixel((1, h - 2)),
        rgb.getpixel((w - 2, h - 2)),
        rgb.getpixel((w // 2, 1)),
        rgb.getpixel((w // 2, h - 2)),
    ]
    r = sum(p[0] for p in pts) // len(pts)
    g = sum(p[1] for p in pts) // len(pts)
    b = sum(p[2] for p in pts) // len(pts)
    return (r, g, b)


def to_transparent_ink(img: Image.Image) -> Image.Image:
    """RGBA with the detected background knocked out and ink normalised.

    Works for the current dark-on-near-black master (the navy ink is only a
    few luminance steps brighter than the background) as well as future
    white-background sources.
    """
    rgb = img.convert("RGB")
    w, h = rgb.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    src = rgb.load()
    dst = out.load()
    ink_r, ink_g, ink_b = INK

    bg_r, bg_g, bg_b = _sample_background(rgb)
    # Pre-scan to find the maximum colour distance from background so we can
    # normalise alpha — the dark master only has ~50 units of contrast.
    max_dist = 1.0
    for y in range(0, h, 3):
        for x in range(0, w, 3):
            r, g, b = src[x, y]
            d = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
            if d > max_dist:
                max_dist = d

    # Anything within ~12% of max distance is treated as background noise.
    cutoff = max(8.0, max_dist * 0.12)

    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            d = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
            if d <= cutoff:
                continue
            alpha = min(255, int(((d - cutoff) / (max_dist - cutoff)) * 255 * 1.05))
            if alpha < 12:
                continue
            dst[x, y] = (ink_r, ink_g, ink_b, alpha)
    return out


def trim_alpha(img: Image.Image, pad_ratio: float = 0.04) -> Image.Image:
    bbox = img.getbbox()
    if bbox is None:
        return img
    cropped = img.crop(bbox)
    w, h = cropped.size
    pad_x = int(w * pad_ratio)
    pad_y = int(h * pad_ratio)
    padded = Image.new("RGBA", (w + pad_x * 2, h + pad_y * 2), (0, 0, 0, 0))
    padded.paste(cropped, (pad_x, pad_y), cropped)
    return padded


def extract_icon(logo_rgba: Image.Image) -> Image.Image:
    """Crop the left M mark.

    The geometric M has wide internal voids, so a naive 'first big gap' scan
    will split it in half. Instead we find the LARGEST empty column run that
    sits within the 15%–55% horizontal window — that's reliably the
    icon→wordmark separator.
    """
    w, h = logo_rgba.size
    alpha = logo_rgba.split()[-1].load()
    col_empty = [
        sum(1 for y in range(h) if alpha[x, y] > 32) <= max(1, int(h * 0.01))
        for x in range(w)
    ]

    lo = int(w * 0.15)
    hi = int(w * 0.55)

    best_len = 0
    best_end = None
    cur_len = 0
    cur_start = None
    for x in range(lo, hi):
        if col_empty[x]:
            if cur_start is None:
                cur_start = x
            cur_len += 1
            if cur_len > best_len:
                best_len = cur_len
                best_end = x
        else:
            cur_start = None
            cur_len = 0

    if best_end is not None and best_len >= max(6, int(h * 0.05)):
        split = best_end - best_len + 1  # start of the gap
        return trim_alpha(logo_rgba.crop((0, 0, split, h)), pad_ratio=0.08)

    return trim_alpha(logo_rgba.crop((0, 0, int(w * 0.30), h)), pad_ratio=0.08)


def to_square_alpha(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = max(w, h)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.paste(img, ((side - w) // 2, (side - h) // 2), img)
    return out


def write_ico(path: Path, sizes: list[int], source: Image.Image) -> None:
    """ICO needs an opaque white tile under the ink so it shows on dark bars."""
    flattened = []
    for s in sizes:
        layer = source.resize((s, s), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (s, s), (255, 255, 255, 255))
        canvas.paste(layer, (0, 0), layer)
        flattened.append(canvas)
    flattened[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=flattened[1:],
    )


def main() -> None:
    src = SRC_UPLOAD if SRC_UPLOAD.exists() else SRC
    if not src.exists():
        raise SystemExit(f"Missing logo source (add {SRC} or upload asset)")

    # Snapshot source for repeatable rebuilds.
    Image.open(src).convert("RGB").save(
        PUBLIC / "match-logo-source.jpg", format="JPEG", quality=92
    )

    master = Image.open(src).convert("RGB")
    logo_full = to_transparent_ink(master)
    logo_rgba = trim_alpha(logo_full, pad_ratio=0.05)
    logo_rgba.save(PUBLIC / "match-logo.png", format="PNG", optimize=True)

    # Run icon extraction against the already-trimmed logo so percentages
    # map to the real artwork, not the padded master canvas.
    icon_rgba = extract_icon(trim_alpha(logo_full, pad_ratio=0.0))
    icon_sq = to_square_alpha(icon_rgba)
    icon_sq.save(PUBLIC / "match-icon.png", format="PNG", optimize=True)

    for size, name in [
        (16, "favicon-16.png"),
        (32, "favicon-32.png"),
        (180, "apple-touch-icon.png"),
        (192, "icon-192.png"),
        (512, "icon-512.png"),
    ]:
        layer = icon_sq.resize((size, size), Image.Resampling.LANCZOS)
        if name == "apple-touch-icon.png":
            # Apple home-screen tile needs an opaque background.
            canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
            canvas.paste(layer, (0, 0), layer)
            canvas.save(PUBLIC / name, format="PNG", optimize=True)
        else:
            layer.save(PUBLIC / name, format="PNG", optimize=True)

    write_ico(PUBLIC / "favicon.ico", [16, 32, 48], icon_sq)

    (PUBLIC / "favicon.svg").write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="MATCH">
  <rect width="32" height="32" fill="#ffffff"/>
  <image href="/match-icon.png" width="28" height="28" x="2" y="2"/>
</svg>
""",
        encoding="utf-8",
    )

    print("Wrote match-logo.png, match-icon.png, favicons to", PUBLIC)


if __name__ == "__main__":
    main()
