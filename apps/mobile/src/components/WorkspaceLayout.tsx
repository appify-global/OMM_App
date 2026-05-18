import { useAuth, useUser } from "@clerk/clerk-expo";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import type { MastheadTab } from "./WorkspaceMasthead";
import { WorkspaceMasthead } from "./WorkspaceMasthead";
import type { NotificationsResponse } from "@unlisted/shared";
import { mobileFetch } from "../lib/api";
import { colors } from "../theme/tokens";
import type { WorkspaceTabParamList } from "../navigation/workspaceTypes";

function initialsFromUser(first?: string | null, last?: string | null) {
  const a = first?.trim()?.[0] ?? "";
  const b = last?.trim()?.[0] ?? "";
  const s = (a + b).toUpperCase();
  return s || "U";
}

type Props = {
  active: MastheadTab;
  children: ReactNode;
};

export function WorkspaceLayout({ active, children }: Props) {
  const navigation = useNavigation<NavigationProp<WorkspaceTabParamList>>();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [hasUnread, setHasUnread] = useState(false);

  const userInitials = initialsFromUser(
    user?.firstName,
    user?.lastName ?? user?.username,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items } = await mobileFetch<NotificationsResponse>(
          "/api/mobile/notifications",
          getToken,
        );
        if (!cancelled) setHasUnread(items.some((i) => !i.read));
      } catch {
        if (!cancelled) setHasUnread(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const onTab = useCallback(
    (t: MastheadTab) => {
      switch (t) {
        case "home":
          navigation.navigate("HomeTab", { screen: "WorkspaceHome" });
          break;
        case "listings":
          navigation.navigate("ListingsTab", { screen: "ListingsList" });
          break;
        case "briefs":
          navigation.navigate("BriefsTab", { screen: "BriefsList" });
          break;
        case "messages":
          navigation.navigate("MessagesTab", { screen: "MessagesList" });
          break;
        case "profile":
          navigation.navigate("ProfileTab", { screen: "ProfileMain" });
          break;
      }
    },
    [navigation],
  );

  const onNotifications = useCallback(() => {
    navigation.navigate("HomeTab", { screen: "Notifications" });
  }, [navigation]);

  const onProfilePress = useCallback(() => {
    navigation.navigate("ProfileTab", { screen: "ProfileMain" });
  }, [navigation]);

  return (
    <View style={styles.root}>
      <WorkspaceMasthead
        userInitials={userInitials}
        hasUnreadNotifications={hasUnread}
        active={active}
        onTab={onTab}
        onNotifications={onNotifications}
        onProfilePress={onProfilePress}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
});
