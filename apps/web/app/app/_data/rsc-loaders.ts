import "server-only";

import { eq, InferSelectModel, inArray } from "drizzle-orm";

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
  type Message,
  type MessageThread,
} from "./fixtures";
import {
  defaultNotificationItems,
  type NotificationListItem,
} from "./notification-fixtures";

import { db } from "@/db/index";
import {
  briefs,
  listings,
  threads as threadsTbl,
  users as usersTbl,
} from "@/db/schema";
import {
  getAttachmentsForMessage,
  getBriefsByBuyer,
  getCurrentUser,
  getIncomingBriefsForAgent,
  getListingsByAgentGrouped,
  getMessagesForThread,
  getNotifications,
  getOffMarketListingsPublic,
  getSavedSearches,
  getThreadByIdForViewer,
  getThreadsAccessibleByUser,
  getThreadsForOwner,
  listInspectionActivitiesForUser,
  type InspectionActivityRow,
} from "@/db/queries";
import type { InspectionActivityItem, MessagesInboxData } from "./dashboard-types";

const HAS_DB = Boolean(process.env.DATABASE_URL);

type ListingRow = InferSelectModel<typeof listings>;
type BriefRow = InferSelectModel<typeof briefs>;
type ThreadRow = InferSelectModel<typeof threadsTbl>;
type UserRow = InferSelectModel<typeof usersTbl>;

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

