/**
 * OMM - DB seed
 *
 * Ports the editorial fixtures into Postgres, in dependency order.
 * Idempotent: clears the DB first, then inserts.
 *
 * Run: npm run db:seed -w apps/web
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import {
  activeListings as fxActiveListings,
  agentProfile,
  agentReviews as fxReviews,
  archivedListings as fxArchived,
  disputeDetails as fxDisputeDetails,
  draftListings as fxDrafts,
  incomingBriefs as fxIncomingBriefs,
  invoices as fxInvoices,
  listingDetails as fxListingDetails,
  myPostedBriefs as fxMyBriefs,
  payouts as fxPayouts,
  threads as fxThreads,
} from "../../app/app/_data/fixtures";
import { db, pool, schema } from "./index";

const DEMO_AGENT_ID = "user_demo_agent_jl";
const DEMO_BUYER_ID = "user_demo_buyer_sj";
const COUNTERPARTY_AGENT_ID = "user_demo_agent_az";

const NOW = new Date();
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000);
const daysFromNow = (n: number) => new Date(NOW.getTime() + n * 86400000);

/**
 * Map fixture listing status → DB enum
 */
function mapListingStatus(s: string): typeof schema.listingStatusEnum.enumValues[number] {
  const m: Record<string, typeof schema.listingStatusEnum.enumValues[number]> = {
    ACTIVE: "LIVE",
    "SOI PENDING": "PRE_MARKET",
    DRAFT: "DRAFT",
    "OFF-MARKET": "PRE_MARKET",
    PRIVATE: "PRE_MARKET",
    EXCLUSIVE: "PRE_MARKET",
    SOLD: "SOLD",
    ARCHIVED: "ARCHIVED",
    WITHDRAWN: "WITHDRAWN",
  };
  return m[s] ?? "DRAFT";
}

function mapBriefStatus(
  s: string,
): typeof schema.briefStatusEnum.enumValues[number] {
  const m: Record<string, typeof schema.briefStatusEnum.enumValues[number]> = {
    ACTIVE: "ACTIVE",
    PAUSED: "PAUSED",
    MATCHED: "MATCHED",
    FULFILLED: "FULFILLED",
    EXPIRED: "EXPIRED",
  };
  return m[s] ?? "ACTIVE";
}

function mapDisputeStatus(
  s: string,
): typeof schema.disputeStatusEnum.enumValues[number] {
  const m: Record<string, typeof schema.disputeStatusEnum.enumValues[number]> = {
    OPEN: "OPEN",
    "UNDER REVIEW": "UNDER_REVIEW",
    RESOLVED: "RESOLVED",
    ESCALATED: "ESCALATED",
  };
  return m[s] ?? "OPEN";
}

function mapInvoiceStatus(
  s: string,
): typeof schema.invoiceStatusEnum.enumValues[number] {
  const m: Record<string, typeof schema.invoiceStatusEnum.enumValues[number]> = {
    PAID: "PAID",
    OUTSTANDING: "OUTSTANDING",
    DRAFT: "DRAFT",
    VOID: "VOID",
  };
  return m[s] ?? "DRAFT";
}

function mapPayoutStatus(
  s: string,
): typeof schema.payoutStatusEnum.enumValues[number] {
  const m: Record<string, typeof schema.payoutStatusEnum.enumValues[number]> = {
    SETTLED: "SETTLED",
    "IN TRANSIT": "IN_TRANSIT",
    SCHEDULED: "SCHEDULED",
  };
  return m[s] ?? "SCHEDULED";
}

function parseAud(s: string | null | undefined): string | null {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n.toFixed(2);
}

async function clearAll() {
  console.log("⌫  Clearing existing rows…");
  // order matters - children first
  await db.delete(schema.notifications);
  await db.delete(schema.savedListings);
  await db.delete(schema.searches);
  await db.delete(schema.payouts);
  await db.delete(schema.invoices);
  await db.delete(schema.disputeEvents);
  await db.delete(schema.disputes);
  await db.delete(schema.reviews);
  await db.delete(schema.messageAttachments);
  await db.delete(schema.messages);
  await db.delete(schema.threads);
  await db.delete(schema.briefMatches);
  await db.delete(schema.briefs);
  await db.delete(schema.listingMedia);
  await db.delete(schema.listings);
  await db.delete(schema.users);
}

