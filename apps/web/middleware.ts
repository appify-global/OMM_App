import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/** Set BYPASS_CLERK_AUTH=true to skip sign-in for /app (dev / staging only). */
const bypassClerkAuth =
  process.env.BYPASS_CLERK_AUTH === "true" ||
  process.env.BYPASS_CLERK_AUTH === "1";

/** Signed-in product — only these routes require a session. */
const isProtected = createRouteMatcher(["/app(.*)"]);
const isPublicAuth = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/welcome",
  "/auth/(.*)",
  "/api/webhooks/(.*)",
]);
/** Marketing site — browse without signing in. */
const isPublicMarketing = createRouteMatcher([
  "/",
  "/listings(.*)",
  "/suburbs(.*)",
  "/briefs(.*)",
  "/blog(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/legal(.*)",
  "/privacy(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicAuth(req)) return;
  if (isPublicMarketing(req)) return;
  if (isProtected(req) && !bypassClerkAuth) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Exclude `/api/mobile/*` — Expo Bearer JWT only (`getUserIdFromMobileRequest`), not Clerk cookies.
    // Including those paths here makes Clerk require `CLERK_SECRET_KEY` on the Edge runtime before the handler runs.
    "/((?!_next|api/mobile|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
