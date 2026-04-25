import { getAppUserId } from "@/lib/auth-user";

import { loadBriefsPageData } from "../_data/rsc-loaders";
import BriefsPageClient from "./BriefsPageClient";

export default async function AppBriefsPage() {
  const userId = await getAppUserId();
  const data = await loadBriefsPageData(userId);
  return <BriefsPageClient data={data} />;
}