async function seedUsers() {
  console.log("👤 Users…");
  await db.insert(schema.users).values([
    {
      id: DEMO_AGENT_ID,
      email: agentProfile.email,
      phone: agentProfile.phone,
      name: agentProfile.name,
      role: "AGENT",
      title: agentProfile.title,
      firm: agentProfile.firm,
      licence: agentProfile.licence,
      abn: agentProfile.abn,
      bio: agentProfile.bio,
      headline: "Quiet, considered campaigns for Bayside & the inner-east.",
      suburbs: agentProfile.suburbs,
      languages: ["English", "Mandarin"],
      specialties: ["Period homes", "Off-market", "Vendor advocacy"],
      yearsExperience: 12,
      websiteUrl: "https://azrealestate.com.au/john-lim",
      instagramHandle: "@johnlim.azre",
      linkedinUrl: "https://linkedin.com/in/johnlim-azre",
      rating: agentProfile.rating.toFixed(2),
      reviewsCount: agentProfile.reviewsCount,
      verifiedAt: daysAgo(1),
    },
    {
      id: DEMO_BUYER_ID,
      email: "sarah.jenkins@example.com",
      phone: "+61 405 224 818",
      name: "Sarah Jenkins",
      role: "BUYER",
      headline: "Looking for a family home in Bayside.",
    },
    {
      id: COUNTERPARTY_AGENT_ID,
      email: "anton.zhouk@rtedgar.com.au",
      phone: "+61 412 778 901",
      name: "Anton Zhouk",
      role: "AGENT",
      title: "Director",
      firm: "RT Edgar",
      licence: "VIC 091 113",
      headline: "Auction specialist, inner-east Melbourne.",
      yearsExperience: 18,
    },
  ]);
}

async function seedListings() {
  console.log("🏠 Listings…");
  const allListings = [...fxActiveListings, ...fxDrafts, ...fxArchived];

  const rows = allListings.map((raw) => {
    // type is the union of three different listing shapes; widen to any-string-keyed
    const l = raw as unknown as Record<string, unknown>;
    const id = l.id as string;
    const detail = fxListingDetails[id] as
      | (Record<string, unknown> & { highlights?: string[] })
      | undefined;
    const status = (l.status as string | undefined) ?? "DRAFT";
    const priceRange = (l.priceRange as string | undefined) ?? null;
    const [from, to] = (priceRange || "")
      .split("–")
      .map((s) => parseAud(s.trim()));
    return {
      id,
      agentId: DEMO_AGENT_ID,
      title: l.title as string,
      address: l.address as string,
      suburb:
        ((l.address as string) || "").split(",").pop()?.trim() || "Melbourne",
      state: "VIC",
      status: mapListingStatus(status),
      bedrooms: (l.beds as number | undefined) ?? null,
      bathrooms: (l.baths as number | undefined) ?? null,
      landSizeSqm: (l.landSqm as number | undefined) ?? null,
      priceFrom: from ?? null,
      priceTo: to ?? null,
      priceDisplay: priceRange,
      description: (detail?.summary as string | undefined) ?? null,
      features: detail?.highlights ?? [],
      viewsCount: (l.views7d as number | undefined) ?? 0,
      enquiriesCount: (l.leads as number | undefined) ?? 0,
      authorityExpiresAt:
        l.authorityDaysLeft != null
          ? daysFromNow(l.authorityDaysLeft as number)
          : null,
      publishedAt:
        status === "ACTIVE" || status === "SOI PENDING" ? daysAgo(7) : null,
    };
  });

  if (rows.length > 0) await db.insert(schema.listings).values(rows);
}

async function seedBriefs() {
  console.log("📝 Briefs…");
  const allBriefs = [...fxMyBriefs, ...fxIncomingBriefs];
  if (allBriefs.length === 0) return;

  const rows = allBriefs.map((raw, i) => {
    const isMine = (fxMyBriefs as unknown as object[]).includes(raw);
    const b = raw as unknown as Record<string, unknown>;
    return {
      id: b.id as string,
      buyerId: isMine ? DEMO_AGENT_ID : DEMO_BUYER_ID,
      headline:
        (b.headline as string | undefined) ??
        (b.title as string | undefined) ??
        "Untitled brief",
      story: (b.story as string | undefined) ?? null,
      status: mapBriefStatus((b.status as string | undefined) ?? "ACTIVE"),
      budgetDisplay: (b.budget as string | undefined) ?? null,
      bedroomsMin: (b.bedrooms as number | undefined) ?? null,
      bathroomsMin: (b.bathrooms as number | undefined) ?? null,
      suburbs: (b.suburbs as string[] | undefined) ?? [],
      mustHaves: (b.mustHaves as string[] | undefined) ?? [],
      timeline: (b.timeline as string | undefined) ?? null,
      finance: (b.finance as string | undefined) ?? null,
      expiresAt: daysFromNow(30 + i * 7),
    };
  });

  await db.insert(schema.briefs).values(rows);
}

