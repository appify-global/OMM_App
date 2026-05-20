/**
 * Query helpers — server-only, used by RSC pages.
 *
 * Falls back gracefully to fixture data when DATABASE_URL isn't set so that
 * frontend dev keeps working without a live DB connection.
 */

import "server-only";

import { randomBytes } from "node:crypto";

import { and, desc, eq, not, sql } from "drizzle-orm";

import { db, schema } from "./index";

import { DEMO_AGENT_ID, DEMO_BUYER_ID } from "@/lib/app-constants";
import { getAppUserId } from "@/lib/auth-user";
import {
  featuresWithOmmMeta,
  mapDbStatusToMobile,
  parseOmmListingMeta,
  type OmmListingMobileMeta,
} from "@/lib/mobile-published-listings";

const HAS_DB = Boolean(process.env.DATABASE_URL);

/* ------------------------------------------------------------ users */

export async function getCurrentUser(userId: string) {
  if (!HAS_DB) return null;
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

/* ------------------------------------------------------------ listings */

export async function getMyListings(agentId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.agentId, agentId))
    .orderBy(desc(schema.listings.updatedAt));
}

export async function searchListings(opts: {
  q?: string;
  suburbs?: string[];
  bedroomsMin?: number;
  priceMin?: number;
  priceMax?: number;
  status?: typeof schema.listingStatusEnum.enumValues[number];
  limit?: number;
}) {
  if (!HAS_DB) return [];
  const { q, suburbs, bedroomsMin, priceMin, priceMax, status, limit = 50 } = opts;
  const conditions = [];

  if (status) conditions.push(eq(schema.listings.status, status));
  if (bedroomsMin)
    conditions.push(sql`${schema.listings.bedrooms} >= ${bedroomsMin}`);
  if (priceMin)
    conditions.push(sql`${schema.listings.priceFrom} >= ${priceMin}`);
  if (priceMax)
    conditions.push(sql`${schema.listings.priceTo} <= ${priceMax}`);
  if (suburbs && suburbs.length > 0) {
    conditions.push(
      sql`${schema.listings.suburb} = ANY(${sql.raw(
        `ARRAY[${suburbs.map((s) => `'${s.replace(/'/g, "''")}'`).join(",")}]`,
      )})`,
    );
  }
  if (q) {
    const like = `%${q}%`;
    conditions.push(
      sql`(${schema.listings.title} ILIKE ${like} OR ${schema.listings.address} ILIKE ${like} OR ${schema.listings.description} ILIKE ${like})`,
    );
  }

  return db
    .select()
    .from(schema.listings)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.listings.publishedAt))
    .limit(limit);
}

export async function getListingById(id: string) {
  if (!HAS_DB) return null;
  const rows = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/* ------------------------------------------------------------ saved searches & listings */

export async function getSavedSearches(buyerId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.searches)
    .where(eq(schema.searches.buyerId, buyerId))
    .orderBy(desc(schema.searches.updatedAt));
}

export async function getSavedSearchById(id: string, buyerId: string) {
  if (!HAS_DB) return null;
  const rows = await db
    .select()
    .from(schema.searches)
    .where(and(eq(schema.searches.id, id), eq(schema.searches.buyerId, buyerId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSavedListings(buyerId: string) {
  if (!HAS_DB) return [];
  return db
    .select({
      saved: schema.savedListings,
      listing: schema.listings,
    })
    .from(schema.savedListings)
    .innerJoin(
      schema.listings,
      eq(schema.savedListings.listingId, schema.listings.id),
    )
    .where(eq(schema.savedListings.buyerId, buyerId))
    .orderBy(desc(schema.savedListings.createdAt));
}

/* ------------------------------------------------------------ notifications */

export async function getNotifications(userId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .orderBy(desc(schema.notifications.occurredAt))
    .limit(100);
}

export async function getUnreadNotificationCount(userId: string) {
  if (!HAS_DB) return 0;
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.read, false),
      ),
    );
  return rows[0]?.count ?? 0;
}

/* ------------------------------------------------------------ misc */

export async function getReviewsForAgent(agentId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.agentId, agentId))
    .orderBy(desc(schema.reviews.postedAt));
}

export { DEMO_AGENT_ID, DEMO_BUYER_ID } from "@/lib/app-constants";

/** Current Clerk user, or dev impersonation / demo id when auth is bypassed. */
export async function resolveCurrentUserId(): Promise<string> {
  return getAppUserId();
}

/* ------------------------------------------------------------ mutations */

