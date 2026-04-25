import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useClerk } from "@clerk/expo";
import { colors, spacing } from "../theme/theme";

/** Render only under `ClerkProvider` (e.g. from `HomeScreen` when Clerk env is set). */
export function ClerkSignOutFooter() {
  const { signOut } = useClerk();
  const [busy, setBusy] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          try {
            await signOut();
          } finally {
            setBusy(false);
          }
        }}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <Text style={styles.label}>{busy ? "Signing out…" : "Sign out"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  pressed: { opacity: 0.7 },
});