async function seedThreadsAndMessages() {
  console.log("💌 Threads & messages…");
  if (fxThreads.length === 0) return;

  const threadRows = fxThreads.map((t) => ({
    id: t.id,
    ownerId: DEMO_AGENT_ID,
    participantId: null,
    participantName: t.participant.name,
    participantFirm: t.participant.firm ?? null,
    participantInitials: t.participant.initials,
    context: t.context,
    category: t.category as typeof schema.messageCategoryEnum.enumValues[number],
    unread: t.unread,
    pinned: t.pinned ?? false,
    preview: t.preview,
    lastMessageAt: daysAgo(1),
  }));
  await db.insert(schema.threads).values(threadRows);

  const messageRows: (typeof schema.messages.$inferInsert)[] = [];
  const attachmentRows: (typeof schema.messageAttachments.$inferInsert)[] = [];

  for (const t of fxThreads) {
    let i = 0;
    for (const m of t.messages) {
      messageRows.push({
        id: m.id,
        threadId: t.id,
        direction: m.direction,
        body: m.body ?? null,
        sentAt: daysAgo(t.messages.length - i),
      });
      if (m.attachments) {
        for (const a of m.attachments) {
          attachmentRows.push({
            id: a.id,
            messageId: m.id,
            kind: a.kind,
            filename: a.filename,
            caption: a.caption ?? null,
          });
        }
      }
      i++;
    }
  }

  if (messageRows.length > 0) await db.insert(schema.messages).values(messageRows);
  if (attachmentRows.length > 0)
    await db.insert(schema.messageAttachments).values(attachmentRows);
}

async function seedReviews() {
  console.log("⭐ Reviews…");
  if (fxReviews.length === 0) return;
  const rows = fxReviews.map((r) => ({
    id: r.id,
    agentId: DEMO_AGENT_ID,
    reviewerName: r.reviewer,
    reviewerRole: r.reviewerRole,
    rating: r.rating,
    body: r.body,
    listingRef: r.listing ?? null,
    postedAt: daysAgo(parseInt(r.posted) || 14),
  }));
  await db.insert(schema.reviews).values(rows);
}

async function seedDisputes() {
  console.log("⚖️  Disputes…");
  const detailValues = Object.values(fxDisputeDetails);
  if (detailValues.length === 0) return;

  const disputeRows = detailValues.map((d) => ({
    id: d.id,
    reference: d.reference,
    raisedById: DEMO_AGENT_ID,
    counterparty: d.counterparty,
    status: mapDisputeStatus(d.status),
    listing: d.listing ?? null,
    amountAtStake: parseAud(d.amountAtStake),
    summary: d.summary,
    openedOn: new Date(d.openedOn),
    resolvedAt: d.status === "RESOLVED" ? daysAgo(20) : null,
  }));
  await db.insert(schema.disputes).values(disputeRows);

  const eventRows = detailValues.flatMap((d) =>
    d.timeline.map((e) => ({
      id: e.id,
      disputeId: d.id,
      author: e.author,
      authorName: e.authorName,
      body: e.body,
      postedAt: new Date(e.posted.split(" · ")[0]) || NOW,
    })),
  );
  if (eventRows.length > 0)
    await db.insert(schema.disputeEvents).values(eventRows);
}

async function seedBilling() {
  console.log("💳 Invoices & payouts…");
  if (fxInvoices.length > 0) {
    const rows = fxInvoices.map((i) => ({
      id: i.id,
      agentId: DEMO_AGENT_ID,
      reference: i.reference,
      description: i.description,
      amount: parseAud(i.amount) ?? "0",
      status: mapInvoiceStatus(i.status),
      issuedAt: new Date(i.date),
      paidAt: i.status === "PAID" ? new Date(i.date) : null,
    }));
    await db.insert(schema.invoices).values(rows);
  }

  if (fxPayouts.length > 0) {
    const rows = fxPayouts.map((p) => ({
      id: p.id,
      agentId: DEMO_AGENT_ID,
      amount: parseAud(p.amount) ?? "0",
      destination: p.destination,
      status: mapPayoutStatus(p.status),
      scheduledFor: new Date(p.date),
      settledAt: p.status === "SETTLED" ? new Date(p.date) : null,
    }));
    await db.insert(schema.payouts).values(rows);
  }
}