export async function markNotificationRead(id: string, userId: string) {
  if (!HAS_DB) return false;
  const rows = await db
    .update(schema.notifications)
    .set({ read: true, readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.id, id),
        eq(schema.notifications.userId, userId),
      ),
    )
    .returning({ id: schema.notifications.id });
  return rows.length > 0;
}

/* ------------------------------------------------------------ briefs */

export async function getBriefsByBuyer(buyerId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.briefs)
    .where(eq(schema.briefs.buyerId, buyerId))
    .orderBy(desc(schema.briefs.createdAt));
}

/** Briefs posted by *other* buyers (visible to an agent). */
export async function getIncomingBriefsForAgent(agentId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.briefs)
    .where(not(eq(schema.briefs.buyerId, agentId)))
    .orderBy(desc(schema.briefs.createdAt));
}

/* ------------------------------------------------------------ threads + messages */

export async function getThreadsForOwner(ownerId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.threads)
    .where(eq(schema.threads.ownerId, ownerId))
    .orderBy(desc(schema.threads.lastMessageAt), desc(schema.threads.updatedAt));
}

export async function getThreadByIdForOwner(threadId: string, ownerId: string) {
  if (!HAS_DB) return null;
  const rows = await db
    .select()
    .from(schema.threads)
    .where(
      and(
        eq(schema.threads.id, threadId),
        eq(schema.threads.ownerId, ownerId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function getMessagesForThread(threadId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.threadId, threadId))
    .orderBy(schema.messages.sentAt);
}

export async function getAttachmentsForMessage(messageId: string) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.messageAttachments)
    .where(eq(schema.messageAttachments.messageId, messageId));
}

/* ------------------------------------------------------------ listings (grouped) */

export async function getListingsByAgentGrouped(agentId: string) {
  if (!HAS_DB) {
    return { active: [], draft: [], offMarket: [], archive: [] };
  }
  const all = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.agentId, agentId));
  return {
    active: all.filter((l) =>
      ["LIVE", "UNDER_OFFER"].includes(l.status),
    ),
    draft: all.filter((l) => l.status === "DRAFT"),
    offMarket: all.filter((l) => l.status === "PRE_MARKET"),
    archive: all.filter((l) =>
      ["SOLD", "WITHDRAWN", "ARCHIVED"].includes(l.status),
    ),
  };
}

export async function getOffMarketListingsPublic(limit = 8) {
  if (!HAS_DB) return [];
  return db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.status, "PRE_MARKET"))
    .orderBy(desc(schema.listings.updatedAt))
    .limit(limit);
}

/** Mobile create-listing payloads (validated again in route). */
export type MobileListingMediaInput = {
  kind: "PHOTO" | "FLOOR_PLAN" | "VIDEO" | "SOI_PDF";
  url: string;
  caption?: string | null;
  position?: number;
};

export type MobileCreateListingInput = {
  title?: string | null;
  address: string;
  suburb: string;
  state?: string | null;
  postcode?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  carSpaces?: number | null;
  landSizeSqm?: number | null;
  buildingSizeSqm?: number | null;
  /** Whole AUD amounts (stored as decimals). */
  priceFromAud?: number | null;
  priceToAud?: number | null;
  priceDisplay?: string | null;
  description?: string | null;
  features?: string[];
  inspectionTimes?: { at: string; label: string }[];
  status?: "DRAFT" | "PRE_MARKET" | "LIVE";
  soiUrl?: string | null;
  soiKind?: string | null;
  media?: MobileListingMediaInput[];
};

function newListingId(): string {
  return `lst-${randomBytes(12).toString("hex")}`;
}

function newMediaId(): string {
  return `lmd-${randomBytes(8).toString("hex")}`;
}

