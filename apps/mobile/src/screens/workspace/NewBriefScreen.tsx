import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { colors, fonts } from "../../theme/tokens";

export function NewBriefScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>New brief</Text>
      </View>
      <Text style={styles.title}>Post a buyer mandate.</Text>
      <Text style={styles.lede}>
        Mirrors `/app/briefs/new` on the web. Wire POST `/api/mobile/briefs` when
        ready to persist from native.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 16, paddingBottom: 40 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginBottom: 10 },
  lede: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.muted },
});
