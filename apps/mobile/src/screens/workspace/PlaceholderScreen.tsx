import { useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { colors, fonts, radii } from "../../theme/tokens";

/**
 * Secondary workspace routes: native shell until full parity with each web page.
 */
export function PlaceholderScreen() {
  const route = useRoute();
  const p = route.params as
    | { title?: string; subtitle?: string; doc?: string; id?: string }
    | undefined;
  const title =
    p?.title ??
    (p?.doc ? `Legal · ${p.doc}` : undefined) ??
    (p?.id ? `Record ${p.id}` : undefined) ??
    "PreMarket";
  const subtitle =
    p?.subtitle ??
    "This area mirrors the web workspace. Full native parity ships incrementally.";

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>Workspace</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 20, paddingBottom: 48 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    maxWidth: 520,
  },
});
