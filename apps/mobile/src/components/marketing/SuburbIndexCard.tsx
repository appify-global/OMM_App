import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SuburbIndexRow, SuburbIndexTrend } from "../../data/marketingHome";
import { colors, fonts, shadow, space } from "../../theme/tokens";

type Props = {
  row: SuburbIndexRow;
  onPress?: () => void;
};

const TREND_LABEL: Record<SuburbIndexTrend, string> = {
  rising: "Rising",
  flat: "Steady",
  cooling: "Cooling",
};

function trendStyles(t: SuburbIndexTrend) {
  switch (t) {
    case "rising":
      return {
        bg: "rgba(15, 41, 24, 0.09)",
        fg: colors.forest,
      };
    case "flat":
      return {
        bg: colors.surfaceMuted,
        fg: colors.muted,
      };
    case "cooling":
      return {
        bg: "rgba(161, 68, 45, 0.1)",
        fg: colors.danger,
      };
    default:
      return { bg: colors.surfaceMuted, fg: colors.muted };
  }
}

export function SuburbIndexCard({ row, onPress }: Props) {
  const t = trendStyles(row.trend);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.name} ${row.state}. Median ${row.median}.`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.accent} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{row.name}</Text>
          <View style={styles.statePill}>
            <Text style={styles.stateText}>{row.state}</Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Median</Text>
            <Text style={styles.metricValue}>{row.median}</Text>
          </View>
          <View style={[styles.metric, styles.metricRight]}>
            <Text style={styles.metricLabel}>12 mo</Text>
            <View style={styles.moRow}>
              <Text style={styles.metricValue}>{row.twelveMonth}</Text>
              <View style={[styles.trendPill, { backgroundColor: t.bg }]}>
                <Text style={[styles.trendText, { color: t.fg }]}>
                  {TREND_LABEL[row.trend]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.metaLine}>
          {row.activeListings} active · {row.privateCampaigns} private
        </Text>

        <Text style={styles.cta}>View suburb →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginBottom: space.md,
    ...shadow.card,
  },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  accent: {
    width: 4,
    backgroundColor: colors.forest,
  },
  inner: {
    flex: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    paddingLeft: space.md - 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  name: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 19,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  statePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.clerkBackground,
  },
  stateText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
  },
  metrics: {
    flexDirection: "row",
    marginBottom: space.sm,
  },
  metric: { flex: 1 },
  metricRight: { alignItems: "flex-end" },
  metricLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  moRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trendPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  trendText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  metaLine: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
    marginBottom: space.sm,
  },
  cta: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.forest,
    alignSelf: "flex-end",
  },
});
