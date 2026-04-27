import { useSignUp } from "@clerk/clerk-expo";
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

export function SignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded || !signUp) return;
    setBusy(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      (navigation as { navigate: (a: string) => void }).navigate("SignUpStep2");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "errors" in e
          ? String((e as { errors?: { message?: string }[] }).errors?.[0]?.message)
          : "Sign up failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.wordmark}>PreMarket</Text>
      <Text style={styles.issue}>Vol. I · Issue 04 · Apply</Text>

      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>I · Account</Text>
      </View>
      <Text style={styles.title}>Begin your application.</Text>
      <Text style={styles.lede}>
        We review every member. Start with email and password — you will verify
        contact details in the following steps.
      </Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Min 8 characters"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.cta, busy && styles.ctaDisabled]}
        onPress={onSubmit}
        disabled={busy}
      >
        <Text style={styles.ctaText}>{busy ? "Saving…" : "Continue"}</Text>
      </Pressable>

      <Pressable onPress={() => (navigation as { navigate: (a: string) => void }).navigate("SignIn")}>
        <Text style={styles.link}>Already a member? Sign in</Text>
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
  issue: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginBottom: 20 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginBottom: 8 },
  lede: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 20 },
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
    marginBottom: 14,
  },
  error: { fontFamily: fonts.sans, fontSize: 13, color: "#a33", marginBottom: 12 },
  cta: {
    backgroundColor: colors.forest,
    paddingVertical: 14,
    borderRadius: radii.control,
    alignItems: "center",
    marginTop: 8,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.paper },
  link: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.forest,
    marginTop: 16,
  },
});
