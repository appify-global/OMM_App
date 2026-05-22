import { loadNotificationsListFromBackend } from "@/lib/backend-web-loaders";

import NotificationsPageClient from "./NotificationsPageClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const initialItems = await loadNotificationsListFromBackend();
  return <NotificationsPageClient initialItems={initialItems} />;
}
