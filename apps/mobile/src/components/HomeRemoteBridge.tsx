import React, { useEffect } from "react";
import { useAuth } from "@clerk/expo";
import { hasApiConfigured, hasClerkConfigured } from "../config/env";
import { apiMobileGetJson } from "../lib/api";
import type { MobileHomePayload, RemoteHomeState } from "../types/mobileHome";

type Props = {
  onRemote: (state: RemoteHomeState) => void;
};

/**
 * Loads `/api/mobile/home` when Clerk + API base URL are configured.
 * Renders nothing; pushes state to the parent for `HomeScreen`.
 */
export function HomeRemoteBridge({ onRemote }: Props) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!hasClerkConfigured() || !hasApiConfigured()) {
      onRemote({ status: "skipped" });
      return;
    }
    if (!isLoaded) {
      onRemote({ status: "idle" });
      return;
    }
    if (!isSignedIn) {
      onRemote({ status: "skipped" });
      return;
    }

    let cancelled = false;
    onRemote({ status: "loading" });
    (async () => {
      const out = await apiMobileGetJson<MobileHomePayload>(
        "/api/mobile/home",
        getToken,
      );
      if (cancelled) return;
      if (out.ok) {
        onRemote({ status: "ready", data: out.data });
      } else {
        onRemote({
          status: "error",
          message:
            out.status === 0 ? out.error : `${out.status}: ${out.error}`,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, onRemote]);

  return null;
}
