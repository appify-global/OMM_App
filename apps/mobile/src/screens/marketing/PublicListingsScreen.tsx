import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { ProductionListingCard } from "../../components/marketing/ProductionListingCard";
import { Screen } from "../../components/ui/Screen";
import {
  portfolioListingFilters,
  portfolioPageStats,
  publicListings,
  type PortfolioListingFilter,
} from "../../data/marketingHome";
import type { MarketingStackParamList } from "../../navigation/MarketingNavigator";
import { colors, fonts, space } from "../../theme/tokens";

const CANVAS = "#f7f7f7";

export function PublicListingsScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<PortfolioListingFilter>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return publicListings;
    return publicListings.filter((l) => l.tag === filter);
  }, [filter]);

  const openListing = () => {
    const parent = navigation.getParent();
    const target: keyof MarketingStackParamList = "Welcome";
    if (parent) (parent as { navigate: (r: string) => void }).navigate(target);
    else (navigation as { navigate: (r: string) => void }).navigate(target);
  };

  return (
    <Screen
      variant="paper"
      edges={["top", "left", "right"]}
      style={{ backgroundColor: CANVAS }}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.masthead}>
          <View style={styles.kickerRow}>
            <SquareFilled size={6} />
            <Text style={styles.kicker}>The Portfolio</Text>
          </View>
          <Text style={styles.title}>
            <Text style={styles.titleEm}>Listings</Text>
            {", before\n"}they reach the market.
          </Text>
          <Text style={styles.lede}>
            Every property below is being offered off-market or in quiet
            campaign. Access is member-gated: request an introduction and
            we&apos;ll bridge you to the agent or vendor directly.
          </Text>
        </View>

        <View style={styles.statsRow}>
          {portfolioPageStats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRail}
        >
          {portfolioListingFilters.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text
                  style={[styles.filterChipText, active && styles.filterChipTextActive]}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.countLine}>
          {filtered.length} listing{filtered.length === 1 ? "" : "s"}
          {filter !== "All" ? ` · ${filter}` : ""}
        </Text>

        {filtered.map((listing) => (
          <ProductionListingCard
            key={listing.id}
            listing={listing}
            onPress={openListing}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: CANVAS },
  inner: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: 120,
  },
  masthead: {
    marginBottom: space.xl,
    paddingBottom: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: "uppercase",
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.75,
    color: colors.ink,
    fontWeight: "400",
    marginBottom: space.md,
  },
  titleEm: {
    fontFamily: fonts.displayItalic,
    color: colors.forest,
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 26,
    color: "rgba(17, 17, 17, 0.72)",
    maxWidth: 480,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: space.lg,
  },
  statCell: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#111",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: colors.ink,
    marginBottom: 6,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 13,
    color: colors.muted,
  },
  filterRail: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: space.md,
    paddingRight: 4,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  filterChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  filterChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  filterChipTextActive: {
    color: colors.paper,
  },
  countLine: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
    marginBottom: space.md,
  },
});
