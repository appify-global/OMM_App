/**
 * Hook point for enforcing session email policy on `/app`.
 * Extend with Clerk `useUser` + `signOut` if you mirror mobile `work-email` rules on web.
 */
export function WorkEmailSessionGuard() {
  return null;
}
