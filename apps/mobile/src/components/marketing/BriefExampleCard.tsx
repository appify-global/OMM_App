import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PublicBriefExample } from "../../data/marketingHome";
import { colors, fonts, space } from "../../theme/tokens";

type Props = {
  brief: PublicBriefExample;
  onPress?: () => void;
};

export function BriefExampleCard({ brief, onPress }: Props) {
  const suburbs = brief.suburbs.join(", ");
  const summary = `${brief.type} · ${suburbs} · ${brief.budget} · ${brief.timing}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${brief.buyerAlias}. ${summary}`}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.accent} />
      <View style={styles.main}>
        <Text style={styles.folio}>{brief.id.toUpperCase()}</Text>
        <Text style={styles.alias}>{brief.buyerAlias}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {summary}
        </Text>
        <Text style={styles.submitted}>{brief.submitted}</Text>
      </View>
      <View style={styles.matchCol}>
        <Text style={styles.matchNum}>{brief.matched}</Text>
        <Text style={styles.matchLabel}>matches</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginBottom: space.md,
  },
  accent: {
    width: 3,
    backgroundColor: colors.forest,
  },
  main: {
    flex: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    paddingRight: space.sm,
  },
  folio: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    marginBottom: 6,
  },
  alias: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.ink,
    marginBottom: 6,
  },
  summary: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    marginBottom: 8,
  },
  submitted: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: "rgba(17,17,17,0.45)",
  },
  matchCol: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.line,
    minWidth: 72,
    backgroundColor: colors.clerkBackground,
  },
  matchNum: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.forest,
  },
  matchLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
});
