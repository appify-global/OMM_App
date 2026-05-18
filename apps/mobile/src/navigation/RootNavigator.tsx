import { useAuth } from "@clerk/clerk-expo";

import { MarketingNavigator } from "./MarketingNavigator";
import { WorkspaceNavigator } from "./WorkspaceNavigator";

export function RootNavigator() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <WorkspaceNavigator />;
  return <MarketingNavigator />;
}
