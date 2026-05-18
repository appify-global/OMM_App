# Listing card height — baseline vs compact (Home)

Approximate **static** heights from `StyleSheet` definitions (no dynamic text). Re-measure in your PR on target devices (font scale, OS).

## LargeListingCard (previous baseline on Buying / Saved)

| Block | Selling (`largeImgWrap`) | Buying (`largeImgWrapBuying`) |
|--------|---------------------------|--------------------------------|
| Hero image | 200 px | 168 px |
| Body block | ~padding 16 ×2 + title/price/spec/stats (varies) | Same pattern |

**Rough total card height (single column):** ~**320–380 px** depending on copy (footer stats row adds ~48 px + borders).

## CompactListingCard (`components/CompactListingCard.tsx`)

| Block | Value |
|--------|--------|
| Image | 88 × 88 px |
| Row padding | 10 vertical + inner text/spec rows |

**Rough total row height:** ~**104–112 px** (single-line suburb + spec row).

## Ratio (~50% goal)

112 / 340 ≈ **33%** of a ~340 px tall large card — comfortably under half the vertical footprint while keeping photo, price, suburb, and bed/bath/car affordances.

## Breakpoints to capture in QA

1. **Default phone width** — e.g. 390 pt logical width (iPhone 14 class).
2. **Small width** — e.g. 320–360 pt — ensure carousel tiles (`layout="carousel"`) still scroll and badges don’t clip.

Update this doc with screenshots or measured values from your PR when visuals change.
