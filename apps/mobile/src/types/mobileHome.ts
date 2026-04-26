/** Subset of `GET /api/mobile/home` JSON — keep in sync with web `HomePageLoaderData`. */
export type MobileHomeListing = {
  id: string;
  title: string;
  address: string;
  priceRange: string;
  status: string;
  authorityDaysLeft: number | null;
  beds: number;
  baths: number;
  landSqm: number;
  views7d: number;
  leads: number;
  soiAttached: boolean;
};

export type MobileAuthorityRow = {
  id: string;
  title: string;
  address: string;
  daysLeft: number;
};

export type MobileBuyerMatch = {
  id: string;
  suburb: string;
  criteria: string;
};

export type MobileSavedSearch = {
  id: string;
  title: string;
  criteria: string;
  alertsOn: boolean;
  newCount: number;
};

export type MobileOffMarketMatch = {
  id: string;
  title: string;
  matchPercent: number;
  priceRange: string;
  beds: number;
  baths: number;
  landSqm: number;
};

export type MobileHomePayload = {
  userFirstName: string;
  selling: {
    activeListings: MobileHomeListing[];
    authorityExpiringSoon: MobileAuthorityRow[];
    newEnquiriesCount: number;
    buyerMatches: MobileBuyerMatch[];
    transactionsAwaitingReviewCount: number;
  };
  buying: {
    savedSearches: MobileSavedSearch[];
    offMarketMatches: MobileOffMarketMatch[];
  };
};

export type RemoteHomeState =
  | { status: "idle" }
  | { status: "skipped" }
  | { status: "loading" }
  | { status: "ready"; data: MobileHomePayload }
  | { status: "error"; message: string };
