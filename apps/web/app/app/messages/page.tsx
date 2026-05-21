import { loadMessagesInboxFromBackend } from "@/lib/backend-web-loaders";

import MessagesPageClient from "./MessagesPageClient";

export const dynamic = "force-dynamic";

export default async function AppMessagesPage() {
  const data = await loadMessagesInboxFromBackend();
  return <MessagesPageClient data={data} />;
}
