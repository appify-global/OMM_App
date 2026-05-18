import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { SuburbIndexCard } from "../../components/marketing/SuburbIndexCard";
import { Screen } from "../../components/ui/Screen";
import { suburbIndexRows } from "../../data/marketingHome";
import { colors, fonts, space } from "../../theme/tokens";

/** Distinct from Listings canvas — same family, cooler neutral. */
const CANVAS = "#f5f4f0";

export function SuburbsScreen() {
  const navigation = useNavigation();

  const totals = useMemo(() => {
    const active = suburbIndexRows.reduce((s, r) => s + r.activeListings, 0);
    const priv = suburbIndexRows.reduce((s, r) => s + r.privateCampaigns, 0);
    return {
      suburbs: suburbIndexRows.length,
      active,
      private: priv,
    };
  }, []);

  const openSuburb = (name: string) => {
    Alert.alert(
      name,
      "Suburb detail pages open in the member workspace on the web. Sign in to save this index to your watchlist.",
      [{ text: "OK" }],
    );
  };

  const openWorkspace = () => {
    const parent = navigation.getParent();
    if (parent)
      (parent as { navigate: (r: string) => void }).navigate("Welcome");
    else (navigation as { navigate: (r: string) => void }).navigate("Welcome");
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
            <Text style={styles.kicker}>The Index</Text>
          </View>
          <Text style={styles.title}>
            Suburbs, by <Text style={styles.titleEm}>quiet movement</Text>.
          </Text>
          <Text style={styles.lede}>
            Median price, twelve-month change, active campaigns and private
            share — a compact read for the suburbs members watch most.
          </Text>
        </View>

        <View style={styles.summaryBand}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.suburbs}</Text>
            <Text style={styles.summaryLabel}>Suburbs in view</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.active}</Text>
            <Text style={styles.summaryLabel}>Active campaigns</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.private}</Text>
            <Text style={styles.summaryLabel}>Running private</Text>
          </View>
        </View>

        <View style={styles.listIntro}>
          <Text style={styles.listEyebrow}>Market pulse</Text>
          <Text style={styles.listTitle}>Regional snapshot</Text>
          <Text style={styles.listHint}>
            Cards replace the full web table — swipe the list, tap a row for
            notes.
          </Text>
        </View>

        {suburbIndexRows.map((row) => (
          <SuburbIndexCard
            key={row.slug}
            row={row}
            onPress={() => openSuburb(row.name)}
          />
        ))}

        <Pressable
          onPress={openWorkspace}
          style={({ pressed }) => [
            styles.watchBand,
            pressed && { opacity: 0.92 },
          ]}
        >
          <Text style={styles.watchTitle}>Standing watch</Text>
          <Text style={styles.watchBody}>
            Save postcodes in the workspace — we surface off-market
            introductions as agents publish them.
          </Text>
          <Text style={styles.watchCta}>Open workspace →</Text>
        </Pressable>
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
  masthead: { marginBottom: space.xl },
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
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.65,
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
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(17, 17, 17, 0.58)",
    maxWidth: 400,
  },
  summaryBand: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: space.xxl,
    ...Platform.select({
      ios: {
        shadowColor: "#111",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginVertical: 4,
  },
  summaryValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: colors.ink,
    marginBottom: 6,
  },
  summaryLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    color: colors.muted,
    textAlign: "center",
  },
  listIntro: {
    marginBottom: space.md,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  listEyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 6,
  },
  listTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.35,
    color: colors.ink,
    marginBottom: 8,
  },
  listHint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    fontStyle: "italic",
  },
  watchBand: {
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: 14,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  watchTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.paper,
    marginBottom: 8,
  },
  watchBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.78)",
    marginBottom: space.md,
  },
  watchCta: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    letterSpacing: 0.3,
    color: colors.paper,
  },
});
