import { useAuth } from "@clerk/clerk-expo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { MessageThread } from "@unlisted/shared";
import { mobileFetch } from "../../lib/api";
import type { MessagesStackParamList } from "../../navigation/workspaceTypes";
import { colors, fonts, radii } from "../../theme/tokens";

type Props = NativeStackScreenProps<MessagesStackParamList, "ThreadDetail">;

export function ThreadScreen({ route }: Props) {
  const { getToken } = useAuth();
  const { id } = route.params;
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      const json = await mobileFetch<MessageThread>(
        `/api/mobile/messages/${id}`,
        getToken,
      );
      setThread(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }, [getToken, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!thread && !err) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  if (err || !thread) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{err}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.ctx}>{thread.context}</Text>
        <Text style={styles.cat}>{thread.category}</Text>
      </View>
      <FlatList
        data={thread.messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const out = item.direction === "OUT";
          return (
            <View style={[styles.bubble, out ? styles.bubbleOut : styles.bubbleIn]}>
              <Text style={[styles.bubbleBody, out && styles.bubbleBodyOut]}>
                {item.body}
              </Text>
              <Text style={[styles.bubbleTime, out && styles.bubbleTimeOut]}>
                {item.time}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.clerkBackground },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  err: { color: "#a33", fontFamily: fonts.sans },
  head: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.paper,
  },
  ctx: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.ink },
  cat: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  list: { padding: 16, paddingBottom: 32 },
  bubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: radii.control,
    marginBottom: 10,
  },
  bubbleIn: {
    alignSelf: "flex-start",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  bubbleOut: { alignSelf: "flex-end", backgroundColor: colors.forest },
  bubbleBody: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  bubbleBodyOut: { color: colors.paper },
  bubbleTime: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted, marginTop: 6 },
  bubbleTimeOut: { color: "rgba(252,250,246,0.75)" },
});
