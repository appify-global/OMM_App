import { getAppUserId } from "@/lib/auth-user";

import { loadListingsPageData } from "../_data/rsc-loaders";
import ListingsPageClient from "./ListingsPageClient";

export default async function AppListingsPage() {
  const userId = await getAppUserId();
  const data = await loadListingsPageData(userId);
  return <ListingsPageClient data={data} />;
}
