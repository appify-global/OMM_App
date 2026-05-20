/**
 * OMM - Drizzle schema
 *
 * Top-level domain map:
 *   users           - synced from Clerk via webhook
 *   listings        - agent-owned property campaigns
 *   listing_media   - photos / floor plans / videos / SOI files
 *   briefs          - buyer briefs (off-market wishlists)
 *   brief_matches   - listings/agents matched to a brief
 *   threads         - message threads
 *   messages        - messages in a thread
 *   message_attachments
 *   reviews         - reviews left on agents
 *   disputes        - formal disagreements between agents
 *   dispute_events  - timeline entries on a dispute
 *   invoices        - billing invoices
 *   payouts         - outgoing payouts to agent's bank
 *   searches        - saved search filter sets
 *   saved_listings  - buyers' saved/favourited listings
 *   notifications   - in-app notifications
 *
 * Conventions:
 *   - cuid-style text IDs (so we can keep fixture-style ids: "lst-hawthorn-...")
 *   - createdAt + updatedAt on everything, defaultNow()
 *   - enums for statuses to keep semantic meaning at the DB level
 *   - cascade deletes from parents to dependents
 */

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ────────────────────────────────────────────────────────────
   ENUMS
   ──────────────────────────────────────────────────────────── */

export const userRoleEnum = pgEnum("user_role", ["AGENT", "BUYER", "ADMIN"]);
export const listingStatusEnum = pgEnum("listing_status", [
  "DRAFT",
  "PRE_MARKET",
  "LIVE",
  "UNDER_OFFER",
  "SOLD",
  "WITHDRAWN",
  "ARCHIVED",
]);
export const listingMediaKindEnum = pgEnum("listing_media_kind", [
  "PHOTO",
  "FLOOR_PLAN",
  "VIDEO",
  "SOI_PDF",
]);
export const briefStatusEnum = pgEnum("brief_status", [
  "ACTIVE",
  "PAUSED",
  "MATCHED",
  "FULFILLED",
  "EXPIRED",
]);
export const messageDirectionEnum = pgEnum("message_direction", [
  "IN",
  "OUT",
]);
export const messageCategoryEnum = pgEnum("message_category", [
  "BUYER",
  "LISTING",
  "BRIEF",
  "VENDOR",
  "PLATFORM",
]);
export const attachmentKindEnum = pgEnum("attachment_kind", [
  "PDF",
  "IMAGE",
  "PLAN",
  "CONTRACT",
]);
export const disputeStatusEnum = pgEnum("dispute_status", [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "ESCALATED",
]);
export const disputeAuthorEnum = pgEnum("dispute_author", [
  "YOU",
  "COUNTERPARTY",
  "MEDIATOR",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "PAID",
  "OUTSTANDING",
  "DRAFT",
  "VOID",
]);
export const payoutStatusEnum = pgEnum("payout_status", [
  "SETTLED",
  "IN_TRANSIT",
  "SCHEDULED",
]);
export const waitlistStatusEnum = pgEnum("waitlist_status", [
  "PENDING",
  "REVIEWED",
  "INVITED",
  "REJECTED",
]);
export const notificationKindEnum = pgEnum("notification_kind", [
  "NEW_MATCH",
  "NEW_ENQUIRY",
  "NEW_OFFER",
  "INSPECTION",
  "MESSAGE",
  "BRIEF_REPLY",
  "REVIEW",
  "DISPUTE",
  "BILLING",
  "SYSTEM",
]);

