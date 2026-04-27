import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { colors, fonts, radii } from "../../theme/tokens";

type Variant = "primary" | "outline" | "ghost";

type Props = Omit<PressableProps, "children"> & {
  children: ReactNode;
  variant?: Variant;
  labelStyle?: object;
};

export function Button({
  children,
  variant = "primary",
  disabled,
  style,
  labelStyle,
  ...rest
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "primary" && pressed && styles.primaryPressed,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        disabled && styles.disabled,
        style as ViewStyle,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.label,
          variant === "primary" && styles.labelOnPrimary,
          variant === "outline" && styles.labelOutline,
          variant === "ghost" && styles.labelGhost,
          labelStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.control,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.forest,
  },
  primaryPressed: {
    backgroundColor: colors.forestPressed,
  },
  outline: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: { opacity: 0.45 },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
  },
  labelOnPrimary: { color: colors.paper },
  labelOutline: { color: colors.ink, fontSize: 13 },
  labelGhost: { color: colors.forest, fontSize: 14 },
});
