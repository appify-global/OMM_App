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

export function SignUpStep2Screen() {
  const navigation = useNavigation();
  const [role, setRole] = useState<"AGENT" | "BUYER">("AGENT");
  const [licence, setLicence] = useState("");
  const [firm, setFirm] = useState("");

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.wordmark}>PreMarket</Text>
      <Text style={styles.issue}>Vol. I · Issue 04 · Apply to join</Text>

      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>II · Step 2 of 4</Text>
      </View>
      <Text style={styles.title}>Tell us who you are.</Text>
      <Text style={styles.lede}>
        Your role on PreMarket. Agents are verified against state licensing
        registers.
      </Text>

      <Text style={styles.label}>Role</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.chip, role === "AGENT" && styles.chipOn]}
          onPress={() => setRole("AGENT")}
        >
          <Text style={styles.chipText}>Agent</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, role === "BUYER" && styles.chipOn]}
          onPress={() => setRole("BUYER")}
        >
          <Text style={styles.chipText}>Buyer</Text>
        </Pressable>
      </View>

      {role === "AGENT" ? (
        <>
          <Text style={styles.label}>Licence number</Text>
          <TextInput
            value={licence}
            onChangeText={setLicence}
            placeholder="e.g. 12345678"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={styles.label}>Firm</Text>
          <TextInput
            value={firm}
            onChangeText={setFirm}
            placeholder="Agency name"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </>
      ) : null}

      <Pressable
        style={styles.cta}
        onPress={() => (navigation as { navigate: (a: string) => void }).navigate("SignUpStep3")}
      >
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.clerkBackground },
  inner: { padding: 20, paddingBottom: 48 },
  back: { marginBottom: 16 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.forest },
  wordmark: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  issue: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginBottom: 16 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginBottom: 8 },
  lede: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 16 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.ink, marginBottom: 8, marginTop: 8 },
  row: { flexDirection: "row", gap: 10, marginBottom: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  chipOn: { borderColor: colors.forest, backgroundColor: colors.surfaceMuted },
  chipText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
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
    marginBottom: 8,
  },
  cta: {
    backgroundColor: colors.forest,
    paddingVertical: 14,
    borderRadius: radii.control,
    alignItems: "center",
    marginTop: 20,
  },
  ctaText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.paper },
});
