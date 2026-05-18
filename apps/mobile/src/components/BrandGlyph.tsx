import { View, StyleSheet } from "react-native";

import { colors } from "../theme/tokens";

export function SquareFilled({
  size = 6,
  color,
}: {
  size?: number;
  /** Defaults to forest; use e.g. `#fff` for hero-on-image meta. */
  color?: string;
}) {
  return (
    <View
      style={[
        styles.filled,
        {
          width: size,
          height: size,
          backgroundColor: color ?? colors.forest,
        },
      ]}
    />
  );
}

export function SquareOutline({ size = 6 }: { size?: number }) {
  return (
    <View
      style={[
        styles.outline,
        {
          width: size,
          height: size,
          borderColor: colors.ink,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  filled: { borderRadius: 1 },
  outline: {
    borderRadius: 1,
    borderWidth: 1,
    backgroundColor: "transparent",
    opacity: 0.55,
  },
});
