import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { colors, fonts, radii } from "../../theme/tokens";

export function WelcomeScreen() {
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.wordmark}>PreMarket</Text>
      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>I · Welcome</Text>
      </View>
      <Text style={styles.title}>A quiet marketplace for serious property.</Text>
      <Text style={styles.lede}>
        PreMarket is where considered agents and buyers meet before a listing
        goes public. Members only, verified credentials, no clutter.
      </Text>
      <Pressable
        style={styles.cta}
        onPress={() => (navigation as { navigate: (a: string) => void }).navigate("SignUp")}
      >
        <Text style={styles.ctaText}>Start application</Text>
      </Pressable>
      <Pressable
        onPress={() => (navigation as { navigate: (a: string) => void }).navigate("AuthSplash")}
      >
        <Text style={styles.link}>Member splash →</Text>
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
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, color: colors.ink, marginBottom: 12 },
  lede: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 24 },
  cta: {
    backgroundColor: colors.forest,
    paddingVertical: 14,
    borderRadius: radii.control,
    alignItems: "center",
  },
  ctaText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.paper },
  link: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.forest, marginTop: 16 },
});
