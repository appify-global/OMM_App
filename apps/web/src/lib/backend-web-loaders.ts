import "server-only";

import type {
  BriefsPageData,
  HomePageLoaderData,
  ListingsPageData,
  MessagesInboxData,
  NotificationListItem,
} from "../../app/app/_data/dashboard-types";
import type { MessageThread } from "../../app/app/_data/fixtures";

import {
  backendAuthorizedFetch,
  backendAuthorizedJson,
} from "./backend-server-fetch";

export async function loadHomePageDataFromBackend(): Promise<HomePageLoaderData> {
  return backendAuthorizedJson<HomePageLoaderData>("/api/mobile/home");
}

export async function loadListingsPageDataFromBackend(): Promise<ListingsPageData> {
  return backendAuthorizedJson<ListingsPageData>("/api/mobile/listings");
}

export async function loadBriefsPageDataFromBackend(): Promise<BriefsPageData> {
  return backendAuthorizedJson<BriefsPageData>("/api/mobile/briefs");
}

export async function loadMessagesInboxFromBackend(): Promise<MessagesInboxData> {
  return backendAuthorizedJson<MessagesInboxData>("/api/mobile/messages");
}

export async function loadNotificationsListFromBackend(): Promise<
  NotificationListItem[]
> {
  const { items } = await backendAuthorizedJson<{
    items: NotificationListItem[];
  }>("/api/mobile/notifications");
  return items;
}

export async function loadThreadForDetailFromBackend(
  threadId: string,
): Promise<MessageThread | null> {
  const res = await backendAuthorizedFetch(
    `/api/mobile/messages/${encodeURIComponent(threadId)}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`/api/mobile/messages/${threadId}: ${res.status} ${text}`);
  }
  return res.json() as Promise<MessageThread>;
}

type ProfileLayoutJson = {
  user: { id: string; name?: string | null; email?: string | null };
  unreadNotificationCount: number;
};

export async function fetchAppShellFromBackend(): Promise<{
  nameForInitials: string | null | undefined;
  hasUnreadNotifications: boolean;
}> {
  const data = await backendAuthorizedJson<ProfileLayoutJson>(
    "/api/mobile/profile",
  );
  return {
    nameForInitials: data.user?.name,
    hasUnreadNotifications: (data.unreadNotificationCount ?? 0) > 0,
  };
}
