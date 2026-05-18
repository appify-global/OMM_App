import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { Screen } from "../../components/ui/Screen";
import {
  ABOUT_CONTACT_EMAIL,
  aboutNarrativeParagraphs,
  aboutPrinciples,
} from "../../data/marketingHome";
import { colors, fonts, space } from "../../theme/tokens";

const CANVAS = "#fafaf8";

export function AboutScreen() {
  const openMail = () => {
    Linking.openURL(`mailto:${ABOUT_CONTACT_EMAIL}`);
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
            <Text style={styles.kicker}>About</Text>
          </View>
          <Text style={styles.heroTitle}>
            A members&apos; network{"\n"}
            for the <Text style={styles.heroEm}>private market</Text>.
          </Text>
          <Text style={styles.lede}>
            PreMarket exists for the slice of the property market that
            doesn&apos;t want to be a property listing. Vendors who prefer
            discretion, buyers who&apos;d rather have an introduction than an
            inspection queue, and agents who&apos;d rather run a relationship
            than an auction.
          </Text>
        </View>

        <View style={styles.narrativeSection}>
          <View style={styles.kickerRow}>
            <SquareFilled size={5} />
            <Text style={styles.kicker}>Our thesis</Text>
          </View>
          <Text style={styles.thesisTitle}>
            The premium end of{"\n"}
            the market was never{"\n"}
            meant to be <Text style={styles.thesisEm}>loud</Text>.
          </Text>
          {aboutNarrativeParagraphs.map((para, i) => (
            <Text key={`about-narrative-${i}`} style={styles.narrativeP}>
              {para}
            </Text>
          ))}
        </View>

        <View style={styles.principlesWrap}>
          {aboutPrinciples.map((p, i) => (
            <View
              key={p.title}
              style={[
                styles.principleBlock,
                i === aboutPrinciples.length - 1 && styles.principleBlockLast,
              ]}
            >
              <Text style={styles.principleTitle}>{p.title}</Text>
              <Text style={styles.principleBody}>{p.body}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={openMail}
          style={({ pressed }) => [
            styles.contactCard,
            pressed && styles.contactPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Email ${ABOUT_CONTACT_EMAIL}`}
        >
          <Text style={styles.contactLabel}>Contact</Text>
          <Text style={styles.contactEmail}>{ABOUT_CONTACT_EMAIL}</Text>
          <Text style={styles.contactHint}>Tap to send email</Text>
        </Pressable>

        <Text style={styles.imprint}>PreMarket Pty Ltd · Melbourne</Text>
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
    paddingBottom: space.xl,
    marginBottom: space.xl,
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
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.85,
    color: colors.ink,
    fontWeight: "400",
    marginBottom: 18,
  },
  heroEm: {
    fontFamily: fonts.displayItalic,
    color: colors.forest,
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 26,
    color: "rgba(17, 17, 17, 0.74)",
    maxWidth: 480,
  },
  narrativeSection: {
    paddingBottom: space.xxl,
    marginBottom: space.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  thesisTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.55,
    color: colors.ink,
    fontWeight: "400",
    marginBottom: space.xl,
  },
  thesisEm: {
    fontFamily: fonts.displayItalic,
    color: colors.forest,
  },
  narrativeP: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 26,
    color: "rgba(17, 17, 17, 0.74)",
    marginBottom: 18,
  },
  principlesWrap: {
    paddingBottom: space.xl,
  },
  principleBlock: {
    paddingVertical: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  principleBlockLast: { borderBottomWidth: 0 },
  principleTitle: {
    fontFamily: fonts.displayItalic,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: colors.forest,
    marginBottom: 10,
  },
  principleBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(17, 17, 17, 0.66)",
  },
  contactCard: {
    marginTop: space.md,
    marginBottom: space.xl,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    backgroundColor: colors.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  contactPressed: { opacity: 0.92 },
  contactLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 8,
  },
  contactEmail: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.forest,
    marginBottom: 8,
  },
  contactHint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
  },
  imprint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: space.md,
  },
});