async function seedSavedAndSearches() {
  console.log("🔖 Saved listings & searches…");

  // Buyer (Sarah) has saved a couple of listings
  const liveListings = fxActiveListings.slice(0, 2);
  if (liveListings.length > 0) {
    await db.insert(schema.savedListings).values(
      liveListings.map((l, i) => ({
        id: `sav-${i + 1}`,
        buyerId: DEMO_BUYER_ID,
        listingId: l.id,
        note: i === 0 ? "Loved the natural light" : null,
      })),
    );
  }

  // Buyer has a couple of saved searches
  await db.insert(schema.searches).values([
    {
      id: "srch-bayside-family",
      buyerId: DEMO_BUYER_ID,
      name: "Bayside family home",
      suburbs: ["Brighton", "Hampton", "Sandringham"],
      propertyTypes: ["House"],
      bedroomsMin: 4,
      bathroomsMin: 2,
      priceMin: "1800000",
      priceMax: "2400000",
      features: ["Backyard", "Period features"],
      alertCadence: "INSTANT",
      newMatchesCount: 3,
      lastRunAt: daysAgo(0),
    },
    {
      id: "srch-inner-east-period",
      buyerId: DEMO_BUYER_ID,
      name: "Inner-east period",
      suburbs: ["Hawthorn", "Kew", "Camberwell"],
      propertyTypes: ["House", "Townhouse"],
      bedroomsMin: 3,
      priceMax: "3000000",
      features: ["Period features", "Garage"],
      alertCadence: "DAILY",
      newMatchesCount: 1,
      lastRunAt: daysAgo(1),
    },
    {
      id: "srch-toorak-pied",
      buyerId: DEMO_BUYER_ID,
      name: "Toorak pied-à-terre",
      suburbs: ["Toorak", "South Yarra"],
      propertyTypes: ["Apartment"],
      bedroomsMin: 2,
      priceMax: "1800000",
      alertCadence: "WEEKLY",
      newMatchesCount: 0,
      lastRunAt: daysAgo(4),
    },
  ]);
}

async function seedNotifications() {
  console.log("🔔 Notifications…");
  await db.insert(schema.notifications).values([
    {
      id: "ntf-01",
      userId: DEMO_AGENT_ID,
      kind: "NEW_ENQUIRY",
      title: "New enquiry from Sarah Jenkins",
      body: "About 1240 Park Ave, Brighton",
      href: "/app/messages",
      read: false,
      occurredAt: daysAgo(0),
    },
    {
      id: "ntf-02",
      userId: DEMO_AGENT_ID,
      kind: "NEW_OFFER",
      title: "Offer received on Hawthorn City Center",
      body: "$2.05M from a pre-approved buyer",
      href: "/app/listings/lst-hawthorn-city-center",
      listingId: "lst-hawthorn-city-center",
      read: false,
      occurredAt: daysAgo(0),
    },
    {
      id: "ntf-03",
      userId: DEMO_AGENT_ID,
      kind: "INSPECTION",
      title: "Inspection booked",
      body: "Saturday 10:30am at 8 Wattle Pde, Kew",
      href: "/app/listings",
      read: false,
      occurredAt: daysAgo(1),
    },
    {
      id: "ntf-04",
      userId: DEMO_AGENT_ID,
      kind: "REVIEW",
      title: "Sarah Jenkins left you a 5★ review",
      body: "He protected the vendor's privacy from day one…",
      href: "/app/profile/reviews",
      read: false,
      occurredAt: daysAgo(2),
    },
    {
      id: "ntf-05",
      userId: DEMO_AGENT_ID,
      kind: "DISPUTE",
      title: "DR-1042 - mediator update",
      body: "Please upload supporting evidence by Fri 25 Apr",
      href: "/app/profile/disputes/dis-01",
      read: true,
      readAt: daysAgo(2),
      occurredAt: daysAgo(2),
    },
    {
      id: "ntf-06",
      userId: DEMO_AGENT_ID,
      kind: "BILLING",
      title: "Invoice INV-20445 issued",
      body: "$890.00 due 29 Apr",
      href: "/app/profile/billing",
      read: true,
      readAt: daysAgo(3),
      occurredAt: daysAgo(3),
    },
    {
      id: "ntf-07",
      userId: DEMO_BUYER_ID,
      kind: "NEW_MATCH",
      title: "New match for 'Bayside family home'",
      body: "1240 Park Ave, Brighton - 96% match",
      href: "/app/saved/searches/srch-bayside-family",
      read: false,
      occurredAt: daysAgo(0),
    },
    {
      id: "ntf-08",
      userId: DEMO_BUYER_ID,
      kind: "MESSAGE",
      title: "John Lim replied to your enquiry",
      body: "Thanks for reaching out - shall we book a private inspection…",
      href: "/app/messages",
      read: false,
      occurredAt: daysAgo(0),
    },
  ]);
}

async function main() {
  console.log("🌱 Seeding OMM Postgres…\n");
  try {
    await clearAll();
    await seedUsers();
    await seedListings();
    await seedBriefs();
    await seedThreadsAndMessages();
    await seedReviews();
    await seedDisputes();
    await seedBilling();
    await seedSavedAndSearches();
    await seedNotifications();
    console.log("\n✅ Seed complete.");
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
