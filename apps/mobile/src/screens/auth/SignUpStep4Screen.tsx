import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { colors, fonts, radii } from "../../theme/tokens";

export function SignUpStep4Screen() {
  const navigation = useNavigation();
  const [suburbs, setSuburbs] = useState("Hawthorn, Camberwell");

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.wordmark}>PreMarket</Text>
      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>IV · Step 4 of 4</Text>
      </View>
      <Text style={styles.title}>Profile & suburbs.</Text>
      <Text style={styles.lede}>
        Tell members where you operate. This feeds matching for briefs and
        listings.
      </Text>

      <Text style={styles.label}>Specialist suburbs</Text>
      <TextInput
        value={suburbs}
        onChangeText={setSuburbs}
        placeholder="Comma separated"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <Pressable
        style={styles.cta}
        onPress={() => (navigation as { navigate: (a: string) => void }).navigate("SignIn")}
      >
        <Text style={styles.ctaText}>Finish & sign in</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.clerkBackground },
  inner: { padding: 20, paddingBottom: 48 },
  back: { marginBottom: 16 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.forest },
  wordmark: { fontFamily: fonts.display, fontSize: 24, color: colors.ink, marginBottom: 16 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginBottom: 8 },
  lede: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 16 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.ink, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.inputSurface,
    marginBottom: 16,
  },
  cta: {
    backgroundColor: colors.forest,
    paddingVertical: 14,
    borderRadius: radii.control,
    alignItems: "center",
  },
  ctaText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.paper },
});
