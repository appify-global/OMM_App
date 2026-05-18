import { getAppUserId } from "@/lib/auth-user";

import { loadMessagesInbox } from "../_data/rsc-loaders";
import MessagesPageClient from "./MessagesPageClient";

export default async function AppMessagesPage() {
  const userId = await getAppUserId();
  const data = await loadMessagesInbox(userId);
  return <MessagesPageClient data={data} />;
}
