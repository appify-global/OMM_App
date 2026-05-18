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
import type { MessageThread, MessagesInboxData } from "@unlisted/shared";
import { mobileFetch } from "../../lib/api";
import type { MessagesStackParamList } from "../../navigation/workspaceTypes";
import { colors, fonts, radii } from "../../theme/tokens";

type Nav = NativeStackNavigationProp<MessagesStackParamList, "MessagesList">;

export function MessagesScreen() {
  const { getToken } = useAuth();
  const navigation = useNavigation<Nav>();
  const [data, setData] = useState<MessagesInboxData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      const json = await mobileFetch<MessagesInboxData>("/api/mobile/messages", getToken);
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: MessageThread }) => (
    <Pressable
      style={styles.row}
      onPress={() => navigation.navigate("ThreadDetail", { id: item.id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.participant.initials}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{item.participant.name}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {item.preview}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>{item.lastTime}</Text>
        {item.unread ? <View style={styles.dot} /> : null}
      </View>
    </Pressable>
  );

  if (!data && !err) {
    return (
      <WorkspaceLayout active="messages">
        <View style={styles.center}>
          <ActivityIndicator color={colors.forest} />
        </View>
      </WorkspaceLayout>
    );
  }

  if (err || !data) {
    return (
      <WorkspaceLayout active="messages">
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
    <WorkspaceLayout active="messages">
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          New enquiries · {data.shortcuts.newEnquiries} · Pending reviews ·{" "}
          {data.shortcuts.pendingReviews}
        </Text>
      </View>
      <FlatList
        data={data.threads}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
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
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  bannerText: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  list: { paddingVertical: 8 },
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.paper },
  body: { flex: 1 },
  name: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink },
  preview: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  meta: { alignItems: "flex-end" },
  time: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forest,
    marginTop: 6,
  },
});
