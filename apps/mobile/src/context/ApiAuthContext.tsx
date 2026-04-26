import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useClerk } from "@clerk/expo";

export type ApiAuthContextValue = {
  /**
   * Call when the backend rejects the session (401 after retry).
   * Clears Clerk session so `AuthRoot` returns users to the sign-in stack.
   */
  onSessionInvalid: () => Promise<void>;
};

const ApiAuthContext = createContext<ApiAuthContextValue | null>(null);

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();

  const onSessionInvalid = useCallback(async () => {
    try {
      await signOut();
    } catch (e) {
      if (__DEV__) {
        console.warn("[ApiAuthProvider] signOut failed", e);
      }
    }
  }, [signOut]);

  const value = useMemo(
    () => ({ onSessionInvalid }),
    [onSessionInvalid],
  );

  return (
    <ApiAuthContext.Provider value={value}>{children}</ApiAuthContext.Provider>
  );
}

export function useOptionalApiAuth(): ApiAuthContextValue | null {
  return useContext(ApiAuthContext);
}
