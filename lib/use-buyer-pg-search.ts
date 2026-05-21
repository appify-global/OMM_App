import { useAuth } from '@clerk/expo';
import { useEffect, useMemo, useRef, useState } from 'react';

import { buyerSearchTokens } from '@/lib/buyer-listed-search';
import { fetchBuyerSearchCatalogFromApi } from '@/lib/mobile-search-api';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';
import type { MobileHomeListing } from '@/lib/mobile-home-api';

type Result =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; listings: MobileHomeListing[] }
  | { kind: 'unavailable' };

/**
 * When signed in and the Next API is configured, runs `GET /api/mobile/search?q=…`
 * (Postgres ILIKE on title/address/description/suburb) for Buying Explore keyword search.
 */
export function useBuyerPostgresSearch(
  searchQuery: string,
  enabled: boolean,
): Result {
  const { getToken, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const trimmed = searchQuery.trim();
  const tokens = useMemo(() => buyerSearchTokens(trimmed), [trimmed]);
  const hasTokens = tokens.length > 0;

  const [result, setResult] = useState<Result>({ kind: 'idle' });

  useEffect(() => {
    if (!enabled || !isSignedIn || !isMobileApiConfigured() || !hasTokens) {
      setResult({ kind: 'idle' });
      return;
    }

    const ac = new AbortController();
    const timer = setTimeout(() => {
      void (async () => {
        setResult({ kind: 'loading' });
        const listings = await fetchBuyerSearchCatalogFromApi(
          () => getTokenRef.current(),
          trimmed,
          { signal: ac.signal },
        );
        if (ac.signal.aborted) return;
        if (listings === null) {
          setResult({ kind: 'unavailable' });
        } else {
          setResult({ kind: 'ready', listings });
        }
      })();
    }, 380);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [enabled, hasTokens, isSignedIn, trimmed]);

  return result;
}
