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

import {
  mergePublishedListingAppendInspectionBooking,
  incrementPublishedListingBuyerEnquiry,
  incrementPublishedListingBuyerView,
  incrementPublishedListingSaveDelta,
  loadPublishedAgentListings,
  mergePublishedListingAnalyticsSaveDelta,
  mergePublishedListingAnalyticsView,
  persistNewPublishedListing,
  updatePublishedListingStored,
  type InspectionBookingInput,
  type NewPublishedListingInput,
  type PublishedAgentListing,
} from '@/lib/agent-published-listings';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';
import { isMobilePostgresLinked } from '@/lib/mobile-database-link';
import {
  fetchPublishedListingsFromApi,
  mergeListingOverlays,
  patchListingOnApi,
  publishListingToApi,
} from '@/lib/mobile-published-listings-api';
import { ensureListingEnquiryThread } from '@/lib/omm-messages';

type Ctx = {
  listings: PublishedAgentListing[];
  ready: boolean;
  /** True when listings were loaded from Railway Postgres via API. */
  usingDatabase: boolean;
  refresh: () => Promise<void>;
  recordListing: (payload: NewPublishedListingInput) => Promise<string>;
  updateListing: (row: PublishedAgentListing) => Promise<boolean>;
  getById: (id: string) => PublishedAgentListing | undefined;
  recordBuyerListingView: (listingId: string) => Promise<void>;
  recordBuyerListingSaveDelta: (listingId: string, delta: number) => Promise<void>;
  recordBuyerListingEnquiry: (listingId: string) => Promise<void>;
  recordBuyerInspectionBooking: (
    listingId: string,
    input: InspectionBookingInput,
  ) => Promise<boolean>;
};

const AgentPublishedListingsContext = createContext<Ctx | null>(null);

