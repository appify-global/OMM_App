import type {
  ArchivedListing,
  Brief,
  DraftListing,
  Listing,
  ListingEnquiryRow,
  MessageThread,
} from "./fixtures";
import {
  authorityExpiringSoon,
  buyerMatches,
  buyingNotifications,
  latestEnquiries,
  offMarketMatches,
  recentAgentReplies,
  savedSearches,
  transactionsAwaitingReviewCount,
} from "./fixtures";
import type { NotificationListItem } from "./notification-fixtures";

export type { NotificationListItem } from "./notification-fixtures";

export type HomePageLoaderData = {
  userFirstName: string;
  selling: {
    activeListings: Listing[];
    authorityExpiringSoon: {
      id: string;
      title: string;
      address: string;
      daysLeft: number;
    }[];
    newEnquiriesCount: number;
    latestEnquiries: typeof latestEnquiries;
    buyerMatches: typeof buyerMatches;
    totalViews7d: number;
    transactionsAwaitingReviewCount: number;
    draftCount: number;
    preMarketCount: number;
    soiReminderListings: {
      id: string;
      titleLine: string;
      subtitleLine: string;
      needsSoi: boolean;
    }[];
    homePipelineListings: Listing[];
  };
  buying: {
    savedSearches: typeof savedSearches;
    offMarketMatches: typeof offMarketMatches;
    buyingNotifications: typeof buyingNotifications;
    recentAgentReplies: typeof recentAgentReplies;
  };
};

export type ListingsPageData = {
  activeListings: Listing[];
  draftListings: DraftListing[];
  offMarket: typeof offMarketMatches;
  archiveListings: ArchivedListing[];
  performance: ListingEnquiryRow[];
  authorityExpiringSoon: typeof authorityExpiringSoon;
};

export type BriefsPageData = { my: Brief[]; incoming: Brief[] };

/** Matches `OMM_APP/packages/shared` mobile-api shape — mobile Activities + inbox. */
export type InspectionActivityItem = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingAddress: string;
  slotLabel: string;
  bookedAtIso: string;
  perspective: "buyer" | "seller";
  counterpartyLabel: string;
};

export type MessagesInboxData = {
  threads: MessageThread[];
  shortcuts: { newEnquiries: number; pendingReviews: number };
  inspections: InspectionActivityItem[];
};
