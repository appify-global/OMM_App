import { useAuth } from "@clerk/clerk-expo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import type { Brief } from "@unlisted/shared";
import { mobileFetch } from "../../lib/api";
import type { BriefsStackParamList } from "../../navigation/workspaceTypes";
import { colors, fonts, radii } from "../../theme/tokens";

type Props = NativeStackScreenProps<BriefsStackParamList, "BriefDetail">;

export function BriefDetailScreen({ route }: Props) {
  const { getToken } = useAuth();
  const { id } = route.params;
  const [data, setData] = useState<Brief | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      const json = await mobileFetch<Brief>(`/api/mobile/briefs/${id}`, getToken);
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

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <View style={styles.kickerRow}>
        <SquareFilled size={5} />
        <Text style={styles.kicker}>The Brief</Text>
      </View>
      <Text style={styles.hero}>{data.title}</Text>
      <Text style={styles.meta}>{data.suburbs}</Text>
      <Text style={styles.meta}>{data.budget}</Text>
      <View style={styles.panel}>
        <Text style={styles.body}>{data.briefBody}</Text>
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
  meta: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted, marginBottom: 4 },
  panel: {
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.line,
  },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
});
