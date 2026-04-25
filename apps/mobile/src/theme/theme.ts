export const colors = {
  /** Unlisted — primary actions (wordmark / CTAs) */
  primary: '#0f2918',
  primaryDark: '#0a1f12',
  background: '#FFFFFF',
  surfaceMuted: '#F3F3F5',
  /** Form fields — Step 2 & 3 */
  inputSurface: '#F7F3F0',
  text: '#111111',
  textSecondary: '#6B6B6B',
  textMuted: '#8E8E93',
  border: '#E5E5EA',
  cardBorder: '#E0E0E0',
  overlay: 'rgba(0,0,0,0.45)',
  modalTitle: '#0f2918',
  destructive: '#D92D20',
  black: '#1C1C1E',
  /** Step 4 “upcoming” status dot */
  statusPendingFill: '#D4D4D4',
  /** Step 4 “Contact support” */
  verificationCta: '#1a3d2e',
  verificationCtaPressed: '#0f2918',
  /** Hourglass circle on verification screen */
  verificationIconBg: '#EEEEEE',
} as const;

export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
