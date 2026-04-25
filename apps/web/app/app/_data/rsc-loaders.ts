import "server-only";

import { briefs, listings, threads as threadsTbl } from "@/db/schema";
import {
  getBriefsByBuyer,
  getCurrentUser,
  getIncomingBriefsForAgent,
  getListingsByAgentGrouped,
  getNotifications,
  getOffMarketListingsPublic,
  getSavedSearches,
  getThreadByIdForOwner,
  getMessagesForThread,
  getAttachmentsForMessage,
  getThreadsForOwner,
} from "@/db/queries";
import type { InferSelectModel } from "drizzle-orm";

import {
  activeListings,
  archivedListings,
  authorityExpiringSoon,
  buyingNotifications,
  buyerMatches,
  draftListings,
  incomingBriefs,
  latestEnquiries,
  listingPerformance,
  myPostedBriefs,
  newEnquiriesCount,
  offMarketMatches,
  recentAgentReplies,
  savedSearches,
  threads as fixtureThreads,
  transactionsAwaitingReviewCount,
  type ArchivedListing,
  type Brief,
  type DraftListing,
  type Listing,
  type ListingEnquiryRow,
  type MessageThread,
} from "./fixtures";
import {
  defaultNotificationItems,
  type NotificationListItem,
} from "./notification-fixtures";

const HAS_DB = Boolean(process.env.DATABASE_URL);

type ListingRow = InferSelectModel<typeof listings>;
type BriefRow = InferSelectModel<typeof briefs>;
type ThreadRow = InferSelectModel<typeof threadsTbl>;

function mapStatus(s: string): string {
  const m: Record<string, string> = {
    DRAFT: "DRAFT",
    PRE_MARKET: "OFF-MARKET",
    LIVE: "ACTIVE",
    UNDER_OFFER: "UNDER OFFER",
    SOLD: "SOLD",
    WITHDRAWN: "WITHDRAWN",
    ARCHIVED: "ARCHIVED",
  };
  return m[s] ?? s;
}

function daysFrom(exp: Date | null): number | null {
  if (!exp) return null;
  const d = Math.ceil((+exp - Date.now()) / 86400000);
  return d;
}

function mapListingToFixtureShape(l: ListingRow): Listing {
  return {
    id: l.id,
    title: l.title,
    address: l.address,
    priceRange: l.priceDisplay ?? "—",
    status: mapStatus(l.status) as Listing["status"],
    authorityDaysLeft: daysFrom(l.authorityExpiresAt),
    beds: l.bedrooms ?? 0,
    baths: l.bathrooms ?? 0,
    landSqm: l.landSizeSqm ?? 0,
    views7d: l.viewsCount,
    leads: l.enquiriesCount,
    soiAttached: Boolean(l.soiUrl),
  };
}

function mapDbBrief(b: BriefRow, ownerSide: "BUYER" | "SELLER" = "BUYER"): Brief {
  const postedDays = Math.max(
    0,
    Math.floor(
      (Date.now() - (b.createdAt?.getTime() ?? Date.now())) / 86400000,
    ),
  );
  const subs = Array.isArray(b.suburbs)
    ? b.suburbs
    : typeof b.suburbs === "string"
      ? [b.suburbs]
      : [];
  const types = Array.isArray(b.propertyTypes) ? b.propertyTypes : [];
  return {
    id: b.id,
    title: b.headline,
    ownerSide: ownerSide,
    postedDays,
    status: b.status as Brief["status"],
    suburbs: subs.join(", "),
    budget: b.budgetDisplay ?? "—",
    propertyType: types.join(" · "),
    minBeds: b.bedroomsMin ? `${b.bedroomsMin}+` : "—",
    briefBody: b.story ?? "—",
    matchCount: 0,
    unreadReplies: 0,
    matches: [],
    replies: [],
  };
}

