import {
  type Theme,
  DefaultTheme,
} from "@react-navigation/native";
import { Platform } from "react-native";

import { colors, fonts } from "./tokens";

/** React Navigation theme — matches web paper / ink / forest. */
export const appNavigationTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.forest,
    background: colors.paper,
    card: colors.paper,
    text: colors.ink,
    border: colors.line,
    notification: colors.forest,
  },
  fonts: {
    regular: {
      fontFamily: fonts.sans,
      fontWeight: "400",
    },
    medium: {
      fontFamily: fonts.sansMedium,
      fontWeight: "500",
    },
    bold: {
      fontFamily: fonts.sansBold,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: fonts.sansBold,
      fontWeight: "700",
    },
  },
};

export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.paper },
  headerShadowVisible: false,
  headerTitleStyle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  headerTintColor: colors.forest,
  headerBackTitle: "",
} as const;

/** Shared bottom tab bar — icons + labels; use `tabBarScrollEnabled` for 6+ tabs. */
export const marketingTabBarOptions = {
  tabBarActiveTintColor: colors.forest,
  tabBarInactiveTintColor: colors.muted,
  tabBarLabelPosition: "below-icon" as const,
  tabBarStyle: {
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 18, default: 10 }),
    minHeight: 60,
  },
  tabBarLabelStyle: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    marginTop: 2,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  tabBarIconStyle: {
    marginTop: 2,
  },
  tabBarItemStyle: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
} as const;