export function AgentPublishedListingsProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [listings, setListings] = useState<PublishedAgentListing[]>([]);
  const [ready, setReady] = useState(false);
  const [usingDatabase, setUsingDatabase] = useState(false);

  const tokenGetter = useCallback(async () => {
    try {
      return (await getToken()) ?? null;
    } catch {
      return null;
    }
  }, [getToken]);

  const refresh = useCallback(async () => {
    if (isSignedIn && isMobileApiConfigured()) {
      const apiRows = await fetchPublishedListingsFromApi(tokenGetter);
      if (apiRows != null) {
        if (isMobilePostgresLinked()) {
          setListings(apiRows);
        } else {
          const local = await loadPublishedAgentListings();
          setListings(mergeListingOverlays(apiRows, local));
        }
        setUsingDatabase(true);
        return;
      }
      if (isMobilePostgresLinked()) {
        setListings([]);
        setUsingDatabase(true);
        return;
      }
    }
    if (isMobilePostgresLinked()) {
      setListings([]);
      setUsingDatabase(true);
      return;
    }
    const local = await loadPublishedAgentListings();
    setListings(local);
    setUsingDatabase(false);
  }, [isSignedIn, tokenGetter]);

  useEffect(() => {
    let alive = true;
    void refresh().finally(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [refresh]);

  const syncMetaToApi = useCallback(
    async (row: PublishedAgentListing) => {
      if (!isSignedIn || !isMobileApiConfigured() || !row.id.startsWith('lst-')) return;
      await patchListingOnApi(tokenGetter, row.id, {
        listingAnalytics: row.listingAnalytics,
        localInspectionBookings: row.localInspectionBookings,
        listingStatus: row.listingStatus,
        soldMarkedAt: row.soldMarkedAt,
        archivedAt: row.archivedAt,
      });
    },
    [isSignedIn, tokenGetter],
  );

  const recordListing = useCallback(
    async (payload: NewPublishedListingInput) => {
      if (isSignedIn && isMobileApiConfigured()) {
        const published = await publishListingToApi(tokenGetter, {
          details: {
            address: payload.addressLine,
            propertyType: payload.propertyType,
            bedrooms: String(payload.beds),
            bathrooms: String(payload.baths),
            carSpaces: String(payload.cars),
            landAreaSize: payload.landSqm != null ? String(payload.landSqm) : '',
            internalArea: '',
          },
          listingPriceFromAud: payload.listingPriceFromAud ?? null,
          listingPriceToAud: payload.listingPriceToAud ?? null,
          addressDisclosure: payload.addressDisclosure,
          sellerInspectionAvailability: payload.sellerInspectionAvailability,
          sellerInspectionAvailabilityTags: payload.sellerInspectionAvailabilityTags,
          sellerInspectionAvailabilityNotes: payload.sellerInspectionAvailabilityNotes,
          draftPhotos: payload.listingPhotos?.map((p) => ({ uri: p.uri, id: p.id })),
          draftFloorPlan: payload.listingFloorPlan,
        });
        if (published) {
          await refresh();
          return published.listingId;
        }
        if (isMobilePostgresLinked()) {
          throw new Error('Could not publish listing to Railway Postgres');
        }
      }
      const id = await persistNewPublishedListing(payload);
      await refresh();
      return id;
    },
    [isSignedIn, refresh, tokenGetter],
  );

  const updateListing = useCallback(
    async (row: PublishedAgentListing) => {
      if (usingDatabase && row.id.startsWith('lst-')) {
        await syncMetaToApi(row);
        setListings((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        return true;
      }
      const ok = await updatePublishedListingStored(row);
      if (ok) await refresh();
      return ok;
    },
    [refresh, syncMetaToApi, usingDatabase],
  );

  const getById = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  );

  const recordBuyerListingView = useCallback(
    async (listingId: string) => {
      const row = listings.find((l) => l.id === listingId);
      if (usingDatabase && row) {
        const next = mergePublishedListingAnalyticsView(row);
        await patchListingOnApi(tokenGetter, listingId, {
          listingAnalytics: next.listingAnalytics,
        });
        setListings((prev) => prev.map((r) => (r.id === listingId ? next : r)));
        return;
      }
      await incrementPublishedListingBuyerView(listingId);
      await refresh();
    },
    [listings, refresh, tokenGetter, usingDatabase],
  );

  const recordBuyerListingSaveDelta = useCallback(
    async (listingId: string, delta: number) => {
      const row = listings.find((l) => l.id === listingId);
      if (usingDatabase && row) {
        const next = mergePublishedListingAnalyticsSaveDelta(row, delta);
        await patchListingOnApi(tokenGetter, listingId, {
          listingAnalytics: next.listingAnalytics,
        });
        setListings((prev) => prev.map((r) => (r.id === listingId ? next : r)));
        return;
      }
      await incrementPublishedListingSaveDelta(listingId, delta);
      await refresh();
    },
    [listings, refresh, tokenGetter, usingDatabase],
  );

  const recordBuyerListingEnquiry = useCallback(
    async (listingId: string) => {
      if (isSignedIn && isMobileApiConfigured() && listingId.startsWith('lst-')) {
        await patchListingOnApi(tokenGetter, listingId, { action: 'buyer_enquiry' });
      } else {
        await incrementPublishedListingBuyerEnquiry(listingId);
      }
      const row = listings.find((l) => l.id === listingId);
      if (row) {
        await ensureListingEnquiryThread(row);
      }
      await refresh();
    },
    [isSignedIn, listings, refresh, tokenGetter],
  );

  const recordBuyerInspectionBooking = useCallback(
    async (listingId: string, input: InspectionBookingInput) => {
      const row = listings.find((l) => l.id === listingId);
      if (!row) return false;
      const next = mergePublishedListingAppendInspectionBooking(row, input);
      if (usingDatabase) {
        await patchListingOnApi(tokenGetter, listingId, {
          localInspectionBookings: next.localInspectionBookings,
        });
        setListings((prev) => prev.map((r) => (r.id === listingId ? next : r)));
        return true;
      }
      const ok = await updatePublishedListingStored(next);
      if (ok) await refresh();
      return ok;
    },
    [listings, refresh, tokenGetter, usingDatabase],
  );

  const value = useMemo(
    () => ({
      listings,
      ready,
      usingDatabase,
      refresh,
      recordListing,
      updateListing,
      getById,
      recordBuyerListingView,
      recordBuyerListingSaveDelta,
      recordBuyerListingEnquiry,
      recordBuyerInspectionBooking,
    }),
    [
      listings,
      ready,
      usingDatabase,
      refresh,
      recordListing,
      updateListing,
      getById,
      recordBuyerListingView,
      recordBuyerListingSaveDelta,
      recordBuyerListingEnquiry,
      recordBuyerInspectionBooking,
    ],
  );

  return (
    <AgentPublishedListingsContext.Provider value={value}>
      {children}
    </AgentPublishedListingsContext.Provider>
  );
}

export function useAgentPublishedListings(): Ctx {
  const ctx = useContext(AgentPublishedListingsContext);
  if (!ctx) {
    throw new Error('useAgentPublishedListings must be used within AgentPublishedListingsProvider');
  }
  return ctx;
}
