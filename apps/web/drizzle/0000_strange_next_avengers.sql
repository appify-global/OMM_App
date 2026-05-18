CREATE TYPE "public"."attachment_kind" AS ENUM('PDF', 'IMAGE', 'PLAN', 'CONTRACT');--> statement-breakpoint
CREATE TYPE "public"."brief_status" AS ENUM('ACTIVE', 'PAUSED', 'MATCHED', 'FULFILLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."dispute_author" AS ENUM('YOU', 'COUNTERPARTY', 'MEDIATOR');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('PAID', 'OUTSTANDING', 'DRAFT', 'VOID');--> statement-breakpoint
CREATE TYPE "public"."listing_media_kind" AS ENUM('PHOTO', 'FLOOR_PLAN', 'VIDEO', 'SOI_PDF');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('DRAFT', 'PRE_MARKET', 'LIVE', 'UNDER_OFFER', 'SOLD', 'WITHDRAWN', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."message_category" AS ENUM('BUYER', 'LISTING', 'BRIEF', 'VENDOR', 'PLATFORM');--> statement-breakpoint
CREATE TYPE "public"."message_direction" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('NEW_MATCH', 'NEW_ENQUIRY', 'NEW_OFFER', 'INSPECTION', 'MESSAGE', 'BRIEF_REPLY', 'REVIEW', 'DISPUTE', 'BILLING', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('SETTLED', 'IN_TRANSIT', 'SCHEDULED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('AGENT', 'BUYER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "brief_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"brief_id" text NOT NULL,
	"listing_id" text,
	"agent_id" text,
	"match_score" integer,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "briefs" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" text NOT NULL,
	"headline" text NOT NULL,
	"story" text,
	"status" "brief_status" DEFAULT 'ACTIVE' NOT NULL,
	"budget_from" numeric(12, 2),
	"budget_to" numeric(12, 2),
	"budget_display" text,
	"bedrooms_min" integer,
	"bathrooms_min" integer,
	"car_spaces_min" integer,
	"suburbs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"property_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"must_haves" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"nice_to_haves" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"timeline" text,
	"finance" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispute_events" (
	"id" text PRIMARY KEY NOT NULL,
	"dispute_id" text NOT NULL,
	"author" "dispute_author" NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"posted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"raised_by_id" text NOT NULL,
	"counterparty" text NOT NULL,
	"status" "dispute_status" DEFAULT 'OPEN' NOT NULL,
	"listing" text,
	"amount_at_stake" numeric(12, 2),
	"summary" text NOT NULL,
	"opened_on" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"reference" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'AUD' NOT NULL,
	"status" "invoice_status" DEFAULT 'DRAFT' NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"due_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"kind" "listing_media_kind" NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"title" text NOT NULL,
	"address" text NOT NULL,
	"suburb" text NOT NULL,
	"state" text DEFAULT 'VIC' NOT NULL,
	"postcode" text,
	"status" "listing_status" DEFAULT 'DRAFT' NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"car_spaces" integer,
	"land_size_sqm" integer,
	"building_size_sqm" integer,
	"price_from" numeric(12, 2),
	"price_to" numeric(12, 2),
	"price_display" text,
	"description" text,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"inspection_times" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"soi_url" text,
	"soi_kind" text,
	"soi_generated_at" timestamp,
	"views_count" integer DEFAULT 0 NOT NULL,
	"enquiries_count" integer DEFAULT 0 NOT NULL,
	"authority_expires_at" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"kind" "attachment_kind" NOT NULL,
	"filename" text NOT NULL,
	"url" text,
	"caption" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"direction" "message_direction" NOT NULL,
	"body" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"href" text,
	"listing_id" text,
	"brief_id" text,
	"thread_id" text,
	"read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'AUD' NOT NULL,
	"destination" text NOT NULL,
	"status" "payout_status" DEFAULT 'SCHEDULED' NOT NULL,
	"scheduled_for" timestamp,
	"settled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"reviewer_id" text,
	"reviewer_name" text NOT NULL,
	"reviewer_role" text NOT NULL,
	"rating" integer NOT NULL,
	"body" text NOT NULL,
	"listing_ref" text,
	"posted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "searches" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" text NOT NULL,
	"name" text NOT NULL,
	"query" text,
	"suburbs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"property_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bedrooms_min" integer,
	"bathrooms_min" integer,
	"car_spaces_min" integer,
	"price_min" numeric(12, 2),
	"price_max" numeric(12, 2),
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alert_cadence" text DEFAULT 'INSTANT' NOT NULL,
	"new_matches_count" integer DEFAULT 0 NOT NULL,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"participant_id" text,
	"participant_name" text NOT NULL,
	"participant_firm" text,
	"participant_initials" text,
	"context" text NOT NULL,
	"category" "message_category" DEFAULT 'BUYER' NOT NULL,
	"unread" boolean DEFAULT false NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"preview" text,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"name" text NOT NULL,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'AGENT' NOT NULL,
	"title" text,
	"firm" text,
	"licence" text,
	"abn" text,
	"bio" text,
	"headline" text,
	"suburbs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specialties" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"years_experience" integer,
	"website_url" text,
	"instagram_handle" text,
	"linkedin_url" text,
	"rating" numeric(3, 2),
	"reviews_count" integer DEFAULT 0 NOT NULL,
	"verified_at" timestamp,
	"show_phone_on_listings" boolean DEFAULT true NOT NULL,
	"show_email_on_listings" boolean DEFAULT true NOT NULL,
	"show_on_directory" boolean DEFAULT true NOT NULL,
	"push_messages" boolean DEFAULT true NOT NULL,
	"push_offers" boolean DEFAULT true NOT NULL,
	"email_digest" boolean DEFAULT false NOT NULL,
	"sms_alerts" boolean DEFAULT true NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brief_matches" ADD CONSTRAINT "brief_matches_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."briefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brief_matches" ADD CONSTRAINT "brief_matches_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brief_matches" ADD CONSTRAINT "brief_matches_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_events" ADD CONSTRAINT "dispute_events_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_id_users_id_fk" FOREIGN KEY ("raised_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."briefs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searches" ADD CONSTRAINT "searches_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "saved_listings_buyer_listing_idx" ON "saved_listings" USING btree ("buyer_id","listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");