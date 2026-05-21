import { useAuth } from '@clerk/expo';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { apiFetch, getExpoMobileApiBase } from '@/lib/api';
import { getClerkMobileBearerToken } from '@/lib/clerk-mobile-token';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';
import { setMobilePostgresLinked } from '@/lib/mobile-database-link';

type MobileDatabaseContextValue = {
  postgresLinked: boolean;
  checking: boolean;
  lastError: string | null;
  recheck: () => Promise<boolean>;
};

const MobileDatabaseContext = createContext<MobileDatabaseContextValue | null>(null);

const DEFAULT_CTX: MobileDatabaseContextValue = {
  postgresLinked: false,
  checking: false,
  lastError: null,
  recheck: async () => false,
};

export type DatabasePingResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'unreachable' | 'no_database' | 'db_error' };

export async function pingMobileDatabase(
  getToken: () => Promise<string | null>,
): Promise<DatabasePingResult> {
  if (!isMobileApiConfigured()) {
    return { ok: false, reason: 'not_configured' };
  }
  const base = getExpoMobileApiBase();
  try {
    const res = await apiFetch('/api/mobile/health', getToken, { method: 'GET' });
    const json = (await res.json().catch(() => ({}))) as {
      database?: boolean;
      ok?: boolean;
      error?: string;
      message?: string;
    };
    if (json.database === true) return { ok: true };
    if (!res.ok && res.status === 503) {
      return { ok: false, reason: 'db_error' };
    }
    if (json.ok === false || json.database === false) {
      return { ok: false, reason: 'no_database' };
    }
    return { ok: false, reason: 'unreachable' };
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
}

function pingFailureMessage(result: DatabasePingResult): string {
  const base = getExpoMobileApiBase();
  const host = base ?? 'API origin not set';
  switch (result.reason) {
    case 'not_configured':
      return 'Set EXPO_PUBLIC_MOBILE_API_ORIGIN (e.g. http://127.0.0.1:3102) in .env and restart Expo.';
    case 'unreachable':
      return `Cannot reach ${host} — run npm run dev:backend (OMM_BACKEND on port 3102).`;
    case 'no_database':
      return `API is up but DATABASE_URL is missing on OMM_BACKEND (.env.local).`;
    case 'db_error':
      return `Postgres unreachable from OMM_BACKEND — check DATABASE_URL in OMM_BACKEND/.env.local.`;
    default:
      return `Database check failed (${host}).`;
  }
}

export function MobileDatabaseProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [postgresLinked, setPostgresLinked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const tokenGetter = useCallback(
    () => getClerkMobileBearerToken(getToken),
    [getToken],
  );

  const recheck = useCallback(async () => {
    if (!isSignedIn || !isMobileApiConfigured()) {
      setPostgresLinked(false);
      setMobilePostgresLinked(false);
      setLastError(null);
      return false;
    }
    setChecking(true);
    try {
      const result = await pingMobileDatabase(tokenGetter);
      const ok = result.ok;
      setPostgresLinked(ok);
      setMobilePostgresLinked(ok);
      setLastError(ok ? null : pingFailureMessage(result));
      return ok;
    } catch {
      setPostgresLinked(false);
      setMobilePostgresLinked(false);
      setLastError(pingFailureMessage({ ok: false, reason: 'unreachable' }));
      return false;
    } finally {
      setChecking(false);
    }
  }, [isSignedIn, tokenGetter]);

  useEffect(() => {
    if (!isSignedIn) {
      setPostgresLinked(false);
      setMobilePostgresLinked(false);
      setLastError(null);
      return;
    }
    void recheck();
  }, [isSignedIn, recheck]);

  const value = useMemo(
    (): MobileDatabaseContextValue => ({
      postgresLinked,
      checking,
      lastError,
      recheck,
    }),
    [postgresLinked, checking, lastError, recheck],
  );

  return (
    <MobileDatabaseContext.Provider value={value}>{children}</MobileDatabaseContext.Provider>
  );
}

export function useMobileDatabase(): MobileDatabaseContextValue {
  return useContext(MobileDatabaseContext) ?? DEFAULT_CTX;
}
