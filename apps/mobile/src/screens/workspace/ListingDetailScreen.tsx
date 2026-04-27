import { useAuth } from "@clerk/clerk-expo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { mobileFetch } from "../../lib/api";
import type { ListingsStackParamList } from "../../navigation/workspaceTypes";
import { colors, fonts, radii } from "../../theme/tokens";

type Props = NativeStackScreenProps<ListingsStackParamList, "ListingDetail">;

export function ListingDetailScreen({ route }: Props) {
  const { getToken } = useAuth();
  const { id } = route.params;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      const json = await mobileFetch<Record<string, unknown>>(
        `/api/mobile/listings/${id}`,
        getToken,
      );
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }, [getToken, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data && !err) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  if (err || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{err}</Text>
      </View>
    );
  }

  const title = String(data.title ?? "Listing");
  const address = String(data.address ?? "");
  const price = String(data.priceRange ?? data.priceDisplay ?? "—");

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>Listing folio</Text>
      </View>
      <Text style={styles.hero}>{title}</Text>
      <Text style={styles.meta}>{address}</Text>
      <Text style={styles.price}>{price}</Text>
      <View style={styles.panel}>
        <Text style={styles.panelText}>
          Full listing analytics and enquiry history match the web workspace.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  err: { color: "#a33", fontFamily: fonts.sans },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  hero: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginBottom: 8 },
  meta: { fontFamily: fonts.sans, fontSize: 15, color: colors.muted, marginBottom: 8 },
  price: { fontFamily: fonts.sansSemiBold, fontSize: 18, color: colors.forest, marginBottom: 16 },
  panel: {
    padding: 14,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.line,
  },
  panelText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.muted },
});
