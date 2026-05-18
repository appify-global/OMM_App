import { useAuth } from "@clerk/clerk-expo";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { WorkspaceLayout } from "../../components/WorkspaceLayout";
import { mobileFetch } from "../../lib/api";
import type { ProfileStackParamList } from "../../navigation/workspaceTypes";
import { colors, fonts, radii } from "../../theme/tokens";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "ProfileMain">;

type ProfileResponse = {
  user: { id: string; name: string; email: string };
  profile: {
    name: string;
    title: string;
    firm: string;
    licence: string;
    bio: string;
    rating: number;
    reviewsCount: number;
  };
};

export function ProfileScreen() {
  const { getToken } = useAuth();
  const navigation = useNavigation<Nav>();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      const json = await mobileFetch<ProfileResponse>("/api/mobile/profile", getToken);
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data && !err) {
    return (
      <WorkspaceLayout active="profile">
        <View style={styles.center}>
          <ActivityIndicator color={colors.forest} />
        </View>
      </WorkspaceLayout>
    );
  }

  if (err || !data) {
    return (
      <WorkspaceLayout active="profile">
        <View style={styles.center}>
          <Text style={styles.err}>{err}</Text>
          <Pressable style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </WorkspaceLayout>
    );
  }

  const p = data.profile;
  const initials = p.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const row = (label: string, onPress: () => void, hint?: string) => (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Text style={styles.rowArrow}>→</Text>
    </Pressable>
  );

  return (
    <WorkspaceLayout active="profile">
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.kickerRow}>
          <SquareFilled size={5} />
          <Text style={styles.kicker}>The Member&apos;s Folio</Text>
        </View>
        <View style={styles.heroRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.firm}>
              {p.firm} · Licence {p.licence}
            </Text>
            <Text style={styles.rating}>
              ★ {p.rating.toFixed(1)} · {p.reviewsCount} reviews
            </Text>
          </View>
        </View>

        <Text style={styles.bio}>{p.bio}</Text>

        <Text style={styles.section}>General</Text>
        {row("Account settings", () => navigation.navigate("Account", {}))}
        {row("Contact support", () => navigation.navigate("Support", {}))}
        {row("Share feedback", () => navigation.navigate("Feedback", {}))}

        <Text style={styles.section}>Dealings</Text>
        {row("Reviews", () => navigation.navigate("Reviews", {}), `${p.reviewsCount} reviews`)}
        {row("Disputes", () => navigation.navigate("Disputes", {}))}
        {row("Payments & billing", () => navigation.navigate("Billing", {}))}

        <Text style={styles.section}>Discover</Text>
        {row("Search properties", () => navigation.navigate("Search", {}))}
        {row("Saved listings", () => navigation.navigate("SavedListings", {}))}
        {row("Saved searches", () => navigation.navigate("SavedSearches", {}))}

        <Text style={styles.section}>Privacy & legal</Text>
        {row("Terms of service", () =>
          navigation.navigate("LegalDoc", { doc: "terms" }),
        )}
        {row("Community guidelines", () =>
          navigation.navigate("LegalDoc", { doc: "community" }),
        )}
        {row("Privacy policy", () =>
          navigation.navigate("LegalDoc", { doc: "privacy" }),
        )}
        {row("Delete account", () => navigation.navigate("Danger", {}))}

        <Pressable
          style={styles.edit}
          onPress={() =>
            navigation.navigate("ProfileEdit", {
              title: "Edit profile",
              subtitle: "Native form parity with the web profile editor.",
            })
          }
        >
          <Text style={styles.editText}>Edit profile →</Text>
        </Pressable>
      </ScrollView>
    </WorkspaceLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  err: { color: "#a33", marginBottom: 8, fontFamily: fonts.sans },
  retry: {
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.control,
  },
  retryText: { color: colors.paper, fontFamily: fonts.sansSemiBold },
  inner: { padding: 16, paddingBottom: 48 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  heroRow: { flexDirection: "row", gap: 14, marginBottom: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.sansSemiBold, fontSize: 18, color: colors.paper },
  name: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  title: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted, marginTop: 4 },
  firm: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 6 },
  rating: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.forest, marginTop: 8 },
  bio: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    marginBottom: 20,
  },
  section: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.muted,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowLabel: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink },
  rowHint: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 4 },
  rowArrow: { fontFamily: fonts.sans, fontSize: 16, color: colors.muted },
  edit: { marginTop: 24 },
  editText: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.forest },
});