/* ────────────────────────────────────────────────────────────
   USERS  (synced from Clerk)
   ──────────────────────────────────────────────────────────── */

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Clerk user id
    email: text("email").notNull(),
    phone: text("phone"),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("AGENT"),

    // Agent-specific
    title: text("title"),
    firm: text("firm"),
    licence: text("licence"),
    abn: text("abn"),
    bio: text("bio"),
    headline: text("headline"),
    suburbs: jsonb("suburbs").$type<string[]>().default([]).notNull(),
    languages: jsonb("languages").$type<string[]>().default([]).notNull(),
    specialties: jsonb("specialties").$type<string[]>().default([]).notNull(),
    yearsExperience: integer("years_experience"),
    websiteUrl: text("website_url"),
    instagramHandle: text("instagram_handle"),
    linkedinUrl: text("linkedin_url"),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewsCount: integer("reviews_count").default(0).notNull(),
    verifiedAt: timestamp("verified_at"),

    // Visibility / preferences
    showPhoneOnListings: boolean("show_phone_on_listings").default(true).notNull(),
    showEmailOnListings: boolean("show_email_on_listings").default(true).notNull(),
    showOnDirectory: boolean("show_on_directory").default(true).notNull(),
    pushMessages: boolean("push_messages").default(true).notNull(),
    pushOffers: boolean("push_offers").default(true).notNull(),
    emailDigest: boolean("email_digest").default(false).notNull(),
    smsAlerts: boolean("sms_alerts").default(true).notNull(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  }),
);

/* ────────────────────────────────────────────────────────────
   LISTINGS
   ──────────────────────────────────────────────────────────── */

