import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import type { Listing, OffMarketMatch, SearchBootstrapResponse } from "@unlisted/shared";
import { mobileFetch } from "../../lib/api";
import { colors, fonts, radii } from "../../theme/tokens";

type ResultRow = {
  kind: "live" | "off";
  id: string;
  title: string;
  meta: string;
  priceRange: string;
  beds: number;
  baths: number;
  landSqm: number;
  match: number;
};

export function SearchWorkspaceScreen() {
  const { getToken } = useAuth();
  const [boot, setBoot] = useState<SearchBootstrapResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [bedsMin, setBedsMin] = useState(0);
  const [showOff, setShowOff] = useState(true);
  const [suburbs, setSuburbs] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      setErr(null);
      const json = await mobileFetch<SearchBootstrapResponse>(
        "/api/mobile/search",
        getToken,
      );
      setBoot(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const results = useMemo(() => {
    if (!boot) return [];
    const all: ResultRow[] = [
      ...boot.activeListings.map((l: Listing) => ({
        kind: "live" as const,
        id: l.id,
        title: l.title,
        meta: l.address,
        priceRange: l.priceRange,
        beds: l.beds,
        baths: l.baths,
        landSqm: l.landSqm,
        match: 0,
      })),
      ...boot.offMarketMatches.map((l: OffMarketMatch) => ({
        kind: "off" as const,
        id: l.id,
        title: l.title,
        meta: l.status,
        priceRange: l.priceRange,
        beds: l.beds,
        baths: l.baths,
        landSqm: l.landSqm,
        match: l.matchPercent,
      })),
    ];
    return all.filter((r) => {
      if (!showOff && r.kind === "off") return false;
      if (q && !(r.title + r.meta).toLowerCase().includes(q.toLowerCase())) return false;
      if (bedsMin > 0 && r.beds < bedsMin) return false;
      if (suburbs.length > 0) {
        const ok = suburbs.some((s) =>
          (r.meta + r.title).toLowerCase().includes(s.toLowerCase()),
        );
        if (!ok) return false;
      }
      return true;
    });
  }, [boot, q, bedsMin, showOff, suburbs]);

  const toggleSuburb = (s: string) => {
    setSuburbs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  if (!boot && !err) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  if (err || !boot) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{err}</Text>
        <Pressable style={styles.retry} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View style={styles.kickerRow}>
          <SquareFilled size={5} />
          <Text style={styles.kicker}>I · Discover</Text>
        </View>
        <Text style={styles.title}>Find your next home.</Text>
      </View>
      <TextInput
        style={styles.search}
        placeholder="Search suburb, address…"
        placeholderTextColor={colors.muted}
        value={q}
        onChangeText={setQ}
      />
      <Text style={styles.filterLabel}>Suburbs</Text>
      <View style={styles.chips}>
        {boot.suburbs.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, suburbs.includes(s) && styles.chipOn]}
            onPress={() => toggleSuburb(s)}
          >
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.stepper}>
        <Text style={styles.filterLabel}>Min beds: {bedsMin === 0 ? "Any" : `${bedsMin}+`}</Text>
        <View style={styles.stepBtns}>
          <Pressable style={styles.stepBtn} onPress={() => setBedsMin(Math.max(0, bedsMin - 1))}>
            <Text>−</Text>
          </Pressable>
          <Pressable style={styles.stepBtn} onPress={() => setBedsMin(Math.min(6, bedsMin + 1))}>
            <Text>+</Text>
          </Pressable>
        </View>
      </View>
      <Pressable style={styles.toggle} onPress={() => setShowOff((v) => !v)}>
        <Text style={styles.toggleText}>
          Include off-market {showOff ? "(on)" : "(off)"}
        </Text>
      </Pressable>
      <Text style={styles.count}>
        {results.length} propert{results.length === 1 ? "y" : "ies"}
      </Text>
      <FlatList
        data={results}
        keyExtractor={(r) => r.kind + r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.pill}>
              {item.kind === "off" ? `OFF-MARKET · ${item.match}%` : "LIVE"}
            </Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.meta}</Text>
            <Text style={styles.price}>{item.priceRange}</Text>
            <Text style={styles.stats}>
              {item.beds} bd · {item.baths} ba · {item.landSqm}m²
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.clerkBackground },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  err: { color: "#a33", marginBottom: 8, fontFamily: fonts.sans },
  retry: {
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.control,
  },
  retryText: { color: colors.paper, fontFamily: fonts.sansSemiBold },
  head: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  search: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 16,
    backgroundColor: colors.inputSurface,
    color: colors.ink,
  },
  filterLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.muted,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.controlTight,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  chipOn: { borderColor: colors.forest, backgroundColor: colors.surfaceMuted },
  chipText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  stepBtns: { flexDirection: "row", gap: 8 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
  toggle: { paddingHorizontal: 16, marginTop: 12 },
  toggleText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.forest },
  count: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.ink,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    backgroundColor: colors.paper,
    padding: 14,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  pill: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.forest, marginBottom: 6 },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  price: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.forest, marginTop: 8 },
  stats: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 6 },
});
