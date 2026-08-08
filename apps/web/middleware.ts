import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/** Set BYPASS_CLERK_AUTH=true to skip sign-in on members-only pages (dev / staging only). */
const bypassClerkAuth =
  process.env.BYPASS_CLERK_AUTH === "true" ||
  process.env.BYPASS_CLERK_AUTH === "1";

/**
 * Waitlist mode — when on, public auth pages redirect home and the modal
 * collects waitlist applications instead. Default: ON. Set
 * NEXT_PUBLIC_WAITLIST_MODE=false to re-enable Clerk sign-in pages.
 *
 * Note: We do NOT block /app server-side here — that would break internal QA
 * via direct URL. Marketing CTAs simply never link to /sign-in while the
 * flag is on, so end users won't land there.
 */
const waitlistRaw = (process.env.NEXT_PUBLIC_WAITLIST_MODE ?? "true")
  .trim()
  .toLowerCase();
const waitlistMode = !["false", "0", "off", "no"].includes(waitlistRaw);

const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

/** Railway healthcheck - must skip Clerk entirely to stay sub-50ms. */
const isHealthcheck = createRouteMatcher(["/api/healthz"]);
const isPublicAuth = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/welcome",
  "/auth/(.*)",
  "/api/webhooks/(.*)",
]);
/** Marketing homepage only - everything else needs a session. */
const isPublicHome = createRouteMatcher(["/"]);
/** Public marketing pages - no sign-in, no Clerk modal. */
const isPublicMarketing = createRouteMatcher([
  "/about(.*)",
  "/contact(.*)",
  "/legal(.*)",
  "/privacy(.*)",
]);

/**
 * Nothing is members-only on the marketing site any more - the product surface
 * moved to OMM_Mobile. Re-add matchers here if a gated page ever lands back.
 */
const isMembersOnly = createRouteMatcher([]);

export default clerkMiddleware(async (auth, req) => {
  if (isHealthcheck(req)) return;

  // Waitlist mode: send /sign-in and /sign-up to home. Webhooks still work
  // (covered by isPublicAuth catch-all below being skipped after this).
  if (waitlistMode && isAuthPage(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isPublicAuth(req)) return;
  if (isPublicHome(req)) return;
  if (isPublicMarketing(req)) return;
  if (isMembersOnly(req) && !bypassClerkAuth) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
