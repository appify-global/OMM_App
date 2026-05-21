import { loadHomePageDataFromBackend } from "@/lib/backend-web-loaders";

import AppHomeClient from "./AppHomeClient";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  const data = await loadHomePageDataFromBackend();
  return <AppHomeClient data={data} />;
}
