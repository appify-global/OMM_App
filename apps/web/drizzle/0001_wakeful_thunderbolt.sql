CREATE TYPE "public"."waitlist_status" AS ENUM('PENDING', 'REVIEWED', 'INVITED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "waitlist_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"agency" text,
	"role" text,
	"licence" text,
	"suburbs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"years_experience" integer,
	"notes" text,
	"source" text,
	"status" "waitlist_status" DEFAULT 'PENDING' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_applications_email_idx" ON "waitlist_applications" USING btree ("email");