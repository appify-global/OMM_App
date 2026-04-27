import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SquareFilled, SquareOutline } from "../../components/BrandGlyph";
import { FeaturedStripCard } from "../../components/marketing/FeaturedStripCard";
import { NativeSearchBar } from "../../components/marketing/NativeSearchBar";
import { NewsCard } from "../../components/marketing/NewsCard";
import { AppText, Button } from "../../components/ui";
import {
  blogSection,
  briefPanel,
  featuredListings,
  heroCaption,
  heroTrust,
  indexSection,
  insights,
  portfolioSection,
  propertyNews,
} from "../../data/marketingHome";
import type { MarketingStackParamList } from "../../navigation/MarketingNavigator";
import { colors, fonts, space, typography } from "../../theme/tokens";

const poster = require("../../../assets/hero-poster.jpg");

const SHORTCUTS = [
  { label: "Listings", tab: "Listings" as const, icon: "list-outline" as const },
  { label: "Briefs", tab: "Briefs" as const, icon: "document-text-outline" as const },
  { label: "Suburbs", tab: "Suburbs" as const, icon: "map-outline" as const },
  { label: "Journal", tab: "Blog" as const, icon: "newspaper-outline" as const },
];

/** Mobile web `hero-figure-frame::after` wash — text stays legible, foot goes dark. */
const HERO_OVERLAY = {
  colors: [
    "rgba(251, 249, 246, 0.96)",
    "rgba(251, 249, 246, 0.78)",
    "rgba(251, 249, 246, 0.12)",
    "rgba(10, 22, 14, 0.52)",
    "rgba(10, 22, 14, 0.78)",
  ] as const,
  locations: [0, 0.26, 0.48, 0.72, 1] as const,
};

