import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/** Set BYPASS_CLERK_AUTH=true to skip sign-in for /app (dev / staging only). */
const bypassClerkAuth =
  process.env.BYPASS_CLERK_AUTH === "true" ||
  process.env.BYPASS_CLERK_AUTH === "1";

const isProtected = createRouteMatcher(["/app(.*)"]);
/** Native app calls these with `Authorization: Bearer`; session is verified in the route handler. */
const isMobileApi = createRouteMatcher(["/api/mobile(.*)"]);
const isPublicAuth = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/welcome",
  "/auth/(.*)",
  "/api/webhooks/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isMobileApi(req)) return;
  if (isPublicAuth(req)) return;
  if (isProtected(req) && !bypassClerkAuth) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
