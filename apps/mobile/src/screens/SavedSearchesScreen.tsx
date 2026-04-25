import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../navigation/types";
import { brand } from "../theme/brand";
import { TopBar } from "../components/TopBar";

type Props = RootStackScreenProps<"SavedSearches">;

type Row = {
  id: string;
  title: string;
  newCount?: number;
  criteria: string;
  alertsOn: boolean;
  time: string;
};

const DATA: Row[] = [
  {
    id: "1",
    title: "South Yarra Penthouse",
    newCount: 2,
    criteria: "3+ beds · Apartment · $4M+",
    alertsOn: true,
    time: "Yesterday",
  },
  {
    id: "2",
    title: "Hawthorn Family",
    criteria: "4+ beds · House · $2.5M—3.5M",
    alertsOn: false,
    time: "Paused 3d ago",
  },
  {
    id: "3",
    title: "Brighton Beachside",
    newCount: 2,
    criteria: "3+ beds · Apartment · $4M+",
    alertsOn: true,
    time: "Yesterday",
  },
  {
    id: "4",
    title: "Toorak Estates",
    criteria: "4+ beds · House · $2.5M—3.5M",
    alertsOn: false,
    time: "Paused 3d ago",
  },
];

export function SavedSearchesScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <TopBar title="Saved Searches" />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={styles.newSearchBtn}
          onPress={() =>
            navigation.navigate("Home", { mode: "buying", focusSearch: true })
          }
          accessibilityLabel="New search"
        >
          <Text style={styles.newSearchText}>+ NEW SEARCH</Text>
        </Pressable>
        <Text style={styles.helper}>
          Get notified the moment a listing or off-market matches your brief.
        </Text>

        <View style={styles.listHead}>
          <Text style={styles.listHeadL}>4 active searches</Text>
          <Pressable onPress={() => {}} hitSlop={6}>
            <Text style={styles.listHeadR}>SORT · NEWEST</Text>
          </Pressable>
        </View>

        {DATA.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.cardTitle}>{r.title}</Text>
            {r.newCount != null && r.newCount > 0 ? (
              <View style={styles.inlineNew}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{r.newCount} NEW</Text>
                </View>
              </View>
            ) : null}
            <Text style={styles.criteria}>{r.criteria}</Text>
            <View style={styles.rule} />
            <View style={styles.footRow}>
              <View style={styles.footLeft}>
                <View style={[styles.dot, r.alertsOn && styles.dotOn]} />
                <Text style={styles.footState}>
                  {r.alertsOn ? "ALERTS ON" : "ALERTS OFF"}
                </Text>
              </View>
              <Text style={styles.footTime}>{r.time}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safe: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  back: { width: 44, height: 44, justifyContent: "center" },
  backSpacer: { width: 44 },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "500",
    color: brand.charcoal,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  newSearchBtn: {
    backgroundColor: brand.terracotta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  newSearchText: {
    color: brand.warmWhite,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1,
  },
  helper: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 20,
    color: brand.sage,
    textAlign: "center",
  },
  listHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listHeadL: { fontSize: 12, fontWeight: "500", color: brand.charcoal },
  listHeadR: {
    fontSize: 10,
    color: brand.sage,
    letterSpacing: 0.2,
    fontWeight: "500",
  },
  card: {
    backgroundColor: brand.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(138,155,142,0.3)",
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "500", color: brand.charcoal },
  inlineNew: { marginTop: 6, marginBottom: 2, alignSelf: "flex-start" },
  badgePill: {
    backgroundColor: brand.charcoal,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgePillText: {
    color: brand.warmWhite,
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  criteria: { fontSize: 14, color: brand.sage, marginTop: 6, lineHeight: 20 },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(138,155,142,0.3)",
    marginVertical: 12,
  },
  footRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footLeft: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(138,155,142,0.6)",
  },
  dotOn: { backgroundColor: brand.charcoal },
  footState: {
    fontSize: 10,
    color: brand.sage,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  footTime: { fontSize: 11, color: brand.sage },
});