export const listings = pgTable("listings", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull().default("VIC"),
  postcode: text("postcode"),
  status: listingStatusEnum("status").notNull().default("DRAFT"),

  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  carSpaces: integer("car_spaces"),
  landSizeSqm: integer("land_size_sqm"),
  buildingSizeSqm: integer("building_size_sqm"),

  priceFrom: decimal("price_from", { precision: 12, scale: 2 }),
  priceTo: decimal("price_to", { precision: 12, scale: 2 }),
  priceDisplay: text("price_display"), // "Contact agent" / "$1.8m – $2.0m"

  description: text("description"),
  features: jsonb("features").$type<string[]>().default([]).notNull(),
  inspectionTimes: jsonb("inspection_times")
    .$type<{ at: string; label: string }[]>()
    .default([])
    .notNull(),

  // SOI
  soiUrl: text("soi_url"),
  soiKind: text("soi_kind"), // "AUTO" | "UPLOAD"
  soiGeneratedAt: timestamp("soi_generated_at"),

  // Stats (denormalised for speed; refresh on a job)
  viewsCount: integer("views_count").default(0).notNull(),
  enquiriesCount: integer("enquiries_count").default(0).notNull(),
  authorityExpiresAt: timestamp("authority_expires_at"),

  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listingMedia = pgTable("listing_media", {
  id: text("id").primaryKey(),
  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  kind: listingMediaKindEnum("kind").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   BRIEFS
   ──────────────────────────────────────────────────────────── */

export const briefs = pgTable("briefs", {
  id: text("id").primaryKey(),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  headline: text("headline").notNull(),
  story: text("story"),
  status: briefStatusEnum("status").notNull().default("ACTIVE"),

  budgetFrom: decimal("budget_from", { precision: 12, scale: 2 }),
  budgetTo: decimal("budget_to", { precision: 12, scale: 2 }),
  budgetDisplay: text("budget_display"),

  bedroomsMin: integer("bedrooms_min"),
  bathroomsMin: integer("bathrooms_min"),
  carSpacesMin: integer("car_spaces_min"),

  suburbs: jsonb("suburbs").$type<string[]>().default([]).notNull(),
  propertyTypes: jsonb("property_types").$type<string[]>().default([]).notNull(),
  mustHaves: jsonb("must_haves").$type<string[]>().default([]).notNull(),
  niceToHaves: jsonb("nice_to_haves").$type<string[]>().default([]).notNull(),

  timeline: text("timeline"), // "next 3 months", etc.
  finance: text("finance"), // "Pre-approved", etc.

  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const briefMatches = pgTable("brief_matches", {
  id: text("id").primaryKey(),
  briefId: text("brief_id")
    .notNull()
    .references(() => briefs.id, { onDelete: "cascade" }),
  listingId: text("listing_id").references(() => listings.id, {
    onDelete: "set null",
  }),
  agentId: text("agent_id").references(() => users.id, {
    onDelete: "set null",
  }),
  matchScore: integer("match_score"), // 0-100
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   MESSAGES / THREADS
   ──────────────────────────────────────────────────────────── */

export const threads = pgTable("threads", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  participantId: text("participant_id").references(() => users.id, {
    onDelete: "set null",
  }),
  participantName: text("participant_name").notNull(),
  participantFirm: text("participant_firm"),
  participantInitials: text("participant_initials"),

  context: text("context").notNull(), // e.g. "1240 Park Ave"
  category: messageCategoryEnum("category").notNull().default("BUYER"),

  unread: boolean("unread").default(false).notNull(),
  pinned: boolean("pinned").default(false).notNull(),
  preview: text("preview"),
  lastMessageAt: timestamp("last_message_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  direction: messageDirectionEnum("direction").notNull(),
  body: text("body"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageAttachments = pgTable("message_attachments", {
  id: text("id").primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  kind: attachmentKindEnum("kind").notNull(),
  filename: text("filename").notNull(),
  url: text("url"),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   REVIEWS
   ──────────────────────────────────────────────────────────── */

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewerName: text("reviewer_name").notNull(),
  reviewerRole: text("reviewer_role").notNull(),

  rating: integer("rating").notNull(), // 1..5
  body: text("body").notNull(),
  listingRef: text("listing_ref"),

  postedAt: timestamp("posted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   DISPUTES
   ──────────────────────────────────────────────────────────── */

export const disputes = pgTable("disputes", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull(),
  raisedById: text("raised_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  counterparty: text("counterparty").notNull(),
  status: disputeStatusEnum("status").notNull().default("OPEN"),

  listing: text("listing"),
  amountAtStake: decimal("amount_at_stake", { precision: 12, scale: 2 }),
  summary: text("summary").notNull(),

  openedOn: timestamp("opened_on").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const disputeEvents = pgTable("dispute_events", {
  id: text("id").primaryKey(),
  disputeId: text("dispute_id")
    .notNull()
    .references(() => disputes.id, { onDelete: "cascade" }),
  author: disputeAuthorEnum("author").notNull(),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  postedAt: timestamp("posted_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   BILLING
   ──────────────────────────────────────────────────────────── */

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reference: text("reference").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("AUD"),
  status: invoiceStatusEnum("status").notNull().default("DRAFT"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  dueAt: timestamp("due_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payouts = pgTable("payouts", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("AUD"),
  destination: text("destination").notNull(),
  status: payoutStatusEnum("status").notNull().default("SCHEDULED"),
  scheduledFor: timestamp("scheduled_for"),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   SEARCH / SAVED
   ──────────────────────────────────────────────────────────── */

export const searches = pgTable("searches", {
  id: text("id").primaryKey(),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  query: text("query"),
  suburbs: jsonb("suburbs").$type<string[]>().default([]).notNull(),
  propertyTypes: jsonb("property_types").$type<string[]>().default([]).notNull(),
  bedroomsMin: integer("bedrooms_min"),
  bathroomsMin: integer("bathrooms_min"),
  carSpacesMin: integer("car_spaces_min"),
  priceMin: decimal("price_min", { precision: 12, scale: 2 }),
  priceMax: decimal("price_max", { precision: 12, scale: 2 }),
  features: jsonb("features").$type<string[]>().default([]).notNull(),

  alertCadence: text("alert_cadence").default("INSTANT").notNull(), // INSTANT | DAILY | WEEKLY | OFF
  newMatchesCount: integer("new_matches_count").default(0).notNull(),
  lastRunAt: timestamp("last_run_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedListings = pgTable(
  "saved_listings",
  {
    id: text("id").primaryKey(),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    buyerListingIdx: uniqueIndex("saved_listings_buyer_listing_idx").on(
      t.buyerId,
      t.listingId,
    ),
  }),
);

/* ────────────────────────────────────────────────────────────
   NOTIFICATIONS
   ──────────────────────────────────────────────────────────── */

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  kind: notificationKindEnum("kind").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"), // deep link

  // optional refs (one of these may be set)
  listingId: text("listing_id").references(() => listings.id, {
    onDelete: "set null",
  }),
  briefId: text("brief_id").references(() => briefs.id, {
    onDelete: "set null",
  }),
  threadId: text("thread_id").references(() => threads.id, {
    onDelete: "set null",
  }),

  read: boolean("read").default(false).notNull(),
  readAt: timestamp("read_at"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   RELATIONS
   ──────────────────────────────────────────────────────────── */

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  briefs: many(briefs),
  threads: many(threads),
  reviews: many(reviews),
  disputes: many(disputes),
  invoices: many(invoices),
  payouts: many(payouts),
  searches: many(searches),
  savedListings: many(savedListings),
  notifications: many(notifications),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  agent: one(users, {
    fields: [listings.agentId],
    references: [users.id],
  }),
  media: many(listingMedia),
}));

export const listingMediaRelations = relations(listingMedia, ({ one }) => ({
  listing: one(listings, {
    fields: [listingMedia.listingId],
    references: [listings.id],
  }),
}));

export const briefsRelations = relations(briefs, ({ one, many }) => ({
  buyer: one(users, {
    fields: [briefs.buyerId],
    references: [users.id],
  }),
  matches: many(briefMatches),
}));

export const briefMatchesRelations = relations(briefMatches, ({ one }) => ({
  brief: one(briefs, {
    fields: [briefMatches.briefId],
    references: [briefs.id],
  }),
  listing: one(listings, {
    fields: [briefMatches.listingId],
    references: [listings.id],
  }),
  agent: one(users, {
    fields: [briefMatches.agentId],
    references: [users.id],
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  owner: one(users, {
    fields: [threads.ownerId],
    references: [users.id],
  }),
  participant: one(users, {
    fields: [threads.participantId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  thread: one(threads, {
    fields: [messages.threadId],
    references: [threads.id],
  }),
  attachments: many(messageAttachments),
}));

export const messageAttachmentsRelations = relations(
  messageAttachments,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageAttachments.messageId],
      references: [messages.id],
    }),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  agent: one(users, {
    fields: [reviews.agentId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export const disputesRelations = relations(disputes, ({ one, many }) => ({
  raisedBy: one(users, {
    fields: [disputes.raisedById],
    references: [users.id],
  }),
  events: many(disputeEvents),
}));

export const disputeEventsRelations = relations(disputeEvents, ({ one }) => ({
  dispute: one(disputes, {
    fields: [disputeEvents.disputeId],
    references: [disputes.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  agent: one(users, {
    fields: [invoices.agentId],
    references: [users.id],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  agent: one(users, {
    fields: [payouts.agentId],
    references: [users.id],
  }),
}));

export const searchesRelations = relations(searches, ({ one }) => ({
  buyer: one(users, {
    fields: [searches.buyerId],
    references: [users.id],
  }),
}));

export const savedListingsRelations = relations(savedListings, ({ one }) => ({
  buyer: one(users, {
    fields: [savedListings.buyerId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [savedListings.listingId],
    references: [listings.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [notifications.listingId],
    references: [listings.id],
  }),
  brief: one(briefs, {
    fields: [notifications.briefId],
    references: [briefs.id],
  }),
  thread: one(threads, {
    fields: [notifications.threadId],
    references: [threads.id],
  }),
}));

/* ────────────────────────────────────────────────────────────
   WAITLIST APPLICATIONS  (pre-launch agent signups)
   ──────────────────────────────────────────────────────────── */

export const waitlistApplications = pgTable(
  "waitlist_applications",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    agency: text("agency"),
    role: text("role"),
    licence: text("licence"),
    suburbs: jsonb("suburbs").$type<string[]>().default([]).notNull(),
    yearsExperience: integer("years_experience"),
    notes: text("notes"),
    source: text("source"),
    status: waitlistStatusEnum("status").notNull().default("PENDING"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("waitlist_applications_email_idx").on(t.email),
  }),
);

export type WaitlistApplication = typeof waitlistApplications.$inferSelect;
export type NewWaitlistApplication = typeof waitlistApplications.$inferInsert;

/* ────────────────────────────────────────────────────────────
   TYPE EXPORTS  (for use in app code)
   ──────────────────────────────────────────────────────────── */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type ListingMedia = typeof listingMedia.$inferSelect;
export type Brief = typeof briefs.$inferSelect;
export type BriefMatch = typeof briefMatches.$inferSelect;
export type Thread = typeof threads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Dispute = typeof disputes.$inferSelect;
export type DisputeEvent = typeof disputeEvents.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type Search = typeof searches.$inferSelect;
export type SavedListing = typeof savedListings.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Quiet unused-import warning for sql; reserved for raw migrations / defaults
void sql;
