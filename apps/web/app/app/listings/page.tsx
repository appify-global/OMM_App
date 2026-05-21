import { loadListingsPageDataFromBackend } from "@/lib/backend-web-loaders";

import ListingsPageClient from "./ListingsPageClient";

export const dynamic = "force-dynamic";

export default async function AppListingsPage() {
  const data = await loadListingsPageDataFromBackend();
  return <ListingsPageClient data={data} />;
}
