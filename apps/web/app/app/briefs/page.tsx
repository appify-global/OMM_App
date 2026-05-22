import { loadBriefsPageDataFromBackend } from "@/lib/backend-web-loaders";

import BriefsPageClient from "./BriefsPageClient";

export const dynamic = "force-dynamic";

export default async function AppBriefsPage() {
  const data = await loadBriefsPageDataFromBackend();
  return <BriefsPageClient data={data} />;
}
