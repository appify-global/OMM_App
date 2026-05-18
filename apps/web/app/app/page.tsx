import { getAppUserId } from "@/lib/auth-user";

import { loadHomePageData } from "./_data/rsc-loaders";
import AppHomeClient from "./AppHomeClient";

export default async function AppHomePage() {
  const userId = await getAppUserId();
  const data = await loadHomePageData(userId);
  return <AppHomeClient data={data} />;
}
