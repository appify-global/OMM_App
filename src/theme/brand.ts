/**
 * Unlisted — brand tokens (wordmark: forest green; “Off market listings”).
 * Headline: load a custom font via expo-font when files are available; until then use system UI.
 */
import { Platform } from 'react-native';

export const brand = {
  charcoal: '#1a1a1a',
  /** Primary brand (wordmark, CTAs) — deep forest green */
  forest: '#0f2918',
  forestPressed: '#0a1f12',
  warmWhite: '#fefdfb',
  cream: '#f5f1ed',
  sage: '#8a9b8e',
  /** Legacy name — use Unlisted green for FAB / links; kept for existing style keys */
  terracotta: '#0f2918',
  terracottaPressed: '#0a1f12',
  white: '#ffffff',
  /** Editorial / luxury — listing cards, Hawthorn-homes tone */
  luxury: {
    ink: '#101214',
    warmBlack: '#1c1a16',
    bone: '#faf8f4',
    parchment: '#f3eee6',
    parchmentLine: 'rgba(45, 38, 30, 0.12)',
    gold: '#b8956a',
    goldHint: 'rgba(184, 149, 106, 0.18)',
    mist: 'rgba(255,255,255,0.78)',
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  space: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
  },
  type: {
    /** ~2rem page title */
    title: 28,
    /** ~1.5rem section */
    subtitle: 22,
    body: 16,
    caption: 14,
    micro: 12,
    weightRegular: '400' as const,
    weightMedium: '500' as const,
  },
  /** System stack until Satoshi files are bundled */
  fontSans:
    Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'sans-serif',
    }) ?? 'sans-serif',
  /** Display (listing titles) — Didot/Georgia for editorial “luxury” while offline-font-free */
  fontDisplay:
    Platform.select({
      ios: 'Didot',
      android: 'serif',
      default: 'Georgia',
    }) ?? 'serif',
} as const;
