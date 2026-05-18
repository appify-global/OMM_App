import { useAuth } from "@clerk/clerk-expo";
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
import type { NotificationListItem, NotificationsResponse } from "@unlisted/shared";
import { mobileFetch, mobilePost } from "../../lib/api";
import { colors, fonts, radii } from "../../theme/tokens";

export function NotificationsScreen() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<NotificationListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setErr(null);
      const json = await mobileFetch<NotificationsResponse>(
        "/api/mobile/notifications",
        getToken,
      );
      setItems(json.items);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await mobilePost(`/api/mobile/notifications/${id}/read`, getToken);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, read: true } : i)),
      );
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <WorkspaceLayout active="home">
        <View style={styles.center}>
          <ActivityIndicator color={colors.forest} />
        </View>
      </WorkspaceLayout>
    );
  }

  if (err) {
    return (
      <WorkspaceLayout active="home">
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
    <WorkspaceLayout active="home">
      <FlatList
        data={items}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet.</Text>
        }
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshing={false}
        onRefresh={load}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.read && styles.cardUnread]}
            onPress={() => markRead(item.id)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{item.occurredAt}</Text>
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
  list: { padding: 16 },
  card: {
    padding: 14,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    marginBottom: 10,
  },
  cardUnread: { borderColor: colors.forest, backgroundColor: colors.surfaceMuted },
  title: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted, marginTop: 6 },
  time: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 8 },
  empty: { fontFamily: fonts.sans, fontSize: 15, color: colors.muted, textAlign: "center", marginTop: 24 },
});
