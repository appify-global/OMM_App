import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, space } from "../../theme/tokens";

type Props = {
  children: ReactNode;
  /** `cream` = marketing / auth (`#fcfaf6`); `paper` = workspace default */
  variant?: "paper" | "cream";
  edges?: ("top" | "bottom" | "left" | "right")[];
  style?: ViewStyle;
};

export function Screen({
  children,
  variant = "paper",
  edges = ["top", "left", "right"],
  style,
}: Props) {
  const bg =
    variant === "cream" ? colors.clerkBackground : colors.paper;
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, { backgroundColor: bg }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

/** Full-bleed area inside a screen (e.g. before ScrollView). */
export function ScreenBody({
  children,
  padH = space.lg,
  style,
}: {
  children: ReactNode;
  padH?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ flex: 1, paddingHorizontal: padH }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
