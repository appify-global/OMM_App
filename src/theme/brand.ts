/**
 * OMM Brand System v1.0 (2026) — tokens for app surfaces.
 * Satoshi: load via expo-font when font files are available; until then use system UI.
 */
import { Platform } from 'react-native';

export const brand = {
  charcoal: '#1a1a1a',
  warmWhite: '#fefdfb',
  cream: '#f5f1ed',
  sage: '#8a9b8e',
  terracotta: '#c87d5f',
  terracottaPressed: '#b56d52',
  white: '#ffffff',
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
} as const;
