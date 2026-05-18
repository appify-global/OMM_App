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

export function SignUpStep3Screen() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.wordmark}>PreMarket</Text>
      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>III · Step 3 of 4</Text>
      </View>
      <Text style={styles.title}>Verify phone.</Text>
      <Text style={styles.lede}>
        We send a single SMS code to confirm reachability. This mirrors the web
        onboarding flow; Clerk can complete SMS verification in production.
      </Text>

      <Text style={styles.label}>Mobile</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="+61 …"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <Pressable
        style={styles.cta}
        onPress={() => (navigation as { navigate: (a: string) => void }).navigate("SignUpStep4")}
      >
        <Text style={styles.ctaText}>Send code (demo)</Text>
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
