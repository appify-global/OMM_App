import { useAuth } from "@clerk/clerk-expo";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import type { HomePageLoaderData } from "@unlisted/shared";
import { mobileFetch } from "../../lib/api";
import type {
  HomeStackParamList,
  WorkspaceTabParamList,
} from "../../navigation/workspaceTypes";
import { colors, fonts, radii } from "../../theme/tokens";

type Nav = NativeStackNavigationProp<HomeStackParamList, "WorkspaceHome">;

export function WorkspaceHomeScreen() {
  const { getToken } = useAuth();
  const navigation = useNavigation<Nav>();
  const [data, setData] = useState<HomePageLoaderData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"selling" | "buying">("selling");

  const load = useCallback(async () => {
    try {
      setErr(null);
      const json = await mobileFetch<HomePageLoaderData>("/api/mobile/home", getToken);
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const tabNav =
    navigation.getParent<BottomTabNavigationProp<WorkspaceTabParamList>>();

  const goListing = (id: string) => {
    tabNav?.navigate("ListingsTab", {
      screen: "ListingDetail",
      params: { id },
    });
  };

  const goBriefs = () => {
    tabNav?.navigate("BriefsTab", { screen: "BriefsList" });
  };

  if (!data && !err) {
    return (
      <WorkspaceLayout active="home">
        <View style={styles.center}>
          <ActivityIndicator color={colors.forest} />
        </View>
      </WorkspaceLayout>
    );
  }

  if (err || !data) {
    return (
      <WorkspaceLayout active="home">
        <View style={styles.center}>
          <Text style={styles.err}>{err ?? "Error"}</Text>
          <Pressable style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </WorkspaceLayout>
    );
  }

  const s = data.selling;
  const b = data.buying;

  return (
    <WorkspaceLayout active="home">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        <View style={styles.masthead}>
          <View>
            <View style={styles.kickerRow}>
              <SquareFilled size={5} />
              <Text style={styles.kicker}>The Studio</Text>
            </View>
            <Text style={styles.hero}>
              Good afternoon,{" "}
              <Text style={styles.nameEm}>{data.userFirstName}.</Text>
            </Text>
          </View>
          <View style={styles.toggle}>
            <Pressable
              style={[styles.toggleBtn, mode === "selling" && styles.toggleOn]}
              onPress={() => setMode("selling")}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === "selling" && styles.toggleTextOn,
                ]}
              >
                Selling
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, mode === "buying" && styles.toggleOn]}
              onPress={() => setMode("buying")}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === "buying" && styles.toggleTextOn,
                ]}
              >
                Buying
              </Text>
            </Pressable>
          </View>
        </View>

        {mode === "selling" ? (
          <>
            <View style={styles.kpiRow}>
              <Kpi
                kicker="i"
                label="Active"
                value={s.activeListings.length}
                onPress={() =>
                  tabNav?.navigate("ListingsTab", { screen: "ListingsList" })
                }
              />
              <Kpi kicker="ii" label="Enquiries" value={s.newEnquiriesCount} />
              <Kpi kicker="iii" label="Views 7d" value={s.totalViews7d} />
            </View>
            <Text style={styles.section}>Active listings</Text>
            {s.activeListings.slice(0, 6).map((l) => (
              <Pressable key={l.id} style={styles.card} onPress={() => goListing(l.id)}>
                <Text style={styles.cardTitle}>{l.title}</Text>
                <Text style={styles.cardMeta}>{l.address}</Text>
                <Text style={styles.cardPrice}>{l.priceRange}</Text>
              </Pressable>
            ))}
            <Text style={styles.section}>Authority watch</Text>
            {s.authorityExpiringSoon.slice(0, 4).map((a) => (
              <View key={a.id} style={styles.card}>
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.cardMeta}>{a.daysLeft} days left</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <View style={styles.kpiRow}>
              <Kpi kicker="i" label="Saved searches" value={b.savedSearches.length} />
              <Kpi kicker="ii" label="Off-market" value={b.offMarketMatches.length} />
              <Kpi
                kicker="iii"
                label="Agent replies"
                value={b.buyingNotifications.newAgentReplies}
              />
            </View>
            <Text style={styles.section}>Off-market matches</Text>
            {b.offMarketMatches.slice(0, 6).map((m) => (
              <Pressable key={m.id} style={styles.card} onPress={() => goListing(m.id)}>
                <Text style={styles.pill}>OFF-MARKET · {m.matchPercent}%</Text>
                <Text style={styles.cardTitle}>{m.title}</Text>
                <Text style={styles.cardPrice}>{m.priceRange}</Text>
              </Pressable>
            ))}
            <Text style={styles.section}>Saved searches</Text>
            {b.savedSearches.map((ss) => (
              <Pressable key={ss.id} style={styles.card} onPress={goBriefs}>
                <Text style={styles.cardTitle}>{ss.title}</Text>
                <Text style={styles.cardMeta}>{ss.criteria}</Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </WorkspaceLayout>
  );
}

function Kpi({
  kicker,
  label,
  value,
  onPress,
}: {
  kicker: string;
  label: string;
  value: string | number;
  onPress?: () => void;
}) {
  const inner = (
    <>
      <Text style={styles.kpiK}>{kicker}</Text>
      <Text style={styles.kpiV}>{value}</Text>
      <Text style={styles.kpiL}>{label}</Text>
    </>
  );
  if (onPress) return <Pressable style={styles.kpi} onPress={onPress}>{inner}</Pressable>;
  return <View style={styles.kpi}>{inner}</View>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  inner: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  err: { fontFamily: fonts.sans, color: "#a33", textAlign: "center", marginBottom: 12 },
  retry: { backgroundColor: colors.forest, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radii.control },
  retryText: { fontFamily: fonts.sansSemiBold, color: colors.paper },
  masthead: { marginBottom: 20, gap: 12 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  hero: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.ink },
  nameEm: { fontStyle: "italic", color: colors.forest },
  toggle: { flexDirection: "row", borderRadius: radii.control, borderWidth: 1, borderColor: colors.line, overflow: "hidden", alignSelf: "flex-start" },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.paper },
  toggleOn: { backgroundColor: colors.forest },
  toggleText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  toggleTextOn: { color: colors.paper },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  kpi: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.cardLine,
    borderRadius: radii.controlSoft,
    padding: 12,
  },
  kpiK: { fontFamily: fonts.sansMedium, fontSize: 10, color: colors.muted },
  kpiV: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  kpiL: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 4 },
  section: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.paper,
    padding: 14,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.ink },
  cardMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  cardPrice: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.forest, marginTop: 6 },
  pill: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.forest, marginBottom: 6 },
});
