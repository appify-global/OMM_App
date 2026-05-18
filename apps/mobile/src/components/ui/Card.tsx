import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { colors, radii, shadow } from "../../theme/tokens";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  /** Web cards use border; optional shadow for emphasis */
  elevated?: boolean;
};

export function Card({ children, style, elevated }: Props) {
  return (
    <View style={[styles.card, elevated && shadow.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.controlSoft,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
});
