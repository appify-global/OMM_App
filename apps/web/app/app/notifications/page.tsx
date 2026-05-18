import { getAppUserId } from "@/lib/auth-user";

import { loadNotificationsList } from "../_data/rsc-loaders";
import NotificationsPageClient from "./NotificationsPageClient";

export default async function NotificationsPage() {
  const userId = await getAppUserId();
  const initialItems = await loadNotificationsList(userId);
  return <NotificationsPageClient initialItems={initialItems} />;
}