/** Insert listing + optional media. Returns listing id or `null` if no DATABASE_URL. */
export async function createListingForAgent(
  agentId: string,
  input: MobileCreateListingInput,
): Promise<string | null> {
  if (!HAS_DB) return null;

  const id = newListingId();
  const status = input.status ?? "DRAFT";
  const address = input.address.trim();
  const suburb = input.suburb.trim();
  const title =
    (input.title?.trim() || `${address}, ${suburb}`).slice(0, 500);
  const now = new Date();
  const publishedAt = status === "LIVE" ? now : null;

  await db.transaction(async (tx) => {
    await tx.insert(schema.listings).values({
      id,
      agentId,
      title,
      address,
      suburb,
      state: (input.state?.trim() || "VIC").slice(0, 24),
      postcode: input.postcode?.trim()?.slice(0, 16) ?? null,
      status,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      carSpaces: input.carSpaces ?? null,
      landSizeSqm: input.landSizeSqm ?? null,
      buildingSizeSqm: input.buildingSizeSqm ?? null,
      priceFrom:
        input.priceFromAud != null ? String(Math.round(input.priceFromAud)) : null,
      priceTo:
        input.priceToAud != null ? String(Math.round(input.priceToAud)) : null,
      priceDisplay: input.priceDisplay?.trim()?.slice(0, 240) ?? null,
      description: input.description?.trim() ?? null,
      features: Array.isArray(input.features) ? input.features : [],
      inspectionTimes: Array.isArray(input.inspectionTimes)
        ? input.inspectionTimes
        : [],
      soiUrl: input.soiUrl?.trim() ?? null,
      soiKind: input.soiKind?.trim() ?? null,
      publishedAt,
      updatedAt: now,
    });

    const mediaRows = Array.isArray(input.media) ? input.media : [];
    let pos = 0;
    for (const m of mediaRows) {
      const url = typeof m.url === "string" ? m.url.trim() : "";
      if (!url || url.length > 2048) continue;
      const kind = m.kind;
      if (
        kind !== "PHOTO" &&
        kind !== "FLOOR_PLAN" &&
        kind !== "VIDEO" &&
        kind !== "SOI_PDF"
      ) {
        continue;
      }
      await tx.insert(schema.listingMedia).values({
        id: newMediaId(),
        listingId: id,
        kind,
        url,
        caption: m.caption?.trim()?.slice(0, 500) ?? null,
        position: typeof m.position === "number" ? m.position : pos,
      });
      pos += 1;
    }
  });

  return id;
}

function parseAudDecimal(v: string | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export type MobilePublishedListingRow = {
  id: string;
  publishedAt: string;
  addressLine: string;
  titleLine: string;
  suburbLine: string;
  streetLine: string;
  priceRangeDisplay: string;
  listingPriceFromAud?: number | null;
  listingPriceToAud?: number | null;
  beds: number;
  baths: number;
  cars: number;
  landSqm: number | null;
  propertyType: string;
  addressDisclosure: "disclose" | "not_disclose";
  description?: string;
  sellerInspectionAvailability?: string;
  sellerInspectionAvailabilityTags?: OmmListingMobileMeta["sellerInspectionAvailabilityTags"];
  sellerInspectionAvailabilityNotes?: string;
  listingPhotos?: { id: string; uri: string; width?: number; height?: number }[];
  listingFloorPlan?: { uri: string; name?: string };
  listingAnalytics?: OmmListingMobileMeta["listingAnalytics"];
  localInspectionBookings?: OmmListingMobileMeta["localInspectionBookings"];
  listingStatus?: "live" | "pending" | "sold";
  soldMarkedAt?: string;
  archivedAt?: string;
};

function mapListingRowToMobile(
  l: typeof schema.listings.$inferSelect,
  media: (typeof schema.listingMedia.$inferSelect)[],
): MobilePublishedListingRow {
  const meta = parseOmmListingMeta(
    Array.isArray(l.features) ? (l.features as string[]) : [],
  );
  const addressLine = [l.address.trim(), l.suburb.trim()].filter(Boolean).join(", ");
  const streetLine = l.address.trim();
  const suburbLine = l.suburb.trim();
  const titleLine = l.title.trim() || `${streetLine} · ${suburbLine}`;
  const fromAud = parseAudDecimal(l.priceFrom);
  const toAud = parseAudDecimal(l.priceTo);
  const photos = media
    .filter((m) => m.kind === "PHOTO")
    .sort((a, b) => a.position - b.position)
    .map((m, i) => ({
      id: m.id,
      uri: m.url,
      width: 1200,
      height: 800,
    }));
  const floor = media.find((m) => m.kind === "FLOOR_PLAN");

  const listingStatus =
    meta.listingStatus ?? mapDbStatusToMobile(l.status) ?? "live";

  return {
    id: l.id,
    publishedAt: (l.publishedAt ?? l.createdAt).toISOString(),
    addressLine,
    titleLine,
    suburbLine,
    streetLine,
    priceRangeDisplay: l.priceDisplay ?? "—",
    listingPriceFromAud: fromAud,
    listingPriceToAud: toAud,
    beds: l.bedrooms ?? 0,
    baths: l.bathrooms ?? 0,
    cars: l.carSpaces ?? 0,
    landSqm: l.landSizeSqm ?? null,
    propertyType: meta.propertyType ?? "House",
    addressDisclosure: meta.addressDisclosure ?? "disclose",
    description: l.description ?? undefined,
    sellerInspectionAvailability: meta.sellerInspectionAvailability,
    sellerInspectionAvailabilityTags: meta.sellerInspectionAvailabilityTags,
    sellerInspectionAvailabilityNotes: meta.sellerInspectionAvailabilityNotes,
    listingPhotos: photos.length ? photos : undefined,
    listingFloorPlan: floor
      ? { uri: floor.url, name: floor.caption ?? "Floor plan" }
      : undefined,
    listingAnalytics: meta.listingAnalytics,
    localInspectionBookings: meta.localInspectionBookings,
    listingStatus,
    soldMarkedAt: meta.soldMarkedAt,
    archivedAt: meta.archivedAt,
  };
}

/** All agent listings for Expo (published-listings sync). */
export async function getPublishedListingsForMobileAgent(
  agentId: string,
): Promise<MobilePublishedListingRow[]> {
  if (!HAS_DB) return [];
  const rows = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.agentId, agentId))
    .orderBy(desc(schema.listings.publishedAt), desc(schema.listings.updatedAt));

  if (!rows.length) return [];

  const media = await db
    .select()
    .from(schema.listingMedia)
    .where(
      sql`${schema.listingMedia.listingId} = ANY(${sql.raw(
        `ARRAY[${rows.map((r) => `'${r.id.replace(/'/g, "''")}'`).join(",")}]`,
      )})`,
    );

  const byListing = new Map<string, (typeof schema.listingMedia.$inferSelect)[]>();
  for (const m of media) {
    const list = byListing.get(m.listingId) ?? [];
    list.push(m);
    byListing.set(m.listingId, list);
  }

  return rows.map((l) => mapListingRowToMobile(l, byListing.get(l.id) ?? []));
}

