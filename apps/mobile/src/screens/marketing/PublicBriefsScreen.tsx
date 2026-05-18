import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { BriefExampleCard } from "../../components/marketing/BriefExampleCard";
import { Button } from "../../components/ui/Button";
import { Screen } from "../../components/ui/Screen";
import { TextField } from "../../components/ui/TextField";
import {
  briefPageStats,
  briefTimingOptions,
  publicBriefExamples,
} from "../../data/marketingHome";
import type { MarketingStackParamList } from "../../navigation/MarketingNavigator";
import { colors, fonts, space } from "../../theme/tokens";

const CANVAS = "#f8f7f4";

function abbrevTiming(label: string): string {
  if (label === "Flexible") return "Flexible";
  if (label.startsWith("Settling in ")) {
    const rest = label.slice("Settling in ".length);
    if (rest === "120+ days") return "120d+";
    return rest.replace(" days", "d");
  }
  return label;
}

export function PublicBriefsScreen() {
  const navigation = useNavigation();
  const [lookingFor, setLookingFor] = useState("");
  const [suburbs, setSuburbs] = useState("");
  const [budget, setBudget] = useState("");
  const [timing, setTiming] = useState<string>(briefTimingOptions[4]);
  const [notes, setNotes] = useState("");

  const statSnap = useMemo(() => {
    const w = Dimensions.get("window").width;
    const cardW = Math.round(Math.min(152, Math.max(128, w * 0.38)));
    const gap = 10;
    return { cardW, interval: cardW + gap, gap };
  }, []);

  const openWorkspace = () => {
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.masthead}>
          <View style={styles.kickerRow}>
            <SquareFilled size={6} />
            <Text style={styles.kicker}>The Brief</Text>
          </View>
          <Text style={styles.title}>
            Tell the market,{" "}
            <Text style={styles.titleEm}>precisely</Text>
            {"\n"}what you want.
          </Text>
          <Text style={styles.lede}>
            A buyer brief is a private record of the home you intend to buy.
            Agents running quiet campaigns search briefs before they build
            shortlists. The sharper your brief, the earlier you&apos;re seen.
          </Text>
        </View>

        <Text style={styles.statsHeading}>Network</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={statSnap.interval}
          snapToAlignment="start"
          disableIntervalMomentum
          contentContainerStyle={[
            styles.statsScrollInner,
            { gap: statSnap.gap },
          ]}
        >
          {briefPageStats.map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { width: statSnap.cardW }]}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.composeShell}>
          <Text style={styles.composeTitle}>Post a brief</Text>
          <Text style={styles.composeHint}>
            Draft here — submission unlocks when you&apos;re signed in.
          </Text>

          <TextField
            label="What are you looking for"
            placeholder="Family home, 4 bed, character"
            value={lookingFor}
            onChangeText={setLookingFor}
          />
          <TextField
            label="Target suburbs"
            placeholder="Kew, Hawthorn, Balwyn"
            value={suburbs}
            onChangeText={setSuburbs}
          />
          <TextField
            label="Budget range"
            placeholder="$3.5m – 4.5m"
            value={budget}
            onChangeText={setBudget}
          />

          <Text style={styles.timingLabel}>Timing</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timingRail}
          >
            {briefTimingOptions.map((opt) => {
              const selected = timing === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setTiming(opt)}
                  accessibilityLabel={opt}
                  style={[
                    styles.timingChip,
                    selected && styles.timingChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.timingChipText,
                      selected && styles.timingChipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {abbrevTiming(opt)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <TextField
            label="Notes for agents"
            placeholder="Must-haves, deal breakers, anything that helps an agent recognise the right home."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={5}
            style={styles.notesInput}
            textAlignVertical="top"
          />

          <Button onPress={openWorkspace} style={styles.submitBtn}>
            Post brief privately
          </Button>
          <Text style={styles.fineprint}>
            Your brief is visible only to verified agents. You can&apos;t be
            searched by name, and your identity stays private until you choose
            to reveal it.
          </Text>
        </View>

        <View style={styles.recentHeader}>
          <View style={styles.kickerRow}>
            <SquareFilled size={5} />
            <Text style={styles.recentKicker}>Recent briefs</Text>
          </View>
          <Text style={styles.recentSubtitle}>
            Anonymised examples — real posts live in the workspace.
          </Text>
        </View>

        {publicBriefExamples.map((b) => (
          <BriefExampleCard key={b.id} brief={b} onPress={openWorkspace} />
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
  masthead: { marginBottom: space.lg },
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
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
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
  statsHeading: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 10,
  },
  statsScrollInner: {
    paddingBottom: 4,
    marginBottom: space.xl,
  },
  statCard: {
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 16,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#111",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.ink,
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
  },
  composeShell: {
    backgroundColor: colors.paper,
    borderRadius: 20,
    padding: space.lg,
    marginBottom: space.xxl,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  composeTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.35,
    color: colors.ink,
    marginBottom: 8,
  },
  composeHint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    marginBottom: space.lg,
  },
  timingLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.ink,
    marginBottom: 8,
  },
  timingRail: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingRight: 4,
  },
  timingChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.inputSurface,
  },
  timingChipSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  timingChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
  },
  timingChipTextSelected: {
    color: colors.paper,
  },
  notesInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitBtn: { marginTop: 4 },
  fineprint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    marginTop: space.md,
  },
  recentHeader: {
    marginBottom: space.md,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  recentKicker: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: "uppercase",
    color: colors.muted,
  },
  recentSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    marginTop: 8,
    fontStyle: "italic",
  },
});
