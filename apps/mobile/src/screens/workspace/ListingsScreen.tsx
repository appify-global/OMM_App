import { useAuth } from "@clerk/clerk-expo";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { WorkspaceLayout } from "../../components/WorkspaceLayout";
import type { ListingsPageData } from "@unlisted/shared";
import { mobileFetch } from "../../lib/api";
import type { ListingsStackParamList } from "../../navigation/workspaceTypes";
import { colors, fonts, radii } from "../../theme/tokens";

type Nav = NativeStackNavigationProp<ListingsStackParamList, "ListingsList">;

export function ListingsScreen() {
  const { getToken } = useAuth();
  const navigation = useNavigation<Nav>();
  const [data, setData] = useState<ListingsPageData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      const json = await mobileFetch<ListingsPageData>("/api/mobile/listings", getToken);
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
      <WorkspaceLayout active="listings">
        <View style={styles.center}>
          <ActivityIndicator color={colors.forest} />
        </View>
      </WorkspaceLayout>
    );
  }

  if (err || !data) {
    return (
      <WorkspaceLayout active="listings">
        <View style={styles.center}>
          <Text style={styles.err}>{err}</Text>
          <Pressable style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout active="listings">
      <View style={styles.head}>
        <Text style={styles.title}>Portfolio</Text>
        <Pressable
          style={styles.newBtn}
          onPress={() => navigation.navigate("ListingNew")}
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </Pressable>
      </View>
      <FlatList
        data={data.activeListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={false}
        onRefresh={load}
        ListHeaderComponent={
          <Text style={styles.section}>Active</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("ListingDetail", { id: item.id })}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.address}</Text>
            <Text style={styles.price}>{item.priceRange}</Text>
            <Text style={styles.pill}>{item.status}</Text>
          </Pressable>
        )}
      />
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
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  newBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.control,
  },
  newBtnText: { fontFamily: fonts.sansSemiBold, color: colors.paper, fontSize: 13 },
  list: { padding: 16, paddingTop: 0 },
  section: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.muted, marginBottom: 10 },
  card: {
    backgroundColor: colors.paper,
    padding: 14,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  price: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.forest, marginTop: 6 },
  pill: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.sage, marginTop: 6 },
});