function draftFixtureToListingShape(d: DraftListing): Listing {
  return {
    id: d.id,
    title: d.title,
    address: d.address,
    priceRange: "—",
    status: "DRAFT",
    authorityDaysLeft: null,
    beds: 0,
    baths: 0,
    landSqm: 0,
    views7d: 0,
    leads: 0,
    soiAttached: false,
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
    return [];
  }
  return rows.map((r) => {
    const at =
      r.occurredAt instanceof Date ? r.occurredAt : new Date(r.occurredAt);
    return {
      id: r.id,
      kind: r.kind,
      title: r.title,
      body: r.body ?? "",
      href: r.href ?? "/app/notifications",
      read: r.read,
      occurredAt: formatNotificationAge(at),
      occurredAtIso: at.toISOString(),
      listingId: r.listingId ?? undefined,
      threadId: r.threadId ?? undefined,
    };
  });
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
    draftCount: number;
    preMarketCount: number;
    soiReminderListings: {
      id: string;
      titleLine: string;
      subtitleLine: string;
      needsSoi: boolean;
    }[];
    /** LIVE + PRE_MARKET + drafts; mobile home shelf (newest first). */
    homePipelineListings: Listing[];
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
        draftCount: draftListings.length,
        preMarketCount: 2,
        soiReminderListings: activeListings
          .filter((l) => !l.soiAttached)
          .slice(0, 5)
          .map((l) => ({
            id: l.id,
            titleLine: l.title,
            subtitleLine: l.address.replace(/\s+/g, " ").trim(),
            needsSoi: true,
          })),
        homePipelineListings: [
          ...activeListings,
          ...draftListings.slice(0, 8).map(draftFixtureToListingShape),
        ].slice(0, 15),
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
    .sort(
      (a, b) =>
        (daysFrom(a.authorityExpiresAt) ?? 99) -
        (daysFrom(b.authorityExpiresAt) ?? 99),
    )
    .map((l) => ({
      id: l.id,
      title: l.title,
      address: l.address,
      daysLeft: daysFrom(l.authorityExpiresAt) as number,
      soiAttached: Boolean(l.soiUrl),
    }));

  const othersBriefs = await getIncomingBriefsForAgent(userId);
  const bm = othersBriefs.slice(0, 5).map((b) => ({
    id: b.id,
    suburb: b.headline,
    criteria: b.budgetDisplay ?? "—",
  }));

  const totalViews7d = allMine.reduce((s, l) => s + l.viewsCount, 0);
  const thr = await getThreadsForOwner(userId);
  const enquiryThreads = thr.filter(
    (t) => t.category === "LISTING" || t.category === "BRIEF",
  );
  const unreadE = enquiryThreads.filter((t) => t.unread).length;
  const latestEnquiriesDb = enquiryThreads.slice(0, 8).map((t) => {
    const at = t.lastMessageAt ?? t.updatedAt ?? t.createdAt;
    const preview = (t.preview ?? "").trim();
    const atDate = at instanceof Date ? at : at ? new Date(at) : null;
    const hoursAgo =
      atDate && !Number.isNaN(+atDate)
        ? Math.max(0, Math.floor((Date.now() - +atDate) / 3_600_000))
        : 0;
    return {
      id: t.id,
      name: t.participantName,
      address:
        t.category === "BRIEF"
          ? (t.participantFirm?.trim() || preview || "Buyer brief")
          : preview || t.context,
      listingTitle: t.context,
      hoursAgo,
    };
  });

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

  const homePipeRows = [...grouped.active, ...grouped.offMarket, ...grouped.draft];
  homePipeRows.sort(
    (a, b) => (+b.updatedAt || 0) - (+a.updatedAt || 0),
  );
  const homePipelineListingsDb = homePipeRows
    .slice(0, 15)
    .map(mapListingToFixtureShape);

  const reminderPool = [...grouped.active, ...grouped.offMarket].sort(
    (a, b) => (+b.updatedAt || 0) - (+a.updatedAt || 0),
  );
  const soiReminderListingsRaw = reminderPool
    .filter((l) => Boolean(l.soiUrl?.trim()))
    .filter((l) => {
      const days = daysFrom(l.authorityExpiresAt);
      return days !== null && days <= 21;
    })
    .slice(0, 6);
  const soiReminderListingsMapped = soiReminderListingsRaw.map((l) => {
    const title = (l.title || "").replace(/\s+/g, " ").trim();
    const address = (l.address || "").replace(/\s+/g, " ").trim();
    const location = [l.suburb?.trim(), l.state?.trim(), l.postcode?.trim()]
      .filter(Boolean)
      .join(" · ");
    const authDays = daysFrom(l.authorityExpiresAt) as number;
    return {
      id: l.id,
      titleLine: title || address || "Listing",
      subtitleLine: location || (address !== title ? address : ""),
      needsSoi: false,
      authorityDaysLeft: authDays,
    };
  });

  return {
    userFirstName: first,
    selling: {
      activeListings: act.length ? act : activeListings,
      authorityExpiringSoon: exp,
      newEnquiriesCount: unreadE,
      latestEnquiries: latestEnquiriesDb,
      buyerMatches: bm.length ? bm : buyerMatches,
      totalViews7d: totalViews7d || 500,
      transactionsAwaitingReviewCount,
      draftCount: grouped.draft.length,
      preMarketCount: grouped.offMarket.length,
      soiReminderListings: soiReminderListingsMapped,
      homePipelineListings:
        homePipelineListingsDb.length > 0 ? homePipelineListingsDb : activeListings,
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

function threadLastIso(t: ThreadRow): string {
  const x = t.lastMessageAt ?? t.updatedAt ?? t.createdAt;
  return x instanceof Date ? x.toISOString() : new Date().toISOString();
}

function participantInitialsForName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "••";
}

/** Agent inbox: `participant*` is buyer / counterpart. */
function mapSellerThreadHeader(t: ThreadRow, displayContext: string): MessageThread {
  return {
    id: t.id,
    participant: {
      name: t.participantName,
      initials:
        t.participantInitials ?? participantInitialsForName(t.participantName),
      firm: t.participantFirm ?? "",
      isOnline: false,
    },
    context: displayContext,
    category: t.category,
    unread: t.unread,
    preview: t.preview ?? "",
    lastTime: relTime(t.lastMessageAt),
    lastMessageAt: threadLastIso(t),
    messages: [],
    pinned: t.pinned,
    listingId:
      t.category === "LISTING" && t.context.startsWith("lst-")
        ? t.context
        : undefined,
  };
}

/** Buyer view: counterpart is listing agent (`participant*` mirrors agent profile). */
function mapParticipantThreadHeader(
  t: ThreadRow,
  displayContext: string,
  agent: UserRow | undefined,
): MessageThread {
  const nm = agent?.name?.trim() || "Selling agent";
  return {
    id: t.id,
    participant: {
      name: nm,
      initials: participantInitialsForName(agent?.name ?? "Selling agent"),
      firm: agent?.firm?.trim() ?? "",
      isOnline: false,
    },
    context: displayContext,
    category: t.category,
    unread: false,
    preview: t.preview ?? "",
    lastTime: relTime(t.lastMessageAt),
    lastMessageAt: threadLastIso(t),
    messages: [],
    pinned: t.pinned,
    participantView: true,
    listingId:
      t.category === "LISTING" && t.context.startsWith("lst-")
        ? t.context
        : undefined,
  };
}

function mapInspectionRow(row: InspectionActivityRow): InspectionActivityItem {
  return {
    id: row.id,
    listingId: row.listingId,
    listingTitle: row.listingTitle,
    listingAddress: row.listingAddress,
    slotLabel: row.slotLabel,
    bookedAtIso: row.bookedAtIso,
    perspective: row.perspective,
    counterpartyLabel: row.counterpartyLabel,
  };
}

/** Back-compat helper for loaders that assume owner-only inbox (e.g. home KPI snippet). */
function mapThreadToFixture(t: ThreadRow): MessageThread {
  return mapSellerThreadHeader(t, t.context);
}

export async function loadMessagesInbox(userId: string): Promise<MessagesInboxData> {
  const emptyShortcuts = { newEnquiries: 0, pendingReviews: 0 };
  if (!HAS_DB) {
    return {
      threads: fixtureThreads,
      shortcuts: { newEnquiries: 2, pendingReviews: 1 },
      inspections: [],
    };
  }

  const [thr, inspectionsDb] = await Promise.all([
    getThreadsAccessibleByUser(userId),
    listInspectionActivitiesForUser(userId),
  ]);

  const inspections = inspectionsDb.map(mapInspectionRow);

  const listingIds = [
    ...new Set(
      thr
        .filter((t) => t.category === "LISTING" && t.context.startsWith("lst-"))
        .map((t) => t.context),
    ),
  ];
  const listingTitleById = new Map<string, string>();
  if (listingIds.length) {
    const rows = await db
      .select({ id: listings.id, title: listings.title })
      .from(listings)
      .where(inArray(listings.id, listingIds));
    for (const r of rows) {
      listingTitleById.set(r.id, r.title.trim());
    }
  }

  function displayContext(row: ThreadRow): string {
    if (row.category === "LISTING" && row.context.startsWith("lst-")) {
      const title = listingTitleById.get(row.context);
      if (title) return title;
    }
    return row.context;
  }

  const participantOwnerIds = [
    ...new Set(
      thr
        .filter(
          (t) =>
            Boolean(t.participantId) &&
            t.participantId === userId &&
            t.ownerId !== userId,
        )
        .map((t) => t.ownerId),
    ),
  ];
  const agentByOwnerId = new Map<string, UserRow>();
  if (participantOwnerIds.length) {
    const agents = await db
      .select()
      .from(usersTbl)
      .where(inArray(usersTbl.id, participantOwnerIds));
    for (const u of agents) agentByOwnerId.set(u.id, u);
  }

  const threadsMapped =
    thr.length > 0
      ? thr.map((t) => {
          const ctx = displayContext(t);
          const isParticipant =
            Boolean(t.participantId) &&
            t.participantId === userId &&
            t.ownerId !== userId;
          if (isParticipant) {
            return mapParticipantThreadHeader(t, ctx, agentByOwnerId.get(t.ownerId));
          }
          return mapSellerThreadHeader(t, ctx);
        })
      : [];

  if (!threadsMapped.length && !inspections.length) {
    return {
      threads: [],
      shortcuts: emptyShortcuts,
      inspections: [],
    };
  }

  return {
    threads: threadsMapped,
    shortcuts: {
      newEnquiries: threadsMapped.filter((w) => w.unread).length,
      pendingReviews: 0,
    },
    inspections,
  };
}

export async function loadThreadForDetail(
  threadId: string,
  viewerUserId: string,
): Promise<MessageThread | null> {
  const flipParticipantDirection = (
    dir: Message["direction"],
  ): Message["direction"] => (dir === "IN" ? "OUT" : "IN");

  if (!HAS_DB) {
    const { getThreadById } = await import("./fixtures");
    return getThreadById(threadId);
  }

  const t = await getThreadByIdForViewer(threadId, viewerUserId);
  if (!t) return null;

  const listingTitles = new Map<string, string>();
  if (t.category === "LISTING" && t.context.startsWith("lst-")) {
    const lr = await db
      .select({ id: listings.id, title: listings.title })
      .from(listings)
      .where(eq(listings.id, t.context))
      .limit(1);
    if (lr[0]) listingTitles.set(lr[0].id, lr[0].title.trim());
  }

  let agentProfile: UserRow | undefined;
  const isParticipant =
    Boolean(t.participantId) &&
    t.participantId === viewerUserId &&
    t.ownerId !== viewerUserId;

  if (isParticipant) {
    const ar = await db
      .select()
      .from(usersTbl)
      .where(eq(usersTbl.id, t.ownerId))
      .limit(1);
    agentProfile = ar[0];
  }

  let displayCtx = t.context;
  if (t.category === "LISTING" && t.context.startsWith("lst-")) {
    const title = listingTitles.get(t.context);
    if (title) displayCtx = title;
  }

  let out: MessageThread = isParticipant
    ? mapParticipantThreadHeader(t, displayCtx, agentProfile)
    : mapSellerThreadHeader(t, displayCtx);

  const msgs = await getMessagesForThread(threadId);
  out = { ...out, messages: [] };

  const flipDirections = Boolean(isParticipant);
  for (const m of msgs) {
    const atts = await getAttachmentsForMessage(m.id);
    const direction = flipDirections
      ? flipParticipantDirection(m.direction as Message["direction"])
      : (m.direction as Message["direction"]);

    out.messages.push({
      id: m.id,
      direction,
      body: m.body ?? "",
      time: m.sentAt
        ? m.sentAt.toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
          })
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
      direction: "IN",
      body: t.preview ?? "No messages yet.",
      time: "—",
    });
  }

  return out;
}