export function MarketingHomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const heroMinHeight = useMemo(() => {
    const h = Dimensions.get("window").height;
    return Math.min(Math.max(h * 0.66, 500), 620);
  }, []);

  const goTab = (name: (typeof SHORTCUTS)[number]["tab"]) => {
    (navigation as { navigate: (n: string) => void }).navigate(name);
  };

  const openAuth = (route: keyof MarketingStackParamList) => {
    const parent = navigation.getParent();
    if (parent) (parent as { navigate: (r: string) => void }).navigate(route);
    else (navigation as { navigate: (r: string) => void }).navigate(route);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.inner}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, space.md) },
        ]}
      >
        <Text style={styles.wordmark}>
          <Text style={typography.brandWordmark}>Pre</Text>
          <Text style={typography.brandMarket}>Market</Text>
        </Text>
        <Button
          variant="outline"
          onPress={() => openAuth("SignIn")}
          style={styles.signInBtn}
          labelStyle={styles.signInLabel}
        >
          Sign in
        </Button>
      </View>

      <View style={[styles.heroShell, { minHeight: heroMinHeight }]}>
        <Image
          source={poster}
          style={styles.heroImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[...HERO_OVERLAY.colors]}
          locations={[...HERO_OVERLAY.locations]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroContent}>
          <View style={styles.heroKickerRow}>
            <SquareFilled size={6} />
            <Text style={styles.heroKickerText}>The Private Market</Text>
          </View>

          <Text style={styles.heroHeadline}>
            <Text style={styles.heroFlip}>Buy</Text>
            <Text style={styles.heroHeadlineRoman}> before</Text>
            {"\n"}
            <Text style={styles.heroHeadlineEm}>the market</Text>
            <Text style={styles.heroHeadlineRoman}> sees it.</Text>
          </Text>

          <Text style={styles.heroLede}>
            A members&apos; network for off-market property — quiet campaigns,
            confidential briefs and the homes that never reach the listings.
          </Text>

          <NativeSearchBar
            visual="hero"
            onSubmit={() => goTab("Listings")}
            onFiltersPress={() =>
              Alert.alert("Filters", "Saved filters sync with the web workspace.")
            }
          />

          <View style={styles.heroMeta}>
            {heroTrust.map((item, i) => (
              <View
                key={item}
                style={[styles.heroMetaBlock, i > 0 && styles.heroMetaBlockDivider]}
              >
                <View style={styles.heroMetaDt}>
                  <SquareFilled size={5} color="#ffffff" />
                  <Text style={styles.heroMetaIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                </View>
                <Text style={styles.heroMetaDd}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.heroFigcaption}>
          <Text style={styles.heroFigLine}>
            <Text style={styles.heroFigStrong}>No. {heroCaption.folio}</Text>
            <Text style={styles.heroFigDot}> · </Text>
            <Text style={styles.heroFigStrong}>{heroCaption.tag}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.shortcutSection}>
        <Text style={styles.quickSectionLabel}>Explore</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shortcutRail}
        >
          {SHORTCUTS.map((s) => (
            <Pressable
              key={s.tab}
              onPress={() => goTab(s.tab)}
              style={({ pressed }) => [
                styles.shortcutChip,
                pressed && styles.shortcutPressed,
              ]}
            >
              <Ionicons name={s.icon} size={18} color={colors.forest} />
              <Text style={styles.shortcutLabel}>{s.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.pad}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionKickerRow}>
            <SquareFilled size={5} />
            <Text style={styles.sectionKicker}>{portfolioSection.kicker}</Text>
          </View>
          <Text style={styles.sectionH2}>{portfolioSection.title}</Text>
          <Text style={styles.sectionDeadline}>{portfolioSection.deadline}</Text>
          <Pressable onPress={() => goTab("Listings")} style={styles.sectionEndWrap}>
            <Text style={styles.sectionEnd}>{portfolioSection.cta}</Text>
            <View style={styles.sqPair}>
              <SquareFilled size={5} />
              <SquareOutline size={5} />
            </View>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredRail}
        >
          {featuredListings.map((listing) => (
            <FeaturedStripCard
              key={listing.folio}
              listing={listing}
              onPress={() => openAuth("Welcome")}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionDivider} />

      <View style={styles.pad}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionKickerRow}>
            <SquareFilled size={5} />
            <Text style={styles.sectionKicker}>{indexSection.kicker}</Text>
          </View>
          <Text style={styles.sectionH2}>{indexSection.title}</Text>
        </View>

        <View style={styles.insightList}>
          {insights.map((row, i) => (
            <View
              key={row.suburb}
              style={[
                styles.insightRow,
                i === insights.length - 1 && styles.insightRowLast,
              ]}
            >
              <View style={styles.insightLeft}>
                <Text style={styles.insightSuburb}>{row.suburb}</Text>
                <Text style={styles.insightGrowth}>{row.growth} · 12 mo</Text>
              </View>
              <View style={styles.insightRight}>
                <Text style={styles.insightMedian}>{row.median}</Text>
                <Text style={styles.insightActive}>{row.listings} active</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable onPress={() => goTab("Suburbs")} style={styles.sectionEndWrap}>
          <Text style={styles.sectionEnd}>{indexSection.cta}</Text>
          <View style={styles.sqPair}>
            <SquareFilled size={5} />
            <SquareOutline size={5} />
          </View>
        </Pressable>
      </View>

      <View style={[styles.pad, styles.briefWrap]}>
        <View style={styles.briefPanel}>
          <View style={styles.sectionKickerRow}>
            <SquareFilled size={5} color="#ffffff" />
            <Text style={[styles.sectionKicker, styles.briefKicker]}>
              {briefPanel.kicker}
            </Text>
          </View>
          <Text style={styles.briefTitle}>
            {briefPanel.titleLead}
            <Text style={styles.briefEm}>{briefPanel.titleEm}</Text>
            <Text style={styles.briefTitleRest}>{briefPanel.titleTrail}</Text>
          </Text>
          <AppText variant="bodyMuted" style={styles.briefBody}>
            {briefPanel.body}
          </AppText>
          <Pressable onPress={() => openAuth("Welcome")}>
            <Text style={styles.inlineCta}>
              {briefPanel.cta} <Text style={styles.quickArrow}>→</Text>
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.blogBand}>
        <View style={styles.blogHeader}>
          <View style={styles.blogHeaderText}>
            <View style={styles.sectionKickerRow}>
              <SquareFilled size={5} />
              <Text style={styles.sectionKicker}>{blogSection.kicker}</Text>
            </View>
            <Text style={styles.sectionH2}>{blogSection.title}</Text>
          </View>
          <Pressable onPress={() => goTab("Blog")} style={styles.blogHeaderLink}>
            <View style={styles.blogEndRow}>
              <Text style={styles.sectionEnd}>{blogSection.cta}</Text>
              <View style={styles.sqPair}>
                <SquareFilled size={5} />
                <SquareOutline size={5} />
              </View>
            </View>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newsRail}
        >
          {propertyNews.map((item, i) => (
            <NewsCard
              key={item.id}
              item={item}
              index={i}
              onPress={() => goTab("Blog")}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  inner: { paddingBottom: 120 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: space.md,
    paddingHorizontal: space.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  wordmark: { flexDirection: "row", alignItems: "baseline" },
  signInBtn: {
    paddingVertical: 8,
    paddingHorizontal: space.md,
    minWidth: 0,
  },
  signInLabel: { fontSize: 13 },
  heroShell: {
    position: "relative",
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ece7e0",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    paddingHorizontal: space.xl,
    paddingTop: 28,
    paddingBottom: 100,
    gap: 20,
  },
  heroKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  heroKickerText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: "uppercase",
    color: colors.muted,
  },
  heroHeadline: {
    marginTop: 4,
  },
  heroFlip: {
    fontFamily: fonts.displayItalic,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.forest,
  },
  heroHeadlineRoman: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.ink,
    fontWeight: "400" as const,
  },
  heroHeadlineEm: {
    fontFamily: fonts.displayItalic,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.forest,
    fontWeight: "400" as const,
  },
  heroLede: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 25,
    color: "rgba(17, 17, 17, 0.66)",
    maxWidth: 400,
  },
  heroMeta: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.24)",
    gap: 0,
  },
  heroMetaBlock: {
    paddingBottom: 4,
  },
  heroMetaBlockDivider: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.18)",
  },
  heroMetaDt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  heroMetaIndex: {
    fontFamily: fonts.displayRegularItalic,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.72)",
  },
  heroMetaDd: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: -0.05,
    color: "#ffffff",
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  heroFigcaption: {
    position: "absolute",
    left: space.xl,
    right: space.xl,
    bottom: 20,
    zIndex: 3,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.22)",
  },
  heroFigLine: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 3.1,
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.82)",
  },
  heroFigStrong: { color: "rgba(255, 255, 255, 0.92)" },
  heroFigDot: { color: "rgba(255, 255, 255, 0.5)" },
  shortcutSection: {
    paddingTop: space.xl,
    paddingBottom: space.lg,
    backgroundColor: colors.paper,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  quickSectionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: "uppercase",
    color: colors.muted,
    paddingHorizontal: space.xl,
    marginBottom: space.md,
  },
  shortcutRail: {
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  shortcutChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.clerkBackground,
    borderWidth: 1,
    borderColor: colors.line,
  },
  shortcutPressed: { backgroundColor: colors.surfaceMuted },
  shortcutLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  pad: { paddingHorizontal: space.xl },
  sectionHeading: {
    paddingTop: space.xxl,
    paddingBottom: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    marginBottom: space.md,
  },
  sectionKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionKicker: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: "uppercase",
    color: colors.muted,
  },
  sectionH2: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "400" as const,
    letterSpacing: -0.6,
    color: colors.ink,
    marginBottom: 8,
  },
  sectionDeadline: {
    fontFamily: fonts.displayRegularItalic,
    fontSize: 16,
    lineHeight: 22,
    color: "rgba(17, 17, 17, 0.62)",
    marginBottom: space.md,
    maxWidth: 400,
  },
  sectionEndWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    paddingBottom: 2,
  },
  sectionEnd: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.ink,
  },
  sqPair: { flexDirection: "row", alignItems: "center", gap: 3 },
  featuredRail: {
    paddingBottom: space.xl,
    paddingRight: space.xl,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
  },
  insightList: {
    backgroundColor: colors.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginTop: space.sm,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  insightRowLast: { borderBottomWidth: 0 },
  insightLeft: { flex: 1, paddingRight: space.md },
  insightRight: { alignItems: "flex-end" },
  insightSuburb: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  insightGrowth: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.forest,
  },
  insightMedian: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  insightActive: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
  },
  briefWrap: { marginTop: space.lg },
  briefPanel: {
    backgroundColor: colors.forest,
    borderRadius: 16,
    padding: space.lg,
  },
  briefKicker: { color: "rgba(255,255,255,0.65)" },
  briefTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
    color: colors.paper,
    marginBottom: space.md,
  },
  briefEm: {
    fontFamily: fonts.displayItalic,
    color: colors.sage,
  },
  briefTitleRest: {
    fontFamily: fonts.display,
    color: colors.paper,
  },
  briefBody: {
    color: "rgba(255,255,255,0.85)",
    marginBottom: space.md,
  },
  inlineCta: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.paper,
  },
  quickArrow: {},
  blogBand: {
    paddingTop: space.xxl,
    paddingBottom: space.xxl,
    backgroundColor: colors.clerkBackground,
    marginTop: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  blogHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
    paddingHorizontal: space.xl,
    marginBottom: space.md,
  },
  blogHeaderText: { flex: 1, minWidth: 0 },
  blogHeaderLink: { paddingTop: 4 },
  blogEndRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    paddingBottom: 2,
  },
  newsRail: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
