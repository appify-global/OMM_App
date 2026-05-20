/**
 * Query helpers - server-only, used by RSC pages.
 *
 * Falls back gracefully to fixture data when DATABASE_URL isn't set so that
 * frontend dev keeps working without a live DB connection.
 */

import "server-only";

import { and, desc, eq, not, sql } from "drizzle-orm";

import { db, schema } from "./index";

import { DEMO_AGENT_ID, DEMO_BUYER_ID } from "@/lib/app-constants";
import { getAppUserId } from "@/lib/auth-user";

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
