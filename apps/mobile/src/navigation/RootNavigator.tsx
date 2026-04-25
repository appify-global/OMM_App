/**
 * When Clerk is configured, `App.tsx` uses `AuthRoot` (auth stack vs main stack).
 * This re-export keeps imports stable and matches the “signed-in app” stack.
 */
export { MainNavigator as RootNavigator } from "./MainNavigator";
export { MainNavigator } from "./MainNavigator";
export { AuthNavigator } from "./AuthNavigator";
export { AuthRoot } from "./AuthRoot";
