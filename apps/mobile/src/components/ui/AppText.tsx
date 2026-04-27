import type { ReactNode } from "react";
import { Text, type TextProps, type TextStyle } from "react-native";

import { typography } from "../../theme/tokens";

const variants = {
  brandWordmark: typography.brandWordmark,
  brandMarket: typography.brandMarket,
  navSection: typography.navSection,
  kicker: typography.kicker,
  hero: typography.hero,
  sectionTitle: typography.sectionTitle,
  lede: typography.lede,
  body: typography.body,
  bodyMuted: typography.bodyMuted,
  label: typography.label,
  caption: typography.caption,
} as const;

export type AppTextVariant = keyof typeof variants;

type Props = TextProps & {
  variant?: AppTextVariant;
  children: ReactNode;
};

export function AppText({
  variant = "body",
  style,
  children,
  ...rest
}: Props) {
  const base = variants[variant] as TextStyle;
  return (
    <Text style={[base, style]} {...rest}>
      {children}
    </Text>
  );
}
