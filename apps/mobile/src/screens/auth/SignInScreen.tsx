import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { AppText, Button, Screen, TextField } from "../../components/ui";
import { colors, fonts, space } from "../../theme/tokens";

export function SignInScreen() {
  const { signIn, isLoaded } = useSignIn();
  const { setActive } = useClerk();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded || !signIn) return;
    setBusy(true);
    setError(null);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        return;
      }
      setError("Additional verification required — use the web app or email link.");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "errors" in e
          ? String(
              (e as { errors?: { message?: string }[] }).errors?.[0]?.message,
            )
          : "Sign in failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen variant="cream" edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.wordmark}>PreMarket</Text>
        <AppText variant="caption" style={styles.issue}>
          Vol. I · Issue 04 · Sign in
        </AppText>

        <View style={styles.kickerRow}>
          <SquareFilled size={5} />
          <AppText variant="kicker">I · Sign in</AppText>
        </View>
        <AppText variant="hero" style={styles.title}>
          Welcome back.
        </AppText>
        <AppText variant="lede" style={styles.lede}>
          Pick up where you left off — your listings, briefs and messages are
          waiting.
        </AppText>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          variant="primary"
          onPress={onSubmit}
          disabled={busy}
          style={styles.cta}
        >
          {busy ? "Signing in…" : "Continue"}
        </Button>

        <Pressable
          onPress={() =>
            (navigation as { navigate: (a: string) => void }).navigate(
              "ForgotPassword",
            )
          }
        >
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            (navigation as { navigate: (a: string) => void }).navigate("SignUp")
          }
        >
          <Text style={styles.link}>Apply to join →</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  inner: { padding: space.xl, paddingBottom: 48 },
  back: { marginBottom: space.md },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.forest },
  wordmark: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  issue: { marginBottom: space.lg },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: space.sm,
  },
  title: { marginBottom: space.sm },
  lede: { marginBottom: space.lg },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.danger,
    marginBottom: space.sm,
  },
  cta: { marginTop: space.sm },
  link: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.forest,
    marginTop: space.md,
  },
});
