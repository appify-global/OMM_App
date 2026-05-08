/**
 * Global design tokens — strict monochrome + Satoshi (regular / medium only).
 */
export const palette = {
  black: '#000000',
  white: '#FFFFFF',
} as const;

/** UI text and ink surfaces use pure black; never blue-grey (#1c1c1e) in new code. */
export const ink = palette.black;

/** Secondary label copy — black at reduced opacity on white. */
export const inkMuted = 'rgba(0, 0, 0, 0.55)';
export const inkSubtle = 'rgba(0, 0, 0, 0.45)';
export const inkFaint = 'rgba(0, 0, 0, 0.35)';
export const borderSubtle = 'rgba(0, 0, 0, 0.12)';
export const borderHairline = 'rgba(0, 0, 0, 0.08)';
export const fillWash = 'rgba(0, 0, 0, 0.06)';
export const fillMisty = 'rgba(0, 0, 0, 0.04)';

/** 4pt grid — use multiples for padding/margin. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
} as const;

export const Fonts = {
  regular: 'Satoshi-Regular',
  medium: 'Satoshi-Medium',
} as const;

/**
 * Cross-screen header & horizontal rhythm — use so titles, back actions, and
 * sticky filter rows share one alignment column.
 */
export const layout = {
  screenGutter: 20,
  headerSideWidth: 44,
  largeTitleSize: 26,
  navTitleSize: 17,
} as const;
