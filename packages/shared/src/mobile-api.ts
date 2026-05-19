/** JSON types for `/api/mobile/*` — keep aligned with `apps/web` loaders and fixtures. */

export type ListingStatus =
  | "ACTIVE"
  | "SOI PENDING"
  | "DRAFT"
  | "OFF-MARKET"
  | "PRIVATE"
  | "EXCLUSIVE";

export type Listing = {
  id: string;
  title: string;
  address: string;
  priceRange: string;
  status: ListingStatus;
  authorityDaysLeft: number | null;
  beds: number;
  baths: number;
  landSqm: number;
  views7d: number;
  leads: number;
  soiAttached: boolean;
};

export type AuthorityExpiring = {
  id: string;
  title: string;
  address: string;
  daysLeft: number;
};

export type Enquiry = {
  id: string;
  name: string;
  address: string;
  listingTitle: string;
  hoursAgo: number;
};

export type BuyerMatch = {
  id: string;
  suburb: string;
  criteria: string;
  newCount?: number;
};

export type SavedSearch = {
  id: string;
  title: string;
  criteria: string;
  alertsOn: boolean;
  newCount: number;
};

export type AgentReply = {
  id: string;
  agentName: string;
  agentFirm: string;
  snippet: string;
};

export type OffMarketMatch = {
  id: string;
  title: string;
  status: "OFF-MARKET" | "PRIVATE" | "EXCLUSIVE";
  matchPercent: number;
  priceRange: string;
  beds: number;
  baths: number;
  landSqm: number;
};

export type HomePageLoaderData = {
  userFirstName: string;
  selling: {
    activeListings: Listing[];
    /** LIVE + PRE_MARKET + drafts; mobile home carousel. */
    homePipelineListings: Listing[];
    authorityExpiringSoon: AuthorityExpiring[];
    newEnquiriesCount: number;
    latestEnquiries: Enquiry[];
    buyerMatches: BuyerMatch[];
    totalViews7d: number;
    transactionsAwaitingReviewCount: number;
  };
  buying: {
    savedSearches: SavedSearch[];
    offMarketMatches: OffMarketMatch[];
    buyingNotifications: {
      newAgentReplies: number;
      transactionsAwaitingReview: number;
    };
    recentAgentReplies: AgentReply[];
  };
};

export type DraftListing = {
  id: string;
  title: string;
  address: string;
  step: number;
  totalSteps: number;
  lastEditedDays: number;
};

export type ArchivedListing = {
  id: string;
  title: string;
  address: string;
  closedReason: "SOLD" | "WITHDRAWN" | "EXPIRED";
  closedAt: string;
  finalPrice?: string;
};

export type ListingEnquiryRow = {
  id: string;
  listingId: string;
  listingTitle: string;
  views7d: number;
  enquiries7d: number;
  conversionPct: number;
};

export type ListingsPageData = {
  activeListings: Listing[];
  draftListings: DraftListing[];
  offMarket: OffMarketMatch[];
  archiveListings: ArchivedListing[];
  performance: ListingEnquiryRow[];
  authorityExpiringSoon: AuthorityExpiring[];
};

export type Brief = {
  id: string;
  title: string;
  ownerSide: "BUYER" | "SELLER";
  postedDays: number;
  status: string;
  suburbs: string;
  budget: string;
  propertyType: string;
  minBeds: string;
  briefBody: string;
  matchCount: number;
  unreadReplies: number;
  matches: unknown[];
  replies: unknown[];
};

export type BriefsPageData = { my: Brief[]; incoming: Brief[] };

export type MessageThread = {
  id: string;
  participant: {
    name: string;
    initials: string;
    firm: string;
    isOnline: boolean;
  };
  context: string;
  category: string;
  unread: boolean;
  preview: string;
  lastTime: string;
  pinned: boolean;
  messages: {
    id: string;
    direction: string;
    body: string;
    time: string;
    dateGroup?: string;
    attachments?: {
      id: string;
      filename: string;
      kind: string;
      caption?: string;
    }[];
  }[];
};

export type MessagesInboxData = {
  threads: MessageThread[];
  shortcuts: { newEnquiries: number; pendingReviews: number };
};

export type NotificationKind =
  | "NEW_MATCH"
  | "NEW_ENQUIRY"
  | "NEW_OFFER"
  | "INSPECTION"
  | "MESSAGE"
  | "BRIEF_REPLY"
  | "REVIEW"
  | "DISPUTE"
  | "BILLING"
  | "SYSTEM";

export type NotificationListItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  read: boolean;
  occurredAt: string;
};

export type NotificationsResponse = { items: NotificationListItem[] };

export type SearchBootstrapResponse = {
  propertyTypes: string[];
  suburbs: string[];
  features: string[];
  activeListings: Listing[];
  offMarketMatches: OffMarketMatch[];
  savedSearches: SavedSearch[];
};