function relTime(d: Date | null): string {
  if (!d) return "—";
  const s = Math.floor((Date.now() - +d) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}M`;
  if (s < 86400) return `${Math.floor(s / 3600)}H`;
  return `${Math.floor(s / 86400)}D`;
}

function formatNotificationAge(d: Date): string {
  const s = Math.floor((Date.now() - +d) / 1000);
  if (s < 120) return "Just now";
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return "Yesterday";
  if (s < 604800) return `${Math.floor(s / 86400)} days ago`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export async function loadNotificationsList(
  userId: string,
): Promise<NotificationListItem[]> {
  if (!HAS_DB) {
    return defaultNotificationItems;
  }
  const rows = await getNotifications(userId);
  if (rows.length === 0) {
    return defaultNotificationItems;
  }
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body ?? "",
    href: r.href ?? "/app/notifications",
    read: r.read,
    occurredAt: formatNotificationAge(
      r.occurredAt instanceof Date ? r.occurredAt : new Date(r.occurredAt),
    ),
  }));
}

export type HomePageLoaderData = {
  userFirstName: string;
  selling: {
    activeListings: Listing[];
    authorityExpiringSoon: { id: string; title: string; address: string; daysLeft: number }[];
    newEnquiriesCount: number;
    latestEnquiries: typeof latestEnquiries;
    buyerMatches: typeof buyerMatches;
    totalViews7d: number;
    transactionsAwaitingReviewCount: number;
  };
  buying: {
    savedSearches: typeof savedSearches;
    offMarketMatches: typeof offMarketMatches;
    buyingNotifications: typeof buyingNotifications;
    recentAgentReplies: typeof recentAgentReplies;
  };
};

export async function loadHomePageData(
  userId: string,
): Promise<HomePageLoaderData> {
  const u = await getCurrentUser(userId);
  const first = u?.name?.split(/\s+/)[0] ?? "There";

  if (!HAS_DB) {
    return {
      userFirstName: first,
      selling: {
        activeListings,
        authorityExpiringSoon,
        newEnquiriesCount,
        latestEnquiries,
        buyerMatches,
        totalViews7d: activeListings.reduce((s, l) => s + l.views7d, 0),
        transactionsAwaitingReviewCount,
      },
      buying: {
        savedSearches,
        offMarketMatches,
        buyingNotifications,
        recentAgentReplies,
      },
    };
  }

  const grouped = await getListingsByAgentGrouped(userId);
  const allMine = [
    ...grouped.active,
    ...grouped.draft,
    ...grouped.offMarket,
    ...grouped.archive,
  ];
  const act = grouped.active.map(mapListingToFixtureShape);
  const exp = [...grouped.active, ...grouped.offMarket, ...grouped.draft]
    .filter(
      (l) =>
        l.authorityExpiresAt &&
        daysFrom(l.authorityExpiresAt) !== null &&
        (daysFrom(l.authorityExpiresAt) as number) <= 30,
    )
    .map((l) => ({
      id: l.id,
      title: l.title,
      address: l.address,
      daysLeft: daysFrom(l.authorityExpiresAt) as number,
    }));

  const othersBriefs = await getIncomingBriefsForAgent(userId);
  const bm = othersBriefs.slice(0, 5).map((b) => ({
    id: b.id,
    suburb: b.headline,
    criteria: b.budgetDisplay ?? "—",
  }));

  const totalViews7d = allMine.reduce((s, l) => s + l.viewsCount, 0);
  const thr = await getThreadsForOwner(userId);
  const unreadE = thr.filter((t) => t.unread).length;

  const om = (await getOffMarketListingsPublic(6)).map(
    (l) =>
      ({
        id: l.id,
        title: l.title,
        status: "OFF-MARKET" as const,
        matchPercent: 90,
        priceRange: l.priceDisplay ?? "—",
        beds: l.bedrooms ?? 0,
        baths: l.bathrooms ?? 0,
        landSqm: l.landSizeSqm ?? 0,
      }) as (typeof offMarketMatches)[0],
  );

  const saved = await getSavedSearches(userId);
  const savedOut =
    saved.length > 0
      ? saved.map(
          (s) =>
            ({
              id: s.id,
              title: s.name,
              criteria: s.suburbs?.join?.(", ") ?? s.query ?? "—",
              alertsOn: s.alertCadence !== "OFF",
              newCount: s.newMatchesCount,
            } as (typeof savedSearches)[0]),
        )
      : savedSearches;

  return {
    userFirstName: first,
    selling: {
      activeListings: act.length ? act : activeListings,
      authorityExpiringSoon: exp.length ? exp : authorityExpiringSoon,
      newEnquiriesCount: unreadE || newEnquiriesCount,
      latestEnquiries: latestEnquiries,
      buyerMatches: bm.length ? bm : buyerMatches,
      totalViews7d: totalViews7d || 500,
      transactionsAwaitingReviewCount,
    },
    buying: {
      savedSearches: savedOut,
      offMarketMatches: om.length ? om : offMarketMatches,
      buyingNotifications,
      recentAgentReplies,
    },
  };
}

export type ListingsPageData = {
  activeListings: Listing[];
  draftListings: DraftListing[];
  offMarket: typeof offMarketMatches;
  archiveListings: ArchivedListing[];
  performance: ListingEnquiryRow[];
  authorityExpiringSoon: typeof authorityExpiringSoon;
};

export async function loadListingsPageData(agentId: string): Promise<ListingsPageData> {
  if (!HAS_DB) {
    return {
      activeListings,
      draftListings,
      offMarket: offMarketMatches,
      archiveListings: archivedListings,
      performance: listingPerformance,
      authorityExpiringSoon,
    };
  }
  const g = await getListingsByAgentGrouped(agentId);
  const all = [
    ...g.active,
    ...g.draft,
    ...g.offMarket,
    ...g.archive,
  ];
  return {
    activeListings: g.active.map(mapListingToFixtureShape),
    draftListings: g.draft.map(mapDraftToPanel),
    offMarket: g.offMarket.map(
      (l) =>
        ({
          id: l.id,
          title: l.title,
          status: "OFF-MARKET" as const,
          matchPercent: 90,
          priceRange: l.priceDisplay ?? "—",
          beds: l.bedrooms ?? 0,
          baths: l.bathrooms ?? 0,
          landSqm: l.landSizeSqm ?? 0,
        }) as (typeof offMarketMatches)[0],
    ),
    archiveListings: g.archive.map(mapArchiveToPanel),
    performance: all.slice(0, 8).map(
      (l) =>
        ({
          id: `perf-${l.id}`,
          listingId: l.id,
          listingTitle: l.title,
          views7d: l.viewsCount,
          enquiries7d: l.enquiriesCount,
          conversionPct: Math.min(
            3.2,
            Math.round(
              (l.enquiriesCount / Math.max(1, l.viewsCount)) * 100 * 10,
            ) / 10,
          ),
        }) as ListingEnquiryRow,
    ),
    authorityExpiringSoon: all
      .filter(
        (l) =>
          l.authorityExpiresAt &&
          (daysFrom(l.authorityExpiresAt) ?? 99) <= 30,
      )
      .map((l) => ({
        id: l.id,
        title: l.title,
        address: l.address,
        daysLeft: daysFrom(l.authorityExpiresAt) as number,
      })),
  };
}

export type BriefsPageData = { my: Brief[]; incoming: Brief[] };

export async function loadBriefsPageData(userId: string): Promise<BriefsPageData> {
  if (!HAS_DB) {
    return { my: myPostedBriefs, incoming: incomingBriefs };
  }
  const mine = await getBriefsByBuyer(userId);
  const inc = await getIncomingBriefsForAgent(userId);
  return {
    my: mine.length
      ? mine.map((b) => mapDbBrief(b, "BUYER"))
      : myPostedBriefs,
    incoming: inc.length
      ? inc.map((b) => mapDbBrief(b, "SELLER"))
      : incomingBriefs,
  };
}

function mapDraftToPanel(l: ListingRow): DraftListing {
  return {
    id: l.id,
    title: l.title,
    address: l.address,
    step: 2,
    totalSteps: 5,
    lastEditedDays: 0,
  };
}

function mapArchiveToPanel(l: ListingRow): ArchivedListing {
  const cr: ArchivedListing["closedReason"] =
    l.status === "SOLD"
      ? "SOLD"
      : l.status === "WITHDRAWN"
        ? "WITHDRAWN"
        : "EXPIRED";
  return {
    id: l.id,
    title: l.title,
    address: l.address,
    closedReason: cr,
    closedAt: l.updatedAt
      ? l.updatedAt.toLocaleDateString("en-AU", { month: "short", year: "numeric" })
      : "—",
    finalPrice: l.priceDisplay ?? undefined,
  };
}

function mapThreadToFixture(t: ThreadRow): MessageThread {
  return {
    id: t.id,
    participant: {
      name: t.participantName,
      initials: t.participantInitials ?? t.participantName.slice(0, 2).toUpperCase(),
      firm: t.participantFirm ?? "",
      isOnline: false,
    },
    context: t.context,
    category: t.category,
    unread: t.unread,
    preview: t.preview ?? "",
    lastTime: relTime(t.lastMessageAt),
    messages: [],
    pinned: t.pinned,
  };
}

export type MessagesInboxData = { threads: MessageThread[]; shortcuts: { newEnquiries: number; pendingReviews: number } };

export async function loadMessagesInbox(
  userId: string,
): Promise<MessagesInboxData> {
  if (!HAS_DB) {
    return {
      threads: fixtureThreads,
      shortcuts: { newEnquiries: 2, pendingReviews: 1 },
    };
  }
  const thr = await getThreadsForOwner(userId);
  if (!thr.length) {
    return { threads: fixtureThreads, shortcuts: { newEnquiries: 0, pendingReviews: 0 } };
  }
  return {
    threads: thr.map(mapThreadToFixture),
    shortcuts: {
      newEnquiries: thr.filter((t) => t.unread).length,
      pendingReviews: 0,
    },
  };
}

export async function loadThreadForDetail(threadId: string, ownerId: string) {
  if (!HAS_DB) {
    const { getThreadById } = await import("./fixtures");
    return getThreadById(threadId);
  }
  const t = await getThreadByIdForOwner(threadId, ownerId);
  if (!t) return null;
  const msgs = await getMessagesForThread(threadId);
  const out: MessageThread = { ...mapThreadToFixture(t), messages: [] };
  for (const m of msgs) {
    const atts = await getAttachmentsForMessage(m.id);
    out.messages.push({
      id: m.id,
      direction: m.direction,
      body: m.body ?? "",
      time: m.sentAt
        ? m.sentAt.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
        : "—",
      dateGroup: "TODAY",
      attachments: atts.length
        ? atts.map((a) => ({
            id: a.id,
            filename: a.filename,
            kind: a.kind,
            caption: a.caption ?? undefined,
          }))
        : undefined,
    });
  }
  if (!out.messages.length) {
    out.messages.push({
      id: "ph",
      direction: "IN" as const,
      body: t.preview ?? "No messages yet.",
      time: "—",
    });
  }
  return out;
}