export async function incrementListingEnquiryCount(listingId: string): Promise<boolean> {
  if (!HAS_DB) return false;
  await db
    .update(schema.listings)
    .set({
      enquiriesCount: sql`${schema.listings.enquiriesCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(schema.listings.id, listingId));
  return true;
}

function newMessageId(): string {
  return `msg-${randomBytes(8).toString("hex")}`;
}

/** Agent or buyer sends a message in a thread they own. */
export async function appendMessageToThread(input: {
  threadId: string;
  ownerId: string;
  direction: "IN" | "OUT";
  body: string;
}): Promise<boolean> {
  if (!HAS_DB) return false;
  const trimmed = input.body.trim();
  if (!trimmed) return false;

  const thread = await getThreadByIdForOwner(input.threadId, input.ownerId);
  if (!thread) return false;

  const now = new Date();
  const preview = trimmed.length > 72 ? `${trimmed.slice(0, 69)}…` : trimmed;

  await db.transaction(async (tx) => {
    await tx.insert(schema.messages).values({
      id: newMessageId(),
      threadId: input.threadId,
      direction: input.direction,
      body: trimmed,
      sentAt: now,
    });
    await tx
      .update(schema.threads)
      .set({
        preview,
        lastMessageAt: now,
        updatedAt: now,
        unread: input.direction === "IN",
      })
      .where(eq(schema.threads.id, input.threadId));
  });

  return true;
}

export async function patchListingMobileMeta(
  listingId: string,
  agentId: string,
  patch: Partial<OmmListingMobileMeta>,
): Promise<boolean> {
  if (!HAS_DB) return false;
  const rows = await db
    .select()
    .from(schema.listings)
    .where(
      and(eq(schema.listings.id, listingId), eq(schema.listings.agentId, agentId)),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return false;

  const existing = parseOmmListingMeta(
    Array.isArray(row.features) ? (row.features as string[]) : [],
  );
  const next = { ...existing, ...patch };
  const features = featuresWithOmmMeta(
    Array.isArray(row.features) ? (row.features as string[]) : [],
    next,
  );

  await db
    .update(schema.listings)
    .set({ features, updatedAt: new Date() })
    .where(eq(schema.listings.id, listingId));
  return true;
}

function newThreadId(): string {
  return `thr-${randomBytes(8).toString("hex")}`;
}

export type CreateThreadForOwnerInput = {
  ownerId: string;
  participantName: string;
  participantFirm?: string;
  context: string;
  category: (typeof schema.messageCategoryEnum.enumValues)[number];
  seedInboundBody?: string;
};

/** Reuse an existing thread for the same owner + context + category, or create one. */
export async function findOrCreateThreadForOwner(
  input: CreateThreadForOwnerInput,
): Promise<string | null> {
  if (!HAS_DB) return null;

  const existing = await db
    .select({ id: schema.threads.id })
    .from(schema.threads)
    .where(
      and(
        eq(schema.threads.ownerId, input.ownerId),
        eq(schema.threads.context, input.context),
        eq(schema.threads.category, input.category),
      ),
    )
    .limit(1);

  if (existing[0]?.id) return existing[0].id;

  const id = newThreadId();
  const now = new Date();
  const preview = input.seedInboundBody?.trim()
    ? input.seedInboundBody.trim().length > 72
      ? `${input.seedInboundBody.trim().slice(0, 69)}…`
      : input.seedInboundBody.trim()
    : "No messages yet";

  await db.insert(schema.threads).values({
    id,
    ownerId: input.ownerId,
    participantId: null,
    participantName: input.participantName,
    participantFirm: input.participantFirm ?? null,
    participantInitials: input.participantName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    context: input.context,
    category: input.category,
    unread: Boolean(input.seedInboundBody?.trim()),
    pinned: false,
    preview,
    lastMessageAt: input.seedInboundBody?.trim() ? now : null,
    createdAt: now,
    updatedAt: now,
  });

  if (input.seedInboundBody?.trim()) {
    await appendMessageToThread({
      threadId: id,
      ownerId: input.ownerId,
      direction: "IN",
      body: input.seedInboundBody.trim(),
    });
  }

  return id;
}

export type AgentHomeMetricsDbPayload = {
  recentlySold: {
    id: string;
    addressLine: string;
    suburb: string;
    soldPriceDisplay: string;
    soldAtDisplay: string;
    imageIndex: number;
    coverImageUri?: string;
  }[];
  activeListingsCount: number;
  pendingListingsCount: number;
  soldListingsCount: number;
  inspectionsBookedCount: number;
  pipelineCommissionEstimateAud: { lowAud: number; highAud: number } | null;
};

function soldAgeLabel(d: Date | null): string {
  if (!d) return "Sold recently";
  const days = Math.floor((Date.now() - +d) / 86400000);
  if (days < 1) return "Sold today";
  if (days === 1) return "Sold 1d ago";
  if (days < 7) return `Sold ${days}d ago`;
  if (days < 14) return "Sold 1w ago";
  if (days < 30) return `Sold ${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

/** Agent home KPIs from Railway Postgres (same shape as mobile `fetchAgentHomeMetrics`). */
export async function getAgentHomeMetricsForAgent(
  agentId: string,
): Promise<AgentHomeMetricsDbPayload | null> {
  if (!HAS_DB) return null;

  const rows = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.agentId, agentId));

  const active = rows.filter((l) =>
    ["LIVE", "UNDER_OFFER", "PRE_MARKET"].includes(l.status),
  );
  const pending = rows.filter((l) =>
    ["DRAFT", "PRE_MARKET"].includes(l.status),
  );
  const sold = rows.filter((l) => l.status === "SOLD");

  const mobileRows = await getPublishedListingsForMobileAgent(agentId);
  let inspectionsBookedCount = 0;
  for (const m of mobileRows) {
    inspectionsBookedCount += m.localInspectionBookings?.length ?? 0;
  }

  const recentlySold = sold
    .sort((a, b) => {
      const ta = a.updatedAt?.getTime() ?? 0;
      const tb = b.updatedAt?.getTime() ?? 0;
      return tb - ta;
    })
    .slice(0, 3)
    .map((l, i) => {
      const parts = (l.address ?? l.title ?? "").split(",").map((s) => s.trim());
      const addressLine = parts[0] ?? l.title ?? "—";
      const suburb =
        l.suburb?.trim() ||
        (parts.length >= 2 ? parts.slice(1).join(", ") : "Melbourne");
      return {
        id: l.id,
        addressLine,
        suburb,
        soldPriceDisplay: l.priceDisplay ?? "—",
        soldAtDisplay: soldAgeLabel(l.updatedAt),
        imageIndex: i % 7,
      };
    });

  let pipelineLow = 0;
  let pipelineHigh = 0;
  for (const l of active) {
    const from = l.priceFrom != null ? Number(l.priceFrom) : null;
    const to = l.priceTo != null ? Number(l.priceTo) : null;
    const mid =
      from != null && to != null
        ? (from + to) / 2
        : from != null
          ? from
          : to != null
            ? to
            : null;
    if (mid != null && Number.isFinite(mid)) {
      const est = mid * 0.022;
      pipelineLow += est * 0.85;
      pipelineHigh += est * 1.05;
    }
  }

  return {
    recentlySold,
    activeListingsCount: active.length,
    pendingListingsCount: pending.length,
    soldListingsCount: sold.length,
    inspectionsBookedCount,
    pipelineCommissionEstimateAud:
      active.length > 0 && pipelineLow > 0
        ? {
            lowAud: Math.round(pipelineLow),
            highAud: Math.round(pipelineHigh),
          }
        : null,
  };
}
