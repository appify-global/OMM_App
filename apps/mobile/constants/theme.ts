/**
 * Global design tokens - monochrome base + Satoshi (regular / medium only).
 */
export const palette = {
  black: '#000000',
  white: '#FFFFFF',
  /** Selection / interactive accent - segments, chips, radios, tabs. Tailwind sky-400. */
  accent: '#38BDF8',
  /** Slate 800 - structural depth, filled CTAs, nav-style actions (not selection accent). */
  slateNavy: '#1E293B',
  /** Slate 50 - default app surface behind content (readable, cool-neutral). */
  frost: '#F8FAFC',
} as const;

/** Re-export for ergonomic imports alongside `palette.*`. */
export const accent = palette.accent;
export const slateNavy = palette.slateNavy;
export const frost = palette.frost;

/** Default screen / scroll surface in light mode. Prefer over raw white for readability. */
export const surfacePrimary = frost;

/** UI text and ink surfaces use pure black; never blue-grey (#1c1c1e) in new code. */
export const ink = palette.black;

/** Secondary label copy - black at reduced opacity on white. */
export const inkMuted = 'rgba(0, 0, 0, 0.55)';
export const inkSubtle = 'rgba(0, 0, 0, 0.45)';
export const inkFaint = 'rgba(0, 0, 0, 0.35)';
export const borderSubtle = 'rgba(0, 0, 0, 0.12)';
export const borderHairline = 'rgba(0, 0, 0, 0.08)';
export const fillWash = 'rgba(0, 0, 0, 0.06)';
export const fillMisty = 'rgba(0, 0, 0, 0.04)';

/** 4pt grid - use multiples for padding/margin. */
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
 * Corners on tappable controls - primary buttons, listing CTAs, segmented glass,
 * wizard option shells (progressively tightened from original Figma radii).
 */
export const controlRadius = {
  button: 7,
  buttonCharcoal: 9,
  listingCta: 9,
  optionCell: 9,
  glassSegment: 7,
  liquidPill: 11,
} as const;

/**
 * Cross-screen header & horizontal rhythm - use so titles, back actions, and
 * sticky filter rows share one alignment column.
 */
export const layout = {
  /** Default horizontal inset for scroll content & most screens (safe area added in hooks). */
  screenGutter: 20,
  /** Sign-in, forgot password, and other auth stack screens. */
  authGutter: 32,
  /** Add-listing wizard and wide-step layouts (`PL_PAD`). */
  listingWizardGutter: 32,
  headerSideWidth: 44,
  largeTitleSize: 26,
  navTitleSize: 17,
} as const;

/** In-screen header wordmark (`assets/images/match-logo.png`). */
export const brand = {
  /** Toolbar-centered mark (single row chrome). */
  toolbarMarkHeight: 17,
  toolbarMarkMaxWidth: 96,
  headerMarkHeight: 22,
  headerMarkMaxWidth: 118,
} as const;

/** Shared toolbar row (leading title + centred logo). */
export const toolbar = {
  rowMinHeight: 38,
  titleSize: 13,
  titleLineHeight: 16,
  leadingTitleMaxFrac: 0.42,
} as const;

/**
 * iOS-style glass / vibrancy surface tokens. Used by GlassSurface, GlassSegment,
 * and the shared ScreenHeader so chrome reads as one frosted material.
 */
export const glass = {
  /** Native blur intensity (expo-blur). 0–100. */
  blurIntensity: 32,
  /** BlurView tint - light glass over white-ish UI. */
  tint: 'light' as const,
  /** Sheen gradient (top → bottom) layered over BlurView for depth on white. */
  sheenTop: 'rgba(255, 255, 255, 0.78)',
  sheenBottom: 'rgba(255, 255, 255, 0.42)',
  /** Android fallback / non-blur surface. */
  fallback: 'rgba(255, 255, 255, 0.82)',
  /** Hairline edge for the glass shell. */
  edge: 'rgba(0, 0, 0, 0.06)',
  /** Inner highlight (top inner stroke) - adds the iOS "lit edge". */
  innerHighlight: 'rgba(255, 255, 255, 0.65)',
  /** Soft drop shadow under the shell. */
  shadow: 'rgba(0, 0, 0, 0.08)',

  /** Segmented control well - Apple-spec cool gray fill (matches iOS UISegmentedControl, no warm tint). */
  segmentTrack: 'rgba(120, 120, 128, 0.16)',
  segmentTrackEdge: 'rgba(60, 60, 67, 0.08)',
  /** Cool gradient sheen layered over the BlurView, top → bottom (slightly darker top sells the recess). */
  segmentWellTop: 'rgba(60, 60, 67, 0.04)',
  segmentWellBottom: 'rgba(255, 255, 255, 0.10)',
  /** Selected thumb - bright frosted disc with subtle vertical sheen (cool, not warm). */
  segmentThumbTop: 'rgba(255, 255, 255, 0.96)',
  segmentThumbBottom: 'rgba(248, 249, 251, 0.86)',
  segmentThumbEdge: 'rgba(255, 255, 255, 0.92)',
} as const;

/** Apple-spec system fills - iOS-aligned cool grays for surfaces and ratings tints. */
export const system = {
  /** Apple `.systemGray6` - primary grouped background. */
  gray6: '#F2F2F7',
  /** Apple `.systemGray5` - secondary surface / large fills. */
  gray5: '#E5E5EA',
  /** Apple `.systemGray4`. */
  gray4: '#D1D1D6',
  /** Apple `.systemFill` cool tint (translucent over white). */
  fill: 'rgba(120, 120, 128, 0.16)',
  /** Apple `.secondarySystemFill`. */
  fillSecondary: 'rgba(120, 120, 128, 0.12)',
  /** Apple `.systemYellow` - review stars / warning accents. */
  yellow: '#FFCC00',
  /** Aligns with `accent` - links, tint, selected affordances (see `accent`). */
  blue: palette.accent,
} as const;

/**
 * Common vertical rhythm for ScrollView content under custom headers.
 * Prefer `space` for one-offs; use these when matching the majority of screens.
 */
export const scrollPadding = {
  /** Typical `ScrollView` `paddingTop` when the screen hides the nav header. */
  top: space[2],
} as const;
