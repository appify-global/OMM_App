import { Platform } from "react-native";

/** Mirrors `apps/web/app/globals.css` :root tokens. */
export const colors = {
  ink: "#111111",
  inkSoft: "#1a1a1a",
  /** Web `layout.tsx` Clerk / chrome accent */
  chrome: "#1c1c1c",
  muted: "#6b6b6b",
  cream: "#f5f1ed",
  paper: "#ffffff",
  forest: "#0f2918",
  forestPressed: "#0a1f12",
  sage: "#8a9b8e",
  surfaceMuted: "#f3f3f5",
  inputSurface: "#f7f3f0",
  line: "#e5e5ea",
  cardLine: "#e0e0e0",
  clerkBackground: "#fcfaf6",
  /** Web `.kpi-delta.is-down` / warn */
  danger: "#a1442d",
} as const;

export const radii = {
  control: 7,
  controlTight: 6,
  controlSoft: 8,
  /** Web Clerk `borderRadius: 2px` — subtle chips */
  clerk: 2,
} as const;

export const fonts = {
  /** Fraunces — display / mastheads */
  display: "Fraunces_600SemiBold",
  displayItalic: "Fraunces_600SemiBold_Italic",
  displayRegular: "Fraunces_400Regular",
  displayRegularItalic: "Fraunces_400Regular_Italic",
  /** Inter — UI */
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemiBold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
} as const;

/** Spacing aligned with web section padding / gutters. */
export const space = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

/** `globals.css` `--shadow` — card lift */
export const shadow = {
  card: Platform.select({
    ios: {
      shadowColor: "#111111",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: { elevation: 3 },
    default: {},
  }),
} as const;

/** Shared text styles (web-equivalent type scale). */
export const typography = {
  brandWordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  brandMarket: {
    fontFamily: fonts.displayItalic,
    fontSize: 22,
    color: colors.forest,
    letterSpacing: -0.2,
  },
  navSection: {
    fontFamily: fonts.displayRegularItalic,
    fontSize: 11,
    color: "rgba(17,17,17,0.4)",
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.muted,
  },
  hero: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  bodyMuted: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.ink,
  },
  caption: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
  },
  tabLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
  },
} as const;
