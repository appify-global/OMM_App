# OMM cross-repo architecture audit — 2026-08-09

Automated multi-agent audit of `OMM_App`, `OMM_BACKEND` and `OMM_Mobile`. 59 findings, each adversarially verified by an independent agent instructed to refute it. 66 agents, 1850 tool calls.

Verdicts: 11 CONFIRMED as claimed, 48 PARTIALLY_CONFIRMED (corrected or narrowed by the verifier), 0 refuted outright.

---

# OMM REMEDIATION PLAN

---

## 1. THE SPINE

Four structural problems. Three of them share one root cause, and the fourth is why nobody caught the other three.

### S1. OMM_App was demoted from "the product" to "marketing" by deleting its *control* plane and leaving its *data* plane intact

The `/app` workspace, `/api/mobile` and the `apps/mobile` fork were deleted. What was not deleted:

- `OMM_App/apps/web/src/db/schema.ts` — a 731-line fork of the backend's 1085-line schema
- `OMM_App/apps/web/drizzle.config.ts` + `drizzle/` + `scripts/run-migration.mjs`
- `db:push` / `db:migrate` / `db:generate` / `db:studio` in `apps/web/package.json`
- `DATABASE_URL` in `apps/web/.env.local` **and** on the Railway `website-frontend` service — byte-identical to `application-backend`'s
- `apps/web/app/api/webhooks/clerk/route.ts`, which hard-`DELETE`s from `users` behind 17 `ON DELETE CASCADE` FKs

A marketing site holds superuser write access to the product's production Postgres and ships two ways to destroy it (one interactive, one server-to-server). Findings that are all just *this*: the hard-delete webhook, the `db:push` drop-9-tables/drop-7-columns hazard, the `users_email_idx` 23505 upsert, the `isPermittedWorkEmail` bypass, the dual migration ledger, the orphaned `waitlist_applications`, and the production DSN sitting in a working tree.

### S2. Identity has no server-side authority — and the Clerk instance split is simultaneously a defect and the only thing containing S1

Two things are broken at once:

- **Instance fragmentation.** `www` runs the dev instance (`known-elf-22`), the product runs `pk_live` (`clerk.offmarketmatch.com.au`), staging runs a third (`organic-mosquito-64`), and there is an orphaned fourth that no service points at but that `docs/RAILWAY_DEPLOY.md:29,72` tells you to configure.
- **Authority-in-the-client.** `OMM_BACKEND/src/lib/clerk-profile-builders.ts:70-79` reads `ommRole`, `firm` and `agencyId` from `unsafeMetadata` — which by definition any signed-in user can PATCH via Clerk FAPI. `clerk-user-sync.ts:226-240` writes it verbatim into Postgres. `users.show_on_directory` defaults true. `queries.ts:1799-1806` builds the buyer-agent referral panel from exactly those fields, and `users.firm` is free text with no FK, so agency brand impersonation does not even require a valid `agencyId`.

**The interlock, and the single most important thing in this document:** the S1 hard-delete path is dormated *only* because `website-frontend` is on a different Clerk instance whose user IDs cannot collide with the 25 live rows. The obvious tidy-up for S2 — "put www on the live Clerk instance" — arms S1 with zero code change. **Data plane must be severed before instances are unified.** Same applies to `NEXT_PUBLIC_WAITLIST_MODE=false`.

Compounding S2 on the product side: `OMM_Mobile/scripts/clerk-sync-dev-origins.mjs` pushed six localhost origins onto the **production** Clerk instance (verified: FAPI returns `access-control-allow-origin: http://localhost:8081` with credentials), the script's own docstring tells you to source `OMM_BACKEND/.env.local` which holds `sk_live_`, and `OMM_BACKEND/src/lib/mobile-bearer-auth.ts:44-47` calls `verifyToken` with no `authorizedParties`, so `azp` is never checked across all 58 route files. `src/lib/api-cors.ts:4-10` independently allowlists localhost. There is no second line of defence anywhere.

### S3. The production schema has no reproducible source of truth

`OMM_BACKEND/railway.toml:9` uses `releaseCommand`, which **is not a Railway configuration key**. Railway silently ignores it. Five deploys since 0012 merged all succeeded with the ledger unchanged, and `agencies.updated_at` is frozen at 2026-07-07 — two days before the key was even added. Conclusion: **`drizzle-kit migrate` has never run in production.** The live schema exists because someone ran `drizzle-kit push` by hand.

Consequences that follow: the ledger stops at 0011 while 0012/0013 objects exist; `0002_support_requests` and `0004_searches_mobile_fields` are on disk but absent from `_journal.json`; `0012_listings_sale_method_heritage.sql` has a bare `CREATE TYPE "public"."sale_method"` that will 42710 the moment anyone fixes the config key; `drizzle/meta/` retains only the 0000 and 0001 snapshots; `waitlist_applications` can never be applied from OMM_App because drizzle's high-water mark (1781100000000) exceeds its `folderMillis` (1779285489592). `scripts/start-production.sh:10-20` prints "migrations already ran via releaseCommand", which is false.

You cannot currently build a staging database, restore from DR, or onboard a developer without hand-reconstructing the schema.

### S4. Every guard in this system reports success without checking anything

This is why S1–S3 survived. It is a pattern, not a coincidence:

| Guard | What it actually does |
|---|---|
| `OMM_Mobile/scripts/verify-clerk-alignment.mjs:48-53` | `secretKeyValid()` returns bare `res.ok` and discards the body. Passes green on real `pk_live` + real `sk_test` from the other instance. Never inspects `website-frontend` — the exact split it exists to catch. Cited as sanctioned in `README.md:29` and `public/todo-items.js:38` marked "Done". |
| `OMM_BACKEND/railway.toml:9` | Wrong key name. Migrations never ran. |
| OMM_Mobile CI | Does not exist. `npm run build:web` = `expo export`, which strips types without checking (proved by probe). 616 typechecked files, 129 tests, zero gates. |
| `OMM_Mobile/package.json:38` `verify` | Runs `test:auth` — 63 of 129 tests. Skips SOI comparables, AU address parsing, workspace mode. |
| `OMM_BACKEND/package.json:22` `test` | Hardcoded 10-file list. An 11th test file is silently never executed. |
| `OMM_BACKEND/.github/workflows/ci.yml` | No build step, so `.next/types/**` matches zero files and Next's 24 dynamic-route validators are invisible to `tsc`. |
| `@unlisted/shared` | Declared, typechecked, 21 of 22 exports unimported, already drifted on `Listing`, `Brief`, `MessageThread`, `AuthorityExpiring`. `docs/architecture-diagram.html:328` draws an `API --> Shared` edge that does not exist. |
| ESLint | Absent from all three repos — while 16 `eslint-disable` comments sit in OMM_Mobile for a linter that has never run. |
| GitHub Actions | Backend's last two runs failed in 2-4s on billing. No CI signal since 2026-08-06. |

Fix the guards last in effort but understand them first: without S4 addressed, everything below regresses.

---

## 2. PRIORITISED PLAN

Ordered by (blast radius at launch) × (cost to fix later). Tier 0 and Tier 1 are the "before real users" line.

### TIER 0 — bleeding right now, on the public domain

**T0.1 — Waitlist is 500ing on every submission. Silent, ongoing lead loss.**
`waitlist_applications` does not exist in production (`to_regclass` → null; 25 tables, none matching). `OMM_App/apps/web/app/api/waitlist/route.ts:107-111` SELECTs it first thing, catches at :134, returns 500 "Could not save your application". `NEXT_PUBLIC_WAITLIST_MODE=true`, 12 "Join the waitlist" CTAs on the homepage. This is the site's entire conversion path.

- Immediate: apply the DDL from `OMM_App/apps/web/drizzle/0001_wakeful_thunderbolt.sql` (CREATE TYPE `waitlist_status` + CREATE TABLE) manually against production, guarded with `DO $$ … EXCEPTION WHEN duplicate_object` / `IF NOT EXISTS`.
- Same PR: `WAITLIST_FROM_EMAIL` on `website-frontend` is `MATCH <onboarding@resend.dev>` — Resend's sandbox sender, delivers only to the account owner. Set it to `contact@offmarketmatch.com.au` (already `verified` on the same key). Fix `apps/web/src/lib/email.ts:48-57` to inspect the SDK's returned `{ error }` — v6 never throws, so the try/catch cannot observe a 403 and `return { ok: true }` runs regardless. Check the result at `route.ts:144`.
- Same PR: `apps/web/middleware.ts:47` sets `isMembersOnly = createRouteMatcher([])`, so `auth.protect()` never runs and `POST /api/waitlist` is unauthenticated and unrate-limited. `route.ts:105-130` *updates* on existing email, so anyone can overwrite a known agent's stored licence number, phone and IP. Add rate limiting and make duplicate email a no-op ack.
- Then (T1.1 dependency): move the table into `OMM_BACKEND/drizzle` as `0014_waitlist_applications` with a `when` **above** 1781100000000, and repoint the website at a backend endpoint.

**Unblocks:** T1.1 (this route is the only other `@/db` consumer in OMM_App).

**T0.2 — Home tab white-screens on browser resize.**
`OMM_Mobile/app/(tabs)/index.tsx` — `HomeScreen` calls `useWebDesktopLayout()` at :1246, early-returns at :1249 when `desktopWeb`, then calls `usePullToRefresh`/`useCallback`/`useTabScreenBottomPad` at :1349-1359. `useWebDesktopLayout` is driven by a window resize listener (`lib/use-web-viewport-size.ts`), so crossing 768px changes the hook count mid-lifecycle → "Rendered more hooks than during the previous render" on `app.offmarketmatch.com.au`. Move all hooks above the early return. One file, minutes.

---

### TIER 1 — must land before the product has real users

**T1.1 — Sever OMM_App's data plane. (OMM_App, plus Railway + Clerk dashboard)**

Delete, in this order:
1. `apps/web/app/api/webhooks/clerk/route.ts`
2. Delete Svix endpoint `ep_3Cq4z9CQvq8gCK51ktdpl49lJ0T` from the `known-elf-22` instance; rotate `whsec_[REDACTED]`
3. `apps/web/src/db/`, `apps/web/drizzle/`, `apps/web/drizzle.config.ts`, `apps/web/scripts/run-migration.mjs`
4. The four `db:*` scripts and the `drizzle-kit` / `drizzle-orm` / `pg` / `svix` deps from `apps/web/package.json`
5. Unset `DATABASE_URL` and `CLERK_WEBHOOK_SECRET` on Railway `website-frontend` (both environments); remove `DATABASE_URL` from `apps/web/.env.local`
6. **Rotate the Postgres password.** `blzCeJ…` has been in a working tree of a repo that has no business having it, and is on four service instances.
7. Regenerate `OMM_App/package-lock.json` to drop the stale `packages/*` workspace entries

**Unblocks:** everything Clerk-related. This is the gate on T1.2's instance work, on ever flipping `WAITLIST_MODE`, and on the DR/staging work in T2.

**T1.2 — Close the production token trust boundary. (Clerk dashboard, OMM_BACKEND, OMM_Mobile)**

- PATCH live instance `allowed_origins` down to `https://app.offmarketmatch.com.au` (+ apex/www only if the founder decides www needs Clerk — see §4.2). Drop the six localhost entries.
- `OMM_BACKEND/src/lib/mobile-bearer-auth.ts:44` — add `authorizedParties: ['https://app.offmarketmatch.com.au', <native scheme>]`. Per `@clerk/backend@3.4.11`, a missing `azp` always passes, so native iOS/Android are unaffected while localhost-minted tokens are rejected.
- `OMM_BACKEND/src/lib/api-cors.ts:4-10` — remove localhost from `DEFAULT_ALLOWED_ORIGINS`; set `ALLOWED_CORS_ORIGINS` explicitly on `application-backend` per environment so the live allowlist is visible in config.
- `OMM_Mobile/scripts/clerk-sync-dev-origins.mjs` — hard guard at the top: fetch `/v1/instance` and `process.exit(1)` if `environment_type === 'production'` or the key starts with `sk_live_`. Also fix the docstring at line 10, which currently instructs sourcing the file that holds `sk_live`.

Precondition today: an attacker able to serve on the victim's own loopback 8080/8081/19006 (a compromised dev dependency, any other local project) while the victim is signed in can mint a real production session JWT and replay it server-side with no Origin header. Nothing downstream distinguishes it.

**T1.3 — Stop treating `unsafeMetadata` as authorization data. (OMM_BACKEND, OMM_Mobile)**

- `OMM_BACKEND/src/lib/clerk-profile-builders.ts:70-79` and `src/lib/omm-role.ts:31-44,63-74` — read only `publicMetadata`. Delete the `um?.*` fallbacks.
- Backend writes `ommRole`/`agencyId`/`firm` into `publicMetadata` via `clerk.users.updateUserMetadata` **after** validating the agency selection server-side against the `agencies` table. `agencyRequests`, `parseAgencyRequestIdFromMetadata` and the `agency_request_status` enum already exist as dead code — wire them, or pick a different verification model (§4.1).
- `unsafeMetadata` becomes a client UX cache only.
- Bug to fix in the same pass: `src/lib/ensure-clerk-user-db.ts:138` awaits `upsertUserFromClerkProfile` with no try/catch, and `users.agencyId` carries an FK — so a bogus `agencyId` makes **every** mobile API call 500 for that user.

Without this, any user with a non-webmail address can set `ommRole='Buyer Agent'` plus a real agency's name, land in the buyer-agent referral pool under that brand, and — because they also control `operatingStates`/`suburbs` which feed `areaOverlapScore` — rank themselves top of every listing's referral panel.

**T1.4 — Delete `POST /api/mobile/listings`. (OMM_BACKEND)**

`app/api/mobile/listings/route.ts:175` is called by nothing (the real path is `POST /api/mobile/published-listings`) but is live behind bearer auth and is missing two guards its twin enforces: the `soi_required` check at `published-listings/route.ts:234-236`, and `features` sanitisation. It forwards the caller's `features` array unfiltered (`:108-114` → `queries.ts:2249`), so `features: ["omm:meta:{\"listingStatus\":\"live\"}"]` on a DRAFT makes the listing buyer-visible via `isListingVisibleToBuyer` while skipping the Statement of Information gate entirely. SOI is statutory. Delete the route (also `messages/[id]/referral-deal` GET and `propertydata/session-check`, both dead — keep Playwright, it is load-bearing for `soi/generate-from-propertydata`).

**T1.5 — Guard the destructive seed. (OMM_BACKEND)**

`src/db/seed.ts:110-133` deletes every row from 20 tables, untransacted, as the first action of `main()`. The existing guard (`:544-550`, `NODE_ENV === 'production'`) works in the container but not on a laptop, where `NODE_ENV` is unset and `.env.local` points at production — put there by `npm run sync:railway-env`, the documented setup step. It sits one tab-completion from `db:seed-agencies`. Blast radius verified: 537 rows, 25 users, 24 listings, 39 threads, 96 messages, 3 invoices, 2 payouts, 80 agencies.

Fix: assert `DATABASE_URL` host is localhost/127.0.0.1 unless `ALLOW_DESTRUCTIVE_SEED=1`. Rename to `db:seed-demo-destructive`.

---

### TIER 2 — must land before you need to rebuild anything (staging, DR, a second region, a new dev)

**T2.1 — Make migrations real. Strict order.**

1. Rewrite `OMM_BACKEND/drizzle/0012_listings_sale_method_heritage.sql` idempotently — `DO $$ BEGIN CREATE TYPE … EXCEPTION WHEN duplicate_object THEN NULL; END $$` in the style of 0013, plus `ADD COLUMN IF NOT EXISTS`.
2. Re-add `0002_support_requests` (`when: 1779500000000`) and `0004_searches_mobile_fields` (a value **below** 1781100000000) to `drizzle/meta/_journal.json`, preserving their original low timestamps so production skips them and fresh databases apply them. Make 0002 idempotent first.
3. Regenerate the missing `drizzle/meta/*_snapshot.json` files — only 0000 and 0001 remain, so the next `db:generate` will emit one migration re-creating everything from 0002 onward.
4. **Only now** change `railway.toml:9` `releaseCommand` → `deploy.preDeployCommand`.
5. Prove it: restore a snapshot into a scratch DB, run `db:migrate` from empty, diff `information_schema` against production.
6. Fix `scripts/start-production.sh:10-20`, which currently prints a false "migrations already ran via releaseCommand".
7. Add a CI assertion: `ls drizzle/*.sql | wc -l` == `jq '.entries|length' drizzle/meta/_journal.json`. Ban `drizzle-kit push` against production.

**T2.2 — Restore verification. (all three repos)**

- Unblock GitHub Actions billing first. Backend CI has produced no signal since 2026-08-06.
- OMM_Mobile: restore `28bb3d1^:.github/workflows/ci.yml` — it existed and was deleted as collateral when store builds moved to EAS. Wire it to `typecheck` + `npm run test` (full) + `verify:delete-guards` + `build:web`. **Not** `npm run verify`.
- `OMM_Mobile/package.json:38` — change `test:auth` to `test` (63 → 129 tests).
- `OMM_BACKEND/.github/workflows/ci.yml` — add `npx next typegen` before `npm run typecheck` (Next 16.2 supports it without a full build) so the 24 dynamic-route validators are checked.
- `OMM_BACKEND/package.json:22` — replace the hardcoded 10-file list with `"src/**/*.test.ts"`; verify on Node 20 or bump CI's Node.
- Add `.node-version` = `22` and an `engines` block to OMM_BACKEND; switch `ci.yml` to `node-version-file`. Delete `OMM_Mobile/nixpacks.toml` (dead — builder is RAILPACK) and `OMM_App/railpack.json` (dead — `configFile: /railway.json`).
- Add `next-env.d.ts` to `.gitignore` in both Next repos and `git rm --cached`; it flips between dev and build variants on every cycle.
- Add ESLint (`eslint-config-next` / `eslint-config-expo`) with `react-hooks/*` and `@typescript-eslint/no-floating-promises` as errors, everything else warnings. It found T0.2.
- Rewrite or delete `verify-clerk-alignment.mjs` — see §3.7.

**T2.3 — Route-level tests for the handlers that can lose money or data.** Zero of 63 route handlers has a behavioural test. Start with `/api/webhooks/clerk` (svix verification), `/api/mobile/account/delete` + preflight, and the bearer-auth path. Next 16 handlers are plain functions — import and invoke with a constructed `Request` under the existing `node:test` setup. Also fix `scripts/verify-delete-guards.mjs`, which re-implements the predicates inline instead of importing them.

---

### TIER 3 — starts biting exactly when the platform starts working

**T3.1 — Search is unpaginated and silently truncates.** `app/api/mobile/search/route.ts:113-172` reads 8 params and hardcodes `limit: 96`; the client sends 14. `bedroomsMax`, `bathroomsMax`, `carsMin`, `carsMax`, `landSqmMin`, `landSqmMax` are absent from the entire backend, and `searchListings` (`src/db/queries.ts:159`) does not accept them. The client re-filters locally *after* the server has already truncated.

Worse: `buyerSearchFiltersHasCriteria` (`OMM_Mobile/lib/buyer-listed-search.ts:248-257`) treats a cars-only or land-only filter as valid criteria, so a "4+ car" search sends **only** unread params — the server does an effectively unfiltered search and returns the newest 96 listings platform-wide. That triggers as soon as the catalogue exceeds 96, not when the matching subset does.

Fix: extend `searchListings` (the `carSpaces` and `landSizeSqm` columns already exist), parse the six params, and add `total`/`hasMore` to the response so truncation is detectable. Fix the stale contract comment at `packages/shared/src/mobile-api.ts:236`.

**T3.2 — Chat attachments are Redis blobs with a 60-day sliding TTL, message rows are permanent.** `src/lib/message-attachment-storage.ts:11,126-127`. After 60 days without being opened the chip still renders and 404s with `attachment_unavailable`, and `OMM_Mobile/lib/message-attachment-open.ts:26-28` tells the user to "try again in a moment" — advice that can never work. Contracts of Sale normally take the durable S3 path, but fall back to Redis when the listing isn't a persisted `lst-` id. Move attachments to the `application-imagery` bucket (`src/lib/listing-media-bucket.ts` is already configured), or at minimum return a distinct expired code and stop rendering dead chips. Delete the `att-floorplan` seed row with the NULL url — it reproduces the failure today.

**T3.3 — Media URLs are baked to the disposable Railway domain.** Delete `LISTING_MEDIA_PUBLIC_ORIGIN` and `MOBILE_API_PUBLIC_ORIGIN` from `application-backend` (both environments) — the fallback chain already resolves `RAILWAY_PUBLIC_DOMAIN` = `api.offmarketmatch.com.au`. Then run `scripts/backfill-listing-media-to-bucket.mjs` (it already does the `listing_media.url` rewrite) and add the equivalent one-liner for `message_attachments.url`. Do this **before** anyone deletes the auto-generated domain during "domain cleanup".

---

### TIER 4 — before the store binary is built

**T4.1 — Universal Links and App Links are dead.** `app.offmarketmatch.com.au/.well-known/apple-app-site-association` returns `{"applinks":{"apps":[],"details":[]}}`; `assetlinks.json` returns `[]`. Set `APPLE_TEAM_ID=9VB3P2H367` and `ANDROID_APP_LINK_SHA256` (from `eas credentials -p android`) on Railway `application-frontend`. Make `scripts/generate-well-known.mjs` exit non-zero when `RAILWAY_ENVIRONMENT_NAME === 'production'` and either is missing — it currently only warns.

**T4.2 — The binary may declare the wrong host.** `OMM_Mobile/lib/universal-link-config.js:3-4` `DEFAULT_WEB_ORIGIN = 'https://application-frontend-production-de79.up.railway.app'`, and `app.config.js:44` derives `associatedDomains` from it. `eas.json`'s production profile sets no `EXPO_PUBLIC_WEB_ORIGIN`. Change the default to `https://app.offmarketmatch.com.au` or make it throw, and add `"environment": "production"` explicitly to the production profile so config does not depend on EAS CLI inference. Setting the Apple/Android values on Railway alone will not fix this.

---

### TIER 5 — hygiene, batched

| Item | Where |
|---|---|
| Drop `DATABASE_URL` / `RESEND_API_KEY` / `WAITLIST_FROM_EMAIL` from `application-frontend` (both envs) — verified unused. Per-service Resend keys. Scoped Postgres role instead of `postgres`. | Railway |
| Delete row `user_verify_webhook_omm3007` from production; make `scripts/verify-clerk-webhook.mjs` read-only (assert 400 on bad signature) or add a cleanup step | OMM_BACKEND |
| Generic auth bodies: `src/lib/mobile-bearer-auth.ts:62-73` returns "Railway CLERK_SECRET_KEY must match EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" to any bad token, and `OMM_Mobile/lib/mobile-published-listings-api.ts:120-129` deliberately forwards it into user alerts. Also scrub the hardcoded dev strings at `:141,:145,:156,:160,:162` and `mobile-database-context.tsx:84,86` | both |
| `rate_limited` copy: raw code reaches users via `lib/mobile-property-enrichment-api.ts:196` → `app/(tabs)/add/index.tsx:985` and `lib/mobile-soi-propertydata-draft-pdf.ts:88` → `update-soi.tsx:269`. Read `retryAfterSec` | OMM_Mobile |
| Route `message-attachment-open.ts`, `mobile-published-listings-pdf.ts`, `soi-pdf-webview-source.ts:120-135` through `fetchWithBearerRetry` | OMM_Mobile |
| Delete `packages/shared` (21 dead exports, drifted); move `InspectionActivityItem` into `lib/`; fix `docs/architecture-diagram.html:328` | OMM_Mobile |
| Listing status badge fallback: `lib/listing-status-badge.ts:15` returns the green LIVE wash for anything unrecognised, and two live producers emit `"PRE-MARKET"`/`"WITHDRAWN"`/`"OFF-MARKET"` (`rsc-loaders.ts:59-70`, `mobile-saved-listings-map.ts:26-44`). Change `FALLBACK` to neutral grey and add the missing washes | OMM_Mobile |
| Work-email blocklist: import one module in the waitlist route rather than a third copy | OMM_App |
| Docs: `RAILWAY_DEPLOY.md:3,11,29,54,72`, `OMM_Mobile/README.md:29`, `HANDOVER_NIMERSHAN.md:22-23,29,30`, `OMM_BACKEND/README.md:5-7`. `organic-mosquito-64` is a **real live orphaned instance**, which makes step 72 worse than a typo: you make the change and it silently does nothing | all |
| Port or delete the 5 PowerShell npm scripts (`package.json:42-46`); `verify:backend` is already covered by `scripts/verify-api-domain.mjs` | OMM_Mobile |
| Delete `OMM_BACKEND/Dockerfile.imagery`, `TEST_REDIS_SETUP`, `NEXT_PUBLIC_BACKEND_URL` (both services), the two dead `NEXT_PUBLIC_CLERK_*_FALLBACK_REDIRECT_URL`, `OMM_Mobile/assets/images/match-logo.png`, `apps/web/src/lib/auth-user.ts` | all |
| Set `ENRICHMENT_PROXY_SECRET` on both services and remove the `CLERK_SECRET_KEY` fallback at `enrichment-internal-proxy-auth.ts:12`. Separately: `application-enrichment` is on a public Railway domain, so its PropertyData/Playwright routes are internet-reachable behind only the Clerk bearer — check whether that is intended | OMM_BACKEND |
| Redeploy `application-backend@staging` from `main` — it is on `claude/signup-property-listing-ui-eji88v`, 8 commits behind | Railway |

---

## 3. WHAT NOT TO DO

1. **Do not unify the Clerk instances first.** It is the obvious cleanup and it converts the S1 landmine into live, unrecoverable cascade deletion of real agent data. `T1.1` first, always. Same for flipping `NEXT_PUBLIC_WAITLIST_MODE=false`.

2. **Do not run `npm run db:migrate` from `OMM_App/apps/web` to create `waitlist_applications`.** Both repos share one `drizzle.__drizzle_migrations`; drizzle's gate (`pg-core/dialect.cjs:64`) compares against the newest applied row (1781100000000) and OMM_App's `0001_wakeful_thunderbolt` has `when` 1779285489592. It will print success, exit 0, and create nothing. You will believe it worked.

3. **Do not fix `railway.toml`'s `releaseCommand` → `preDeployCommand` first.** That is the tempting one-word typo fix and it arms 0012's unguarded `CREATE TYPE "public"."sale_method"`, which raises 42710 and blocks every backend deploy. Guard 0012 and re-journal 0002/0004 first (T2.1 steps 1-3), *then* fix the key.

4. **Do not re-add 0002/0004 to the journal with new high `when` values.** Production would re-run 0002's unguarded `CREATE TYPE` / `CREATE TABLE` and fail the release. Preserve the original low timestamps so production skips them via the high-water mark and only fresh databases apply them.

5. **Do not "harden" the seed by tightening the `NODE_ENV` check.** That guard already exists at `seed.ts:544-550` and already works where it matters (the container sets `NODE_ENV=production` in `Dockerfile:16`). The gap is developer laptops where `NODE_ENV` is undefined and `.env.local` points at production. Assert on the resolved `DATABASE_URL` host.

6. **Do not change the `users` FKs from `CASCADE` to `RESTRICT`.** It is a production schema change to defend against code you are deleting, and it would break the backend's legitimate `processDueScheduledClerkDeletions` path. Delete the route.

7. **Do not "extend" `verify-clerk-alignment.mjs` to cover `website-frontend`.** It shells `railway variables --json` with no `--service`/`--environment`, depends on ambient cwd-keyed link state, makes 4 CLI calls per run, and is structurally un-runnable on a CI runner. Either rewrite it as an env-var-driven CI check that compares *identity* — fetch `/v1/instance` with the secret key, assert `environment_type` matches the publishable prefix, cross-check `jwks.json` `kid` against `clerkFrontendApiHost(publishable)` — or delete it along with `README.md:29` and `public/todo-items.js:38`. A guard that passes on a deliberately mismatched key pair is worse than no guard; it is how this split survived.

8. **Do not "make `@unlisted/shared` real".** It is 21 dead exports, 4 drifted types, a wrong package name, and a docs diagram asserting a dependency edge that does not exist. Delete it. A real contract is zod schemas or codegen from the backend route handlers — a project, not a cleanup. Leaving the package in place makes that project look half-done and invites someone to type a new screen against a schema no server returns (`addressDisclosure` is the field it does not know exists).

9. **Do not repoint staging's frontend at staging's backend and expect it to work.** `src/lib/api-cors.ts:24-31` `isRailwayAppOrigin` hard-403s all `*.up.railway.app` **before** the allowlist, so staging→staging is also 403. Either give staging real subdomains (`staging-app` / `staging-api`.offmarketmatch.com.au) so the origin allowlist works as in production, or make the web client issue relative `/api/mobile/*` paths through the same-origin proxy that `scripts/serve-web-production.js` and `lib/metro-backend-proxy.js` already implement and that the absolute-URL resolver currently bypasses.

10. **Do not delete the auto-generated Railway domain** (`ommbackend-production.up.railway.app`) during domain cleanup until T3.3's backfill has run. Every `listing_media.url` and `message_attachments.url` in Postgres is built on it.

11. **Do not wire OMM_Mobile CI to `npm run verify`.** It runs `test:auth` — 63 of 129 tests, skipping the SOI comparables and AU address parsing that are the hardest things to eyeball.

12. **Do not spend time "fixing CORS for www".** `OMM_App`'s only API-calling code (`apps/web/app/lib/api.ts:356`) runs in a server component and sends no Origin header, and its endpoints (`/listings`, `/suburbs`) do not exist on the backend anyway. Set `ALLOWED_CORS_ORIGINS` for visibility (T1.2) and move on. The real CORS casualty is `application-frontend-production-de79.up.railway.app`, blocked by `isRailwayAppOrigin` with no client-visible reason.

13. **Do not delete `OMM_BACKEND/Dockerfile.enrichment`** with the rest of the unused Dockerfiles — it is the likely ancestor of `OMM_ENRICHMENT`'s live image (same `start-enrichment-production.sh` entrypoint). Diff them before removing. Note also that `application-enrichment` builds from `Dockerfile`, not `Dockerfile.enrichment`, so it may be running the wrong start script — worth 10 minutes.

---

## 4. FOUNDER DECISIONS, NOT ENGINEERING CALLS

**4.1 — How does an agent prove they belong to an agency?**
This is the trust model of the entire referral/directory product and there is currently no answer in code. `isAgencyDirectorySelectionValidForSignup` (`OMM_Mobile/lib/omm-user-role.ts:57-64`) is client-side and explicitly exempts "Buyer Agent"; `users.firm` is free text with no FK; the `agencyRequests` table and `agency_request_status` enum exist but are never consulted. `work-email.ts` is a 30-domain *denylist*, not an allowlist, with no email-domain→agency binding. Options: (a) verified email domains per agency (needs a `domains` column on `agencies`), (b) manual ops approval through the existing `agencyRequests` table, (c) launch self-declared with a visible "unverified" badge and no referral-panel eligibility. **This decision sizes T1.3.**

**4.2 — Does the marketing site need auth at all?**
Today `isMembersOnly = createRouteMatcher([])` — there is no signed-in surface on www. If the answer is no: delete `ClerkProvider` (`apps/web/app/layout.tsx:2,32`), `app/sign-in`, `app/sign-up`, `app/forgot-password`, and point every CTA at `https://app.offmarketmatch.com.au`. That collapses four findings at once. If the answer is yes, www must move to the live instance — and T1.1 must have already shipped.

**4.3 — The fabricated listings on www.**
`apps/web/app/lib/api.ts:63-241` serves three invented properties with invented price guides ("$4.8m – 5.2m", "On application"), invented specs, stock photography, under the heading "Private listings / Properties near {IP-geolocated suburb}", with no disclaimer. This conflicts with your own Terms (`OMM_Mobile/lib/legal-docs.ts:68`) and is Australian Consumer Law misleading-conduct territory. Three options: wire to real published listings, label as clearly illustrative, or remove the section until there is stock. (The fabricated suburb medians are dead fields, never rendered — no action needed there.)

**4.4 — Legal entity name and the SOI credit.**
The footer says "Off the Market Match Pty Ltd" (`SiteFooter.tsx:11`). The Terms and Privacy Policy users accept at sign-up say "Off Market Match" (`legal-docs.ts:12-14`) with no "Pty Ltd", no ABN, no ACN — i.e. they name a counterparty that does not identify a legal person. The file's own header flags it as a draft pending Victorian counsel. Separately, `OMM_Mobile/lib/soi-custom-builder.ts:191,323` stamps **"Prepared in Unlisted"** on every generated Statement of Information — a product that does not exist — on a document agents hand to clients. Pick the entity name, add the ABN, get the counsel review, and fix the SOI string (it is a one-line import of `LEGAL_PRODUCT`, already used by seven other files).

**4.5 — Privacy notice on the marketing site.**
You collect full name, phone, real estate licence number, IP address and user agent, with no collection notice, no consent, no policy link anywhere in OMM_App — while the form asserts "No spam, no data sales" (`WaitlistModal.tsx:250-253`). Note this is a **regression**: `apps/web/app/privacy/page.tsx` and `app/legal/page.tsx` shipped in commit `60518af` and were lost in the app→web merges; the orphaned matchers at `middleware.ts:39-40` are the fossil. Decision: restore those pages, or cross-link OMM_Mobile's policy — but that policy only covers registration and in-app activity, not pre-registration waitlist capture, so it needs a new clause either way.

**4.6 — Brand.**
MATCH (website, 23 occurrences) → OMM (app name and `<title>`) → Off Market Match (legal docs) → Unlisted (Expo slug, `@unlisted/shared`, `UserAgent`, theme comments, SOI footer) → appify (iOS bundle id). A user goes from a monochrome black-and-white MATCH site to a navy-and-cobalt OMM app with a different ink, a different accent, and a brand primary (`#0047AB`) that appears nowhere on the website. Pick one name and one palette; the sweep is cheap once decided, and nothing will converge by accident because there is no shared token source.

**4.7 — Listing status vocabulary.**
The DB enum has 7 values; `mobileListingStatusToDbColumn` (`src/lib/mobile-published-listings.ts:94`) can only ever write 4, so `PRE_MARKET`, `WITHDRAWN` and `ARCHIVED` are unreachable from the product — and archiving is separately encoded as a flag inside `listings.features`, a second source of truth. Do you actually want pre-market as a distinct agent-controlled state? That answer decides whether you collapse the enum to 4 or build UI for 7.

**4.8 — What is staging for?**
Right now it validates nothing: its frontend points at the production API, on a third Clerk instance, CORS-blocked in both directions, with a backend deployed from an abandoned branch 8 commits behind main, its own idle Postgres/Redis/bucket, and media origins pointing at production. Either invest in real staging subdomains plus its own Clerk instance and make it the pre-launch gate, or delete the environment and stop paying for the illusion of one. Do not leave it half-wired.

**4.9 — Does the waitlist survive to launch?**
It is currently the entire conversion path and it has been 500ing. If launch is imminent you may prefer to flip `WAITLIST_MODE=false` rather than fix it — but that exposes the wrong-instance signup funnel and hands users a dev-instance session the product cannot recognise. T1.1 must land first either way.

---

## Appendix — all verified findings

### [CRITICAL] waitlist_applications does not exist in production — every waitlist signup on the live marketing site 500s, and waitlist mode is ON
*data · CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

Live DB probe (via Postgres DATABASE_PUBLIC_URL, ballast.proxy.rlwy.net:42697/railway):
  `select to_regclass('public.waitlist_applications')` -> null
  `select typname from pg_type where typname='waitlist_status'` -> 0 rows
  Full table list (25): agencies, agency_requests, brief_matches, briefs, deal_acknowledgements, dispute_events, disputes, inspection_bookings, invoices, listing_buyer_offers, listing_media, listings, map_geocode_cache, message_attachments, messages, notifications, payouts, referral_deals, reviews, saved_listings, searches, support_requests, threads, user_push_tokens, users — no waitlist_applications.
The only DDL that creates it is /Users/mennanyelkenci/Desktop/OMM_App/apps/web/drizzle/0001_wakeful_thunderbolt.sql:2 `CREATE TABLE "waitlist_applications"`, and nothing applies it: OMM_App/railway.json:9 sets `"preDeployCommand": ["true"]` (no migrate), and OMM_BACKEND/drizzle/meta/_journal.json contains no waitlist entry — the backend is the only migrator (OMM_BACKEND/railway.toml:9 `releaseCommand = "npm run db:deploy"`).
The route runs a SELECT against the missing table before anything else: /Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/api/waitlist/route.ts:107-111 `db.select(...).from(waitlistApplications)`, wrapped in try/catch that returns 500 at lines 134-140 (`"Could not save your application. Please try again."`). The thank-you email at line 143-144 is never reached.
Caller is the live site's modal: /Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/components/WaitlistModal.tsx:79 `fetch("/api/waitlist", {...})`.
`railway variables --service website-frontend --environment production --json` shows `NEXT_PUBLIC_WAITLIST_MODE = true` and `RAILWAY_PUBLIC_DOMAIN = www.offmarketmatch.com.au`.

**Why it matters**

The marketing site is in waitlist mode, so the waitlist form is the site's entire conversion path pre-launch. Every agent who fills it in gets an error and their details are discarded — no row, no email, no record anywhere. This is silent, ongoing lead loss on the public domain right now, not a launch-day risk.

**Remediation**

Move the waitlist table into the backend's migration chain: add a new numbered migration in OMM_BACKEND/drizzle (e.g. 0014_waitlist_applications.sql) containing the CREATE TYPE waitlist_status + CREATE TABLE waitlist_applications DDL from OMM_App's 0001_wakeful_thunderbolt.sql, guarded with DO $$ ... EXCEPTION WHEN duplicate_object $$ / IF NOT EXISTS, and register it in OMM_BACKEND/drizzle/meta/_journal.json. Longer term the waitlist should be a backend API endpoint the website calls, not a direct DB write from the marketing service.

**Verifier correction**

Confirmed as stated, with one trivial correction and one material addition. Correction: the route validates required fields first, so an incomplete POST returns 422, not 500 — but WaitlistModal requires all four fields client-side, so every real submission reaches the DB call and 500s. Addition: the obvious fix does not work. Both repos share one `drizzle.__drizzle_migrations` ledger, and drizzle's apply condition (node_modules/drizzle-orm/pg-core/dialect.cjs:64, `Number(lastDbMigration.created_at) < migration.folderMillis`) compares against the newest applied row (created_at 1781100000000). OMM_App's 0001_wakeful_thunderbolt has `when` 1779285489592, which is older, so running `npm run db:migrate` from OMM_App/apps/web would silently skip it and exit 0 while the table remains missing. Remediation must be a re-stamped migration in OMM_BACKEND (the only service with a releaseCommand that migrates) or manual DDL against production.

---

### [CRITICAL] Two divergent Drizzle migration ledgers against one database; OMM_App's migration can never be applied by `drizzle-kit migrate`
*drift · CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

Both journals share migration idx 0 with an identical tag, identical `when`, and identical SQL:
`OMM_App/apps/web/drizzle/meta/_journal.json` idx 0 → `0000_strange_next_avengers`, `when: 1777098441876`
`OMM_BACKEND/drizzle/meta/_journal.json` idx 0 → same tag, same `when`
`md5 …/0000_strange_next_avengers.sql` = `b0b97c97d997ab4aff9ddce8a94dba5e` in both.
Then they fork at idx 1:
- OMM_App idx 1 → `0001_wakeful_thunderbolt`, `when: 1779285489592` (creates `waitlist_applications`)
- OMM_BACKEND idx 1 → `0001_listing_buyer_offers`, `when: 1779421387582`; backend journal runs to idx 12 (`0013_referral_deals`, `when: 1781200000001`).
Backend applies its journal on every production deploy: `OMM_BACKEND/railway.toml:9` `releaseCommand = "npm run db:deploy"` → `package.json:15` `"db:deploy": "npm run db:migrate && npm run db:seed-agencies"`.
The migrator gate is strictly timestamp-ordered — `OMM_BACKEND/node_modules/drizzle-orm/pg-core/dialect.js:62`:
```js
if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
```
So with `__drizzle_migrations.created_at` already at 1781200000001, OMM_App's 1779285489592 entry is skipped forever.
`waitlist_applications` was instead created out-of-band by `OMM_App/apps/web/scripts/run-migration.mjs`, whose own usage string is `node scripts/run-migration.mjs drizzle/0001_wakeful_thunderbolt.sql` (line 8) and which executes raw statements without ever inserting into `__drizzle_migrations` (lines 47-65).

**Why it matters**

Two repos share one `drizzle.__drizzle_migrations` ledger with interleaved, mutually invisible timestamps. Rebuilding the database from scratch (new environment, staging, disaster recovery) runs the backend journal only — `waitlist_applications` never gets created and `POST /api/waitlist` 500s on every agent signup, silently losing the pre-launch pipeline. The out-of-band script also means the live DB's schema is not reproducible from either repo's migration history.

**Remediation**

Move `waitlist_applications` into OMM_BACKEND's schema and generate it as a properly-numbered migration (`0014_waitlist_applications`) so one journal owns the database. Delete `OMM_App/apps/web/drizzle/` and `run-migration.mjs`.

**Verifier correction**

Two divergent Drizzle migration ledgers point at ONE production database (website-frontend and application-backend have byte-identical DATABASE_URL). OMM_App's `0001_wakeful_thunderbolt` (when=1779285489592) can never be applied by `drizzle-kit migrate`, because the shared `drizzle.__drizzle_migrations` high-water mark — set by the backend's per-deploy `releaseCommand = "npm run db:deploy"` — is already 1781100000000, and drizzle's gate (`Number(lastDbMigration.created_at) < migration.folderMillis`, drizzle-orm/pg-core/dialect.js:62) skips anything below it. OMM_App itself runs no migration on deploy (`railway.json` `preDeployCommand: ["true"]`).

The investigator's one error understated the impact: they assumed `waitlist_applications` had been created out-of-band by `apps/web/scripts/run-migration.mjs`. It was not. A read-only query against production shows `to_regclass('public.waitlist_applications')` = NULL and no `waitlist_status` enum — the script was never run against prod. This is not a disaster-recovery hypothetical; it is the live state.

It is actively failing in production: `NEXT_PUBLIC_WAITLIST_MODE=true`, the live homepage renders 12 "Join the waitlist" CTAs, the route is confirmed deployed (GET -> 405, malformed POST -> 422 with route.ts's exact error string), and `route.ts:132-137` returns 500 on the DB error. Every valid agent signup on the marketing site's primary CTA 500s and is silently lost. Severity is critical, not high.

Separately discovered and equally urgent: backend migrations 0012 and 0013 are absent from the ledger while their objects already exist in prod (created by `drizzle-kit push`). 0013 is guarded against duplicates; `0012_listings_sale_method_heritage.sql` is a bare `CREATE TYPE "public"."sale_method"`. The next application-backend deploy's release command will fail with 'type "sale_method" already exists', blocking deploys.

---

### [HIGH] The PRODUCTION Clerk instance allows six localhost origins, pushed by a script with no production guard — and the API accepts tokens from any of them because verifyToken omits authorizedParties
*identity · CONFIRMED · repos: OMM_Mobile, OMM_BACKEND*

**Evidence**

`curl -H "Authorization: Bearer sk_live_..." https://api.clerk.com/v1/instance` ->
  {"id":"ins_3GnmhRJnE0Qf94hooUkCKiwpFGy","environment_type":"production","allowed_origins":["https://app.offmarketmatch.com.au","https://offmarketmatch.com.au","https://www.offmarketmatch.com.au","http://127.0.0.1:8080","http://localhost:19006","http://localhost:8081","http://127.0.0.1:8081","http://localhost:8080","http://127.0.0.1:19006"]}

Those six are verbatim the list in /Users/mennanyelkenci/Desktop/OMM_Mobile/scripts/clerk-sync-dev-origins.mjs:15-24 (DEV_ORIGINS), and the script PATCHes /v1/instance (lines 54-58) with only an "is the key non-empty" check at lines 27-30 — no assertion that the key is sk_test or that instance.environment_type !== 'production'. Its own docstring says "Requires CLERK_SECRET_KEY (sk_test_ for dev)" (line 6); it was clearly run with sk_live.

The API does not narrow it back down:
  /Users/mennanyelkenci/Desktop/OMM_BACKEND/src/lib/mobile-bearer-auth.ts:44-47
    const payload = await verifyToken(token, { secretKey, clockSkewInMs: 60_000 });
  No `authorizedParties` option, so the `azp` claim is never checked — a session JWT minted from http://localhost:8081 is accepted by https://api.offmarketmatch.com.au identically to one from app.offmarketmatch.com.au.

**Why it matters**

Production Clerk FAPI will serve credentialed cross-origin requests to pages served from localhost, which is the standard prerequisite for token-minting attacks via a hostile local dev server or DNS-rebinding, and it is a straight-up CORS widening of your live identity provider. The missing authorizedParties removes the second line of defence: nothing downstream distinguishes a token issued to your real app origin from one issued to a dev origin. Also note the same script pattern means a future `npm run` from a laptop with sk_live sourced can silently re-widen production again.

**Remediation**

PATCH the live instance's allowed_origins down to https://app.offmarketmatch.com.au (+ www/apex only if www actually needs Clerk after finding #2). Add a hard guard at the top of clerk-sync-dev-origins.mjs: fetch /v1/instance and `process.exit(1)` if `environment_type === 'production'` or the key starts with `sk_live_`. Pass `authorizedParties: ['https://app.offmarketmatch.com.au', ...native scheme]` to verifyToken in mobile-bearer-auth.ts:44.

**Verifier correction**

The PRODUCTION Clerk instance (ins_3GnmhRJnE0Qf94hooUkCKiwpFGy, environment_type "production") allows six localhost origins, and I confirmed live that production FAPI honours them: a preflight to https://clerk.offmarketmatch.com.au/v1/client with Origin http://localhost:8081 returns 200 with access-control-allow-origin: http://localhost:8081 and access-control-allow-credentials: true, while a control origin gets 400 origin_invalid.

They were pushed by OMM_Mobile/scripts/clerk-sync-dev-origins.mjs, whose DEV_ORIGINS (lines 15-24) match verbatim and whose only guard (lines 27-30) is a non-empty check before PATCHing /v1/instance (lines 54-58). The script is NOT wired into any npm script — the sharper risk is that its own docstring (line 10) instructs you to run it after sourcing OMM_BACKEND/.env.local, and that file holds sk_live_. The documented happy path is the production-widening path, so a re-run silently re-widens production.

OMM_BACKEND/src/lib/mobile-bearer-auth.ts:44-47 calls verifyToken with only { secretKey, clockSkewInMs } — no authorizedParties, and the option appears nowhere in either repo — so the azp claim is never checked across all 58 route files that make up /api/mobile/* and /api/support/*. Per @clerk/backend@3.4.11 (dist/chunk-J2CDX2WG.mjs:189-197), a missing azp always passes, so adding authorizedParties would reject localhost-minted tokens without breaking native iOS/Android clients.

Two additions the original missed: (a) OMM_BACKEND/src/lib/api-cors.ts:4-10 DEFAULT_ALLOWED_ORIGINS independently allowlists localhost:8080/8081 and 127.0.0.1 equivalents, and ALLOWED_CORS_ORIGINS is unset on Railway production — verified live, OPTIONS https://api.offmarketmatch.com.au/api/mobile/home with Origin http://localhost:8081 returns 204 with credentials allowed (evil origin gets 403), so the production API is widened to localhost too; (b) the api-cors path is live code (invoked from proxy.ts, Next 16's middleware), so this is not dead code.

Two corrections to the original rationale: DNS rebinding is NOT a viable vector — a rebound attacker hostname still sends Origin: https://attacker.com, which production FAPI rejects (verified 400 origin_invalid); and this is not remotely exploitable by an arbitrary internet attacker. The real precondition is an attacker able to serve content on the victim's own loopback ports 8080/8081/19006 (malicious or compromised npm dev dependency, another local project, any local process) while the victim is signed in — at which point they can mint a real production session JWT, exfiltrate it, and replay it server-side against api.offmarketmatch.com.au with no Origin header, where nothing distinguishes it from a token issued to app.offmarketmatch.com.au. Severity high stands: live production IdP misconfiguration, whole-API blast radius, no second line of defence, compounded by the API's own localhost CORS default.

---

### [HIGH] Server-side role, agency and referral-directory placement are all driven by client-writable Clerk unsafeMetadata
*identity · CONFIRMED · repos: OMM_BACKEND, OMM_Mobile*

**Evidence**

Backend trusts unsafeMetadata for role/agency:
  /Users/mennanyelkenci/Desktop/OMM_BACKEND/src/lib/clerk-profile-builders.ts:70-79
    const um = data.unsafe_metadata;
    const ommRole = normalizeOmmRoleFromUnknown(pm?.ommRole) ?? normalizeOmmRoleFromUnknown(um?.ommRole);
    const firm = parseAgencyNameFromMetadata(pm, um);
    const role = resolveRole(pm, um, ommRole);
    const agencyId = parseAgencyIdFromMetadata(pm, um);
  resolveRole (same file, :28-43): `if (ommRole === "Buyer Agent") return "BUYER";`
  parseAgencyIdFromMetadata / parseAgencyNameFromMetadata (/Users/mennanyelkenci/Desktop/OMM_BACKEND/src/lib/omm-role.ts:31-44, 63-74) both fall through to unsafeMetadata.
  These land in Postgres verbatim: src/lib/clerk-user-sync.ts:215-220 (`role`, `ommRole`, `firm`, `agencyId`, `suburbs`, `operatingStates`).

The client writes them: /Users/mennanyelkenci/Desktop/OMM_Mobile/lib/clerk-auth.ts:1048-1050 (`signUp.update({ unsafeMetadata: buildOmmSignupUnsafeMetadata(input) })`) and :1098-1100 (`user.update({ unsafeMetadata: mergeOmmUnsafeMetadata(user, input) })`). Payload shape at lib/omm-user-role.ts:34-54 — ommRole, agencyName, agencyId, states, municipalities. `unsafeMetadata` is by definition writable by any authenticated client via Clerk FAPI PATCH /v1/me.

What it unlocks: /Users/mennanyelkenci/Desktop/OMM_BACKEND/src/db/queries.ts:1799-1806
    .where(and(eq(schema.users.ommRole, "Buyer Agent"), eq(schema.users.showOnDirectory, true), not(eq(schema.users.id, ownerUserId))))
  (same pattern again at :1892) — this is the buyer-agent referral list, returning name/firm/avatar and referral bonus/share to the requester.

The only agency validation is client-side: `isAgencyDirectorySelectionValidForSignup` at /Users/mennanyelkenci/Desktop/OMM_Mobile/lib/omm-user-role.ts:57-64. No backend equivalent exists.

**Why it matters**

Any signed-in user can PATCH their own unsafeMetadata to ommRole="Buyer Agent" and agencyId=<any id from GET /api/mobile/agencies>, and the next mobile API call (ensureClerkUserInDatabase -> upsertUserFromClerkProfile) writes it straight into Postgres. They then appear in every listing's referral panel under a real agency's name, receiving referral offers and bonus terms they were never approved for. Escalation to ADMIN is not reachable this way (that needs publicMetadata.role, which is server-only), but agency impersonation and referral-pool insertion are — and at launch the whole trust model of the directory is "we asked nicely in the sign-up UI".

**Remediation**

Stop reading unsafeMetadata on the server for anything authoritative. Promote ommRole/agencyId/firm to publicMetadata written only by the backend (clerk.users.updateUserMetadata) after validating the agency selection server-side against the `agencies` table plus an ops approval, and have clerk-profile-builders.ts read only `pm?.*`. Keep unsafeMetadata purely as a client UX cache.

**Verifier correction**

Server-side role, agency identity and buyer-agent referral-directory placement are driven entirely by client-writable Clerk unsafeMetadata, with no backend validation anywhere. Any user with a non-webmail email (work-email.ts is a 30-domain denylist, not an allowlist, with no email-domain-to-agency binding) can PATCH their own unsafeMetadata to ommRole='Buyer Agent', agencyName=<any real agency's name>, and operatingStates/operatingMunicipalities covering all of Australia. The next mobile API call — any of ~20 routes calling ensureClerkUserInDatabase — persists all of it verbatim (clerk-user-sync.ts:226-240 updates ommRole/role/firm/agencyId whenever the metadata value is non-empty, so this works post-signup, not just at signup). users.show_on_directory defaults to true, so they land in the buyer-agent referral pool (queries.ts:1799-1806, :1892-1897) under a real agency's brand — and because they also control the operatingStates/suburbs that feed areaOverlapScore, they can rank themselves at the top of every listing's referral panel. Notably, brand impersonation does not even require a valid agencyId: the panel renders users.firm, which comes from free-text agencyName with no FK and no directory check. The only 'validation', isAgencyDirectorySelectionValidForSignup, is client-side and explicitly exempts the 'Buyer Agent' role being abused; parseAgencyRequestIdFromMetadata and the agencyRequests approval table are never consulted by the sync path (dead code). Nothing in the backend ever writes publicMetadata, so no server-side promotion/approval step exists at all. Correction to the original framing: exposure is not automatic — refer-suggestions/refer are owner-gated, so the listing agent must actually select the impostor before off-market address, referral bonus and a direct message thread are disclosed. That makes this high (identity/affiliation impersonation plus insertion into the trusted referral pool with attacker-controlled ranking) rather than critical (no admin escalation, no bulk listing exfiltration). Separately: users.agencyId carries an FK to agencies and upsertUserFromClerkProfile is awaited without try/catch (ensure-clerk-user-db.ts:138), so a bogus agencyId value makes every mobile API call 500 for that user.

---

### [HIGH] Two Drizzle schema owners point at one production Postgres; the marketing repo's copy is 12 migrations stale and still ships `db:push`
*identity · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

/Users/mennanyelkenci/Desktop/OMM_App/apps/web/drizzle.config.ts:12 -> `url: process.env.DATABASE_URL ?? ""` — and website-frontend's DATABASE_URL is the same shared Postgres (see finding #1).
/Users/mennanyelkenci/Desktop/OMM_App/apps/web/package.json scripts: "db:generate": "drizzle-kit generate", "db:push": "drizzle-kit push", "db:migrate": "drizzle-kit migrate".
Migration counts: `ls OMM_App/apps/web/drizzle/*.sql | wc -l` = 2 (0000_strange_next_avengers.sql, 0001_wakeful_thunderbolt.sql) vs `ls OMM_BACKEND/drizzle/*.sql | wc -l` = 14 (latest 0013_referral_deals.sql). OMM_App's 0000 migration does `CREATE TABLE "users"` (line 230) plus 16 other product tables.
Column drift on `users`: OMM_App/apps/web/src/db/schema.ts:131-176 has no omm_role, operating_states, agency_id, buyer_recent_searches, account_deletion_requested_at, account_clerk_delete_at, account_clerk_deleted_at — all of which exist in OMM_BACKEND/src/db/schema.ts:181-244 and are load-bearing for auth/deletion. OMM_App also has no `agencies`, `referral_deals` or `deal_acknowledgements` tables at all.

**Why it matters**

One `npm run db:push` from OMM_App with production DATABASE_URL in .env.local — which drizzle.config.ts:4-5 loads automatically — reconciles production to the 12-migrations-old marketing schema: drops the account-deletion tombstone columns the whole OMM-3022 retention design depends on, drops omm_role/agency_id (nuking role and agency assignment for all 12 live users), and drops the agencies/referral tables. `strict: true` prompts, but it is one Enter away.

**Remediation**

Delete apps/web/drizzle.config.ts, apps/web/drizzle/ and the db:* scripts from OMM_App/apps/web/package.json, and remove drizzle-kit/drizzle-orm/pg from its deps. OMM_BACKEND must be the sole schema owner. Unset DATABASE_URL on the website-frontend Railway service so the tooling has nothing to point at even if it comes back.

**Verifier correction**

Two full Drizzle schema owners (OMM_App/apps/web and OMM_BACKEND) point at the same production Postgres — verified by string-identical DATABASE_URL in both .env.local files (ballast.proxy.rlwy.net:42697/railway), an md5-identical 0000 migration, and website-frontend's Railway DATABASE_URL resolving to the shared postgres.railway.internal. The marketing copy is 13 backend migrations behind (0001-0013), not 12, and is also 1 migration ahead (its own waitlist_applications), so the drift is bidirectional: db:push from OMM_BACKEND would drop the live waitlist_applications table, and db:push from OMM_App would drop omm_role, agency_id, operating_states, buyer_recent_searches, the three account-deletion tombstone columns, and 9 tables. Both repos ship db:push with strict: true.

However, db:push is the lesser hazard: it is manual, interactive, and appears in no build or CI path (railway.json preDeployCommand is ["true"]; the GitHub workflow only typechecks and builds). The reachable, unattended hazard is OMM_App/apps/web/app/api/webhooks/clerk/route.ts, which imports the stale schema and on user.deleted runs a hard `db.delete(schema.users)` against the shared production users table, bypassing the account_clerk_delete_at/account_clerk_deleted_at tombstone design entirely, plus upserting `role` on user.created/updated. That endpoint is live in production (CLERK_WEBHOOK_SECRET and DATABASE_URL both set on website-frontend) and is contained today only by the accident that OMM_App runs on the pk_test Clerk instance whose user ids do not collide with the 12 pk_live prod users. Unifying the Clerk instances — the expected remediation for the separate Clerk-split finding — would convert this into live production data loss, so the marketing repo's DB access must be severed before the Clerk instances are merged. Severity is high, not medium.

Two secondary corrections: OMM_App's 0000 migration contains 16 CREATE TABLE statements total (users plus 15 others, not 16 others), and the migration count is evidence of drift rather than its mechanism, since drizzle-kit push diffs schema.ts against the live database and never reads drizzle/*.sql. Unrelated defect found during verification: OMM_BACKEND/drizzle/meta/_journal.json omits 0002_support_requests and 0004_searches_mobile_fields, so drizzle-kit migrate silently skips both on a fresh environment.

---

### [HIGH] OMM_App holds the production DATABASE_URL in .env.local and still ships a db:push script whose schema is missing 9 backend-owned tables and 10 users columns
*data · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

/Users/mennanyelkenci/Desktop/OMM_App/apps/web/.env.local contains `DATABASE_URL=postgresql://postgres:blzCeJLScgOJCwctRB…` — the same credential prefix as the production Railway Postgres (`railway variables --service application-backend` DATABASE_URL begins `postgresql://postgres:blzCeJLScgOJCwctRBUBbmO…`).
OMM_App/apps/web/package.json still exposes `"db:push": "drizzle-kit push"`, `"db:migrate": "drizzle-kit migrate"`, `"db:generate"`, `"db:studio"`, and OMM_App/apps/web/drizzle.config.ts:8-13 points `schema: "./src/db/schema.ts"` at `process.env.DATABASE_URL`.
That schema is a strict subset of the live database. `grep -n 'pgTable(' OMM_App/apps/web/src/db/schema.ts` returns 17 tables; the backend's returns 25. Tables present in production and in OMM_BACKEND/src/db/schema.ts but absent from OMM_App's: agencies (:247), agency_requests (:268), map_geocode_cache (:290), user_push_tokens (:298), referral_deals (:495), deal_acknowledgements (:549), support_requests (:646), inspection_bookings (:729), listing_buyer_offers (:764).
The users table also diverges. Live DB `information_schema.columns` for users returns 39 columns; OMM_App/apps/web/src/db/schema.ts:131-175 declares 29. Missing from OMM_App: omm_role, operating_states, agency_id, buyer_recent_searches, account_deletion_requested_at, account_clerk_delete_at, account_clerk_deleted_at (all defined at OMM_BACKEND/src/db/schema.ts:191, 200, 203, 225-231, 234-236).
Similarly OMM_App declares 13 pgEnums vs the backend's 21 — it has no sale_method, heritage_status, thread_referral_status, referral_deal_stage, support_request_kind, agency_request_status or deal_ack_lifecycle.

**Why it matters**

`drizzle-kit push` reconciles the database to the schema file, which means running it from OMM_App/apps/web resolves DATABASE_URL from .env.local — production — and proposes DROP TABLE for nine backend-owned tables including referral_deals (the commission ledger) and listing_buyer_offers, plus DROP COLUMN for the account-deletion and agency-linkage fields on users. There is no guard rail: the command is one line in package.json, the credential is already on disk, and the repo's own docs (OMM_Mobile/lib/mobile-published-listings-api.ts:160) still instruct developers to run `cd apps/web && npm run db:push`. Note that push is demonstrably already in use against this database — that is how 0012's columns and referral_deals got created without ledger rows.

**Remediation**

Delete OMM_App/apps/web/src/db/schema.ts, OMM_App/apps/web/drizzle/, OMM_App/apps/web/drizzle.config.ts and all four db:* scripts from OMM_App/apps/web/package.json once the two API routes are removed. Remove DATABASE_URL from OMM_App/apps/web/.env.local and unset it on the website-frontend Railway service. Rotate the Postgres password, since it is sitting in a working tree of a repo that no longer needs it. Update the stale instruction at OMM_Mobile/lib/mobile-published-listings-api.ts:160.

**Verifier correction**

OMM_App/apps/web/.env.local holds the production DATABASE_URL (password verified identical to Railway application-backend's; the file's own comment admits it is production), and apps/web still ships db:push/db:migrate/db:studio with a drizzle.config.ts that explicitly loads .env.local and applies no host or environment guard. Its schema.ts diverges from the live database in both directions: it is missing 9 backend-owned tables that exist in production with real data (agencies 80 rows, map_geocode_cache 47, support_requests 34, user_push_tokens 7, agency_requests 1, referral_deals 1, plus empty listing_buyer_offers, deal_acknowledgements, inspection_bookings), it is missing 7 users columns (not 10 - it declares 32 against production's 39: omm_role, operating_states, agency_id, buyer_recent_searches, account_deletion_requested_at, account_clerk_delete_at, account_clerk_deleted_at) and 8 pgEnums (not 7; the original list omits listing_offer_status, and the backend has 20 enums not 21), while also declaring waitlist_applications which does not exist in production - so it is not a strict subset. Running db:push from apps/web targets production and proposes DROPs for all 9 tables and 7 columns; drizzle-kit 0.31.10 does prompt before deleting tables that contain rows, so agencies and referral_deals require a human keypress, but the three empty tables would be dropped with no prompt. That push has already been used against this database is independently confirmed: the backend has 14 migrations on disk (0000-0013) but drizzle.__drizzle_migrations holds only 11 rows, yet 0011-0013's objects (referral_deals, sale_method, heritage_status) are present in production. Two additions the original claim missed: the deployed website-frontend Railway service also carries the same production DATABASE_URL, and apps/web/app/api/waitlist/route.ts queries waitlist_applications, a table that does not exist in production - meaning the live marketing-site waitlist endpoint is already broken. A second unguarded prod-write path is apps/web/scripts/run-migration.mjs.

---

### [HIGH] Buyer search sends six filter params the backend never reads (beds-max, baths-max, cars-min/max, land-min/max)
*api · CONFIRMED · repos: OMM_Mobile, OMM_BACKEND*

**Evidence**

Client builds the query in OMM_Mobile/lib/mobile-search-api.ts:147-179 — `params.set('bedroomsMax',…)` (:158), `bathroomsMax` (:162), `carsMin` (:164), `carsMax` (:166), `landSqmMin` (:173), `landSqmMax` (:174).
Backend OMM_BACKEND/app/api/mobile/search/route.ts:113-172 only ever calls `url.searchParams.get()` for `q`, `suburbs`, `bedroomsMin`, `bathroomsMin`, `propertyTypes`, `includeSurrounding`, `priceMin`, `priceMax`, then builds `searchOptsBase` (:172-182) with `limit: 96`. No read of the other six anywhere in the file.
The client then re-applies the missing filters locally: OMM_Mobile/lib/buyer-listed-search.ts:503-505 `countMeetsRangeFilter(listing.beds, filters.bedsMin, filters.bedsMax)` / baths / `listingCars(...)`, and :307-312 for land.
The shared type file even documents the params as supported: OMM_Mobile/packages/shared/src/mobile-api.ts:236 — "optional `q`, `suburbs`, `includeSurrounding`, `bedroomsMin`, `bathroomsMin`, `carsMin`, `propertyTypes`, `priceMin`, `priceMax`, `landSqmMin`, `landSqmMax`".

**Why it matters**

Search is the core loop of the product. Today the mismatch is masked because the client re-filters the response, but the server truncates at 96 rows BEFORE the ignored filters are applied. Once the live catalogue exceeds 96 rows matching the coarse server filter, a buyer agent searching "4+ car, 800sqm+" gets a silently incomplete result set with no error and no way to tell. It degrades gradually as the listing count grows — i.e. it starts biting exactly when the platform starts working.

**Remediation**

Parse `bedroomsMax`, `bathroomsMax`, `carsMin`, `carsMax`, `landSqmMin`, `landSqmMax` in app/api/mobile/search/route.ts and pass them into `searchListings`, or delete them client-side and make the 96-row cap explicit (return a `truncated: true` flag the UI can show). Either way, fix the stale doc comment at packages/shared/src/mobile-api.ts:236.

**Verifier correction**

Confirmed as stated, with two refinements.

(a) It goes one layer deeper than reported: the six params are absent from the entire OMM_BACKEND repo, and OMM_BACKEND/src/db/queries.ts:159 `searchListings` does not even accept max-beds/max-baths/cars/land options. Fixing this means extending the query builder, not just adding `url.searchParams.get()` calls in the route. The DB columns (`listings.carSpaces`, `listings.landSizeSqm`) already exist, so it is implementable.

(b) The root cause is broader than the six params, and the trigger threshold is lower than claimed. The underlying defect is an unpaginated server-side `LIMIT 96` (ordered by publishedAt DESC, applied in SQL) combined with client-side post-filtering and a response shape that carries no total/hasMore — so the client cannot detect truncation. Even a fully-supported query (e.g. "Brighton, 3+ bed") silently truncates at 96 today. The six unread params make the truncation maximally lossy because the 96-row window is filled with rows the client then discards.

Critically, `buyerSearchFiltersHasCriteria` (OMM_Mobile/lib/buyer-listed-search.ts:248-257) treats a cars-only or land-only filter as valid search criteria. A buyer searching only "4+ car" or "800sqm+" therefore sends a query string containing ONLY unread params: the server performs an effectively unfiltered search and returns the newest 96 listings platform-wide. This does not require the matching subset to exceed 96 — it only requires the total live catalogue to exceed 96. The fallback path offers no protection, since `mergedBuyerListedCatalog` is loaded by `useBuyerBrowseCatalog` through the same route with the same `limit: 96`.

---

### [HIGH] OMM_Mobile — THE PRODUCT — has no CI at all AND its production build does zero typechecking, so nothing gates 614 typechecked files or 129 tests
*buildhealth · PARTIALLY_CONFIRMED · repos: OMM_Mobile*

**Evidence**

`ls -la ~/Desktop/OMM_Mobile/.github` -> "No such file or directory" (OMM_App and OMM_BACKEND both have .github/workflows). Proof the build is type-blind: I wrote /Users/mennanyelkenci/Desktop/OMM_Mobile/lib/__zz_buildprobe.ts containing `export const zzBuildProbe: number = "this is a string not a number";` and imported it at the top of /Users/mennanyelkenci/Desktop/OMM_Mobile/app/_layout.tsx, then ran the exact Railway build command from railway.json (`npm run build:web` = `node scripts/generate-well-known.mjs && expo export --platform web`). Output ended with the full route table and `Exported: dist` — success, no type error. (Contrast: `npm run typecheck` on the same tree reports `lib/__zz_buildprobe.ts(1,14): error TS2322`.) Both files were then deleted and `git status --porcelain` is empty. So `npm run typecheck` (614 files) and `npm test` (13 files / 129 tests, all passing) only ever run if a human types them; Railway's application-frontend build for app.offmarketmatch.com.au ships whatever compiles under Babel — which is everything, because Metro/Babel strip types without checking.

**Why it matters**

OMM_Mobile is the single codebase behind iOS, Android and web. It is the largest of the three (617 .ts/.tsx source files vs 190 backend, 39 website) and the only one with zero automated gate. A type error, a broken import contract, or a regression caught by any of the 129 tests can be merged to main and auto-deployed to app.offmarketmatch.com.au without a single check running. The two *less* important repos both have CI; the product does not.

**Remediation**

Add .github/workflows/verify.yml to OMM_Mobile mirroring OMM_App's: checkout, setup-node with `node-version-file: .node-version`, `npm ci`, then `npm run typecheck`, `npm test` (full suite, not test:auth), `npm run verify:delete-guards`, and `npm run build:web`. Until then, at minimum make Railway's build command `npm run typecheck && npm run build:web` so the deploy itself is the gate.

**Verifier correction**

OMM_Mobile — the product behind iOS, Android and web — has no CI that runs on push or PR (no .github, no active git hooks, no husky; the only workflow file, .eas/workflows/store-release.yml, is manual-only and contains zero verification jobs), and its Railway production build runs `npm run build:web` (= `expo export --platform web`) which performs no typechecking. Verified by probe: a file with `const x: number = "string"` imported into app/_layout.tsx fails `npm run typecheck` (TS2322) but builds successfully and is bundled into dist/_expo/static/js/web/entry-*.js. Railway's application-frontend deploys appify-global/OMM_Mobile@main automatically with `buildCommand: npm run build:web` and no service-level override, so `npm run typecheck` (616 files) and `npm test` (13 files / 129 tests) only ever run when a human types them. Caveat the original claim got wrong: the build is not a total no-op gate — it does fail on unresolvable imports and syntax errors (verified). What passes unchecked is everything type-level: wrong types, changed signatures, bad props, and imports of named exports that no longer exist. Severity is high, not critical: it is a missing gate on the most important repo, but main currently typechecks clean and all 129 tests pass, so nothing is broken in production today. Fix: copy OMM_BACKEND/.github/workflows/ci.yml (npm ci → npm run typecheck → npm run test); do NOT wire CI to the existing `npm run verify` script, which runs only `test:auth` and would skip 6 of the 13 test files.

---

### [HIGH] Backend has 53 tests and none of them touch any of the 65 API route handlers; OMM_App has zero tests and no test script
*buildhealth · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_App*

**Evidence**

All 10 backend test files live under src/lib/ (api-cors, cron-auth, enrichment-internal-proxy-auth, sync-clerk-phone, mobile-published-listings, mobile-buyer-brief-match, clerk-user-sync-helpers, propertydata/*) — pure helper functions. `find OMM_BACKEND/app -name "*.test.ts"` returns nothing, while `.next/types/app/api/**` shows 65 generated route validators, i.e. 65 untested HTTP handlers including /api/mobile/account/delete, /api/webhooks/clerk, /api/mobile/listings/[id]/*, /api/mobile/messages/[id]/referral-deal/actions. OMM_App/package.json:16-20 has scripts dev / build:website / start:website only — no `test` key — and `find OMM_App/apps -name "*.test.*"` returns nothing; OMM_App/.github/workflows/verify.yml has no test step (typecheck + build only).

**Why it matters**

At launch the entire mobile↔backend surface — auth, listings, messaging, account deletion, Clerk webhooks — has no regression net whatsoever. The 53 passing tests cover string parsing and helper predicates; they will stay green through any breaking change to a handler. The marketing site's Clerk middleware and its /api routes are equally unguarded.

**Remediation**

Add route-level tests for the highest-risk handlers first: /api/webhooks/clerk (svix signature verification), /api/mobile/account/delete + preflight (the delete guards, which OMM_Mobile already tests client-side via verify-delete-guards.mjs), and the bearer-auth path in src/lib/mobile-bearer-auth. Next 16 route handlers are plain functions — they can be imported and invoked with a constructed `Request` under the existing node:test setup.

**Verifier correction**

OMM_BACKEND's 53 passing tests (10 files, all under src/lib/) contain no test that constructs a Request or invokes any of the 63 App Router route handlers under app/api — which collectively export 80 HTTP methods (38 GET, 32 POST, 5 PATCH, 4 DELETE, 1 PUT). The "65" in the original claim is wrong: it counted all 65 files under .next/types/app, two of which are page.ts and layout.ts, not route validators.

The gap is behavioral and authorization coverage, not coverage in the absolute. Both repos do gate handler signatures in CI: OMM_BACKEND/.github/workflows/ci.yml runs `npm run typecheck && npm run test` on push/PR to main, and `tsc --noEmit` consumes the very .next/types route validators cited as evidence. So a route whose signature or param typing breaks fails CI; a route whose auth check, ownership filter, or business logic silently inverts stays green. One route has a partial manual net — scripts/verify-clerk-webhook.mjs POSTs unsigned and svix-signed payloads at /api/webhooks/clerk and asserts on the responses — but it is not in CI, needs CLERK_WEBHOOK_SECRET, and targets production by default. Its sibling scripts/verify-account-deletion.mjs only inspects Postgres and never calls /api/mobile/account/delete.

Nor are the 53 tests purely string parsing: cron-auth guards app/api/internal/jobs/account-deletions/route.ts, api-cors is invoked at proxy.ts:10, and enrichment-internal-proxy-auth is used by src/lib/enrichment-route-shell.ts — these are security predicates on live request paths, tested in isolation from the handlers that call them.

OMM_App is confirmed as stated and slightly worse than reported: zero test files, and no `test` script in either the root package.json or apps/web/package.json. Its verify.yml runs typecheck + build only, leaving apps/web/middleware.ts and four API routes (waitlist, notify, healthz, webhooks/clerk) with no behavioral coverage.

No mitigation exists elsewhere: the backend has no Playwright/e2e/smoke config, and OMM_Mobile — despite 13 vitest files and Maestro auth flows — has no CI workflows at all and zero test references to any /api/ path, so there is no cross-repo contract coverage. scripts/verify-delete-guards.mjs re-implements the delete-guard predicates inline instead of importing them, so it tests a copy that can drift from the shipping implementation.

---

### [HIGH] OMM_App carries a stale fork of the backend-owned Drizzle schema + its own migrations, pointed at the SAME production Postgres — one `db:push` drops live tables
*config · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

`railway variables --service website-frontend --environment production --json` → DATABASE_URL=postgresql://postgres:[REDACTED]@postgres.railway.internal:5432/railway — byte-identical to application-backend's DATABASE_URL. Same DB.

/Users/mennanyelkenci/Desktop/OMM_App/apps/web/drizzle.config.ts is byte-identical to /Users/mennanyelkenci/Desktop/OMM_BACKEND/drizzle.config.ts (both `out: "./drizzle"`, neither sets `migrationsTable`/`migrationsSchema`, both read `process.env.DATABASE_URL`). Both therefore use drizzle's default `drizzle.__drizzle_migrations` table in the one database.

Both journals share idx 0 tag `0000_strange_next_avengers` with the identical `when=1777098441876` (OMM_App/apps/web/drizzle/meta/_journal.json vs OMM_BACKEND/drizzle/meta/_journal.json) — same fork origin. Backend journal has 12 entries / 14 SQL files; OMM_App has 2.

`wc -l`: OMM_App/apps/web/src/db/schema.ts = 731 lines, OMM_BACKEND/src/db/schema.ts = 1085 lines (26 pgTable calls vs 15 in the App). Diff of the `users` block shows OMM_App is missing `ommRole`, `operatingStates`, `agencyId`, `buyerRecentSearches`, `accountDeletionRequestedAt/accountClerkDeleteAt/accountClerkDeletedAt`, and the whole `agencies` / `agencyRequests` tables.

OMM_App/apps/web/package.json:9-12 still ships `"db:generate"`, `"db:push": "drizzle-kit push"`, `"db:migrate"`, `"db:studio"`.

**Why it matters**

`drizzle-kit push` diffs the declared schema against the live database and emits DROP statements for anything it doesn't know about. Run from OMM_App with the production DATABASE_URL loaded (which `railway run`, `.env.local`, or OMM_BACKEND/scripts/sync-railway-env-local.sh make trivial), it would drop `agencies`, `agency_requests`, `support_requests`, `user_push_tokens`, `deal_acknowledgements`, `referral_deals` and the six user columns above from the live product database. Independently, if OMM_App's `db:migrate` ever runs, its journal hashes interleave with the backend's in the shared `__drizzle_migrations` table and both migration histories corrupt. The marketing site has been reduced to marketing-only but still holds a loaded gun pointed at the product's DB.

**Remediation**

Delete OMM_App/apps/web/src/db/schema.ts's product tables, OMM_App/apps/web/drizzle/, and the db:push/db:migrate/db:generate scripts. Keep only `waitlist_applications`. Then either (a) give the waitlist its own database/schema, or (b) move the waitlist table into OMM_BACKEND's migrations and have OMM_App talk to it read-only. If any drizzle-kit stays in OMM_App, set an explicit `migrationsTable: "__drizzle_migrations_website"` in its drizzle.config.ts so the journals can never collide.

**Verifier correction**

OMM_App/apps/web carries a stale 17-table fork of the backend's 25-table Drizzle schema, with a byte-identical drizzle.config.ts and a `db:push` script, wired via its own gitignored .env.local (auto-loaded by drizzle.config.ts) to the SAME production Postgres as application-backend — verified byte-identical DATABASE_URL. Running `npm run db:push -w apps/web` would diff that stale schema against live and drop NINE tables (agencies, agency_requests, deal_acknowledgements, inspection_bookings, listing_buyer_offers, map_geocode_cache, referral_deals, support_requests, user_push_tokens — all confirmed present in the live DB) plus SEVEN `users` columns (ommRole, operatingStates, agencyId, buyerRecentSearches, accountDeletionRequestedAt, accountClerkDeleteAt, accountClerkDeletedAt). Blast radius is total, but it is a manual footgun: OMM_App/railway.json runs no DB command on deploy (preDeployCommand is `["true"]`), and `strict: true` forces an interactive confirmation. Severity high, not critical.

The migration-history-corruption half of the claim is REFUTED. drizzle's migrator (drizzle-orm/pg-core/dialect.cjs:59-69) reads only the single newest row from drizzle.__drizzle_migrations and applies entries with `folderMillis > created_at`. Live watermark is created_at=1781100000000; OMM_App's newest journal entry is when=1779285489592. OMM_App's `db:migrate` therefore applies nothing and writes nothing — it cannot interleave or corrupt anything.

The real live defect hiding underneath: `waitlist_applications` (OMM_App-only, in its 0001 migration) does NOT exist in the production database and can never be created by `db:migrate` because of that same timestamp gate. With NEXT_PUBLIC_WAITLIST_MODE=true in production, apps/web/app/api/waitlist/route.ts:107-138 fails on every submission and returns HTTP 500 — the marketing site's waitlist is broken in production right now.

---

### [HIGH] Two backend migrations exist on disk but are absent from _journal.json — the production releaseCommand never applies them
*config · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

OMM_BACKEND/railway.toml:9 `releaseCommand = "npm run db:deploy"`; package.json:15 `"db:deploy": "npm run db:migrate && npm run db:seed-agencies"`; package.json:11 `"db:migrate": "drizzle-kit migrate"` (journal-driven).

`comm -23 <(ls drizzle/*.sql | xargs -n1 basename | sed 's/.sql//' | sort) <(jq -r '.entries[].tag' drizzle/meta/_journal.json | sort)` returns:
  0002_support_requests
  0004_searches_mobile_fields

Journal idx sequence is 0,1,3,4,5,6,7,8,9,10,11,12 — idx 2 is missing entirely and idx 4 maps to tag `0005_account_deletion_geocode_cache`.

drizzle/0002_support_requests.sql:1-2 creates `CREATE TYPE "public"."support_request_kind"` and `CREATE TABLE "support_requests"`.
drizzle/0004_searches_mobile_fields.sql:1-2 `ALTER TABLE "searches" ADD COLUMN IF NOT EXISTS "criteria_line" text;` / `"last_viewed_at" timestamp;`

**Why it matters**

`drizzle-kit migrate` iterates `_journal.json`, not the directory. Two schema changes are therefore invisible to every deploy: the `support_requests` table (backing /api/support/*, which api-cors.ts:21 treats as a first-class API surface) and two `searches` columns. Either they exist in production only because someone applied them by hand — meaning production has drifted from the migration history and any fresh environment (the staging DB, a DR restore, a new region) will boot missing them — or they don't exist and those routes 500. Both are launch-biting and neither is visible from a green deploy.

**Remediation**

Determine the live state (`select to_regclass('public.support_requests');` and `\d searches` against each environment's Postgres), then reconcile: add the two entries back into drizzle/meta/_journal.json with correct idx/when/tag AND matching snapshot files, or regenerate the migration set cleanly with `drizzle-kit generate` and backfill the `__drizzle_migrations` rows for what is already applied. Add a CI check that asserts `ls drizzle/*.sql | wc -l == jq '.entries|length' drizzle/meta/_journal.json`.

**Verifier correction**

Two backend migrations, `drizzle/0002_support_requests.sql` and `drizzle/0004_searches_mobile_fields.sql`, exist on disk but are absent from `drizzle/meta/_journal.json`, so `drizzle-kit migrate` (which iterates the journal, never the directory) will never apply them. Root cause: commit 9b4fcd0 overwrote the existing idx-2 journal entry with the 0003 entry instead of appending, and added 0004.sql without journaling it.

Contrary to the original claim, this is NOT currently breaking production. 0002 was applied by a normal deploy before its journal entry was clobbered — production's `drizzle.__drizzle_migrations` still carries its `created_at = 1779500000000`, and `support_requests` holds 34 live rows. 0004's two columns also exist in production, but with no migration record, so that one is genuine out-of-band drift (`db:push` or manual SQL).

The real, confirmed exposure is reproducibility: any fresh database — staging, a DR restore, a new region, a local bootstrap — will come up missing the `support_requests` table, the `support_request_kind` enum, and `searches.criteria_line`/`last_viewed_at`. That breaks `app/api/support/contact` and `/feedback`, and additionally (not noted in the original claim) `src/lib/clerk-user-sync.ts:87`, which touches `supportRequests` inside the user-id remap transaction and would fail every Clerk ID-change sync, plus `getSavedSearches` at `src/db/queries.ts:314`, whose bare `db.select()` expands to an explicit column list and 500s on the missing columns.

Severity is high, not critical: no live production impact today, and the fix is to re-add both entries to the journal preserving their original low `when` values (1779500000000 and a value below 1781100000000) so production skips them via drizzle's high-water-mark check while fresh databases apply them in order. Assigning new high `when` values instead would make production re-run 0002, whose unguarded `CREATE TYPE`/`CREATE TABLE` would fail the releaseCommand and block deploys.

---

### [HIGH] Two live Clerk webhook handlers write the same `users` table with opposite delete semantics — the marketing site's hard-DELETEs and cascades
*drift · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

Both handlers exist and both are wired to the SAME database.

`/Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/api/webhooks/clerk/route.ts:63-66`
```ts
if (type === "user.deleted") {
  await db.delete(schema.users).where(eq(schema.users.id, data.id));
  return new Response("ok");
}
```
`/Users/mennanyelkenci/Desktop/OMM_BACKEND/app/api/webhooks/clerk/route.ts:67-77`
```ts
if (type === "user.deleted") {
  const now = new Date();
  await db.update(schema.users).set({ accountClerkDeletedAt: now, updatedAt: now })
    .where(eq(schema.users.id, data.id));
```
The DB cascades from `users`: `OMM_BACKEND/src/db/schema.ts:321-323` `agentId ... .references(() => users.id, { onDelete: "cascade" })` — same for briefs.buyerId (391), threads.ownerId (442), reviews.agentId (587), disputes.raisedById (611), referral_deals.listingAgentId/buyerAgentId (505/508), deal_acknowledgements (556/559), user_push_tokens (302). One `user.deleted` hitting the OMM_App endpoint destroys that agent's entire listing/thread/dispute/referral history.

Both endpoints are armed in production:
`railway variables --service website-frontend --environment production --json` →
`CLERK_WEBHOOK_SECRET = whsec_[REDACTED]`, `DATABASE_URL = postgresql://postgres:[REDACTED]@postgres.railway.internal:5432/railway`
`--service application-backend` → `CLERK_WEBHOOK_SECRET = whsec_[REDACTED]`, identical `DATABASE_URL`.

And the handover doc asserts the opposite of reality: `/Users/mennanyelkenci/Desktop/OMM_App/docs/HANDOVER_NIMERSHAN.md:22-23` — "Clerk is one instance across all of them — the web session and the mobile Bearer token come from the same application." Decoded keys: website `pk_test_a25vd24t…` → `known-elf-22.clerk.accounts.dev`; frontend+backend `pk_live_Y2xlcmsub2Zm…` → `clerk.offmarketmatch.com.au`.

**Why it matters**

The website's webhook is on a test Clerk instance but writes to the LIVE shared Postgres. Any user.deleted routed to www (a mis-pasted endpoint in the Clerk dashboard, or the test instance being reused) permanently deletes a production user row and cascade-deletes their listings, threads, referral deals and disputes — data the backend deliberately preserves via soft-delete. The OMM_App handler also sets `role` from `public_metadata.role` defaulting to `AGENT` and never writes `omm_role`/`operating_states`, so test-instance signups land as directory-visible AGENT rows (`show_on_directory` defaults true, `src/db/schema.ts:218`).

**Remediation**

Delete `OMM_App/apps/web/app/api/webhooks/clerk/route.ts` and `apps/web/src/db/` entirely; the marketing site has no business syncing users. Unset `CLERK_WEBHOOK_SECRET` and `DATABASE_URL` on `website-frontend` (keep only what the waitlist needs, and move the waitlist table to OMM_BACKEND). Fix the HANDOVER doc's one-Clerk-instance claim.

**Verifier correction**

Two live Clerk webhook handlers write the same production `users` table with opposite delete semantics — OMM_App/apps/web/app/api/webhooks/clerk/route.ts:63-66 hard-DELETEs (cascading to listings, briefs, threads, reviews, disputes, referral_deals, deal_acknowledgements, user_push_tokens via real ON DELETE cascade DDL in OMM_BACKEND/drizzle/0000_*.sql:268-286, 0007, 0010, 0013), while OMM_BACKEND/app/api/webhooks/clerk/route.ts:67-77 deliberately soft-deletes. Both services share one DATABASE_URL and both endpoints are armed and responding in production.

However, the destructive path is NOT currently reachable. Enumerating the Svix registrations shows the live Clerk instance has exactly one endpoint (api.offmarketmatch.com.au → soft-delete), while the hard-delete handler is registered only on the test instance (known-elf-22), which has zero users. A live user.deleted therefore never reaches www; and even if routed there it would fail signature verification, since website-frontend holds the test endpoint's whsec. Test-instance user IDs cannot collide with live rows, so a test-instance delete affects 0 rows.

What IS live today is the INSERT half: the test instance's sign-up is public with allowlist/blocklist disabled and its endpoint is enabled for user.created, so any stranger can write a row into the live production users table as role=AGENT with show_on_directory=true, bypassing the backend's isPermittedWorkEmail work-email gate — and as a structurally partial row, since OMM_App's schema fork lacks omm_role, operating_states, agency_id and account_clerk_deleted_at.

This is a loaded gun rather than a fired one: repointing the existing live endpoint's URL from api. to www., or performing the "Clerk is one instance across all of them" unification that docs/HANDOVER_NIMERSHAN.md:22-23 asserts (and which is currently false), would arm the cascade. Correct severity is high, not critical.

---

### [HIGH] OMM_App still owns a stale 731-line fork of the Drizzle schema plus `db:push` — pointed at the shared production Postgres, missing 9 tables and 7 user columns
*drift · CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

`/Users/mennanyelkenci/Desktop/OMM_App/apps/web/src/db/schema.ts` (731 lines) vs `/Users/mennanyelkenci/Desktop/OMM_BACKEND/src/db/schema.ts` (1085 lines). `OMM_App/apps/web/drizzle.config.ts:8` `schema: "./src/db/schema.ts"`, `dbCredentials.url: process.env.DATABASE_URL`. `OMM_App/apps/web/package.json:9-12` still exposes `db:generate`, `db:push`, `db:migrate`, `db:studio`.

Structural diff of the two schema files (script over `pgTable` blocks):
- tables only in BACKEND (absent from OMM_App's desired state): `agencies`, `agency_requests`, `deal_acknowledgements`, `inspection_bookings`, `listing_buyer_offers`, `map_geocode_cache`, `referral_deals`, `support_requests`, `user_push_tokens`
- `users` missing 7 columns in OMM_App: `ommRole`, `operatingStates`, `agencyId`, `buyerRecentSearches`, `accountDeletionRequestedAt`, `accountClerkDeleteAt`, `accountClerkDeletedAt`
- enums only in BACKEND: `sale_method`, `heritage_status`, `thread_referral_status`, `referral_deal_stage`, `support_request_kind`, `listing_offer_status`, `agency_request_status`, `deal_ack_lifecycle` (`OMM_BACKEND/src/db/schema.ts:63,70,99,105,129,145,165,171`)

Both services resolve `DATABASE_URL` to the same instance — verified identical string (`postgres:blzCeJ…@postgres.railway.internal:5432/railway`) on `website-frontend` and `application-backend`.

What still agrees today: `listing_status` is byte-identical in both (`DRAFT, PRE_MARKET, LIVE, UNDER_OFFER, SOLD, WITHDRAWN, ARCHIVED` — OMM_App:47-55, BACKEND:49-57), as are `user_role`, `listing_media_kind`, `brief_status`, `message_category`, `attachment_kind`, `dispute_status`, `invoice_status`, `payout_status`, and `src/lib/app-constants.ts` (byte-identical in both repos).

**Why it matters**

`npm run db:push -w apps/web` from the marketing repo diffs this stale schema against the live shared database and proposes dropping 9 tables (including `referral_deals`, `deal_acknowledgements`, `agencies`) and 7 `users` columns. The README says the repo is marketing-only and HANDOVER_NIMERSHAN.md:16 says OMM_BACKEND "Owns the Drizzle schema/migrations", yet the gun is still loaded and pointed at production. It also means every schema change now has to be remembered in two places.

**Remediation**

Delete `OMM_App/apps/web/src/db/schema.ts`, `apps/web/drizzle/`, `apps/web/drizzle.config.ts` and the four `db:*` scripts. Move `waitlist_applications` into `OMM_BACKEND/src/db/schema.ts` + a real numbered migration, and have the website POST to `api.offmarketmatch.com.au` instead of holding a Postgres pool.

**Verifier correction**

CONFIRMED with one correction to framing and one escalation of reachability.

OMM_App still owns a DIVERGENT (not merely stale) 731-line fork of the Drizzle schema plus runnable db:push/db:migrate/db:generate/db:studio scripts, pointed at the shared production Postgres.

Verified against the live database: the 9 tables absent from OMM_App's desired state (agencies, agency_requests, deal_acknowledgements, inspection_bookings, listing_buyer_offers, map_geocode_cache, referral_deals, support_requests, user_push_tokens) all exist in production, six of them holding real data (agencies 80 rows, map_geocode_cache 47, support_requests 34, user_push_tokens 7, agency_requests 1, referral_deals 1). All 7 missing users columns exist on the live 25-row users table, including omm_role (authorization data) and the three account_*_delete* deletion-compliance fields.

CORRECTION - the drift is bidirectional, not a subset. OMM_App/apps/web/src/db/schema.ts:679 also defines waitlist_applications and a waitlist_status enum that exist in neither OMM_BACKEND nor production. So db:push would CREATE those as well as drop the 9 tables and 7 columns. The waitlist table is dead code (referenced nowhere outside schema.ts) shipped in an unapplied migration, apps/web/drizzle/0001_wakeful_thunderbolt.sql.

ESCALATION - reachability is worse than the original claim stated. The claim relied on Railway service variables. In reality drizzle.config.ts:4 loads .env.local first, and OMM_App/apps/web/.env.local carries the same production DATABASE_URL as OMM_BACKEND over the PUBLIC proxy (ballast.proxy.rlwy.net:42697), with drizzle-kit installed locally. `npm run db:push -w apps/web` therefore hits production from any dev machine with no Railway access required.

Additionally, OMM_App/drizzle shares migration 0000_strange_next_avengers.sql lineage with OMM_BACKEND (now at 0013), so db:migrate is a second hazard against the shared migrations journal.

Severity high is correct, not critical: no automated path invokes it - railway.json preDeployCommand is ["true"], buildCommand is only `npm run build:website`, and .github/workflows/verify.yml never calls drizzle. The risk is a human running one command.

---

### [MEDIUM] The marketing site owns a live Clerk webhook that HARD-DELETES user rows (cascading to every child table) in the SAME production Postgres the product uses
*identity · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

Same DB, proven from Railway:
  `railway variables --service website-frontend --environment production --json` -> "DATABASE_URL": "postgresql://postgres:[REDACTED]@postgres.railway.internal:5432/railway"
  `railway variables --service application-backend --environment production --json` -> identical DATABASE_URL string.

Divergent delete semantics on the same `users` table:
  /Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/api/webhooks/clerk/route.ts:63-66
    if (type === "user.deleted") {
      await db.delete(schema.users).where(eq(schema.users.id, data.id));
  /Users/mennanyelkenci/Desktop/OMM_BACKEND/app/api/webhooks/clerk/route.ts:67-77 does the OPPOSITE — a soft delete setting `accountClerkDeletedAt` (deliberate, per the OMM-3022 comment at /Users/mennanyelkenci/Desktop/OMM_BACKEND/src/lib/clerk-scheduled-account-deletions.ts:25-26 "keep Postgres profile (role/firm/areas) and PII").

Blast radius: `grep -c 'onDelete: "cascade"' /Users/mennanyelkenci/Desktop/OMM_App/apps/web/src/db/schema.ts` = 16 FKs referencing users.id (listings, briefs, brief_matches, threads, messages, reviews, disputes, invoices, payouts, searches, saved_listings, notifications...).

Endpoint is live in production right now:
  `curl -s -X POST https://www.offmarketmatch.com.au/api/webhooks/clerk -d '{}'` -> HTTP 400 "Missing svix headers". The route returns 500 when CLERK_WEBHOOK_SECRET is unset (route.ts:38-41), so 400 proves the secret IS set on website-frontend (`CLERK_WEBHOOK_SECRET: whsec_[REDACTED]`).

It also skips the work-email policy the backend enforces: OMM_App's route has no `isPermittedWorkEmail` call anywhere, while OMM_BACKEND/app/api/webhooks/clerk/route.ts:82-85 and src/lib/clerk-user-sync.ts:164 both gate on it.

**Why it matters**

OMM_App was just reduced to marketing-only, but it kept a production-reachable write path into the product's database. Any `user.deleted` event that reaches www — e.g. if that endpoint is (or gets) registered on the LIVE Clerk instance, which is exactly what `processDueScheduledClerkDeletions` triggers via `clerk.users.deleteUser` — permanently destroys the agent's row and every listing, thread, message, offer, review, invoice and payout attached to it. The backend's whole retention design (OMM-3022) is silently defeated by a second handler nobody is looking at. Even on the dev instance it is a live unauthenticated-ish write channel into production rows.

**Remediation**

Delete /Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/api/webhooks/clerk/route.ts, apps/web/src/db/ and the `svix` + `drizzle` deps from apps/web, and unset DATABASE_URL and CLERK_WEBHOOK_SECRET on the Railway `website-frontend` service. (Only two files in OMM_App touch @/db: the clerk webhook and app/api/waitlist/route.ts — repoint the waitlist at its own store or at the backend API.) Then confirm in the Clerk dashboard for BOTH instances that the only registered endpoint is https://api.offmarketmatch.com.au/api/webhooks/clerk.

**Verifier correction**

The marketing site (OMM_App) still ships and deploys a Clerk webhook handler at apps/web/app/api/webhooks/clerk/route.ts that HARD-DELETES rows from the `users` table of the same production Postgres the product uses — cascading to 17 direct child FKs and, second-order, to messages, listing_media, inspection_bookings, listing_buyer_offers, saved_listings, deal_acknowledgements and brief_matches. This directly contradicts the backend's deliberate soft-delete retention design (OMM-3022) and skips the isPermittedWorkEmail policy the backend enforces. The route IS deployed and its CLERK_WEBHOOK_SECRET IS set (verified: live POST returns 400 "Missing svix headers", not 500).

However, it is NOT currently a live destruction path. website-frontend is wired to the DEVELOPMENT Clerk instance (sk_test / ins_3Cq3hb…), which has ZERO users, and its webhook secret (whsec_Twuk…) differs from the live instance's endpoint secret (whsec_cAgg…, held by the backend). A user.deleted from the live instance — including the one processDueScheduledClerkDeletions triggers — would fail svix signature verification at www and return 400 before any DELETE runs. Clerk user IDs are per-instance, so a dev-instance ID could not match any of the 25 live-instance rows in the table anyway. The endpoint is also not "unauthenticated" — it requires a valid svix HMAC.

This is therefore a dormant landmine rather than an active incident: consolidating www onto the live Clerk instance (whose allowed_origins already includes www.offmarketmatch.com.au) and copying the webhook endpoint across — a plausible near-term change — arms unrecoverable, silent cascade deletion of real agent data. Fix by deleting the route from the now-marketing-only repo.

---

### [MEDIUM] www runs a Clerk DEVELOPMENT instance in production, and that instance is open-signup with every restriction disabled
*identity · PARTIALLY_CONFIRMED · repos: OMM_App*

**Evidence**

Live production HTML: `curl -s https://www.offmarketmatch.com.au/ | grep -o 'known-elf-22[a-z0-9.-]*\|pk_test_[A-Za-z0-9]*'` ->
  known-elf-22.clerk.accounts.dev
  pk_test_a25vd24tZWxmLTIyLmNsZXJrLmFjY291bnRzLmRldiQ
ClerkProvider is still mounted site-wide: /Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/layout.tsx:2,32.

Instance identity confirmed via Clerk BAPI:
  sk_test key -> {"id":"ins_3Cq3hb2ca5IIYxAIXSeQry0Av7H","environment_type":"development","allowed_origins":null}
  sk_live key -> {"id":"ins_3GnmhRJnE0Qf94hooUkCKiwpFGy","environment_type":"production"}
Separate Svix apps, so webhook endpoints are per-instance: dev app_3Cq4mLIfDHv9YvTzflLz4RROGmp, live app_3H4DuUAUTenYtel9voH5gTDpEIg.

Dev instance is wide open — `GET https://known-elf-22.clerk.accounts.dev/v1/environment`:
  sign_up: {"mode": "public", ...}
  restrictions: {"allowlist":{"enabled":false},"blocklist":{"enabled":false},"block_email_subaddresses":{"enabled":false},"block_disposable_email_domains":{"enabled":false}}
  allowed_origins: null (any origin)
Current blast radius is still zero: `GET /v1/users/count` -> dev 0 users, live 12 users.

**Why it matters**

The publishable key for an unrestricted, any-origin, public-signup dev instance is shipped in the production marketing bundle, and the same service holds a webhook secret plus a DATABASE_URL to production Postgres. Chain it with finding #1 and any internet user can mint dev-instance accounts (disposable domains allowed) whose user.created events insert rows into the production `users` table with role AGENT, no work-email gate, and `show_on_directory` defaulting to true — consuming the `users_email_idx` unique-email slots that real agents will later need. Dev instances also have hard user caps, no SLA, and Clerk's dev-mode UI warnings on your public domain.

**Remediation**

Either move www onto the production Clerk instance (pk_live) or, better, remove Clerk from the marketing site entirely — it has no signed-in surface (`isMembersOnly = createRouteMatcher([])`, middleware.ts:47). Then delete the dev instance's webhook endpoints and turn on domain restrictions there so it can never write to prod again.

**Verifier correction**

www.offmarketmatch.com.au is wired to a Clerk DEVELOPMENT instance (ins_3Cq3hb2ca5IIYxAIXSeQry0Av7H, environment_type "development", allowed_origins null) whose signup mode is "public" with allowlist, blocklist, subaddress-blocking and disposable-domain-blocking all disabled — but NOT "every restriction disabled": Smart CAPTCHA bot protection is enabled and email verification at sign-up is required. The pk_test in the production bundle is not itself the exposure (publishable keys are public by design and this one decodes to the instance subdomain).

The genuine issue is blast radius on a service that should be marketing-only: Railway's website-frontend holds sk_test, a CLERK_WEBHOOK_SECRET, and a DATABASE_URL byte-identical to application-backend's — full write access to the production Postgres — and still serves POST /api/webhooks/clerk, which upserts into `users` with role defaulting to AGENT against a `users_email_idx` unique-email index and `show_on_directory` defaulting true. I confirmed this insert is schema-compatible with the backend's authoritative schema, so it would land if driven.

Two mitigations the finding missed, both verified live: NEXT_PUBLIC_WAITLIST_MODE=true in production makes middleware.ts 307-redirect /sign-in and /sign-up to /, and no Clerk UI component renders on any public page (so no dev-mode banner either). The site therefore offers no signup doorway; the dev instance's own hosted portal remains public independently.

The decisive link is unverified: I could not confirm the dev instance has a webhook endpoint registered against www's /api/webhooks/clerk (Clerk's BAPI exposes only the Svix app id). Without it the DB-write chain does not close. Blast radius is currently zero (dev instance: 0 users; live: 12). Severity medium, not high — remediate by stripping CLERK_*, DATABASE_URL and the webhook route from website-frontend rather than by treating it as an active open-signup breach.

---

### [MEDIUM] verify-clerk-alignment.mjs passes green on a deliberately mismatched key pair — it validates nothing it claims to, and covers the wrong two services
*identity · PARTIALLY_CONFIRMED · repos: OMM_Mobile*

**Evidence**

Ran it today from /Users/mennanyelkenci/Desktop/OMM_Mobile:
  $ node scripts/verify-clerk-alignment.mjs --railway
    application-frontend publishable: clerk.offmarketmatch.com.au
    application-backend publishable:  clerk.offmarketmatch.com.au
    Publishable keys identical: yes
    Secret key valid:  yes
    Clerk keys are aligned.        (exit 0)

Proof it is a no-op — I fed it the pk_live publishable with the sk_TEST secret from the OTHER instance:
  $ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsub2ZmbWFya2V0bWF0Y2guY29tLmF1JA CLERK_SECRET_KEY=sk_test_[REDACTED]... node scripts/verify-clerk-alignment.mjs
    Frontend API host: clerk.offmarketmatch.com.au
    Secret key valid:  yes
    Clerk keys are aligned.        (exit 0)
Root cause: scripts/verify-clerk-alignment.mjs:46-51
    async function secretKeyValid(secretKey) {
      const res = await fetch('https://api.clerk.com/v1/instance', {...});
      return res.ok;
    }
It discards the response body and never compares the secret key's instance to `clerkFrontendApiHost(publishable)` — it only asks "is this key valid for SOMETHING".

Scope gap: lines 71-90 read only `repoRoot` (application-frontend) and `../OMM_BACKEND` (application-backend). website-frontend is never inspected, which is precisely why the known pk_test/pk_live split has stayed invisible.

Why it is not in CI:
  - `ls /Users/mennanyelkenci/Desktop/OMM_Mobile/.github/workflows` -> "No such file or directory". OMM_Mobile — the actual product — has no CI at all.
  - The script appears in no npm script; `package.json` "verify" = "typecheck && test:auth && verify:delete-guards && verify:website". Its only reference outside itself is README.md:29.
  - It shells out to `railway variables --json` (line 44) with no --service/--environment, so it depends on ambient `railway link` state on a developer's machine and on an authenticated Railway CLI — structurally un-runnable on a GitHub runner as written. It also re-invokes railwayVars twice more at line 121 (4 CLI calls per run).

**Why it matters**

This is the one guard that was supposed to stop exactly the class of bug this codebase keeps hitting, and it green-lights the broken state. Worse, it gives false confidence: someone reads "Clerk keys are aligned" and stops looking, while www is on a different instance and localhost origins are open on production.

**Remediation**

Rewrite `secretKeyValid` to compare identity, not validity: fetch /v1/instance with the secret key and assert `environment_type` matches the publishable key prefix (pk_live -> production), and cross-check by fetching `https://<frontendApiHost>/.well-known/jwks.json` and confirming the same `kid` set as the secret-key instance. Add website-frontend as a third service in the comparison and fail loudly when its publishable key differs. Replace the `railway` CLI dependency with plain env vars so it can run in CI, add a `.github/workflows/verify.yml` to OMM_Mobile (it currently has none), and add it to the `verify` npm script.

**Verifier correction**

`OMM_Mobile/scripts/verify-clerk-alignment.mjs` does not implement the check its own docstring promises. `secretKeyValid()` (lines 48-53) returns bare `res.ok` from `GET api.clerk.com/v1/instance` and discards the response body, so it only asks "is this secret valid for SOME Clerk instance", never "for THIS one". Verified by execution: the real pk_live (OMM_Mobile/.env) paired with the real sk_test from the separate OMM_App instance prints "Clerk keys are aligned" and exits 0. The response body it throws away contains `environment_type: "development"`, so a one-line comparison against the pk_live/pk_test prefix would catch it.

It is not a total no-op: in `--railway` mode lines 120-121 do enforce that application-frontend and application-backend carry identical publishable keys, exiting 1 otherwise. That guard is real but orthogonal — identical pk_live on both services plus a mismatched sk_test still exits 0.

Coverage is incomplete rather than wrong: application-frontend vs application-backend is the right pair for the product, but website-frontend (OMM_App, the pk_test instance) is never inspected, so the known cross-instance split cannot surface here. README.md:29 asks you to align against "the web app in `../OMM`", a directory that does not exist on disk.

It is also un-runnable in CI as written: line 44 shells `railway variables --json` with no `--service`/`--environment`, depending on ambient `~/.railway/config.json` cwd-keyed link state (no `.railway` dirs exist in any repo), and it makes 4 CLI calls per run. OMM_Mobile has no `.github/` directory at all, and the script appears in zero npm scripts — `verify:website` is just `npm run build:web`, not a website-repo check. No other code in OMM_BACKEND or OMM_Mobile performs any Clerk instance cross-check.

Severity is medium, not high: nothing gates on this script, so it cannot fail a build or ship a bad deploy. The harm is bounded to false confidence for a developer running it manually — which is reachable, since both README.md:29 and the in-product todo board (public/todo-items.js:38, marked "Done") cite this exact command as the sanctioned re-check.

---

### [MEDIUM] The next application-backend deploy will fail its releaseCommand: migration 0012 re-runs an unguarded CREATE TYPE for types that already exist
*data · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

Live DB: `select max(created_at::bigint) from drizzle.__drizzle_migrations` -> 1781100000000 (11 rows applied, last is 0011_disputes_listing_id).
OMM_BACKEND/drizzle/meta/_journal.json registers `0012_listings_sale_method_heritage` with `"when": 1781200000000` and `0013_referral_deals` with `"when": 1781200000001` — both greater than the ledger max, so drizzle-kit migrate will execute them on the next run.
But the objects already exist in the DB: `select typname from pg_type where typname in ('sale_method','heritage_status',...)` -> heritage_status, referral_deal_stage, sale_method, support_request_kind; and `select column_name from information_schema.columns where table_name='listings' and column_name in ('sale_method','heritage_status')` -> both present.
/Users/mennanyelkenci/Desktop/OMM_BACKEND/drizzle/0012_listings_sale_method_heritage.sql:1-2 is unguarded:
  `CREATE TYPE "public"."sale_method" AS ENUM(...);`
  `CREATE TYPE "public"."heritage_status" AS ENUM(...);`
`grep -c 'IF NOT EXISTS'` on that file returns 0. By contrast 0013_referral_deals.sql:4-9 IS guarded (`DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN NULL; END $$`) and its own header comment says "schema landed on main without a migration file; this backfills it... a no-op on any database where drizzle-kit push already created the objects."
OMM_BACKEND/railway.toml:9 `releaseCommand = "npm run db:deploy"` -> package.json `"db:deploy": "npm run db:migrate && npm run db:seed-agencies"`.

**Why it matters**

Railway aborts the deploy if releaseCommand exits non-zero. `CREATE TYPE sale_method` on an existing type raises SQLSTATE 42710, so db:migrate fails, db:deploy fails, and application-backend cannot ship a new version at all. Whoever created 0012's columns used `drizzle-kit push` instead of migrate, so the ledger never recorded it — this is a booby trap armed right now and it fires on the very next backend push, likely mid-launch.

**Remediation**

Rewrite OMM_BACKEND/drizzle/0012_listings_sale_method_heritage.sql to be idempotent in the same style as 0013 (DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN NULL; END $$ and `ADD COLUMN IF NOT EXISTS`), or insert reconciling rows into drizzle.__drizzle_migrations for created_at 1781200000000 and 1781200000001 so migrate skips them. Then verify with a dry `npm run db:migrate` against a restored copy before the next production deploy. Ban `drizzle-kit push` against production (see separate finding).

**Verifier correction**

Migration 0012_listings_sale_method_heritage.sql is genuinely unguarded and WOULD fail with SQLSTATE 42710 (verified live: `type "sale_method" already exists`) if drizzle-kit migrate ever ran against production — its objects were created by `drizzle-kit push`, so the ledger stopped at 0011 (max created_at 1781100000000) while the journal registers 0012/0013 at 1781200000000/1. But it will NOT break the next application-backend deploy, because railway.toml:9 uses `releaseCommand`, which is not a Railway config key — Railway's is `deploy.preDeployCommand`, and unknown keys are silently ignored. Proof: five backend deploys since 0012 merged on Aug 4 all succeeded with the ledger unchanged, and agencies.updated_at (bumped by db:seed-agencies, the second half of db:deploy) is stuck at 2026-07-07, two days before releaseCommand was even added. railway.toml is otherwise honoured — the healthcheckPath from it appears in the build logs. The actual defect is therefore the inverse of the claim: db:migrate has NEVER run in production, so every migration since 0011 (including 0012, 0013, and 0004 which has no journal entry at all) is silently unapplied and the schema is held together only by manual `drizzle-kit push`, while start-production.sh prints the false message "migrations already ran via releaseCommand". The 42710 trap is armed against whoever fixes the key name to preDeployCommand — so 0012 must be rewritten with DO $$ ... EXCEPTION WHEN duplicate_object guards (and ADD COLUMN IF NOT EXISTS, also missing) BEFORE that config typo is corrected.

---

### [MEDIUM] users has two owners with contradictory delete semantics — the marketing site hard-DELETEs users (cascading away listings, briefs, threads, invoices, payouts) where the backend soft-deletes
*data · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

Both services point at the identical database — I hashed both values: `railway variables --service website-frontend` DATABASE_URL sha256 prefix 0dd3bd477c1b2776, `railway variables --service application-backend` DATABASE_URL sha256 prefix 0dd3bd477c1b2776 — byte-identical, both `postgresql://***@postgres.railway.internal:5432/railway`.
Website hard-deletes: /Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/api/webhooks/clerk/route.ts:63-66
  `if (type === "user.deleted") { await db.delete(schema.users).where(eq(schema.users.id, data.id)); ... }`
Backend soft-deletes the same event: /Users/mennanyelkenci/Desktop/OMM_BACKEND/app/api/webhooks/clerk/route.ts:67-77 `db.update(schema.users).set({ accountClerkDeletedAt: now, updatedAt: now })`.
The cascade blast radius is in OMM_BACKEND/drizzle/0000_strange_next_avengers.sql (identical md5 b0b97c97d997ab4aff9ddce8a94dba5e in both repos): lines 268, 271, 273, 276, 280, 281, 283, 285, 286 all declare `REFERENCES "public"."users"("id") ON DELETE cascade` — briefs.buyer_id, invoices.agent_id, listings.agent_id, notifications.user_id, payouts.agent_id, reviews.agent_id, saved_listings.buyer_id, searches.buyer_id, threads.owner_id, disputes.raised_by_id. listings cascade further into listing_media and brief_matches (lines 272, 265).
Both webhooks are live and separately registered: website-frontend has `CLERK_WEBHOOK_SECRET = whsec_[REDACTED]`, application-backend has `CLERK_WEBHOOK_SECRET = whsec_[REDACTED]…` — different secrets, i.e. two distinct endpoints registered in two Clerk instances (website `pk_test_…known-elf-22`, backend `pk_live_Y2xlcmsub2ZmbWFya2V0bW…`).
The upsert paths also contradict each other. Backend deliberately preserves fields — OMM_BACKEND/src/lib/clerk-user-sync.ts:230 comments "Display name is owned by account settings / PATCH — do not reset from Clerk SSO" and line 241-242 "Only overwrite phone when Clerk actually has one — never null out a DB number." The website does the opposite unconditionally at route.ts:93-116: `name: fullName` (falls back to `email.split("@")[0]` at line 85), `phone` (null when Clerk has none, line 77-81), and `role` reset to `"AGENT"` by default (lines 88-91).

**Why it matters**

One `user.deleted` event delivered to www.offmarketmatch.com.au irreversibly destroys that agent's listings, media, briefs, match records, threads, messages, reviews, invoices and payouts — real commercial and financial records, with no soft-delete tombstone and no recovery path. The backend was explicitly designed to never do this. Because the website sits on the pk_test Clerk instance, an ordinary act of tidying up test users in the Clerk test dashboard is enough to trigger it against the production database. The upsert path is a quieter version of the same bug: it silently clobbers display names, nulls phone numbers, and demotes roles that the backend treats as user-owned.

**Remediation**

Delete /Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/api/webhooks/clerk/route.ts entirely — the site is marketing-only and has no reason to own user rows — then remove the Clerk webhook endpoint registration from the test instance and unset CLERK_WEBHOOK_SECRET on website-frontend. Until that ships, treat this as a live incident: the endpoint is reachable and armed. Separately, consider changing the users FKs from ON DELETE cascade to RESTRICT so no future code path can silently erase commercial records.

**Verifier correction**

The `users` table does have two owners with contradictory semantics — OMM_App/apps/web/app/api/webhooks/clerk/route.ts:63-66 hard-DELETEs where OMM_BACKEND/app/api/webhooks/clerk/route.ts:67-77 soft-deletes — and both services genuinely share one production Postgres (DATABASE_URL sha256 0dd3bd477c1b2776 on both). The hard-delete route is deployed, publicly reachable (400 "Missing svix headers"), middleware-whitelisted, and registered as a live Svix endpoint with user.deleted subscribed and a signing secret matching its env var exactly. Behind it sit 17 ON DELETE CASCADE FKs on users (more than the 10 claimed — also inspection_bookings, user_push_tokens, listing_buyer_offers, deal_acknowledgements x2, referral_deals x2), covering 24 listings, 39 threads, 96 messages, 3 invoices, 2 payouts and 1 referral deal of live data.

But the stated impact does not hold today. I enumerated the Svix endpoints on both Clerk instances. The live instance (12 users — the source of every real user row) has exactly one endpoint: api.offmarketmatch.com.au, the soft-delete backend. The hard-delete endpoint exists only in the dev instance (known-elf-22, 0 users). Because the DELETE is keyed on the Clerk user id and dev ids never collide with live ids, a dev-dashboard deletion can only remove rows the dev webhook itself created — no real agent's records are reachable. Sign-up on the marketing site is also closed (NEXT_PUBLIC_WAITLIST_MODE=true). The claim also errs on the cascade chain: brief_matches is ON DELETE SET NULL on both listing_id and agent_id, not cascade.

So: a live, correctly-signed hard-delete path into the production database whose only safety property is that its Clerk instance happens to have no real users — a landmine, not an active fire. Wiring the live instance to that URL, or swapping the site to live keys, detonates it with zero code change. Secondary live issue: the same dev endpoint actively inserts/updates rows in the production users table (unconditionally clobbering name, phone, avatar and role — ADMIN is settable from public_metadata — and bypassing the backend's isPermittedWorkEmail gate) against a schema.ts that is 12 migrations stale. Fix: delete OMM_App/apps/web/app/api/webhooks/clerk/route.ts and remove Svix endpoint ep_3Cq4z9CQvq8gCK51ktdpl49lJ0T.

---

### [MEDIUM] users.email is UNIQUE but the website upsert conflict-targets id, so any cross-Clerk-instance email overlap throws a unique violation and puts Clerk into a retry loop
*data · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

Unique constraint declared in both schemas: OMM_BACKEND/src/db/schema.ts:242-244 and OMM_App/apps/web/src/db/schema.ts:172-174 both end the users table with `(t) => ({ emailIdx: uniqueIndex("users_email_idx").on(t.email) })`.
The website upsert targets only the primary key: /Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/api/webhooks/clerk/route.ts:103-116 `db.insert(schema.users).values(values).onConflictDoUpdate({ target: schema.users.id, set: {...} })`.
The two services authenticate against different Clerk instances, so the same human has two different Clerk user ids: website-frontend `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_a25vd24tZWxmLTIyLmNsZXJrLmFjY291bnRzL…` and `CLERK_SECRET_KEY = sk_test_…`; application-backend `pk_live_Y2xlcmsub2ZmbWFya2V0bW…`.
Live DB shows the collision surface is already non-trivial: `select count(*) from users` -> 25, and `select left(id,5), count(*) from users group by 1` -> a single bucket `user_` x25, i.e. test-instance and live-instance ids are lexically indistinguishable once written.
The backend additionally gates writes that the website does not: OMM_BACKEND/app/api/webhooks/clerk/route.ts:85-88 `if (!isPermittedWorkEmail(profile.email)) return new Response("ok")` — "Ack without upsert — avoid Clerk retry storms for blocked personal domains." The website has no equivalent check.

**Why it matters**

A tester or founder who exists in both Clerk instances has one row keyed by the live id. When the test instance fires user.created for the same email, the INSERT gets a fresh id, misses the id conflict target, and violates users_email_idx. Drizzle throws, the route has no catch, Next returns 500, and Clerk retries the webhook on a backoff schedule indefinitely — exactly the retry storm the backend's author wrote a guard to avoid. It also means the website silently bypasses the work-email allowlist that gates who becomes a user record at all, so personal-domain signups on the test instance can land rows in the production users table that the backend's own policy would have rejected.

**Remediation**

Covered by deleting the website's Clerk webhook route (see the hard-delete finding) — that removes the second writer and the problem with it. If the endpoint must survive for any reason, at minimum wrap the insert in try/catch returning 200 so Clerk stops retrying, conflict-target users_email_idx rather than users.id, and apply the same isPermittedWorkEmail gate the backend uses.

**Verifier correction**

The website's Clerk webhook (OMM_App/apps/web/app/api/webhooks/clerk/route.ts:103-116) upserts into the SHARED production users table with `onConflictDoUpdate({ target: users.id })`, while `users_email_idx` is a live UNIQUE index on email — so an insert carrying a new Clerk id with an already-present email raises 23505 and, with no try/catch, returns 500 and burns Clerk's bounded Svix retry schedule (~8 attempts / ~24h) before the endpoint is marked failing. I reproduced the exact violation against the production DB in a rolled-back transaction. The website also lacks the `isPermittedWorkEmail` gate and the `migrateClerkUserPrimaryKey` same-email/different-id recovery that the backend has, so it is strictly less safe than the service that owns the schema.

However, this is currently UNREACHABLE, not an active fault. The dev Clerk instance backing website-frontend has ZERO users (`/v1/users/count` → 0), so no cross-instance email overlap exists or ever has. The site runs NEXT_PUBLIC_WAITLIST_MODE=true and its middleware 307-redirects /sign-in and /sign-up to /, verified live — there is no sign-up surface at all. Triggering requires someone to manually create a dev-instance user with an email that already exists in the live instance.

Two of the claim's supporting facts are wrong: the `left(id,5) → user_ x25` query is a tautology (all Clerk ids start with `user_`) and demonstrates no dev-instance rows; and the 4 gmail.com rows in production came from the LIVE Clerk instance, not from the website bypassing the allowlist, so the "personal-domain signups landing in prod" consequence is misattributed.

Severity medium, not high — a latent landmine that arms the moment WAITLIST_MODE is flipped or a single dev test user is created. Separately and unreported: the same route's user.deleted branch does a HARD `db.delete(users)` against the shared prod DB where the backend does a soft delete, and users.id carries onDelete:"cascade" from ~20 tables — same reachability caveat, far worse blast radius.

---

### [MEDIUM] Migration ledger no longer describes the database: two migrations were dropped from the journal, one of which is recorded as applied and one of which was never applied by migrate at all
*data · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

Files on disk in OMM_BACKEND/drizzle: 0000 through 0013, fourteen .sql files. `grep -o '"tag": "[^"]*"' OMM_BACKEND/drizzle/meta/_journal.json` returns only twelve — 0002_support_requests and 0004_searches_mobile_fields are absent from the journal, so drizzle-kit migrate will never execute either file. The journal's idx sequence also skips 2 (entries run 0, 1, 3, 4, 5, …).
Live DB `select id, created_at from drizzle.__drizzle_migrations order by created_at` returns 11 rows: 1777098441876, 1779421387582, 1779500000000, 1779600000000, 1780500000000, 1780600000000, 1780700000000, 1780800000000, 1780900000000, 1781000000000, 1781100000000. The row at 1779500000000 corresponds to no entry in the current journal — that is 0002_support_requests, applied under an earlier version of the journal and since removed from it.
Both orphans nonetheless exist in the database, applied out-of-band: `select to_regclass('public.support_requests')` -> support_requests, and `select column_name from information_schema.columns where table_name='searches' and column_name in ('criteria_line','last_viewed_at')` -> both present. 0004's DDL is `ALTER TABLE "searches" ADD COLUMN IF NOT EXISTS "criteria_line" text;` (OMM_BACKEND/drizzle/0004_searches_mobile_fields.sql:1-2).
Only one service applies migrations, which is the one good part of this picture: OMM_BACKEND/railway.toml:9 `releaseCommand = "npm run db:deploy"`, and OMM_BACKEND/scripts/start-production.sh:10-20 explicitly skips migrate when RAILWAY_ENVIRONMENT is set ("Railway deploy — migrations already ran via releaseCommand"). OMM_App/railway.json:9 runs `["true"]`. OMM_Mobile has no database access at all — `node -e` over its package.json deps for /drizzle|^pg$|postgres/ returns [], and grepping app/lib/components/packages for drizzle or pg.Pool finds only comment strings.

**Why it matters**

A fresh environment built from this repo — a staging clone, a disaster-recovery restore, a new Railway environment — will come up structurally different from production: no support_requests table, no searches.criteria_line or last_viewed_at columns, because migrate skips the two unjournaled files. Any backend code reading those columns then fails against the rebuilt database while working fine in prod, which is the hardest class of bug to diagnose. It also means the migration directory can no longer be trusted as the source of truth for what production looks like, which is what let the 0012 deploy trap go unnoticed.

**Remediation**

Re-add 0002_support_requests and 0004_searches_mobile_fields to OMM_BACKEND/drizzle/meta/_journal.json with their original `when` values (1779500000000 and a value between 1779600000000 and 1780500000000), making 0002 idempotent first (guard the CREATE TYPE support_request_kind and CREATE TABLE, which currently have zero IF NOT EXISTS). Then prove it: restore a snapshot into a scratch database, run db:migrate from empty, and diff information_schema against production. Adopt the rule that production schema changes only ever arrive via migrate, never push.

**Verifier correction**

Two migration files were removed from OMM_BACKEND/drizzle/meta/_journal.json while remaining on disk, so drizzle-kit migrate will never execute them. Verified by sha256: 0002_support_requests (hash a45e8b3b7ee8) is recorded as applied in drizzle.__drizzle_migrations at created_at 1779500000000 despite being absent from the journal, and 0004_searches_mobile_fields (hash b7e6e74a4a75) appears in no ledger row at all, yet both sets of objects exist in the live database (support_requests table; searches.criteria_line and searches.last_viewed_at), applied out of band. The journal's idx sequence skips 2 and is now desynced from the file prefixes.

Confirmed empirically: running the repo's own `npx drizzle-kit migrate` against an empty Postgres reports "migrations applied successfully!" and produces a database with no support_requests table, no support_request_kind enum, and neither searches.criteria_line nor searches.last_viewed_at. No later migration references those objects, so nothing fails at migrate time; the divergence only surfaces at runtime, where src/db/queries.ts:3890, src/lib/clerk-user-sync.ts:87 and app/api/mobile/saved-searches/route.ts (via src/db/queries.ts:390) all read or write them. There is no drizzle-kit push in any deploy path to compensate, and README.md:83 documents `npm run db:migrate` as the local setup, so this is reachable by any developer provisioning a database from the repo.

Two corrections to the original impact argument: a disaster-recovery restore is NOT affected — a Postgres dump or snapshot reproduces the objects verbatim, as the live staging environment proves (its ledger is byte-identical to production, orphan row included, because it was built by copying the database rather than by running migrate). And the link to the 0012 deploy trap is speculation; that trap has an independent root cause.

Two things the original understated: drizzle/meta/ retains only 0000_snapshot.json and 0001_snapshot.json, so the next `npm run db:generate` will diff schema.ts against the 0001 snapshot and emit one migration re-creating everything from 0002 onward. And both production and staging ledgers stop at 1781100000000 (0011), so the journaled-but-unapplied 0012 will run its unguarded CREATE TYPE "public"."sale_method" against a database where that type already exists and abort the releaseCommand on the next deploy.

---

### [MEDIUM] npm run db:seed deletes every row from 16 production tables and resolves DATABASE_URL from a .env.local that holds the production credential
*data · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

/Users/mennanyelkenci/Desktop/OMM_BACKEND/src/db/seed.ts:113-132 issues unfiltered deletes in FK order: `db.delete(schema.notifications)`, agencyRequests, dealAcknowledgements, savedListings, listingBuyerOffers, searches, payouts, invoices, disputeEvents, disputes, reviews, messageAttachments, messages, threads, briefMatches, briefs, listingMedia, listings, users, agencies. The file's own header at lines 1-8 says "Idempotent: clears the DB first, then inserts" and "Run: npm run db:seed".
It loads production credentials by default — seed.ts:10-12 `loadEnv({ path: ".env.local" }); loadEnv();` — and /Users/mennanyelkenci/Desktop/OMM_BACKEND/.env.local exists on disk. There is no NODE_ENV check, no confirmation prompt, and no guard on the resolved host.
The seed then inserts fixtures under hardcoded ids (seed.ts:29-31: DEMO_AGENT_ID `user_demo_agent_jl`, DEMO_BUYER_ID `user_demo_buyer_sj`, COUNTERPARTY_AGENT_ID `user_demo_agent_az`).
It is not wired into deploy — OMM_BACKEND/package.json `"db:deploy": "npm run db:migrate && npm run db:seed-agencies"` invokes only the agency upsert, and scripts/seed-agencies.ts is a CSV upsert rather than a wipe.

**Why it matters**

The destructive script sits one keystroke away from the safe one — `db:seed` versus `db:seed-agencies` — in the same package.json, and both resolve to production by default. Running the wrong one erases all 25 live users and every listing, thread, invoice and payout in the database, then repopulates it with demo fixtures. There is no soft-delete or tombstone to recover from. The risk rises sharply at launch when someone is refreshing a demo environment under time pressure.

**Remediation**

Add a hard guard at the top of src/db/seed.ts: refuse to run when RAILWAY_ENVIRONMENT is set, when the resolved DATABASE_URL host is not localhost, or unless an explicit env var like ALLOW_DESTRUCTIVE_SEED=1 is present. Rename the script to db:seed-local-destructive so it cannot be confused with db:seed-agencies.

**Verifier correction**

`npm run db:seed` (src/db/seed.ts) unconditionally deletes every row from 20 tables — not 16 — in FK order (seed.ts:110-133), untransacted, as the very first action of main(). It resolves DATABASE_URL via `loadEnv({path:".env.local"}); loadEnv();` (seed.ts:10-12), and OMM_BACKEND/.env.local holds postgresql://…@ballast.proxy.rlwy.net:42697/railway — verified to be the production Postgres service's own DATABASE_PUBLIC_URL (RAILWAY_TCP_PROXY_DOMAIN=ballast.proxy.rlwy.net, port 42697). That is not incidental: scripts/sync-railway-env-local.sh, exposed as `npm run sync:railway-env`, writes the production credential into .env.local as the documented local-dev setup.

Correction to the original finding: a guard DOES exist. seed.ts:544-550 refuses to run when NODE_ENV === "production", and Dockerfile:16 sets NODE_ENV=production, so the script cannot fire inside the deployed container. The gap is that NODE_ENV is unset on developer machines (verified: no .env file, no NODE_ENV in .env.local, `NODE_ENV = undefined` when replaying seed.ts's exact env-loading), so on a laptop the guard passes while DATABASE_URL points at production. There is no check on the resolved host and no confirmation prompt — those parts of the finding stand.

Confirmed not reachable from any automated path: railway.toml releaseCommand runs `db:deploy` = `db:migrate && db:seed-agencies`, and scripts/seed-agencies.ts is a pure CSV upsert with no deletes. The exposure is a human running the wrong one of two adjacent package.json scripts. Verified blast radius against production: 537 rows across the 20 tables, including 25 users (22 real Clerk accounts, 10 created in the last 30 days), 24 listings, 39 threads, 96 messages, 3 invoices, 2 payouts, 80 agencies — replaced by demo fixtures under hardcoded ids, with no soft-delete or tombstone to recover from.

Recommended fix is a host assertion rather than a NODE_ENV one: refuse to run when DATABASE_URL resolves to anything other than localhost/127.0.0.1 unless an explicit env flag (e.g. ALLOW_DESTRUCTIVE_SEED=1) is present, and rename the script to `db:seed-demo-destructive` so it no longer sits one tab-completion away from `db:seed-agencies`.

---

### [MEDIUM] Chat attachments are Redis blobs with a 60-day TTL, but the message row and its URL are permanent in Postgres
*api · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_Mobile*

**Evidence**

OMM_BACKEND/src/lib/message-attachment-storage.ts:11 `const DEFAULT_ATTACHMENT_TTL_SEC = 60 * 24 * 60 * 60;` and :126-127 `const ttlSec = messageAttachmentTtlSec(); await redis.set(key, payload, "EX", ttlSec);` (touch-on-read refresh at :171-172).
The pointer is permanent: OMM_BACKEND/src/db/schema.ts:479-489 `message_attachments` table with `url: text("url")`, written in app/api/mobile/messages/[id]/route.ts:82-90.
On expiry: app/api/mobile/message-attachments/[id]/route.ts:26-28 returns `{error:"attachment_unavailable"}` 404 while the loader still emits the attachment (src/server-data/rsc-loaders.ts:912-919 maps every persisted row).
Client shows a generic failure: OMM_Mobile/lib/message-attachment-open.ts:26-28 `if (!res.ok) { throw new Error('Could not open attachment.'); }` — no distinction between expired, forbidden and network.
Contracts of Sale go down this path: OMM_Mobile/app/contact-seller-chat.tsx:1270,1301,1318 attach `application/pdf` to threads.

**Why it matters**

A Contract of Sale or SOI exchanged in-app disappears after 60 days of not being opened, but the chat still renders an attachment chip that 404s. Redis is also shared with rate-limiting and thread prefs (src/lib/message-thread-prefs-redis.ts), so under memory pressure Railway's eviction policy can drop these blobs well before the TTL. For a transaction platform this is a document-durability problem, not a caching nit — and the client cannot even tell the user what happened.

**Remediation**

Move message attachments to the same object storage already configured for listing media (AWS_S3_BUCKET_NAME / application-imagery bucket, see src/lib/listing-media-bucket.ts) rather than Redis; or at minimum return a distinct error code the client renders as "this file has expired" and stop rendering chips for blobs that no longer exist.

**Verifier correction**

Generic chat attachments (composer photos and documents) are stored ONLY as Redis blobs with a sliding 60-day TTL refreshed on each open, while the message_attachments row and its URL are permanent in Postgres — so after 60 days without being opened the chat still renders an attachment chip that 404s with `attachment_unavailable`, and the client shows "Could not open attachment / Try again in a moment", telling the user to retry something that can never succeed. Confirmed live: no MESSAGE_ATTACHMENT_TTL_SEC override in production and no cleanup, mirroring, or expiry-aware rendering anywhere.

Two corrections to the original claim. First, Contracts of Sale do NOT normally use this path: the primary flow uploads the PDF to the S3 bucket via uploadListingMediaUriIfNeeded(..., 'SOI_PDF'), syncs it to the listing, and sends a message carrying the durable https URL in the body with no attachment row at all; Redis is only the fallback when the listing id isn't a persisted lst- id or the upload didn't return an http URL. Second, the eviction argument is wrong: production Redis is maxmemory=0 with maxmemory-policy=noeviction, so these blobs are never evicted under pressure (writes would OOM instead); the actual secondary risk is that persistence is RDB-only (appendonly no, save 60 1 to the /data volume), losing up to 60 seconds of writes on an unclean restart.

Severity is medium, not high: the path is live, ungated and end-to-end reachable, but production holds 39 threads / 96 messages and exactly one message_attachments row — a seed row `att-floorplan` with a NULL url — and zero attachment keys in Redis, so no user document has been lost yet. That seed row nonetheless reproduces the failure today, since it passes the `att-` viewer check but has no blob behind it.

---

### [MEDIUM] Persisted media and attachment URLs are baked to the Railway-generated domain, not api.offmarketmatch.com.au
*api · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_Mobile*

**Evidence**

`railway variables --service application-backend --environment production --json` returns `LISTING_MEDIA_PUBLIC_ORIGIN = https://ommbackend-production.up.railway.app` and `MOBILE_API_PUBLIC_ORIGIN = https://ommbackend-production.up.railway.app`, while `RAILWAY_PUBLIC_DOMAIN = api.offmarketmatch.com.au`.
The client talks to the custom domain: `railway variables --service application-frontend` returns `EXPO_PUBLIC_MOBILE_API_ORIGIN = https://api.offmarketmatch.com.au`.
Those origins are written INTO the database, not computed per-request: OMM_BACKEND/src/lib/listing-media-url.ts:10-24 `canonicalListingMediaPublicOrigin()` and :44-64 `normalizeListingMediaUrlForStorage()` → `return `${origin}/api/mobile/listing-media/${fileName}``; same for src/lib/message-attachment-url.ts:4-19,27-31, whose output is stored in `message_attachments.url`.
`railway domain` on application-backend confirms both domains exist today: `ommbackend-production.up.railway.app (service)` and `api.offmarketmatch.com.au (custom)`.

**Why it matters**

Deleting the auto-generated Railway domain is the normal cleanup step after a custom-domain cutover, and it would permanently break every photo, floor plan, SOI and chat attachment URL already stored in Postgres — the app fetches the stored absolute URL, not a relative path. It also means all media traffic bypasses the domain the rest of the product uses, so any WAF/cache/DNS work done on api.offmarketmatch.com.au silently does not apply to media.

**Remediation**

Set `LISTING_MEDIA_PUBLIC_ORIGIN` and `MESSAGE_ATTACHMENT_PUBLIC_ORIGIN`/`MOBILE_API_PUBLIC_ORIGIN` to `https://api.offmarketmatch.com.au`, then run a one-off UPDATE to rewrite the host in `listing_media.url` and `message_attachments.url`. Do this before removing the generated domain, and consider storing relative paths (the client already absolutizes: OMM_Mobile/lib/resolve-listing-media-url.ts:27-29).

**Verifier correction**

Production writes bake the Railway-generated origin into Postgres: application-backend has LISTING_MEDIA_PUBLIC_ORIGIN and MOBILE_API_PUBLIC_ORIGIN both set to https://ommbackend-production.up.railway.app, and those values are written into listing_media.url (OMM_BACKEND/src/lib/listing-media-url.ts:10-24,44-64 via src/db/queries.ts:2272,3038) and message_attachments.url (src/lib/message-attachment-url.ts:4-19,27-31 via app/api/mobile/messages/[id]/route.ts:88-90). The read path returns those stored absolute URLs unchanged (src/server-data/rsc-loaders.ts:911-917), while clients are pointed at EXPO_PUBLIC_MOBILE_API_ORIGIN = https://api.offmarketmatch.com.au.

However, the impact is narrower than claimed, because a client-side rewrite the investigator missed already neutralises most of it. OMM_Mobile/lib/resolve-listing-media-url.ts:31-35 re-bases any /api/mobile/listing-media/* URL onto the client's own API origin when Platform.OS === 'web', discarding the stored origin entirely. So on app.offmarketmatch.com.au — the primary surface — photos, floor plans and SOI already load from api.offmarketmatch.com.au and would NOT break if the Railway domain were deleted. Exposure is limited to (a) native iOS/Android listing media, where resolveListingMediaUrl passes non-loopback hosts through unchanged, and (b) chat attachments on all platforms including web, since OMM_Mobile/lib/message-attachment-open.ts:8 returns absolute https URLs verbatim. Attachment exposure is further bounded to a rolling 60-day window because the blobs are Redis-backed with a 60-day TTL (src/lib/message-attachment-storage.ts:11) and are already gone after that regardless of domain.

Remediation is cheap, which is the main reason this is medium rather than high: canonicalListingMediaPublicOrigin already falls back to https://${RAILWAY_PUBLIC_DOMAIN} (= api.offmarketmatch.com.au) at third priority, so deleting the two explicit env vars fixes all future writes, and OMM_BACKEND/scripts/backfill-listing-media-to-bucket.mjs:147,177-186 already exists to rewrite existing listing_media rows to the canonical origin. The real gap is that no equivalent backfill exists for message_attachments.url. Nothing is broken today — both domains are ACTIVE and return 200 — so this is a latent footgun that fires only if the auto-generated Railway domain is deleted, plus a real-today observability/edge-policy split where native media traffic and all attachment traffic bypass api.offmarketmatch.com.au.

---

### [MEDIUM] The contract is 100% hand-maintained: @unlisted/shared is installed but imported by zero files, and has already drifted
*api · PARTIALLY_CONFIRMED · repos: OMM_Mobile, OMM_BACKEND*

**Evidence**

`@unlisted/shared` is declared (OMM_Mobile/package.json:64) and linked (`node_modules/@unlisted/shared -> ../../packages/shared`), but `grep -rn "unlisted/shared" app lib components types tsconfig.json metro.config.js` matches ONLY package.json:64, and grepping the exported type names (`HomePageLoaderData|MessagesInboxData|SearchBootstrapResponse|BriefsPageData|ListingsPageData|NotificationsResponse`) across app/lib/components/types/tests returns nothing.
OMM_BACKEND has no reference to the package at all and defines its own copies — e.g. its `HomePageLoaderData` at src/server-data/rsc-loaders.ts:310-337 carries `draftCount`, `preMarketCount` and `soiReminderListings[]` which the shared copy (packages/shared/src/mobile-api.ts:75-97) does not have.
More drift: shared `MessageThread.messages[]` (mobile-api.ts:174-186) declares `time: string` and `dateGroup?: string` and no `sentAt`; the server actually emits `sentAt` plus a hard-coded `dateGroup: "TODAY"` (rsc-loaders.ts:904-910) and the client reads `sentAt` and ignores both (OMM_Mobile/lib/mobile-messages-api.ts:62-77; `grep dateGroup` over app/lib/components returns nothing).
`npx tsc --noEmit` exits 0 in BOTH repos — precisely because no type crosses the boundary.

**Why it matters**

Every one of the ~60 endpoints is validated only by hand-written `typeof x === 'string'` guards on the client, and both typecheckers are green no matter how far the two sides diverge. The dead shared package is worse than no package: it looks authoritative, three of its declarations are already wrong, and its doc comments are being cited as the contract (see the search-params finding). Nothing will catch a breaking backend change before it ships.

**Remediation**

Either delete packages/shared so nobody trusts it, or make it real: move it to a location both repos consume (published private package or git submodule), have OMM_BACKEND route handlers type their `NextResponse.json()` payloads against it, and import it in the OMM_Mobile parsers. Zod schemas shared by both sides would give runtime validation as well as compile-time.

**Verifier correction**

The client/server contract is 100% hand-maintained, and the `@unlisted/shared` package that looks like the contract is 95% orphaned and already wrong in at least four places.

`@unlisted/shared` is declared (OMM_Mobile/package.json:64) and symlinked as an npm workspace, but nothing imports it by package specifier. Of its 22 exports, exactly one — `InspectionActivityItem` — is used, and only via a relative path into the package's source (`import type { InspectionActivityItem } from '../packages/shared/src/mobile-api'` in lib/activities-feed.ts:3, lib/inspection-booking-guards.ts:4, lib/message-thread-reason.ts:7, lib/mobile-messages-api.ts:1, lib/omm-messages-context.tsx:16). The other 21 exports, including every page-loader response type (HomePageLoaderData, MessagesInboxData, ListingsPageData, BriefsPageData, NotificationsResponse, SearchBootstrapResponse), are referenced by zero files; same-named types are independently redeclared client-side.

OMM_BACKEND has no reference to the package whatsoever and defines its own copies, which have diverged: its `HomePageLoaderData` (src/server-data/rsc-loaders.ts:310-336) carries `draftCount`, `preMarketCount` and `soiReminderListings[]` that the shared copy (packages/shared/src/mobile-api.ts:75-97) lacks; shared `MessageThread.messages[]` (mobile-api.ts:174-186) declares `time: string` and `dateGroup?: string` with no `sentAt`, while the server emits `sentAt` plus a hard-coded `dateGroup: "TODAY"` (rsc-loaders.ts:904-910) and the client reads only `sentAt` (lib/mobile-messages-api.ts:62-77); shared's attachment type omits `url`, which the server emits and the client requires; shared's `participant` declares `initials`/`isOnline` the client never models; and even the one live type mismatches (`bookedForAtIso?: string` vs the backend's `string | null`, src/db/queries.ts:3325-3335).

`npx tsc --noEmit` exits 0 in both repos — not because no type crosses the boundary (one does, and OMM_Mobile's tsconfig `include: ["**/*.ts"]` does typecheck packages/shared), but because the backend never imports the package, so the two definitions can never be compared. Where the shared type IS imported it still enforces nothing: the value is validated by a hand-written `typeof x === 'string'` parser (parseInspectionActivityItem, lib/mobile-messages-api.ts:176-207) that re-lists every field independently. Across ~127 backend route handlers, that hand-written-guard pattern is the entire contract, and nothing will catch a breaking backend change before it ships.

---

### [MEDIUM] Dead backend surface, including a second, unused listing-create write path
*api · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_Mobile*

**Evidence**

`GET /api/mobile/listings` and `POST /api/mobile/listings` (OMM_BACKEND/app/api/mobile/listings/route.ts:158 and :175, the latter calling `createListingForAgent`) are never called: `grep -rn "api/mobile/listings" app lib components` in OMM_Mobile only ever matches the sub-paths `/listings/{id}`, `/listings/{id}/analytics`, `/refer`, `/refer-suggestions`, `/inspection-bookings`. The real publish path is `POST /api/mobile/published-listings` (OMM_Mobile/lib/mobile-published-listings-api.ts:234-240).
`GET /api/mobile/messages/[id]/referral-deal` (route.ts exists, GET only) is never called — the only referral-deal reference in OMM_Mobile is lib/mobile-messages-api.ts:418 hitting `/referral-deal/actions`.
`POST /api/mobile/propertydata/session-check` is never called from OMM_Mobile, yet production has `PROPERTYDATA_SESSION_CHECK_ENABLED = true` and `PROPERTYDATA_USE_PLAYWRIGHT = true` set on application-backend.
For completeness: every path the client DOES call exists on the backend, and every HTTP method matches (checked acknowledge=PATCH, recent-searches=PUT, messages/[id]/mute=POST|DELETE, messages/mute=GET). There are no 404 or 405 endpoints.

**Why it matters**

Two divergent code paths that both create listings (`POST /api/mobile/listings` with `parseCreateBody` + `createListingForAgent`, vs `POST /api/mobile/published-listings`) is a maintenance trap — validation added to one will be missed on the other, and the unused one is still authenticated-and-live so it is reachable by anyone with a session token. The unused propertydata/session-check route drags a Playwright dependency (`serverExternalPackages: ["pg","playwright"]` in next.config.js) into the production image for nothing.

**Remediation**

Delete app/api/mobile/listings/route.ts's POST (and the GET if the ListingsPageData loader is genuinely unused), app/api/mobile/messages/[id]/referral-deal/route.ts, and app/api/mobile/propertydata/session-check/route.ts — or wire them up. If propertydata/session-check is intentionally ops-only, move it under /api/internal/ where the cron auth already lives.

**Verifier correction**

Dead backend surface is real: `GET`/`POST /api/mobile/listings` (OMM_BACKEND/app/api/mobile/listings/route.ts:158, :175), `GET /api/mobile/messages/[id]/referral-deal`, and `POST /api/mobile/propertydata/session-check` are called by neither OMM_Mobile nor OMM_App, yet all remain live behind bearer auth. But two of the claim's three justifications do not survive checking, and the real defect was missed.

Wrong #1 — the two create paths are not divergent writers. Both `POST /api/mobile/listings` and `POST /api/mobile/published-listings` call the same `createListingForAgent` (src/db/queries.ts:2200 — its only two callers) and already share `validateListingMediaRows`, `validateSoiUrl`, `forbidIfNoSellingWorkspace` and `DuplicateActiveListingError` handling. Validation added to those helpers reaches both.

Wrong #2 — session-check does not drag Playwright in. Playwright is required by live, client-called routes: `POST /api/mobile/soi/generate-from-propertydata` (OMM_Mobile/lib/mobile-soi-propertydata-draft-pdf.ts:202,353) and address-autocomplete both reach `src/lib/propertydata/ensure-session.ts`. `serverExternalPackages: ["pg","playwright"]` and `PROPERTYDATA_USE_PLAYWRIGHT=true` are load-bearing. Only `PROPERTYDATA_SESSION_CHECK_ENABLED=true` is orphaned config.

Missed — the dead `POST /api/mobile/listings` is missing two guards its live twin enforces, making it an exploitable bypass rather than a maintenance trap. It omits the `soi_required` check at published-listings/route.ts:234-236, and unlike published-listings (which sanitises via `featuresWithOmmMeta`, mobile-published-listings.ts:84) it forwards the caller's `features` array unfiltered (listings/route.ts:108-114 -> queries.ts:2249), so a caller can inject a forged `omm:meta:` blob that `parseOmmListingMeta` trusts. Submitting status DRAFT with `features: ["omm:meta:{\"listingStatus\":\"live\"}"]` makes the listing buyer-visible via `isListingVisibleToBuyer` (mobile-published-listings.ts:77) while skipping the Statement-of-Information gate entirely. Fix is to delete the route, not to reconcile it.

---

### [MEDIUM] Auth failure messages leak internal env-var and service names into user-facing alerts
*api · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_Mobile*

**Evidence**

OMM_BACKEND/src/lib/mobile-bearer-auth.ts:66-75 `mobileAuthErrorMessage()` returns, verbatim: "Unauthorized — CLERK_SECRET_KEY is missing on OMM_BACKEND (Railway mobile-backend service)." and "Unauthorized — session token rejected. Railway CLERK_SECRET_KEY must match EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (same Clerk app as Expo)."
These are returned as the response body on ~10 routes, e.g. app/api/mobile/published-listings/[id]/route.ts:114-116, disputes/route.ts:40-42, reviews/route.ts:40-42, all `{ error: mobileAuthErrorMessage(auth.reason), reason: auth.reason }`.
The client renders `error` verbatim: OMM_Mobile/lib/mobile-published-listings-api.ts:84-94 `readApiErrorBody` returns `parsed.error.trim()`, surfaced as `result.detail` in alerts at app/edit-listing.tsx:204, app/make-listing-live.tsx:128, app/archive-listing.tsx:105, app/update-soi.tsx:219.
No auth needed to trigger — an unauthenticated PATCH to /api/mobile/published-listings/{id} returns it.

**Why it matters**

Anyone can curl the API with a bad/absent token and be told which secrets the backend expects and what the Railway service is called. Separately, the second string is nonsense to a real user staring at an alert box: end users get told to check that `CLERK_SECRET_KEY` matches `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. It is a dev-loop message shipped to production.

**Remediation**

Return a generic body (`{error:"unauthorized", reason}`) and log the diagnostic server-side. If the developer hint is worth keeping, gate it on `process.env.NODE_ENV !== 'production'`.

**Verifier correction**

Dev-loop auth error messages naming internal environment variables are returned by the production API and rendered verbatim in end-user alerts.

OMM_BACKEND/src/lib/mobile-bearer-auth.ts:62-73 `mobileAuthErrorMessage()` returns, for `invalid_token`: "Unauthorized — session token rejected. Railway CLERK_SECRET_KEY must match EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (same Clerk app as Expo)." This is the response body on 12 call sites across 9 route files under app/api/mobile/**, and OMM_BACKEND has no middleware.ts gating them. Confirmed live: any request carrying a garbage Bearer token (e.g. PATCH https://api.offmarketmatch.com.au/api/mobile/published-listings/x with "Authorization: Bearer notarealtoken") returns it — no valid credentials needed. Note the trigger is a BAD token, not a MISSING one: with no Authorization header the backend returns a clean "sign in again" message.

The client does not mitigate this; it deliberately forwards it. OMM_Mobile/lib/mobile-published-listings-api.ts:120-129 sanitizes only `missing_bearer` and explicitly `return err` (the raw backend string) for `invalid_token` and `clerk_not_configured`. It reaches users as `result.detail` in alerts at app/edit-listing.tsx:204, make-listing-live.tsx:128, archive-listing.tsx:105, update-soi.tsx:219, change-listing-status.tsx:125, photos-floorplan.tsx:326.

Two parts of the original claim do not hold: (a) the second string, "CLERK_SECRET_KEY is missing on OMM_BACKEND (Railway mobile-backend service)", is unreachable in production because CLERK_SECRET_KEY is set on application-backend; and (b) it does not disclose a real Railway service name — "mobile-backend" does not exist, the service is "application-backend". So the "attacker learns your service topology" rationale is unfounded.

Conversely the finding is understated in scope: OMM_Mobile ships its own hardcoded dev-loop strings independent of the backend, in a codebase that also builds for web, including the Clerk instance slug at mobile-published-listings-api.ts:156 ("organic-mosquito-64 Clerk app"), plus DATABASE_URL / CLERK_WEBHOOK_SECRET / apps/web/.env.local / `npm run db:push` at :145,:160,:162, http://127.0.0.1:3101 at :141, and "Railway application-backend" at mobile-database-context.tsx:84,86.

Correct severity framing: as an information leak this is LOW — no secret values are exposed and the Clerk env var names are publicly documented; the only genuinely internal identifier is the Clerk instance slug in the client bundle. The medium rating is justified only on shipped-quality grounds: incoherent developer instructions are displayed to real users in production across many surfaces.

---

### [MEDIUM] OMM_BACKEND CI never runs `next build`, so `npm run typecheck` is blind to Next route-handler contract errors on a fresh checkout
*buildhealth · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

OMM_BACKEND/tsconfig.json:19-25 includes `.next/types/**/*.ts` and `.next/dev/types/**/*.ts` — the Next-generated route validators. OMM_BACKEND/.github/workflows/ci.yml:12-20 runs only checkout -> setup-node -> `npm ci` -> `npm run typecheck` -> `npm run test`; there is no build step, so `.next/` does not exist and those validators contribute zero files. Demonstrated on a real route: in app/api/mobile/agents/[id]/route.ts:23 I changed `type Params = { params: Promise<{ id: string }> };` to `type Params = { params: { id: string } };`. (A) With `.next/` present, `npx tsc --noEmit` failed: `.next/types/app/api/mobile/agents/[id]/route.ts(53,7): error TS2344 ... The types of '__param_type__.params' are incompatible ... Type '{ id: string; }' is missing the following properties from type 'Promise<any>'`. (B) With `.next/` moved aside — exactly the state of a CI runner after `npm ci` — `npx tsc --noEmit` produced no output and exit 0. The validator that does this checking is real: .next/types/app/api/mobile/agents/[id]/route.ts defines `type RouteContext = { params: Promise<SegmentParams> }` and checks every exported HTTP method's second argument against it. File restored; `git status` clean. Backend has 65 route validators under .next/types/app/api/**.

**Why it matters**

A wrong `params` contract in any of the 65 /api/mobile/* handlers passes CI green and only blows up during the Railway Docker build (`Dockerfile.core:13 RUN npm run build`) — I confirmed `next build` does catch it (planted error produced `Failed to type check.` and `Next.js build worker exited with code: 1`). So the failure moves from a 60-second PR check to a failed production deploy of api.offmarketmatch.com.au. Worse, at runtime in Next 16 `params` really is a Promise, so a handler declaring it as a plain object reads `undefined` off it — a silent 500 rather than a crash, if it ever slipped past the build.

**Remediation**

Add `- run: npm run build` to OMM_BACKEND/.github/workflows/ci.yml after `npm run typecheck` (with the same fake Clerk env vars OMM_App's workflow uses at verify.yml:42-47), or change the `typecheck` script to `next build --no-lint` style gating. OMM_App already does this correctly (verify.yml:40-47) — copy that shape.

**Verifier correction**

OMM_BACKEND's CI (.github/workflows/ci.yml) runs only `npm ci` -> `npm run typecheck` -> `npm run test` with no build step. Because tsconfig.json's `include` pulls the Next route validators from the gitignored `.next/types/**` and `.next/dev/types/**`, those globs match zero files on a fresh checkout, so `tsc --noEmit` cannot see Next's route-handler contract checks (params shape, HTTP-handler signature, exported route config). I verified this: a wrong `params` type in app/api/mobile/agents/[id]/route.ts:23 fails `tsc --noEmit` with .next present (TS2344) and passes silently, exit 0, without it — even with the tsbuildinfo cache cleared. Ordinary type errors inside route bodies are still caught; only the generated contract checks are missed. The exposure is the 24 source routes under app/api with a dynamic [segment] (of 63 routes total, 59 of them under /api/mobile) — not 65. The failure is caught downstream: `next build` in Dockerfile.core:13 fails the image build ("Failed to type check", worker exit 1), and next.config.js sets no `typescript.ignoreBuildErrors`. So the consequence is a broken Railway build and a slow feedback loop, not a production outage — Railway does not promote a failed build, and api.offmarketmatch.com.au keeps serving the previous deployment. The "silent 500 at runtime" scenario is unreachable while the build-time type check stays enabled. Severity is medium: a real CI gap with a one-line fix (add `npx next typegen` — available in Next 16.2 without a full build — before `npm run typecheck`).

---

### [MEDIUM] OMM_BACKEND's `test` script is a hardcoded list of 10 file paths — any new test file is silently never run
*buildhealth · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

OMM_BACKEND/package.json:22 — `"test": "node --import ./scripts/test-preload.mjs --import tsx --test src/lib/api-cors.test.ts src/lib/clerk-user-sync-helpers.test.ts src/lib/cron-auth.test.ts src/lib/enrichment-internal-proxy-auth.test.ts src/lib/mobile-published-listings.test.ts src/lib/mobile-buyer-brief-match.test.ts src/lib/sync-clerk-phone.test.ts src/lib/propertydata/member-address-autocomplete.test.ts src/lib/propertydata/member-aspnet-form.test.ts src/lib/propertydata/member-soi-comparables-rank.test.ts"` — no glob, no discovery. `find OMM_BACKEND/src -name "*.test.ts"` returns exactly those 10 files, so the list is complete *today* by coincidence. `npm test` runs and passes: `tests 53 / pass 53 / fail 0`. This is the only test discovery mechanism — OMM_BACKEND/.github/workflows/ci.yml:20 runs `npm run test`.

**Why it matters**

The moment anyone adds an 11th test file and forgets to edit that string, the test exists, looks green in the editor, and never executes in CI — the same class of silent-no-op as the tsconfig baseUrl trap you just fixed. Nobody notices because the suite still reports 'pass'.

**Remediation**

Replace the file list with Node's built-in glob discovery: `node --import ./scripts/test-preload.mjs --import tsx --test "src/**/*.test.ts"` (Node 22 supports the glob form directly), or switch to vitest as OMM_Mobile already uses so the two repos share one runner.

**Verifier correction**

OMM_BACKEND's `test` script (package.json:22) enumerates 10 test file paths literally, with no glob or discovery mechanism, and CI (.github/workflows/ci.yml) invokes only `npm run typecheck` + `npm run test`. I empirically confirmed the failure mode: adding an 11th test file that always fails leaves `npm test` reporting 53/53 pass with exit 0 — the file is never executed. However, the new file IS still type-checked, because tsconfig.json includes `**/*.ts` under `strict: true` and CI runs `tsc --noEmit` first; so type errors and bad imports in a forgotten test still break CI, and only runtime assertion failures are silently skipped. Impact today is zero (all 10 files are listed, all 53 tests genuinely run, and all 6 historical test-adding commits correctly updated package.json). This is a latent maintenance hazard, not an active defect — medium, not high. Fix is one line, but note CI pins Node 20 while `node --test` glob support landed in a later Node, so the glob replacement must be verified on Node 20 or CI's Node version bumped.

---

### [MEDIUM] OMM_Mobile's `npm run verify` runs only half the test suite (63 of 129 tests)
*buildhealth · CONFIRMED · repos: OMM_Mobile*

**Evidence**

OMM_Mobile/package.json:38 — `"verify": "npm run typecheck && npm run test:auth && npm run verify:delete-guards && npm run verify:website"`. It calls `test:auth` (line 32, `vitest run tests/auth`), not `test` (line 31, `vitest run`). Measured: `npm run test:auth` -> `Test Files 7 passed (7) / Tests 63 passed (63)`. `npm test` -> `Test Files 13 passed (13) / Tests 129 passed (129)`. The 6 files verify skips are tests/au/soi-comparable-candidates (11), tests/au/soi-comparable-selection (19), tests/au/au-real-estate-terms (20), tests/listing-address-unit (6), tests/workspace/workspace-mode (6), tests/activities/activity-event-date (4).

**Why it matters**

`verify` is the ritual command a developer runs before pushing, and with no CI in this repo (see the critical finding) it is the *only* gate. It silently omits the SOI comparables selection logic and AU address/terms parsing — the domain logic most likely to regress and hardest to spot by eye.

**Remediation**

Change OMM_Mobile/package.json:38 to `npm run typecheck && npm run test && npm run verify:delete-guards && npm run verify:website`.

**Verifier correction**

OMM_Mobile's `npm run verify` executes 63 of the repo's 129 tests (7 of 13 files), because it calls `test:auth` (`vitest run tests/auth`) instead of `test` (`vitest run`). The 66 skipped tests cover live, imported domain logic — SOI comparable candidates/selection, AU real-estate terms, listing address/unit parsing, workspace mode, activity event dates (28 non-test importers across the 6 modules). With no .github/workflows, no git hooks, and a Railway build that only runs `npm run build:web`, nothing else executes them. Caveat: verify's `tsc --noEmit` does type-check those files (tsconfig includes `**/*.ts` and typecheck genuinely runs, exit 0), so type errors are still caught — only behavioural regressions slip through. Fix is a one-word change: `npm run test` in place of `npm run test:auth`.

---

### [MEDIUM] No ESLint in any of the three repos
*buildhealth · CONFIRMED · repos: OMM_App, OMM_BACKEND, OMM_Mobile*

**Evidence**

`find <repo> -maxdepth 3 -name ".eslintrc*" -o -maxdepth 3 -name "eslint.config.*"` (excluding node_modules) returns nothing for all three. No `lint` script exists in OMM_App/package.json, OMM_App/apps/web/package.json, OMM_BACKEND/package.json, or OMM_Mobile/package.json. Next 16 no longer runs lint during `next build`, so nothing lints at build time either.

**Why it matters**

tsc catches type errors but not the classes that actually bite a React Native + Next codebase: missing hook dependencies, conditional hooks, unhandled promises, unused awaits, `console.log` left in production paths, react-hooks/exhaustive-deps. On OMM_Mobile — 617 files, 264 of them components — this is the difference between deterministic renders and heisenbugs.

**Remediation**

Add `eslint-config-next` to the two Next repos and `eslint-config-expo` to OMM_Mobile, wire a `lint` script, and add it to each CI workflow. Start with `react-hooks/*` and `@typescript-eslint/no-floating-promises` as errors and everything else as warnings so it lands green.

**Verifier correction**

Confirmed: none of the three repos has any ESLint (or Biome/oxlint) configuration, dependency, installed binary, or lint script; no husky/git hooks; and OMM_Mobile has no CI at all (OMM_App and OMM_BACKEND CI runs typecheck + build/tests only). The Next 16 point is moot rather than load-bearing - with no config and no eslint installed, nothing would lint at build time either way.

The consequence is real but narrower and sharper than claimed. Running eslint-plugin-react-hooks over OMM_Mobile (585 files in app/, components/, lib/) yields 12 rules-of-hooks errors and 25 exhaustive-deps warnings; OMM_App and OMM_BACKEND are clean on hook rules. Eleven of the twelve rules-of-hooks errors are the benign `Platform.OS === 'web' && useX()` idiom - Platform.OS is constant per bundle, so hook order never actually changes. The twelfth is a genuine production crash: in app/(tabs)/index.tsx, HomeScreen calls useWebDesktopLayout() (line 1246), returns early when desktopWeb is true (1249), then calls usePullToRefresh/useCallback/useTabScreenBottomPad (1349-1359). Because useWebDesktopLayout is driven by a window resize listener (lib/use-web-viewport-size.ts), crossing the 768px breakpoint changes the hook count mid-lifecycle and throws "Rendered more hooks than during the previous render" - white-screening the Home tab on app.offmarketmatch.com.au on a browser resize.

Drop the console.log argument: OMM_Mobile source has exactly one console.log (33 console.* total) and OMM_BACKEND has 14. Instead, note that the codebase already carries 16 eslint-disable comments in OMM_Mobile (plus 2 each in the other repos) that ESLint reports as unused directives - developers are writing suppressions for a linter that has never run.

---

### [MEDIUM] The marketing site's Clerk webhook writes into the production `users` table using a TEST Clerk instance's identities
*config · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

OMM_App/apps/web/app/api/webhooks/clerk/route.ts:103-116 — `await db.insert(schema.users).values(values).onConflictDoUpdate({ target: schema.users.id, ... })`, and :63-66 `if (type === "user.deleted") { await db.delete(schema.users).where(eq(schema.users.id, data.id)); }`. Line 88-91 defaults `role` to `"AGENT"`.

website-frontend production vars: CLERK_SECRET_KEY=sk_test_wfKF…, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_a25vd24tZWxmLTIy… (known-elf-22.clerk.accounts.dev), CLERK_WEBHOOK_SECRET=whsec_[REDACTED] (set, so the endpoint is live), DATABASE_URL = the production Postgres (identical string to application-backend's).

The route never sets `ommRole`, and OMM_App's schema fork doesn't even have the column. OMM_BACKEND/src/lib/ensure-clerk-user-db.ts:105-133 then hydrates a missing `ommRole` by querying `schema.users` on normalised email and copying `ommRole`, `role`, `firm`, `agencyId`, `operatingStates`, `suburbs` from any matching row — then writes them onto the live Clerk user's unsafeMetadata (lines 142-158).

**Why it matters**

A Clerk *development* instance (`*.clerk.accounts.dev`) is open to anyone who finds the URL and has no domain binding. Every user.created event from it upserts a row into the live product's `users` table with `role='AGENT'` and `ommRole=NULL`, and every user.deleted hard-deletes by id. Worse, the backend's email-keyed recovery path treats those rows as a trust source: it copies role/firm/agency/suburbs from a same-email row into the live Clerk user's metadata. That converts "a stranger signed up on the marketing site's dev Clerk instance" into "a stranger's row can seed a real product account's workspace fields". NEXT_PUBLIC_WAITLIST_MODE=true does not gate this — the webhook is called by Clerk server-to-server and the route has no waitlist check.

**Remediation**

Delete OMM_App/apps/web/app/api/webhooks/clerk/route.ts and remove the endpoint from the known-elf-22 Clerk dashboard, or repoint it at a table the product does not read. Unset CLERK_WEBHOOK_SECRET and DATABASE_URL on website-frontend once the waitlist has its own store. Separately, restrict ensure-clerk-user-db.ts's email-based hydration to rows whose Clerk id belongs to the live instance.

**Verifier correction**

The marketing site (website-frontend) still exposes a live Clerk webhook at /api/webhooks/clerk that performs unrestricted INSERT/UPDATE and hard-DELETE on the production `users` table — the same Postgres the product uses (byte-identical DATABASE_URL) — while authenticating against a Clerk DEVELOPMENT instance (ins_3Cq3…, known-elf-22, sign-up mode "public", no allow/blocklist). The endpoint is confirmed deployed and its secret is set (live probe returns "Invalid signature", not the missing-secret 500). It is vestigial code from the deleted /app workspace (commit e31454d), it applies no work-email gate that the product enforces on every other write path, and it is in fact the product's ONLY deployed Clerk webhook receiver — OMM_BACKEND has none.

However, the claimed escalation is refuted. The backend's email-keyed recovery (ensure-clerk-user-db.ts:119-120) selects only rows with a non-empty `ommRole` and skips everything else; webhook-written rows always have ommRole NULL, so they are never a trust source and the unsafeMetadata write at 142-158 is unreachable from them. Nor can a stranger target a real user: the dev instance requires email_code verification at sign-up (`verify_at_sign_up: true`) plus CAPTCHA, so only self-owned mailboxes can be registered; a unique index on users.email would 23505 an exact collision anyway; `role` comes from public_metadata which clients cannot set, so it is always AGENT; the agent directory filters on ommRole = 'Buyer Agent' so these rows never surface; live-instance delete events cannot reach this route (different signing secret); and Clerk reports total_count 0 users on the test instance, so no row has ever been written.

The sharper unnoticed risk is clerk-user-sync.ts:166-177, which on any same-normalized-email row with a different id calls migrateClerkUserPrimaryKey — tombstoning and re-keying the row onto the live Clerk id and repointing listings/briefs/threads FKs, with no ommRole requirement. That is the real bridge between the two instances, though it too requires control of the email.

Correct severity: MEDIUM. Real remediation is to delete the vestigial route and rotate whsec_Twuk…, plus drop DATABASE_URL from website-frontend so a marketing service no longer holds write access to the product's user table — not incident response for an active compromise.

---

### [MEDIUM] Universal Links and Android App Links are dead in production — verification files are empty on the live domain
*config · PARTIALLY_CONFIRMED · repos: OMM_Mobile*

**Evidence**

Live probe:
  curl https://app.offmarketmatch.com.au/.well-known/apple-app-site-association → HTTP 200 `{"applinks":{"apps":[],"details":[]}}`
  curl https://app.offmarketmatch.com.au/.well-known/assetlinks.json → HTTP 200 `[]`

OMM_Mobile/lib/universal-link-config.js:48-59 — `const teamId = (env.APPLE_TEAM_ID ?? env.EXPO_APPLE_TEAM_ID ?? '').trim(); const appId = teamId ? … : null; const details = appId ? [...] : [];`
:76-87 — `const raw = env.ANDROID_APP_LINK_SHA256 ?? env.ANDROID_APP_LINK_SHA256_FINGERPRINTS ?? ''; … if (!fingerprints.length) return [];`

Neither APPLE_TEAM_ID, EXPO_APPLE_TEAM_ID, ANDROID_APP_LINK_SHA256 nor IOS_BUNDLE_IDENTIFIER appears in `railway variables --service application-frontend --environment production --json` (full dump inspected).

The values exist elsewhere: eas.json:45-46 `"appleTeamId": "9VB3P2H367"`, app.json:25 `"bundleIdentifier": "com.appify.omm"`, app.json:45 `"package": "com.offmarketmatch.app"`. Note universal-link-config.js:6 `DEFAULT_IOS_BUNDLE_ID = 'com.appify.omm'` matches app.json, so only the team id and the Android fingerprint are actually missing.

**Why it matters**

Apple and Google fetch these two files to decide whether a domain may open the app. Empty `details` / `[]` means iOS and Android will never hand app.offmarketmatch.com.au links to the installed app — every deep link, email link, SMS link and share link opens the browser instead. `webcredentials` is also absent (universal-link-config.js:70), so iOS Password AutoFill for the app is off too. The build script even prints the warning (`scripts/generate-well-known.mjs:40-42` — "needs APPLE_TEAM_ID on build host" / "needs ANDROID_APP_LINK_SHA256 on build host") and nothing fails, so it has shipped green.

**Remediation**

Set on Railway application-frontend (production and staging): APPLE_TEAM_ID=9VB3P2H367, and ANDROID_APP_LINK_SHA256 to the SHA-256 fingerprint of the Play App Signing cert (`eas credentials -p android`). Re-deploy and re-verify both URLs return non-empty bodies. Make scripts/generate-well-known.mjs exit non-zero when `process.env.RAILWAY_ENVIRONMENT_NAME === 'production'` and either value is missing.

**Verifier correction**

Universal Links and Android App Links are misconfigured and will ship broken: app.offmarketmatch.com.au serves HTTP 200 but empty verification files ({"applinks":{"apps":[],"details":[]}} and []), because OMM_Mobile/lib/universal-link-config.js:47-99 emits empty details/[] when APPLE_TEAM_ID and ANDROID_APP_LINK_SHA256 are unset, and neither exists among the 28 production vars on the Railway application-frontend service. webcredentials and activitycontinuation are gated on the same missing team id, so iOS Password AutoFill for the app is also off. scripts/generate-well-known.mjs only warns and exits 0, and npm run verify calls build:web, so this passes CI green. There is no mitigation: public/.well-known/ is gitignored, the dist copy is empty, and metro dev + scripts/serve-web-production.js:140 share the same empty builder.

However the impact is prospective, not live: no native app is published (App Store id6795010476 -> 404, iTunes lookup resultCount 0, Play com.offmarketmatch.app -> 404, no ios/ or android/ dirs), so today essentially no device has the app installed and nothing is actually degraded for users. Clerk/OAuth is also unaffected — SSO handover uses the omm:// custom scheme, explicitly handled at lib/universal-link-navigation.ts:39-51. This is a store-launch blocker, severity medium, not a live production outage.

One additional, unreported risk makes the fix bigger than described: eas.json's production build profile does not set EXPO_PUBLIC_WEB_ORIGIN (only the development profile does, eas.json:18), and app.config.js:44 derives associatedDomains from getWebOrigin(), which falls back to DEFAULT_WEB_ORIGIN = 'https://application-frontend-production-de79.up.railway.app' (universal-link-config.js:3-4). Unless an EAS project-level env var supplies it — unverifiable here without an Expo login — the production binary will declare the wrong host, so setting APPLE_TEAM_ID and ANDROID_APP_LINK_SHA256 on Railway alone would still leave app.offmarketmatch.com.au links broken.

---

### [MEDIUM] eas.json's production build profile ships no EXPO_PUBLIC_* vars — the App Store / Play binary likely has no API origin and no Clerk key
*config · PARTIALLY_CONFIRMED · repos: OMM_Mobile*

**Evidence**

OMM_Mobile/eas.json:28-40 — the `production` profile's `env` block contains only `{ "SENTRY_ALLOW_FAILURE": "true" }`. The `development` profile (:17-22) by contrast sets EXPO_PUBLIC_USE_LOCAL_BACKEND, EXPO_PUBLIC_MOBILE_API_ORIGIN, EXPO_PUBLIC_API_URL and EXPO_PUBLIC_WEB_ORIGIN. Neither profile sets EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.

OMM_Mobile/.env holds the values but .gitignore:28-29 lists `.env` / `.env.*`, and there is no .easignore (`ls -la .easignore` → No such file), so EAS excludes it from the upload.

OMM_Mobile/lib/resolve-expo-api-origin.ts:107-111 — `if (!configured && __DEV__) { return … } ; if (!configured) return null;` → in a production build with neither var set the origin is **null**. lib/mobile-api-config.ts:15-17 `isMobileApiConfigured()` then returns false.

OMM_Mobile/lib/universal-link-config.js:3-4 `DEFAULT_WEB_ORIGIN = 'https://application-frontend-production-de79.up.railway.app'` and app.json:79-82 bakes `extra.router.origin` to that same raw Railway domain — so with EXPO_PUBLIC_WEB_ORIGIN unset, app.config.js:44/48 emits `associatedDomains: ['applinks:application-frontend-production-de79.up.railway.app']` and Android intent filters for that host rather than app.offmarketmatch.com.au.

**Why it matters**

If the EAS project does not supply these through dashboard-level environment variables, the shipped native app has no backend to call, no Clerk publishable key to initialise auth, and universal links bound to a disposable Railway subdomain — i.e. a store binary that cannot log in or load data, discovered only after review. Even if EAS dashboard vars do cover it today, the config is split across three sources (eas.json, the EAS dashboard, a gitignored .env) with no single reviewable source of truth.

**Remediation**

Run `eas login && eas env:list --environment production` to confirm what the production profile actually resolves (I could not: the CLI reported "An Expo user account is required to proceed"). Whatever the answer, pin EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY, EXPO_PUBLIC_MOBILE_API_ORIGIN, EXPO_PUBLIC_API_URL and EXPO_PUBLIC_WEB_ORIGIN explicitly in eas.json's production profile, and change universal-link-config.js:3 DEFAULT_WEB_ORIGIN to https://app.offmarketmatch.com.au (or make it throw when unset in production) so the Railway subdomain can never be baked into a binary.

**Verifier correction**

eas.json's `production` profile intentionally carries no EXPO_PUBLIC_* vars because EAS CLI >= 16 auto-resolves a store-distribution profile to the dashboard's **production** environment, and docs/TESTFLIGHT.md:66-76 documents the five vars that must live there — so the store binary is almost certainly configured, and a missing Clerk key would hard-crash at launch (app/_layout.tsx:65-73 throws at module scope), not slip through to App Review. The real, verified issue is twofold: (a) production config for the store build is split across three unreviewable sources (eas.json, the EAS dashboard, a gitignored .env) with only a docs table tying them together and no CI check, so drift between the mobile binary and Railway's application-frontend is silent; and (b) lib/universal-link-config.js:3-4 and app.json:79-82 hardcode the disposable Railway subdomain as the fallback web origin, so any build where EXPO_PUBLIC_WEB_ORIGIN is absent silently ships associatedDomains/intent filters for `application-frontend-production-de79.up.railway.app` instead of app.offmarketmatch.com.au. Separately and independently confirmed: universal links are already dead on all hosts — both app.offmarketmatch.com.au and the Railway domain serve `{"applinks":{"apps":[],"details":[]}}` and `[]`, because APPLE_TEAM_ID and ANDROID_APP_LINK_SHA256 are unset on the web service. Fixes: add `"environment": "production"` explicitly to the profile to remove the inference dependency, change the hardcoded DEFAULT_WEB_ORIGIN to app.offmarketmatch.com.au (or make it throw rather than default), and set the Apple team ID / Android SHA-256 fingerprints so the association files stop being empty.

---

### [MEDIUM] All persisted listing-media and message-attachment URLs are built on the raw Railway domain, not api.offmarketmatch.com.au — and staging points at the production domain
*config · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

application-backend production: MOBILE_API_PUBLIC_ORIGIN=https://ommbackend-production.up.railway.app and LISTING_MEDIA_PUBLIC_ORIGIN=https://ommbackend-production.up.railway.app, while RAILWAY_PUBLIC_DOMAIN=api.offmarketmatch.com.au.

OMM_BACKEND/src/lib/listing-media-url.ts:9-23 `canonicalListingMediaPublicOrigin()` returns LISTING_MEDIA_PUBLIC_ORIGIN first; :47-67 `normalizeListingMediaUrlForStorage()` **persists** that origin into the row (`return `${origin}/api/mobile/listing-media/${fileName}``). src/lib/message-attachment-url.ts:11 does the same via MOBILE_API_PUBLIC_ORIGIN.

application-backend **staging** carries the identical values: MOBILE_API_PUBLIC_ORIGIN / LISTING_MEDIA_PUBLIC_ORIGIN = https://ommbackend-production.up.railway.app — while staging's bucket is `application-imagery-gkky7x` and production's is `resilient-barrel-hm-pmcuh`, and staging has its own volume-backed Postgres.

Both domains are live and identical: curl https://api.offmarketmatch.com.au/api/mobile/health/live and https://ommbackend-production.up.railway.app/api/mobile/health/live both → HTTP 200 {"ok":true,"live":true}.

**Why it matters**

Two bites. (1) Production media URLs are written into the database on an auto-generated Railway service domain — the exact domain type that changes when a service is recreated, renamed, or moved. The custom domain exists and is unused; the day the generated domain goes, every stored image and attachment URL already in Postgres 404s, and they are persisted, not computed at read time, so there is no quick fix. (2) Staging writes media rows pointing at the PRODUCTION backend, which serves from a different bucket and volume — every staging upload is immediately a broken link, making staging useless for validating the media path before launch.

**Remediation**

Set MOBILE_API_PUBLIC_ORIGIN and LISTING_MEDIA_PUBLIC_ORIGIN to https://api.offmarketmatch.com.au on production, and to https://application-backend-staging-a339.up.railway.app on staging. Then backfill existing rows (scripts/backfill-listing-media-to-bucket.mjs:40-41 already reads the same vars) to rewrite the persisted `ommbackend-production.up.railway.app` prefix.

**Verifier correction**

application-backend persists listing-media and message-attachment URLs on the auto-generated Railway domain (https://ommbackend-production.up.railway.app) instead of the ACTIVE custom domain api.offmarketmatch.com.au, because LISTING_MEDIA_PUBLIC_ORIGIN and MOBILE_API_PUBLIC_ORIGIN explicitly override a fallback chain that would otherwise resolve correctly via RAILWAY_PUBLIC_DOMAIN. Confirmed persisted (not read-time computed) at OMM_BACKEND/src/db/queries.ts:2272 and :3038 for listing_media.url, and via app/api/mobile/messages/[id]/route.ts:88-90 → queries.ts:2681 for message_attachments.url. Blast radius is narrower than claimed: OMM_Mobile/lib/resolve-listing-media-url.ts already rewrites listing-media paths to the client's own API base on Platform.OS === 'web', so app.offmarketmatch.com.au is immune for listing media; exposure is native iOS/Android for listing media, and ALL platforms for message attachments (lib/message-attachment-open.ts passes absolute hrefs through unchanged). "No quick fix" is wrong — OMM_BACKEND/scripts/backfill-listing-media-to-bucket.mjs already performs exactly the required UPDATE listing_media SET url rewrite from the same origin resolver; only message_attachments.url would need an added one-liner. Staging does carry the same two vars pointing at the production Railway domain while owning a separate bucket, Postgres and Redis, but the "every staging upload is a broken link" consequence is not reachable through the deployed stack: staging's application-frontend sets EXPO_PUBLIC_API_URL and EXPO_PUBLIC_MOBILE_API_ORIGIN to https://api.offmarketmatch.com.au, so the staging app talks to the production backend for everything — and is separately dead anyway (pk_test frontend vs pk_live backend, plus src/lib/api-cors.ts 403ing all *.up.railway.app browser origins). Severity medium, not high: no live breakage, no security impact, remediation is two env-var changes plus a one-shot SQL rewrite.

---

### [MEDIUM] Staging is wired to production: staging frontends call the production API, on a THIRD Clerk instance, and are CORS-blocked doing it
*config · CONFIRMED · repos: OMM_App, OMM_Mobile, OMM_BACKEND*

**Evidence**

`railway variables --service application-frontend --environment staging --json`:
  EXPO_PUBLIC_API_URL=https://api.offmarketmatch.com.au
  EXPO_PUBLIC_MOBILE_API_ORIGIN=https://api.offmarketmatch.com.au
  EXPO_PUBLIC_WEB_ORIGIN=https://app.offmarketmatch.com.au
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_b3JnYW5pYy1tb3NxdWl0by02NC5jbGVyay5hY2NvdW50cy5kZXYk  → organic-mosquito-64.clerk.accounts.dev
staging website-frontend: NEXT_PUBLIC_BACKEND_URL=https://ommbackend-production.up.railway.app, CLERK pk_test_a25vd24tZWxmLTIy… → known-elf-22.clerk.accounts.dev

That is three distinct Clerk instances, not two: known-elf-22 (marketing, both envs), clerk.offmarketmatch.com.au (production product), organic-mosquito-64 (staging product).

Live CORS probe against the production API (`/api/mobile/health/live`):
  Origin: https://application-frontend-staging.up.railway.app → HTTP 403
  Origin: https://app.offmarketmatch.com.au                   → HTTP 200
  Origin: https://www.offmarketmatch.com.au                   → HTTP 403
  Origin: https://ommbackend-production.up.railway.app        → HTTP 403

Cause: OMM_BACKEND/src/lib/api-cors.ts:4-10 DEFAULT_ALLOWED_ORIGINS lists only app.offmarketmatch.com.au + localhost, :24-31 `isRailwayAppOrigin` hard-403s any `*.up.railway.app`, and ALLOWED_CORS_ORIGINS is unset on application-backend in both environments so the defaults apply.

**Why it matters**

Staging never exercises staging. Its frontend is aimed at the production backend, so any test that writes touches live data — except it cannot, because production 403s the staging Railway origin, so staging web is simply broken. Meanwhile staging's own backend (application-backend-staging-a339, which has its own Postgres, Redis and bucket) receives no traffic from staging's own frontend. The result is an environment that neither protects production nor validates anything, discovered at the moment you need it. The staging Clerk key also cannot authenticate against production's sk_live instance even if CORS allowed it.

**Remediation**

Point staging at staging: set EXPO_PUBLIC_API_URL / EXPO_PUBLIC_MOBILE_API_ORIGIN=https://application-backend-staging-a339.up.railway.app and EXPO_PUBLIC_WEB_ORIGIN to the staging frontend domain; set staging website-frontend's NEXT_PUBLIC_BACKEND_URL likewise. Because api-cors.ts blocks all `*.up.railway.app` origins, staging also needs ALLOWED_CORS_ORIGINS set explicitly on application-backend@staging — or, better, give staging real subdomains (staging-app / staging-api .offmarketmatch.com.au) so the origin allowlist works the same way it does in production.

**Verifier correction**

Staging's product frontend is configured against production and is completely non-functional on web as a result. application-frontend (staging) ships EXPO_PUBLIC_API_URL and EXPO_PUBLIC_MOBILE_API_ORIGIN = https://api.offmarketmatch.com.au with a third Clerk instance (pk_test organic-mosquito-64.clerk.accounts.dev) — both verified baked into the live bundle at /_expo/static/js/web/entry-6f0b52ede50c515f01fee3fd1aec5721.js, not merely set as env vars. OMM_Mobile/lib/api.ts via lib/resolve-expo-api-origin.ts builds absolute API URLs, so the browser makes genuine cross-origin calls that OMM_BACKEND/src/lib/api-cors.ts (invoked at OMM_BACKEND/proxy.ts:10) rejects with 403 — isRailwayAppOrigin (lines 24-31) hard-blocks all *.up.railway.app before the allowlist, and ALLOWED_CORS_ORIGINS is unset on application-backend in both environments so DEFAULT_ALLOWED_ORIGINS (lines 4-10) applies. Preflight OPTIONS also 403s, so every authenticated call fails.

Three corrections to the original framing:

(1) The impact is broken staging, not endangered production. Staging Postgres and Redis have distinct credentials from production, CORS blocks reads as well as writes, and the staging Clerk tokens cannot authenticate against sk_live. No production data is reachable or corruptible from staging web. The cost is that staging validates nothing and this is discovered only when someone tries to use it.

(2) The fix is deeper than repointing a URL. application-backend-staging-a339.up.railway.app also 403s the staging frontend origin (verified live), because isRailwayAppOrigin is unconditional and the staging frontend has no custom domain. Fixing this requires one of: set ALLOWED_CORS_ORIGINS and relax the *.up.railway.app block, attach a custom domain to staging, or — cleanest — make the web client issue relative /api/mobile/* paths so it uses the same-origin proxy that OMM_Mobile/scripts/serve-web-production.js and lib/metro-backend-proxy.js already implement and that the absolute-URL resolver currently bypasses.

(3) Scope is web-only. Native iOS/Android send no Origin header, so maybeHandleApiCors returns null and they are unaffected.

Additional unreported misconfiguration in the same direction: staging application-backend sets MOBILE_API_PUBLIC_ORIGIN and LISTING_MEDIA_PUBLIC_ORIGIN to https://ommbackend-production.up.railway.app.

---

### [MEDIUM] Production Postgres superuser credentials and the shared Resend key are deployed to application-frontend, which never reads either
*config · PARTIALLY_CONFIRMED · repos: OMM_Mobile*

**Evidence**

`railway variables --service application-frontend --environment production --json` includes DATABASE_URL=postgresql://postgres:[REDACTED]@postgres.railway.internal:5432/railway and RESEND_API_KEY=re_[REDACTED]_3gffNb4kxfzBCqvNF2rcc4jL (and WAITLIST_FROM_EMAIL). Staging has the same shape.

`grep -rn "DATABASE_URL\|RESEND_API_KEY" OMM_Mobile/{lib,app,components,scripts}` returns only comment/diagnostic *strings* — e.g. lib/mobile-database-context.tsx:84 "API is up but DATABASE_URL is missing on OMM_BACKEND…", lib/mobile-published-listings-pdf.ts:29. There is no `process.env.DATABASE_URL` or `process.env.RESEND_API_KEY` read anywhere in the repo.

The same RESEND_API_KEY value is on website-frontend, application-frontend and application-backend, in BOTH production and staging — one key, five service instances, two environments.

**Why it matters**

application-frontend is the Expo web host (scripts/serve-web-production.js) — the most internet-exposed process in the project and the one that also proxies /api/mobile/* traffic. Handing it the production Postgres superuser DSN buys nothing and means any RCE, dependency compromise, or env-dumping bug there is an immediate full-database compromise rather than a static-file incident. The single shared Resend key means a staging leak sends mail as production, and rotating it takes down five service instances at once.

**Remediation**

Delete DATABASE_URL, RESEND_API_KEY and WAITLIST_FROM_EMAIL from application-frontend in both environments (verified unused). Issue per-service Resend keys. Give application-backend a scoped Postgres role rather than `postgres`.

**Verifier correction**

The production Postgres DSN (postgresql://postgres:[REDACTED]@postgres.railway.internal:5432/railway) and the Resend API key are deployed to Railway service application-frontend (OMM_Mobile), which reads neither — verified by full-repo grep showing zero `process.env.DATABASE_URL` / `process.env.RESEND_API_KEY` reads and by reading the entire web-host runtime path (scripts/serve-web-production.js, lib/metro-backend-proxy.js, lib/universal-link-config.js), which consumes only PORT, EXPO_PUBLIC_*, and the Apple/Android universal-link vars. The repo's own docs/RAILWAY_DEPLOY.md:35 explicitly instructs removing DATABASE_URL from this service, so this is a documented-policy violation. The same production DSN is additionally on website-frontend, making this a project-wide DSN spray rather than an application-frontend-only issue.

Corrections to the original framing: (a) the shared Resend key re_[REDACTED]... is on SIX service instances, not five — website-frontend, application-frontend and application-backend in both production and staging; (b) rotating it would break FOUR real consumers, not five — only OMM_App/apps/web/src/lib/email.ts and OMM_BACKEND/src/lib/support-email.ts actually read it, and the two application-frontend copies are inert; (c) staging does NOT share the production database — staging's DATABASE_URL has a different password against a separate Postgres, so cross-environment sharing applies only to the Resend key (a staging leak can send mail as production, but cannot reach the production database).

There is no client-side exposure: the live bundle at app.offmarketmatch.com.au contains neither secret, Expo inlines only EXPO_PUBLIC_* vars, and no env-dumping endpoint exists on the web host. The risk is strictly blast-radius amplification — any RCE, dependency compromise, or env-disclosure bug in the most internet-exposed process in the project escalates from a static-file incident to full production database compromise for zero functional benefit. "Superuser" is inferred from `postgres` being Railway's default owner role; not verified via SQL.

---

### [MEDIUM] Build config contradictions: duplicated builder files, a dead Node pin, and three Dockerfiles no service uses
*config · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_Mobile, OMM_BACKEND*

**Evidence**

OMM_App ships BOTH railway.json (builder RAILPACK, buildCommand `npm run build:website`, startCommand `npm run start:website`) and railpack.json (same build + start commands again). Railway's resolved manifest shows `configFile: /railway.json` and railpack.json's steps are redundant.

OMM_Mobile ships nixpacks.toml pinning `nixPkgs = ["nodejs_20"]` (line 4) while railway.json sets `"builder": "RAILPACK"`. Railway's deployed manifest for application-frontend confirms `builder: RAILPACK`, `railpackInfo.resolvedPackages.node.resolvedVersion = 22.23.2` — the nixpacks file, and its Node 20 pin, is inert. Its own line 15 comment ("when Dockerfile is present, Railway uses Docker instead of this file") is also wrong about why.

OMM_BACKEND/railway.toml:1-2 comment: "application-enrichment must override Dockerfile path to Dockerfile.enrichment in Railway → Settings → Build." But application-enrichment (production and staging) deploys from repo `appify-global/OMM_ENRICHMENT@main` with `dockerfilePath: Dockerfile` and healthcheck `/api/mobile/health` — a different repo entirely. OMM_BACKEND/Dockerfile, Dockerfile.enrichment and Dockerfile.imagery are referenced by no service in either environment (only Dockerfile.core is).

Dockerfile.core:6 `ENV PORT=3102` / :17 `EXPOSE 3102` while the api.offmarketmatch.com.au domain targets port 8080 and works (HTTP 200) — Railway's injected PORT wins, so the Dockerfile's pin is decorative and misleading.

Also: application-backend@staging's last deploy is from branch `claude/signup-property-listing-ui-eji88v`, not main. And TEST_REDIS_SETUP=1 is set on production application-backend with zero references anywhere in src/, app/ or scripts/.

**Why it matters**

None of these break a deploy today, but each is a trap for the next person: editing railpack.json or nixpacks.toml changes nothing and the change appears to have been made; following railway.toml's comment sends you to the wrong repo; the Node 20 pin implies a runtime guarantee that isn't there (it's 22.23.2); the unused Dockerfiles invite edits to files nothing builds. Staging's backend running an abandoned feature branch means staging isn't testing main.

**Remediation**

Delete OMM_App/railpack.json, OMM_Mobile/nixpacks.toml, and OMM_BACKEND/Dockerfile + Dockerfile.enrichment + Dockerfile.imagery. Fix the railway.toml header comment to say enrichment lives in OMM_ENRICHMENT. Drop `ENV PORT`/`EXPOSE` from Dockerfile.core or set them to 8080. Redeploy application-backend@staging from main. Remove TEST_REDIS_SETUP.

**Verifier correction**

Build-config cruft across all three repos — every stated fact verified, but "contradictions" overstates one item and the severity is mixed, not uniformly low.

Confirmed as low-severity documentation traps (zero runtime impact; all three prod domains return HTTP 200):
- OMM_App ships both railway.json and railpack.json with IDENTICAL build/start commands. This is redundancy, not contradiction — but railway.json wins (`configFile: /railway.json` in both envs), so editing railpack.json is a silent no-op.
- OMM_Mobile/nixpacks.toml:4 pins `nodejs_20` while builder is RAILPACK and the deployed runtime is Node 22.23.2 (sourced from .node-version=22). The file is entirely unread — `nixpacksConfigPath: null`, `nixpacksProviders: []`. Its line-15 comment is wrong twice: there is no Dockerfile in OMM_Mobile at all, and the reason it's inert is builder=RAILPACK. It is leftover from the reverted Dockerfile experiment (commits 5279491 → 713daca).
- OMM_BACKEND/railway.toml:1-2 tells you to override application-enrichment's dockerfilePath, but that service deploys from appify-global/OMM_ENRICHMENT with its own railway.toml, `dockerfilePath: Dockerfile`, healthcheck `/api/mobile/health` — a different repo, in both environments.
- OMM_BACKEND/Dockerfile, Dockerfile.enrichment and Dockerfile.imagery are used by no service in either environment; only Dockerfile.core is. Caveat: Dockerfile.enrichment is the likely ancestor of OMM_ENRICHMENT's live Dockerfile (same start-enrichment-production.sh entrypoint), and Dockerfile.imagery can never have a consumer — application-imagery is a storage bucket, not a service.
- Dockerfile.core:6/:17 pin PORT/EXPOSE 3102 while the api domain routes to targetPort 8080 and works. Railway's injected PORT wins; the app honors it correctly via `${PORT:-3102}`. Confirmed by control case: application-frontend sets PORT=8081 explicitly and its targetPort is 8081.
- TEST_REDIS_SETUP=1 has zero references in any of the three repos — and it is set on BOTH production and staging application-backend, not just production.

Should be split out as a separate MEDIUM finding (not build config, and worse than described):
- application-backend@staging's last deploy is branch `claude/signup-property-listing-ui-eji88v` from 2026-08-04, which is 0 commits ahead and 8 commits BEHIND main — a fully merged, abandoned branch. Staging's API has not tracked main for days, so staging validates nothing. Staging is also internally inconsistent: application-frontend@staging tracks branch `staging`, website-frontend@staging tracks `main`, backend tracks the dead claude/ branch.

---

### [MEDIUM] The public marketing site serves fabricated listings, agents and suburb medians as real content
*drift · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

`/Users/mennanyelkenci/Desktop/OMM_App/apps/web/app/lib/api.ts:63-241` hard-codes `MOCK_LISTINGS` and `MOCK_SUBURBS`: invented addresses and agents (`"502 Glenferrie Rd", suburb "Hawthorn", priceGuide "$4.8m – 5.2m", agent "Harriet Rowe", agency "Rowe & Partners"`), and invented market data (`{ name: "Toorak", median: "$5.85m", twelveMonth: "+9.2%", activeListings: 6 }`).
`api.ts:356-358` — `const base = process.env.NEXT_PUBLIC_API_BASE; if (!base) return mock;`
`NEXT_PUBLIC_API_BASE` does not appear in the `website-frontend` production variable list (railway variables output), so the mock branch is what production serves.
`HomePageContent.tsx:8-12` calls `fetchFeaturedListingsForSuburb(geo.suburbFilter, 3)` on the homepage; `FindNearbyListings.tsx:46-73` renders them under the headings `"Private listings"` / `"Properties near {suburbLabel}"` with `aria-label={"${item.tag} in ${item.suburb}, ${item.state}, ${item.priceGuide} - address available to members"}`.
Meanwhile the real listings live only in OMM_BACKEND (`app/api/mobile/published-listings/route.ts`), which the website never calls — `NEXT_PUBLIC_BACKEND_URL` is set on `website-frontend` (`https://ommbackend-production.up.railway.app`) but grep across OMM_App returns zero references to it.

**Why it matters**

www.offmarketmatch.com.au publishes invented price guides and suburb medians as if they were live off-market stock. The product's own Terms (`OMM_Mobile/lib/legal-docs.ts:68`) forbid exactly this — "underquote or misrepresent likely selling prices, price ranges, or buyer interest" — and cite the Sale of Land Act 1962 (Vic) anti-underquoting provisions and the Australian Consumer Law. At launch this is the first thing a regulator or a competitor's lawyer sees, and the named agencies are fictitious in a market where they might not be.

**Remediation**

Either wire `FindNearbyListings` to `GET /api/mobile/published-listings` on OMM_BACKEND, or replace the section with clearly-labelled illustrative placeholders ("example listing") until there is real stock. Delete `MOCK_SUBURBS` medians outright — fabricated market statistics have no safe presentation.

**Verifier correction**

The public marketing site serves three fabricated property listings as apparently-real off-market stock. `OMM_App/apps/web/app/lib/api.ts:356-358` returns `MOCK_LISTINGS` unconditionally because `NEXT_PUBLIC_API_BASE` is absent from the `website-frontend` production variables (verified via railway CLI), and no real path exists anyway — `swrOrMock` requests `/listings` and `/suburbs`, which OMM_BACKEND does not expose (it has only `app/api/mobile/published-listings` etc.). `HomePageContent.tsx:9` and `AuthRouteShell.tsx:18` render them on the homepage and behind /sign-in and /sign-up. Confirmed live on https://www.offmarketmatch.com.au: invented price guides ($4.8m – 5.2m, $3.6m – 3.9m, On application), invented specs and land sizes, invented status tags ("Private campaign", "Matched buyers", "Quiet listing"), Unsplash stock photography, under the heading "Private listings / Properties near {IP-geolocated suburb}", with no disclaimer anywhere on the page.

However, the claim's other three limbs do not hold. Agent and agency names (`Harriet Rowe`, `Rowe & Partners`) and street addresses are never rendered — `FindNearbyListings.tsx:54-86` reads only tag/suburb/state/priceGuide/bed/bath/car/land/image and explicitly withholds the address behind "Address on request"; grep for "Rowe" in the live HTML returns zero. The fabricated suburb medians are also never published: `MOCK_SUBURBS` has a single consumer, `geo.ts:118-121`, which uses `s.name` only, so `median`, `twelveMonth` and `activeListings` are unreachable dead fields (zero "median" in the live HTML). `MOCK_BRIEFS` and `MOCK_POSTS` have no fetcher at all.

The regulatory hook is Australian Consumer Law misleading-conduct rather than Sale of Land Act 1962 (Vic) anti-underquoting, which bites on price statements about real properties actually offered for sale. It does still conflict with the product's own Terms (`OMM_Mobile/lib/legal-docs.ts:68`, repeated at `:174`). Real but bounded — the fix is removing one component's data source.

---

### [MEDIUM] Work-email policy is duplicated in two repos and enforced in neither of the places the third repo collects emails
*drift · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND, OMM_Mobile*

**Evidence**

`OMM_BACKEND/src/lib/work-email.ts` and `OMM_Mobile/lib/work-email.ts` are a copy-paste pair (backend header line 2: "Work-email policy (must match OMM_Mobile `lib/work-email.ts`)"). The 24-entry `BLOCKED_CONSUMER_DOMAINS` sets are element-for-element identical today (gmail.com … iinet.net.au) — diff shows only quote style, plus a mobile-only `workEmailValidationMessageFromOAuth`. Backend enforces it in the Clerk webhook: `OMM_BACKEND/app/api/webhooks/clerk/route.ts:19` imports `isPermittedWorkEmail`.
The marketing site's waitlist has no such rule — `OMM_App/apps/web/app/api/waitlist/route.ts:24`:
```ts
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
```
and line 73 accepts anything matching that shape. The form (`WaitlistModal.tsx`) only hints at it via a placeholder `"you@agency.com.au"`.

**Why it matters**

An agent joins the waitlist with a gmail.com address, gets the thank-you email (`waitlistThankYouEmail`), is later invited — and is then rejected at product sign-up with "Use your agency or corporate work email. Personal and webmail addresses are not accepted." The invite list and the sign-up gate disagree by construction, and there are now three copies of the domain blocklist that must be edited together to stay in sync.

**Remediation**

Extract the blocklist to one place the API owns and expose it (e.g. `GET /api/mobile/work-email-policy` or a published package), or at minimum import the same module in the waitlist route so the website rejects webmail at submission time with the identical copy.

**Verifier correction**

Work-email policy is duplicated across TWO repos (not three) and is absent from the marketing site's one live email-collection endpoint.

OMM_BACKEND/src/lib/work-email.ts and OMM_Mobile/lib/work-email.ts hold byte-equivalent 24-domain BLOCKED_CONSUMER_DOMAINS sets (identical content AND order; only quote style differs, plus a mobile-only workEmailValidationMessageFromOAuth). They are kept in sync only by a comment at OMM_BACKEND/src/lib/work-email.ts:2. Backend enforces at three sites (app/api/webhooks/clerk/route.ts:85, src/lib/ensure-clerk-user-db.ts:64, src/lib/clerk-user-sync.ts:164 -- the last explicitly labelled defense in depth); mobile enforces on sign-up, sign-in, forgot-password and native OAuth.

OMM_App has NO copy of the blocklist -- there are two copies, not three. Its waitlist endpoint (OMM_App/apps/web/app/api/waitlist/route.ts:24,73) validates email shape only, so gmail.com is accepted and receives waitlistThankYouEmail. This endpoint is live: NEXT_PUBLIC_WAITLIST_MODE=true on the production website-frontend service, and it writes to the same shared Postgres as the backend. The form only hints at the policy via the WaitlistModal.tsx:191 placeholder "you@agency.com.au".

The other two "collection points" are not live: OMM_App/apps/web/app/api/notify/route.ts has zero callers and merely console.info's the address without persisting it, and ApplyModal.tsx's email field is never submitted (line 133 "TODO: wire to /api/apply once the endpoint exists") and only renders when waitlist mode is off.

The claimed harm is real but manual, not automated: no code in any repo reads waitlist_applications, and the INVITED value of waitlist_status (OMM_App/apps/web/src/db/schema.ts:111) is unused, so whoever runs invitations by hand can invite an address the product will then reject with "Use your agency or corporate work email." There is no security exposure -- the backend's three-layer check prevents a personal-domain account from ever being persisted. Severity: medium.

---

### [MEDIUM] Seven different product names across the three repos, including a legal-entity mismatch and the wrong brand printed on generated Statements of Information
*drift · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND, OMM_Mobile*

**Evidence**

There is no shared brand constant anywhere; every surface hard-codes its own string.
- Marketing site → **MATCH**: `OMM_App/apps/web/app/layout.tsx:9` `title: "MATCH - The off-market network for agents"`; `SiteHeader.tsx:22` `aria-label="MATCH home"`; `HeroFind.tsx:289` `<span className="hero-find__wordmark-text">MATCH</span>`; `WaitlistModal.tsx:156` "Join the MATCH waitlist."
- Marketing footer → **Off the Market Match Pty Ltd**: `SiteFooter.tsx:11` `© {year} Off the Market Match Pty Ltd, Melbourne.`
- Product legal copy → **Off Market Match**: `OMM_Mobile/lib/legal-docs.ts:12-14` `LEGAL_PRODUCT = 'Off Market Match (OMM)'`, `LEGAL_ENTITY = 'Off Market Match'`.
- App identity → **OMM** / **unlisted**: `OMM_Mobile/app.json:3-8` `"name": "OMM", "slug": "unlisted", "scheme": "omm"`; `app/+html.tsx:18` `<title>OMM</title>`; bundle ids disagree with each other — iOS `com.appify.omm` (app.json:25) vs Android `com.offmarketmatch.app` (app.json:45).
- **Unlisted** leaks into user-visible output: `OMM_Mobile/lib/soi-custom-builder.ts:191` and `:323` — `'Prepared in Unlisted. Verify all figures against current evidence before publishing.'`; also `packages/shared/package.json` `@unlisted/shared`, `lib/address-autocomplete.ts:18` `USER_AGENT = 'UnlistedMobile/1.0'`, `constants/theme.ts:67` "Unlisted palette family".
- **PreMarket/Unlisted**: `OMM_BACKEND/README.md:3`.
- The internal spec says something else again: `OMM_App/docs/ARCHITECTURE_MEETING_BACKLOG.md:149,204` — "App strings and marketing: **Off Market Match** / **OMM** consistency; domain **offmarketmatch.com**" (the real domain is offmarketmatch.com.**au**).
Logo assets are forked too: `md5 OMM_App/apps/web/public/match-logo.png` = `e4dc4bb2…` (1523 B) vs `OMM_Mobile/assets/images/match-logo.png` = `5379998a…` (8804 B), and the mobile copy is referenced by nothing (grep across app/components/lib returns zero hits) — it is dead weight while `OmmLogo.tsx:6` uses `assets/images/OMM.png`.

**Why it matters**

"Off the Market Match Pty Ltd" (website copyright) and "Off Market Match" (in-app Terms of Service, Privacy Policy and Community Guidelines the user agrees to at sign-up) are two different entity names on the two documents that matter legally. And "Prepared in Unlisted" is stamped on a Statement of Information — a document required under s47A of the Estate Agents Act 1980 (Vic) — naming a product that does not exist. A user going from the MATCH website to the OMM app under an "Unlisted" slug also has no way to tell they are in the right place.

**Remediation**

Pick one legal entity name and one product name, put them in a single constants module per repo with a comment pointing at the other two copies, and sweep. Priority order: (1) the SOI string in `soi-custom-builder.ts`, (2) the footer/legal-docs entity mismatch, (3) the app.json name/slug and the two bundle ids. Delete `OMM_Mobile/assets/images/match-logo.png`.

**Verifier correction**

Brand naming is fragmented across the three repos with no cross-repo brand constant, and one live user-visible surface prints a defunct product name. Five distinct identities exist (plus a sixth in a bundle id): MATCH on the marketing site (OMM_App/apps/web/app/layout.tsx:9, components/SiteHeader.tsx:22, components/HeroFind.tsx:289, components/WaitlistModal.tsx:156 — 23 occurrences); "Off the Market Match Pty Ltd" in the marketing footer (components/SiteFooter.tsx:11); "Off Market Match (OMM)" in the product's legal copy (OMM_Mobile/lib/legal-docs.ts:12-14); "Unlisted" throughout OMM_Mobile (app.json slug, packages/shared as @unlisted/shared, lib/address-autocomplete.ts:18 USER_AGENT, constants/theme.ts:67, components/AppAlertDialog.tsx:102, lib/clerk-auth.ts:863/953); and "PreMarket/Unlisted" in OMM_BACKEND/README.md:3. A sixth, "appify", survives in the iOS bundle id com.appify.omm.

Three items are genuine and worth fixing, in this order:

1. (Most material, and understated in the original finding) OMM_Mobile/lib/legal-docs.ts sets LEGAL_ENTITY = 'Off Market Match' with no "Pty Ltd", no ABN and no ACN anywhere in the file. The Terms of Service and Privacy Policy that users accept at sign-up (app/(auth)/sign-up.tsx:64, and the standalone terms-of-service.tsx / privacy-policy.tsx routes) therefore name a counterparty that does not identify a legal person, while the marketing footer names "Off the Market Match Pty Ltd". Note this is a copyright notice versus a ToS party name, NOT two conflicting legal documents — OMM_App/apps/web/app has no terms or privacy routes at all. The file's own header already flags it as a draft pending Victorian counsel review.

2. OMM_Mobile/lib/soi-custom-builder.ts:191 and :323 stamp "Prepared in Unlisted. Verify all figures against current evidence before publishing." on every generated Statement of Information. This is live, not dead code: app/(tabs)/add/build-soi.tsx:26 and components/SoiCustomBuilderForm.tsx:21 import it, and generateCustomSoiPdf emits the string on both the native expo-print path and the web buildMinimalTextPdf path. It credits a product that no longer exists on a document agents hand to clients. It is NOT an s47A compliance breach — the PDF carries the prescribed content (indicative selling price, median sale price, comparable sales) and self-labels as an agent-prepared draft; the line is a tool credit, not a prescribed field. The fix is one line: import LEGAL_PRODUCT/LEGAL_SHORT from lib/legal-docs.ts, which already exists and is already used by seven other files.

3. OMM_Mobile/assets/images/match-logo.png (8804 B, md5 5379998a62213e99e479491989a2997a) is referenced by nothing in the repo — confirmed zero hits across all file types. It is a stale fork of OMM_App/apps/web/public/match-logo.png (1523 B, md5 e4dc4bb2bf28f059c3423d9fb84a587a); the app actually renders assets/images/OMM.png via components/OmmLogo.tsx:6. Delete it.

Two sub-claims should be dropped: the Expo "slug": "unlisted" is an EAS project identifier and is never user-visible (user-facing identity is name "OMM", app/+html.tsx:18 <title>OMM</title>, and app.offmarketmatch.com.au), so it does not confuse users — the real discontinuity is a MATCH-branded website handing off to an OMM-branded app. And the iOS/Android bundle ids do not "disagree" in any harmful sense: they occupy separate namespaces and are used consistently across eas.json:51, package.json:34-35, .maestro/config.yaml, lib/universal-link-config.js:6-7 and docs/TESTFLIGHT.md:46, which records that com.appify.omm must match the existing App Store Connect registration.

Separately confirmed: OMM_App/docs/ARCHITECTURE_MEETING_BACKLOG.md:149 and :204 specify "Off Market Match / OMM" with domain "offmarketmatch.com", missing the .au that every deployed domain and every env var actually uses — the spec itself is wrong, and section 7 shows naming governance is already a tracked open item.

Severity: medium at the low end. Brand hygiene plus one genuine legal-copy gap. Nothing is functionally broken and there is no regulatory exposure.

---

### [MEDIUM] The marketing site collects licence numbers, phone numbers and IP addresses with no privacy policy or terms anywhere on the site — the legal copy exists only in OMM_Mobile
*drift · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_Mobile*

**Evidence**

`OMM_App/apps/web/app/api/waitlist/route.ts:84-101` persists `name, email, phone, agency, role, licence, yearsExperience, suburbs, notes, source, ipAddress, userAgent` to Postgres. `WaitlistModal.tsx:164-224` collects full name, email, phone and "Real estate licence number" (`placeholder="e.g. VIC 123456"`) with no consent checkbox and no link to any policy — grep for `terms|privacy` across `WaitlistModal.tsx` and `ApplyModal.tsx` returns nothing.
The site has no such routes: `ls OMM_App/apps/web/app` → `about api components find.css forgot-password globals.css layout.tsx lib page.tsx sign-in sign-up`. `SiteFooter.tsx:15-19` renders only `headerNavItems`, which are Search/Suburbs/Briefs/Insights (all `disabled: true`) and About (`app/lib/nav.ts:23-29`). The middleware even reserves matchers for pages that were never built — `middleware.ts:36-41` `isPublicMarketing = createRouteMatcher(["/about(.*)", "/contact(.*)", "/legal(.*)", "/privacy(.*)"])`.
All the actual legal text lives in the other repo: `OMM_Mobile/lib/legal-docs.ts` (Terms, Privacy Policy, Community Guidelines, `LEGAL_LAST_UPDATED = '16 June 2026'`) surfaced at `OMM_Mobile/app/privacy-policy.tsx`, `terms-of-service.tsx`, `community-guidelines.tsx`.

**Why it matters**

Personal information — including a professional licence number and the submitter's IP — is collected on a public site with no APP 5 collection notice and no published privacy policy, while the product one click away has a full one. The two surfaces are the same brand and the same Pty Ltd. This is the cheapest thing on this list to fix and the most embarrassing to be caught on at launch.

**Remediation**

Add `/privacy` and `/legal` routes to OMM_App that render the same text as `OMM_Mobile/lib/legal-docs.ts` (import the strings, or move them to a location both repos can read — do not retype them, or they will drift like everything else here), link them from `SiteFooter`, and add a consent line to the waitlist form.

**Verifier correction**

The marketing site's live waitlist form (OMM_App/apps/web/app/components/WaitlistModal.tsx:164-225) collects full name, email, phone and real estate licence number, and OMM_App/apps/web/app/api/waitlist/route.ts:84-101 additionally captures the submitter's IP address and user agent, persisting all of it to `waitlist_applications` in the shared production Postgres. There is no privacy policy, terms page, consent checkbox, footer link or collection notice anywhere in OMM_App — a repo-wide grep for privacy|terms|legal|consent|policy returns only two hits, the orphaned route matchers at middleware.ts:39-40 — and the Resend thank-you email (src/lib/email.ts) carries no policy link either. All legal copy lives solely in OMM_Mobile/lib/legal-docs.ts.

Three corrections to the original framing: (1) the extra fields cited (agency, role, yearsExperience, suburbs, notes) are accepted by the API but sent by no live client, and ApplyModal is dead code that submits nowhere (ApplyModal.tsx:133 is a TODO stub, rendered only when waitlist mode is off, which it never is) — so it should be dropped from the evidence; (2) the form is not entirely silent, WaitlistModal.tsx:250-253 asserts "No spam, no data sales", which is an unbacked handling representation rather than an absence; (3) most importantly, the middleware matchers are NOT "reserved for pages never built" — apps/web/app/privacy/page.tsx (145 lines) and apps/web/app/legal/page.tsx were shipped in commit 60518af and subsequently lost in the app→web branch merges. This is a regression from a published privacy page, not a launch oversight.

Cross-linking OMM_Mobile's policy would not fully cure it: that policy's collection section only covers registration and in-app activity, not pre-registration waitlist capture, and the entity name is inconsistent across surfaces (footer "Off the Market Match Pty Ltd" vs legal-docs.ts "Off Market Match", no ABN in either).

Separately and more seriously, middleware.ts:47 sets isMembersOnly to an empty matcher so auth.protect() never runs, leaving POST /api/waitlist unauthenticated and unrate-limited; because route.ts:105-130 updates rather than rejects on an existing email, anyone can overwrite a known agent's stored licence number, phone and IP. That should be tracked as its own higher-severity finding.

---

### [MEDIUM] Three incompatible listing-status vocabularies; the mobile status pill paints unrecognised statuses green "LIVE"
*drift · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_Mobile*

**Evidence**

Vocabulary 1 — the DB enum (7 values, identical in both schema files): `DRAFT, PRE_MARKET, LIVE, UNDER_OFFER, SOLD, WITHDRAWN, ARCHIVED` (`OMM_BACKEND/src/db/schema.ts:49-57`).
Vocabulary 2 — the wire type, duplicated in `OMM_Mobile/packages/shared/src/mobile-api.ts:3-9` and `OMM_BACKEND/src/server-data/fixtures.ts:1`: `"ACTIVE" | "SOI PENDING" | "DRAFT" | "OFF-MARKET" | "PRIVATE" | "EXCLUSIVE"` — only `DRAFT` overlaps with vocabulary 1. The adapter is buried in the seed script (`OMM_BACKEND/src/db/seed.ts:42-52`: `ACTIVE→LIVE`, `"SOI PENDING"→PRE_MARKET`, `OFF-MARKET/PRIVATE/EXCLUSIVE→PRE_MARKET`, unknown `→ "DRAFT"`).
Vocabulary 3 — the mobile UI's 4 values (`OMM_Mobile/lib/agent-published-listings.ts:63`): `'live' | 'pending' | 'sold' | 'draft'`, produced by `OMM_BACKEND/src/lib/mobile-published-listings.ts:106-114`:
```ts
if (status === "UNDER_OFFER" || status === "PRE_MARKET") return "pending";
if (status === "SOLD" || status === "ARCHIVED" || status === "WITHDRAWN") return "sold";
```
and `mobileListingStatusToDbColumn` (line 94) can only ever write back `DRAFT|LIVE|UNDER_OFFER|SOLD` — so PRE_MARKET/WITHDRAWN/ARCHIVED are write-only states.
The badge colour function has no fallback discipline — `OMM_Mobile/lib/listing-status-badge.ts:15,18-27`:
```ts
const FALLBACK: ListingStatusBadgeColors = LIVE;
...
if (key === 'ARCHIVED' || key === 'ARCHIVE') return ARCHIVED;
return FALLBACK;   // anything unrecognised → green "live" wash
```
`listingStatusWash` (`constants/theme.ts:68-74`) defines only 5 keys (live/sold/draft/contract/archived) for a 7-value enum — no `pre-market`, no `withdrawn`.

**Why it matters**

A `PRE_MARKET` listing is shown to its own agent as "Under offer" (`agent-published-listings.ts:898` `${price} | Under offer`), and a `WITHDRAWN` listing as "Removed from active search" alongside genuinely sold stock. Any status string the badge doesn't recognise renders in the green LIVE wash, which is the single most misleading default available on a real-estate listing — and `isListingVisibleToBuyer` (`mobile-published-listings.ts:68-78`) does show PRE_MARKET to buyers. The lossy round-trip also means a listing can never be moved back out of WITHDRAWN through the app.

**Remediation**

Change `FALLBACK` in `listing-status-badge.ts` to a neutral grey and add explicit `PRE_MARKET` / `WITHDRAWN` washes. Then decide whether the 7-value DB enum or the 4-value mobile vocabulary is the truth and collapse the other — and delete vocabulary 2 (`ListingStatus` in the shared/fixtures pair), which now only feeds the seed script.

**Verifier correction**

FIVE incompatible listing-status vocabularies, not three, and the mobile status pill will paint unrecognised statuses in the green LIVE wash — a latent defect with two identified live producers.

The three named vocabularies are real and correctly cited (DB enum at OMM_BACKEND/src/db/schema.ts:49-57; the duplicated wire union at OMM_Mobile/packages/shared/src/mobile-api.ts:3-9 and OMM_BACKEND/src/server-data/fixtures.ts:1; the mobile 4-value UI set at OMM_Mobile/lib/agent-published-listings.ts:63). Two more were missed, and they are the ones that actually matter because they are what the server puts on the wire:
- OMM_BACKEND/src/server-data/rsc-loaders.ts:59-70 `mapStatus` (DB -> wire) emits "OFF-MARKET", "UNDER OFFER", "WITHDRAWN", "ARCHIVED" plus an `?? s` raw passthrough — three of those are not in the declared wire union. It feeds GET /api/mobile/search, where PRE_MARKET rows are serialised as offMarketMatches with status "OFF-MARKET", pass isListingVisibleForBuyerSearch (buyer-listed-search.ts:24-30 only filters DRAFT/SOLD/ARCHIVED), and reach badgeLeft={m.status} at app/(tabs)/index.tsx:1647 and :1890.
- OMM_BACKEND/src/lib/mobile-saved-listings-map.ts:26-44 `badgeLeftFromListingStatus` emits "PRE-MARKET" and "WITHDRAWN" as badgeLeft on GET /api/mobile/saved-listings, piped verbatim into listingStatusBadgeColors at saved-properties.tsx:179 and index.tsx:1945.
I executed listingStatusBadgeColors: OFF-MARKET, PRE-MARKET, PRIVATE, EXCLUSIVE, SOI PENDING and WITHDRAWN all return the green live wash {#E4F6EA, #166534}, so a withdrawn or pre-market property would render a green "LIVE"-styled pill to a buyer.

Two corrections to the original write-up:
1. It is latent, not active. Production holds 21 LIVE / 2 SOLD / 1 UNDER_OFFER and zero PRE_MARKET, WITHDRAWN or ARCHIVED rows (verified against the Railway Postgres). Vocabulary 2 is seed/fixture INPUT only and never reaches a client. All agent-side badge producers (publishedListingStatusBadge, buyerMatchStatusBadge, agent-active-listings statusLabel) emit a closed set the badge function handles correctly, so Manage and Matches screens are unaffected. The bug fires the first time any row is set to PRE_MARKET or WITHDRAWN — which the API already permits (app/api/mobile/listings/route.ts:25, published-listings/route.ts:180,267), though the mobile client does not currently send it.
2. The round-trip claim is inverted. A WITHDRAWN listing CAN be recovered: it surfaces as 'sold', and ManageListingSheet's "Change status" / "Make live" writes LIVE via mobileListingStatusToDbColumn (queries.ts:2946, 3154). The real lossiness is the opposite direction — the app can never write PRE_MARKET, WITHDRAWN or ARCHIVED, so those three enum values are unreachable from the product, and any app-side status edit on such a row silently collapses it to DRAFT/LIVE/UNDER_OFFER/SOLD. Related: ARCHIVED-the-enum is never written at all; archiving is a separate archivedAt flag inside listings.features (queries.ts:2917-2920, 3139-3142), which is itself a second source of truth for listing state.

---

### [MEDIUM] OMM_Mobile — the actual product — has no CI at all, while both supporting repos do
*drift · CONFIRMED · repos: OMM_Mobile, OMM_App, OMM_BACKEND*

**Evidence**

`ls -a /Users/mennanyelkenci/Desktop/OMM_Mobile/.github` → `No such file or directory`.
`OMM_App/.github/workflows/verify.yml` runs `npx tsc --noEmit` + `npm run build:website` on every PR and push to main.
`OMM_BACKEND/.github/workflows/ci.yml:19-20` runs `npm run typecheck` + `npm run test`.
OMM_Mobile has the scripts and nothing invokes them — `package.json`: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"verify": "npm run typecheck && npm run test:auth && npm run verify:delete-guards && npm run verify:website"`, plus a `tests/` tree (auth, workspace, au, activities) and `.maestro/` flows.
This is the repo that ships to the App Store, Play, and app.offmarketmatch.com.au.

**Why it matters**

OMM_App's own CI exists specifically because typechecking there was silently broken for months (verify.yml:2-6 documents it). The same class of failure is completely unguarded on the product: a type error, a failing auth test or a broken `verify:delete-guards` run reaches TestFlight and production web with nothing in the way. The `verify:delete-guards` script in particular exists to protect account-deletion behaviour and is currently run only when a human remembers.

**Remediation**

Add `.github/workflows/ci.yml` to OMM_Mobile running `npm ci && npm run verify` on PR and push to main. It is a five-line file and the scripts already exist.

**Verifier correction**

OMM_Mobile — the product repo that auto-deploys to app.offmarketmatch.com.au and ships to App Store/Play — currently has no automated verification gate, while both supporting repos do. It is not that CI never existed: OMM_Mobile ran `npm ci && npm run verify` on every push and PR to main until commit 28bb3d1 (2026-08-06, "Remove GitHub Actions; use Expo EAS for store builds.") deleted .github/workflows/ci.yml together with the store and OTA workflows — the verification job was collateral to a change intended only to move store builds to EAS. The surviving `.eas/workflows/store-release.yml` is build+submit only and, per its own header, is not push-triggered, so it replaces nothing. The claim's supporting detail that `.github` is simply absent is true but incomplete (the investigator did not check `.eas/workflows/`), and OMM_App's own verify.yml was itself only added today (c0d988c), so "both supporting repos have CI" is true as of now rather than a long-standing contrast. Nothing else covers the gap: no husky/git hooks, no eas-build lifecycle hooks, and the Railway build (`expo export --platform web`) strips types without checking them. Everything currently passes — tsc exits 0 over 616 real project files, 129 vitest tests pass, delete-guards passes 7/7 — so this is an unguarded risk, not a live break, and the old workflow can be restored verbatim from `28bb3d1^:.github/workflows/ci.yml` or from origin/staging.

---

### [MEDIUM] Load-bearing docs assert infrastructure facts that are wrong, including a Clerk instance name that exists nowhere
*drift · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND, OMM_Mobile*

**Evidence**

Verified against `railway variables` output and the code:
- `OMM_Mobile/docs/RAILWAY_DEPLOY.md:29,72` names the Clerk instance **`organic-mosquito-64`** and tells you to add domains there. The real instances are `clerk.offmarketmatch.com.au` (decoded from `pk_live_Y2xlcmsub2ZmbWFya2V0bWF0Y2guY29tLmF1JA` on both application-frontend and application-backend) and `known-elf-22.clerk.accounts.dev` (website). `organic-mosquito-64` appears in no variable and no file.
- Same file, line 3: project **"Off Market Match - Application"**; actual `RAILWAY_PROJECT_NAME = OMM: Web & Mobile Platform`. Line 11: website-frontend at `https://omm-production.up.railway.app`; actual `RAILWAY_PUBLIC_DOMAIN = www.offmarketmatch.com.au`. Line 54: `cd /path/to/OMM_APP`.
- `OMM_Mobile/README.md:29`: "`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — same publishable key as the web app in `../OMM`. Verify with `node scripts/verify-clerk-alignment.mjs --railway`." The claim is false (pk_test vs pk_live), and the named verifier cannot catch it — `scripts/verify-clerk-alignment.mjs:76-77` only compares `repoRoot` (application-frontend) against `../OMM_BACKEND`; it never reads website-frontend.
- `OMM_App/README.md:11-12` describes apps/web as serving "home, about, listings, suburbs, briefs, insights" — `app/lib/nav.ts:18-27` says those pages "were removed once the product moved to OMM_Mobile" and `ls app/` confirms only about/sign-in/sign-up/forgot-password/api exist.
- `OMM_App/README.md:14-15` documents `packages/shared`; `ls OMM_App/packages` → `.gitkeep` only. The real `packages/shared` is in OMM_Mobile.
- `OMM_App/docs/HANDOVER_NIMERSHAN.md:30` says apps/web's Drizzle layer is used by "the waitlist, the Clerk webhook and notification reads" — grep for `notification` across `apps/web/app|src|lib` (excluding schema.ts) returns nothing.
- `OMM_BACKEND/README.md:5-7` says the web app calls the API via `NEXT_PUBLIC_BACKEND_URL`; grep across OMM_App returns zero references, yet the variable is still set on `website-frontend` (`https://ommbackend-production.up.railway.app`) — and the same variable name is set on application-frontend with a *different* value (`https://api.offmarketmatch.com.au`), where an Expo build cannot read `NEXT_PUBLIC_*` at all.
Related stale config on `website-frontend`: `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL = /app` and `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL = /sign-up/step-2` — neither route exists any more (`middleware.ts:44-47` confirms the `/app` workspace is gone).

**Why it matters**

These are the documents someone reaches for at 2am during a launch incident. The Clerk one is the worst: a doc naming a non-existent instance, a README asserting the keys match when they do not, and a verifier script that structurally cannot detect the mismatch — which is exactly how the pk_test/pk_live split survived this long. The stale redirect URLs are a live trap: the moment `NEXT_PUBLIC_WAITLIST_MODE` is flipped to `false` for launch, successful sign-in redirects to a 404.

**Remediation**

Fix the Clerk claims in `OMM_Mobile/README.md:29` and `docs/RAILWAY_DEPLOY.md:29,72` (or delete the sections), and extend `verify-clerk-alignment.mjs` to include `website-frontend` so the three-way mismatch is caught mechanically. Correct or delete the stale sections of `OMM_App/README.md` and `HANDOVER_NIMERSHAN.md`. Unset `NEXT_PUBLIC_BACKEND_URL` on both services and point the two Clerk fallback URLs at `APP_ORIGIN` before waitlist mode is turned off.

**Verifier correction**

Load-bearing docs across all three repos assert infrastructure facts that are wrong, and the one script named as the check is structurally blind to the mismatch it is cited for.

Confirmed: `OMM_Mobile/docs/RAILWAY_DEPLOY.md` names the wrong Clerk instance (`organic-mosquito-64`, lines 29 and 72), the wrong Railway project name (line 3: "Off Market Match - Application" vs actual `OMM: Web & Mobile Platform`), the wrong website-frontend URL (line 11: `omm-production.up.railway.app` vs `www.offmarketmatch.com.au`) and the wrong repo to redeploy from (line 54). `OMM_Mobile/README.md:29` claims the mobile publishable key matches the web app's — it does not (pk_live `clerk.offmarketmatch.com.au` vs pk_test `known-elf-22.clerk.accounts.dev`) — and `scripts/verify-clerk-alignment.mjs:76-77,120` only ever compares OMM_Mobile against `../OMM_BACKEND`, never website-frontend, so it can never detect that split. `OMM_App/docs/HANDOVER_NIMERSHAN.md:22-23` goes further and states "Clerk is one instance across all of them", which is false. `OMM_App/README.md:11-12` and `HANDOVER:29` list listings/suburbs/briefs/insights as live pages that `app/lib/nav.ts:17-27` says were deleted; `HANDOVER:30` claims "notification reads" that exist only in `schema.ts`; both docs link `packages/shared`, which is now just a `.gitkeep`. `OMM_BACKEND/README.md:5-7` documents `NEXT_PUBLIC_BACKEND_URL` as the web app's API path — zero references remain in OMM_App, yet the variable is still set on website-frontend and (uselessly, since Expo cannot read `NEXT_PUBLIC_*`) on application-frontend.

Two corrections to the original claim. First, `organic-mosquito-64` does NOT "exist nowhere": it appears in three files (`RAILWAY_DEPLOY.md:29,72`, `public/todo-items.js:34,38,125`, and a runtime error string at `lib/mobile-published-listings-api.ts:156`), and probing `https://organic-mosquito-64.clerk.accounts.dev/v1/environment` returns a live auth_config while a control subdomain returns `host_invalid` — it is a real, orphaned third Clerk dev instance that no service points at. That makes the doc more dangerous, not less: step 72 sends you to a real dashboard where the change silently does nothing.

Second, the claimed launch-day trap is refuted. The stale `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app` and `..._SIGN_UP_...=/sign-up/step-2` on website-frontend are inert: the only sign-in/up surface, `apps/web/app/components/AuthModalShell.tsx:112,120`, passes `forceRedirectUrl={APP_ORIGIN}` to both Clerk components, and `forceRedirectUrl` outranks the fallback env vars. Flipping `NEXT_PUBLIC_WAITLIST_MODE` to false will send users to `https://app.offmarketmatch.com.au`, not a 404. Those variables are config litter worth deleting, not a live hazard.

---

### [LOW] verify-clerk-webhook.mjs writes a permanent junk user into the production database every time it runs
*identity · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

/Users/mennanyelkenci/Desktop/OMM_BACKEND/scripts/verify-clerk-webhook.mjs:18-23 targets `https://api.offmarketmatch.com.au` by default, then :55-82 signs a REAL svix payload with the production CLERK_WEBHOOK_SECRET:
    type: "user.updated", data: { id: "user_verify_webhook_omm3007", email_addresses: [{ id: "e1", email_address: "verify@offmarketmatch.test" }], ... }
That email survives the gate — "offmarketmatch.test" is not in BLOCKED_CONSUMER_DOMAINS (/Users/mennanyelkenci/Desktop/OMM_BACKEND/src/lib/work-email.ts:8-31), so isPermittedWorkEmail returns true and OMM_BACKEND/app/api/webhooks/clerk/route.ts:88 calls upsertUserFromClerkProfile, inserting the row. The script ends at line 96 with no cleanup/delete step.

**Why it matters**

A diagnostic that mutates production. The row is a real `users` record with role AGENT that then flows into any query not filtered by ommRole, and it holds a `users_email_idx` slot forever. It also proves the production webhook secret is sitting in a developer .env.local capable of forging arbitrary signed user.created/updated/deleted events against the live API.

**Remediation**

Make the verification read-only: assert the 400-without-headers and a deliberately BAD signature returning 400 "Invalid signature" — that already proves reachability plus secret presence without writing. If a signed round-trip is genuinely needed, use an email on a domain added to BLOCKED_CONSUMER_DOMAINS (so the handler acks at route.ts:84 without upserting) and delete the existing user_verify_webhook_omm3007 row from production.

**Verifier correction**

scripts/verify-clerk-webhook.mjs mutates the production database: it signs a real svix `user.updated` event with the production CLERK_WEBHOOK_SECRET and POSTs it to the live backend (resolved from MOBILE_API_PUBLIC_ORIGIN=https://ommbackend-production.up.railway.app in .env.local, falling back to https://api.offmarketmatch.com.au), and the email `verify@offmarketmatch.test` passes the work-email gate because `offmarketmatch.test` is not in BLOCKED_CONSUMER_DOMAINS. This creates a real `users` row in production — verified present now: id `user_verify_webhook_omm3007`, role AGENT, omm_role NULL, created 2026-07-02 — and the script has no cleanup step. However, the write is an upsert keyed on `users.id`, so it produces ONE permanent row that is merely refreshed on reruns, not a new row per run. Impact is minimal: every user-enumeration path (buyer-agent directory at src/db/queries.ts:1802, listing-invite recipients at :1892) filters on `ommRole = 'Buyer Agent'`, which the row does not match, so it surfaces in no product feature; it only pollutes raw row counts (1 of 25). The related security framing does not hold: the production webhook secret in .env.local is deliberate (scripts/sync-clerk-webhook-secret.mjs, README.md:44-53), and .env.local is gitignored and was never committed. Correct fix is a one-line DELETE plus a cleanup/dry-run step in the script. Severity: low.

---

### [LOW] www's dormant auth surface is one env-var flip from a broken, wrong-instance signup funnel
*identity · PARTIALLY_CONFIRMED · repos: OMM_App*

**Evidence**

Sign-in/sign-up pages still exist: apps/web/app/sign-in/[[...sign-in]]/page.tsx, apps/web/app/sign-up/[[...sign-up]]/page.tsx. They are hidden only by an env flag — /Users/mennanyelkenci/Desktop/OMM_App/apps/web/middleware.ts:20-22, 53-56:
    const waitlistMode = !["false","0","off","no"].includes(waitlistRaw);   // default ON
    if (waitlistMode && isAuthPage(req)) return NextResponse.redirect(new URL("/", req.url));
Railway website-frontend: NEXT_PUBLIC_WAITLIST_MODE="true".
The post-auth destinations are already dead — verified live:
    https://www.offmarketmatch.com.au/app          -> 404
    https://www.offmarketmatch.com.au/sign-up/step-2 -> 307 to /
    https://www.offmarketmatch.com.au/sign-in      -> 307 to /
yet Railway still sets NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/app" and NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/sign-up/step-2" — both left over from the deleted /app workspace. Dead helper still present: apps/web/src/lib/auth-user.ts:9 getAppUserId(), referenced by nothing.

**Why it matters**

Turning the waitlist off (a one-word env change someone will make on launch day) instantly re-exposes a sign-up flow on the wrong Clerk instance that dead-ends on a 404, and starts pumping dev-instance users at the webhook in finding #1. There is no code change required to trigger it and no test that would catch it.

**Remediation**

Delete apps/web/app/sign-in, apps/web/app/sign-up, apps/web/app/forgot-password and apps/web/src/lib/auth-user.ts; point every marketing CTA at https://app.offmarketmatch.com.au. Remove the four NEXT_PUBLIC_CLERK_SIGN_*_URL vars and NEXT_PUBLIC_WAITLIST_MODE's auth branch from the website-frontend service.

**Verifier correction**

www's dormant auth surface is one env-var flip (NEXT_PUBLIC_WAITLIST_MODE=false) from a live signup funnel on the WRONG Clerk instance. The flip does two things at once: middleware.ts:53-56 stops redirecting /sign-in and /sign-up home, and SiteHeader.tsx:62-99 swaps the "Join waitlist" button for a real `<Link href="/sign-in">`. Signups then run against the pk_test dev instance (known-elf-22.clerk.accounts.dev) while the product runs pk_live.

However, the claimed 404 dead-end is incorrect. AuthModalShell.tsx:112 and :120 pass `forceRedirectUrl={APP_ORIGIN}` ("https://app.offmarketmatch.com.au", nav.ts:7-8) to both <SignIn> and <SignUp>, and on @clerk/nextjs ^7.2.7 that prop overrides the fallbackRedirectUrl env vars. NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/app" and NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/sign-up/step-2" are dead config that never fires — worth deleting as cruft, but not the failure path.

The actual failure is a silent cross-instance identity split: the user is redirected to app.offmarketmatch.com.au with a dev-instance session that the pk_live product cannot recognise, so they arrive logged out with an account the product cannot see. Dead helper apps/web/src/lib/auth-user.ts:9 getAppUserId() is confirmed orphaned. Severity remains low: it needs a deliberate env change, the default is fail-safe ON, and no test covers the flag.

---

### [LOW] Two authenticated call sites bypass apiFetch's 401 refresh-retry and the session-expiry handler
*api · PARTIALLY_CONFIRMED · repos: OMM_Mobile*

**Evidence**

OMM_Mobile/lib/api.ts:36-39 documents why the retry exists: "Clerk can briefly hand out a JWT that the backend rejects right after Microsoft/Google SSO. Retry once with a forced token refresh before treating 401 as a hard sign-out." — implemented in `fetchWithBearerRetry` (:40-67), used by `apiFetch`/`apiUpload`.
Two authenticated calls use raw `fetch` instead:
- lib/message-attachment-open.ts:21-28 — `const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); if (!res.ok) throw new Error('Could not open attachment.');` No retry, no `notifyIfApiUnauthorized`.
- lib/mobile-published-listings-pdf.ts:65,77-88 — `const token = await getToken()...; const response = await fetch(url, {...Authorization...}); if (status !== 200) return { ok: false, status };` Same gap.
(lib/expo-push-registration.ts:115 also uses raw fetch but does at least call `notifyIfApiUnauthorized` at :127.)

**Why it matters**

The exact scenario the retry was written for — the first minute after a Microsoft/Google SSO sign-in — will make "open attachment" and "download listing PDF" fail with an unhelpful generic error, and because neither calls `notifyIfApiUnauthorized`, a genuinely expired session on those two paths never triggers the sign-out/redirect flow (lib/auth-session-expiry.ts:47-68). The user is stuck with a button that just doesn't work.

**Remediation**

Route both through `apiFetch` (it already returns a raw `Response`, so binary bodies work) — or, if the raw fetch is needed for the native networking reasons noted in the PDF file's comment, at minimum reuse the same getToken-refresh-once loop and call `notifyIfApiUnauthorized(res, { sentBearerToken: true })`.

**Verifier correction**

At least three authenticated call sites in OMM_Mobile send a Clerk Bearer token via raw `fetch` instead of `apiFetch`/`apiUpload`, so they miss `fetchWithBearerRetry`'s 401 forced-token-refresh retry (lib/api.ts:38-69) and never call `notifyIfApiUnauthorized`: lib/message-attachment-open.ts:22-28 (open message attachment), lib/mobile-published-listings-pdf.ts:66,77-88 (listing PDF download), and lib/soi-pdf-webview-source.ts:120-135 (`downloadRemotePdfToCache`, which the original claim missed). Both named endpoints are genuinely auth-gated and 401-capable, and all paths are reachable from live UI.

However, the practical impact is smaller than claimed. The PDF path does NOT surface a generic error — lib/mobile-published-listings-pdf.ts:13-16 returns a dedicated 401 message telling the user to wait and retry or re-sign-in, which is the correct remedy for the transient-SSO-JWT case. And a genuinely expired session is NOT missed: the chat screen polls through apiFetch continuously via useMessagesLiveSync (lib/use-messages-live-sync.ts:63-88), and the PDF button is only reachable after a publish flow that runs entirely on apiFetch, so `notifyIfApiUnauthorized` fires from that surrounding traffic and the sign-out/redirect still happens. The SSO race itself is largely pre-empted because a prior apiFetch 401 calls getToken({skipCache:true}), warming the Clerk token cache the raw-fetch sites read from, and getClerkMobileBearerToken (lib/clerk-mobile-token.ts:30-45) already retries 15x with skipCache for the "no token yet" case. In the hard-expiry case getToken returns null, no Bearer is sent, and notifyIfApiUnauthorized would intentionally no-op (lib/auth-session-expiry.ts:76) anyway.

This is a consistency/robustness cleanup — route all three through fetchWithBearerRetry — not a user-blocking defect. Severity: low, not medium.

---

### [LOW] Client has no 429 handling at all; rate-limited users see the raw string "rate_limited"
*api · PARTIALLY_CONFIRMED · repos: OMM_Mobile, OMM_BACKEND*

**Evidence**

OMM_BACKEND/src/lib/api-rate-limit.ts:133-142 `rateLimitExceededResponse` returns `{ error: "rate_limited", retryAfterSec }` with status 429 and a `Retry-After` header. Policies at :154-161 include `geocodeMap: { limit: 30, windowSec: 600 }`, `agencyRequests: { limit: 5, windowSec: 3600 }`, `supportContact`/`supportFeedback: { limit: 10, windowSec: 3600 }`. Enforced in app/api/mobile/map-geocode/route.ts:129, app/api/mobile/agency-requests/route.ts:31-35, app/api/support/contact/route.ts:28-32, app/api/support/feedback/route.ts:21-25.
In OMM_Mobile, `grep -rn "429" lib app components` returns nothing. `readApiErrorBody` (lib/mobile-published-listings-api.ts:84-105) and `readApiError` (lib/mobile-notifications-api.ts:87-97, lib/mobile-buyer-listing-api.ts:41-52) special-case `soi_required`, `invalid_media_url`, `external_media_not_allowed`, `duplicate_active_listing` — but not `rate_limited`, so the raw code is shown, and `Retry-After` is never read.

**Why it matters**

30 geocodes per 10 minutes is easy to hit while browsing listings on a map. The user gets an alert reading "rate_limited" with no indication that waiting will fix it, and the app makes no attempt to back off — it will keep hammering the endpoint on every render that triggers a geocode.

**Remediation**

Add a `rate_limited` case to the shared error-message helpers that reads `retryAfterSec` (or the `Retry-After` header) and says "Too many requests — try again in N seconds", and suppress automatic retries for that window in lib/geocode-address.ts.

**Verifier correction**

OMM_Mobile has no 429-specific handling anywhere (confirmed: no "429" literal in lib/app/components, `Retry-After` never read). However, the raw "rate_limited" string only reaches the user through the ENRICHMENT limit (20/hr, API_RATE_LIMITS.enrichment, enforced in OMM_BACKEND/src/lib/enrichment-route-shell.ts:32 for /api/mobile/property-address-enrichment, /api/mobile/soi/generate-from-propertydata and /api/mobile/propertydata/session-check), via two spots: OMM_Mobile/lib/mobile-property-enrichment-api.ts:196 (`: j?.error ? \`${j.error}\``) which is rendered as on-screen text at app/(tabs)/add/index.tsx:985, and lib/mobile-soi-propertydata-draft-pdf.ts:88 (`if (detailTrimmed) return sanitizeSoiUserFacingDetail(detailTrimmed)`, which short-circuits every status branch and does not scrub the code) surfacing in the SOI alerts at app/update-soi.tsx:269 and app/(tabs)/add/soi.tsx:515. The four endpoints the finding actually cited do NOT show the raw code: map-geocode is swallowed by `if (!res.ok) return null` at lib/mobile-map-geocode-api.ts:52 (map just fails to appear), and support/contact, support/feedback and agency-requests all fall through to generic "please try again" copy. The geocodeMap rationale is also wrong: the 30/600s budget is only consumed on a Postgres cache MISS (map-geocode/route.ts:126-131) against a globally shared cache, so ordinary map browsing of already-geocoded listings costs nothing, and the client does not retry or hammer. The cited `readApiErrorBody`/`readApiError` readers are irrelevant — the published-listings, notifications and buyer-listing routes have no rate limiting at all. Real impact: an agent doing >20 address lookups in an hour sees the literal text "rate_limited" on the Add Listing / SOI screens with no hint that waiting fixes it.

---

### [LOW] CORS allowlist is hard-coded in code, not configured; www.offmarketmatch.com.au is blocked
*api · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_App*

**Evidence**

`ALLOWED_CORS_ORIGINS` is NOT present in `railway variables --service application-backend --environment production --json`, so the hard-coded fallback in OMM_BACKEND/src/lib/api-cors.ts:5-11 is what is live: `["https://app.offmarketmatch.com.au", "http://127.0.0.1:8080", "http://127.0.0.1:8081", "http://localhost:8080", "http://localhost:8081"]`.
Verified against production:
  Origin https://app.offmarketmatch.com.au → `HTTP/2 204`, `access-control-allow-origin: https://app.offmarketmatch.com.au`
  Origin http://localhost:8081 → `HTTP/2 204`
  Origin https://www.offmarketmatch.com.au → `HTTP/2 403` body `CORS origin not allowed`
  Origin https://ommbackend-production.up.railway.app → `HTTP/2 403` (deliberate, api-cors.ts:23-29)
Handled in middleware, not per-route: proxy.ts:10-13 calls `maybeHandleApiCors(req)`; no route.ts in app/api exports an `OPTIONS` handler.

**Why it matters**

Low today — OMM_App is marketing-only and `NEXT_PUBLIC_API_BASE` is not set on website-frontend (its vars are only NEXT_PUBLIC_BACKEND_URL / RESEND_API_KEY), so apps/web/app/lib/api.ts:357 falls back to hard-coded fixtures. But the allowlist lives in source, not config, so adding a staging origin or letting the marketing site call the API requires a backend redeploy, and the failure mode is an opaque 403 with a text/plain body that no client parses.

**Remediation**

Set `ALLOWED_CORS_ORIGINS` explicitly on application-backend in Railway (at minimum `https://app.offmarketmatch.com.au`) so the live allowlist is visible in config rather than buried at api-cors.ts:5, and add www.offmarketmatch.com.au only if/when the marketing site actually needs it.

**Verifier correction**

The CORS allowlist is env-configurable via ALLOWED_CORS_ORIGINS (OMM_BACKEND/src/lib/api-cors.ts:13), but that variable is not set on application-backend in production, so the five-origin hard-coded fallback (api-cors.ts:4-10) is what is live. Verified against prod: app.offmarketmatch.com.au and localhost:8081 get 204 + ACAO; www.offmarketmatch.com.au, the apex domain, and *.up.railway.app all get 403 "CORS origin not allowed" (text/plain) on both preflight and real requests. Enforced solely in middleware (proxy.ts:10-11), scoped to /api/mobile/* and /api/support/* (api-cors.ts:21); /api/webhooks/* is unguarded (204 for any origin). Unit-tested at src/lib/api-cors.test.ts — live, reachable code, not dead.

Impact is lower than claimed, on two counts. (1) Adding a staging origin does NOT require a code change — set ALLOWED_CORS_ORIGINS on Railway. (2) Letting the marketing site call the API does NOT require any CORS change at all: OMM_App's only API-calling code (apps/web/app/lib/api.ts:356 swrOrMock) runs in a server component (no "use client" anywhere in that chain, uses `next: { revalidate: 60 }`), so it sends no Origin header and maybeHandleApiCors returns null at line 54 — confirmed live, GET /api/mobile/health with no Origin returns 200. Its endpoints ("/listings", "/suburbs") are also outside isApiPath's scope.

The real, reachable exposure is different from the one claimed: `railway domain` shows application-frontend-production-de79.up.railway.app as an ACTIVE domain on port 8081 serving the product web build, and the deliberate isRailwayAppOrigin block (OMM-3009) makes every API call from that URL 403 with no client-visible reason. Separately, website-frontend has NEXT_PUBLIC_BACKEND_URL=https://ommbackend-production.up.railway.app set but referenced nowhere in OMM_App source — a dead leftover pointing at a deliberately blocked origin. Severity remains low; the claim's supporting detail that website-frontend "only" has NEXT_PUBLIC_BACKEND_URL / RESEND_API_KEY is wrong (it has 29 vars including CLERK_SECRET_KEY and DATABASE_URL), though its load-bearing point — no NEXT_PUBLIC_API_BASE — is correct.

---

### [LOW] Node version pinning is inconsistent across the three repos, and OMM_BACKEND tests on Node 20 while shipping on Node 22
*buildhealth · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_Mobile, OMM_App*

**Evidence**

OMM_App: `.node-version` = `22`, package.json:8-11 `engines: node >=20.19.4 <26`, CI uses `node-version-file: .node-version` (verify.yml:28) — consistent. OMM_Mobile: `.node-version` = `22`, package.json:9-12 same engines — but nixpacks.toml:4 pins `nixPkgs = ["nodejs_20"]` while railway.json:4 sets `"builder": "RAILPACK"`, so nixpacks.toml is dead config that reads like the source of truth. OMM_BACKEND: **no `.node-version`, no `.nvmrc`, and no `engines` field at all** (package.json has none), yet .github/workflows/ci.yml:16 pins `node-version: "20"` while the image Railway actually builds is `Dockerfile.core:1 FROM node:22-bookworm-slim` (railway.toml:3-4 selects DOCKERFILE + Dockerfile.core). The sibling Dockerfiles disagree further: Dockerfile:1 and Dockerfile.enrichment:1 use `mcr.microsoft.com/playwright:v1.51.1-noble`, Dockerfile.imagery:1 uses node:22. `railway variables --service application-backend/application-frontend/website-frontend --environment production --json` shows no NODE_VERSION / NIXPACKS_* / RAILPACK_* override on any service. Local dev machine is Node v25.7.0 / npm 11.10.1.

**Why it matters**

OMM_BACKEND's CI validates typecheck and tests against a Node major that production never runs. Node 20 vs 22 differ in fetch/undici behaviour, `node --test` output and glob support, and OpenSSL — a test that passes on 20 can fail on 22 and vice versa, and it will be discovered in production. The missing `engines` field also means npm will never warn a developer (or Railpack) about a wrong local Node, unlike the other two repos.

**Remediation**

Add `.node-version` containing `22` and an `engines` block matching the other two repos to OMM_BACKEND, and change ci.yml:15-16 to `node-version-file: .node-version`. Delete OMM_Mobile/nixpacks.toml (railway.json already forces RAILPACK, so it is misleading dead config) or switch that service's builder to NIXPACKS if 20 was actually intended.

**Verifier correction**

Node version pinning is inconsistent across the three repos and OMM_BACKEND's CI runs on a different Node major than production, but the practical exposure is much narrower than claimed and production is not split.

Accurate version: OMM_App is self-consistent (.node-version=22, engines >=20.19.4 <26, CI uses node-version-file) and Railpack empirically resolves node 22.23.2 for it. OMM_Mobile has the same .node-version/engines and Railpack also resolves 22.23.2 via "idiomatic-version-file" — its nixpacks.toml pin of nodejs_20 is genuinely dead config (railway.json selects RAILPACK), a documentation hazard with zero runtime effect, and it has no CI at all. OMM_BACKEND is the real gap: no .node-version, no .nvmrc, no engines field, and .github/workflows/ci.yml:16 hardcodes node-version "20" while every backend image runs Node 22.

Correction to the evidence: the sibling Dockerfiles do NOT disagree on Node. mcr.microsoft.com/playwright:v1.51.1-noble installs Node from deb.nodesource.com/node_22.x (verified from the image config history), so Dockerfile, Dockerfile.core, Dockerfile.enrichment and Dockerfile.imagery are all Node 22. Production is uniformly Node 22 across application-backend, application-enrichment and application-imagery.

Correction to the impact: CI is not the only Node-22 gate. The Railway Docker build runs `next build --webpack`, which the build log shows executing TypeScript ("Finished TypeScript in 7.3s"), so typecheck and build are validated on Node 22 at deploy time and a break there fails the deploy rather than reaching production. The only step validated exclusively on Node 20 is `npm run test` (10 unit files). Nothing in the lockfile excludes Node 20 (next requires >=20.9.0) and no Node-22-only API is used anywhere in src/, scripts/ or app/, so the divergence is latent, not active. The one plausible landing spot is src/lib/api-cors.test.ts, src/lib/cron-auth.test.ts and src/lib/enrichment-internal-proxy-auth.test.ts, which construct global Request/Headers/NextRequest (undici differs between 20 and 22).

Also, the issue is currently unreachable: OMM_BACKEND's last two CI runs failed in 2-4 seconds with "The job was not started because recent account payments have failed or your spending limit needs to be increased" — Actions has produced no signal since 2026-08-06. Fix is cheap (add .node-version=22 and an engines field to OMM_BACKEND, switch ci.yml to node-version-file, delete OMM_Mobile/nixpacks.toml), but severity is low, not medium. Two adjacent issues surfaced while verifying and are worth separate findings: backend CI never runs `npm run build` (so it validates strictly less than the Docker build does), and application-enrichment's build log shows it building from `Dockerfile`, not `Dockerfile.enrichment` as railway.toml's comment instructs — meaning it may be running scripts/start-production.sh instead of scripts/start-enrichment-production.sh.

---

### [LOW] `@unlisted/shared` is a declared, typechecked, zero-import dead package that claims to be the mobile↔backend API contract
*buildhealth · PARTIALLY_CONFIRMED · repos: OMM_Mobile, OMM_App*

**Evidence**

OMM_Mobile/packages/shared/src/mobile-api.ts:1 — `/** JSON types for `/api/mobile/*` — keep aligned with `OMM_BACKEND` handlers and dashboard fixtures. */` — 244 lines defining `Listing`, `ListingStatus`, `BuyerMatch`, `SavedSearch`, `AgentReply` etc. It is a declared runtime dependency at OMM_Mobile/package.json:64 (`"@unlisted/shared": "*"`) and tsc compiles both its files (`tsc --listFiles` shows 2 files under `packages/`). But `grep -rn "@unlisted/shared" OMM_Mobile --include="*.ts" --include="*.tsx" -l` (excluding node_modules) returns **nothing** — the only two textual references in the whole repo are the two package.json declarations themselves. Separately, OMM_App/package-lock.json still carries the deleted workspace: line 12 `"packages/*"`, lines 1744-1745 `"node_modules/@unlisted/shared": { "resolved": "packages/shared" }`, lines 3084-3085 `"packages/shared": { "name": "@unlisted/shared" }` — while OMM_App/package.json:5-7 declares only `["apps/web"]` and OMM_App/packages/ contains nothing but `.gitkeep`. `npm ci --dry-run` in OMM_App reports `remove @unlisted/shared undefined`; a clean-room `git archive HEAD` + `npm ci` still succeeds (85 packages), so it is not currently breaking installs.

**Why it matters**

There is no compile-time link of any kind between OMM_BACKEND's 65 handlers and OMM_Mobile's consumption of them — both repos typecheck green while disagreeing about the wire format. The one file that looks like the shared contract is dead, so it silently rots, and its header instructs future developers to keep it aligned with the backend. Anyone who trusts it will type mobile code against a schema no server ever returns.

**Remediation**

Either delete packages/shared and the OMM_Mobile/package.json:64 dependency, or make it real: have OMM_BACKEND publish/derive these types from its Drizzle schema and have OMM_Mobile's API client actually import them so `tsc` enforces the contract. Also regenerate OMM_App/package-lock.json (`rm package-lock.json && npm install`) to drop the stale packages/* workspace entries.

**Verifier correction**

`@unlisted/shared` in OMM_Mobile is a declared, typechecked, zero-import dead package: it is listed at OMM_Mobile/package.json:64, tsc compiles both its files (packages/shared/src/index.ts and mobile-api.ts), and no source file in the repo imports it. It is not a shared contract but a hand-copied, already-drifted fork of types OMM_BACKEND owns in src/server-data/fixtures.ts and src/server-data/rsc-loaders.ts — the backend's Listing has four fields (coverPhotoUrl, publishedAt, cars, addressDisclosure) and HomePageLoaderData.selling three fields (draftCount, preMarketCount, soiReminderListings) that the shared copy lacks, and MessagesInboxData.inspections differs in element type. Drift is additive-only so far; ListingStatus still matches exactly. The file is not abandoned — it was last edited 2026-07-13 and touched in 4 of 5 commits — but nothing validates it against the 59 /api/mobile handlers, and neither repo uses zod, OpenAPI or codegen, so there is no compile-time or runtime contract. The trap is documented as real: OMM_Mobile/docs/architecture-diagram.html:109/125/328 lists the package as a live component and draws the edge `API --> Shared`, a dependency that does not exist. Separately, OMM_App/package-lock.json still carries the deleted workspace (lines 12, 1744-45, 3084-85) while package.json declares only ["apps/web"]; this is cosmetic — `npm ci --dry-run` reports `remove @unlisted/shared undefined` and a clean-room `git archive HEAD` + `npm ci` succeeds. Severity is low, not medium: nothing breaks at build, install or runtime; the cost is documentation rot and a stale type file a future developer could trust.

---

### [LOW] Committed `next-env.d.ts` flip-flops between dev and build variants, and skipLibCheck silently swallows the resulting dangling import
*buildhealth · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_BACKEND*

**Evidence**

Both files are git-tracked (`git ls-files apps/web/next-env.d.ts` and `git ls-files next-env.d.ts` both return). OMM_App's committed copy is `import "./.next/dev/types/routes.d.ts";` (the `next dev` variant); OMM_BACKEND's committed copy is `import "./.next/types/routes.d.ts";` (the `next build` variant). Running `npm run build:website` in OMM_App immediately produced `git diff apps/web/next-env.d.ts` showing `-import "./.next/dev/types/routes.d.ts"; +import "./.next/types/routes.d.ts";` (reverted). In a clean-room `git archive HEAD` checkout with no `.next/` directory at all, `npx tsc --noEmit` in apps/web exits 0 and checks 39 files — the import to a non-existent path raises no error, because `skipLibCheck: true` (apps/web/tsconfig.json:10, OMM_BACKEND/tsconfig.json:6) suppresses errors inside .d.ts files.

**Why it matters**

Two concrete costs: (1) every dev/build cycle dirties a tracked file, so `git status` is never trustworthy and the file ping-pongs in diffs and merge conflicts; (2) it is a second, quieter instance of the same failure mode as the baseUrl trap — a config artifact that points at nothing and reports clean. It is the mechanism that lets the OMM_BACKEND CI route-validator gap above go unnoticed rather than erroring loudly.

**Remediation**

Add `next-env.d.ts` to .gitignore in both repos (Next regenerates it on every dev/build; the file itself says "This file should not be edited") and `git rm --cached` it.

**Verifier correction**

Committed `next-env.d.ts` in both OMM_App (apps/web/next-env.d.ts) and OMM_BACKEND (next-env.d.ts) is rewritten by Next 16 on every `next dev` / `next build`, so a git-tracked file churns on every cycle. This is empirically recurring, not theoretical: OMM_BACKEND's copy alternates between the dev and build variant across all 7 commits that ever touched it, and OMM_App's across all 3 since the import line appeared. I reproduced it live — `npm run build:website` flipped `./.next/dev/types/routes.d.ts` to `./.next/types/routes.d.ts` in the working tree. The correct fix is to stop tracking the file (add `next-env.d.ts` to .gitignore in both repos); Next regenerates it automatically.

Separately and NOT caused by the flip-flop: in any checkout with no `.next/` directory (i.e. both CI jobs, which do actions/checkout + npm ci + tsc), the side-effect import resolves to nothing, and `skipLibCheck: true` (apps/web/tsconfig.json:10, OMM_BACKEND/tsconfig.json:6) suppresses the one signal that would surface it — verified by counter-test, where `--skipLibCheck false` emits `next-env.d.ts(3,8): error TS2882`. The dev-vs-build variant is irrelevant to this: both tsconfigs `include` both `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`, and I confirmed that with a deliberate variant mismatch the glob still loads the correct routes.d.ts and tsc passes. Whichever variant is committed, a fresh checkout dangles identically.

The practical type-safety impact is near zero and is the opposite of what was claimed. OMM_BACKEND's routes.d.ts provides only route string unions and ParamMap, and backend source has zero usages of PageProps/LayoutProps/RouteContext and zero `next/link` — nothing consumes them. OMM_App, which does have 5 `next/link` usages where typed hrefs matter, is already covered because its CI runs `npm run build:website` (verify.yml:40) with no `ignoreBuildErrors`. Disabling skipLibCheck is not a usable remedy — it produces hundreds of node_modules errors (@clerk, drizzle-orm/gel-core).

This is therefore a housekeeping/churn issue, not a second instance of the baseUrl trap. The genuine adjacent gap it was conflated with is that OMM_BACKEND/.github/workflows/ci.yml runs only `npm run typecheck` and `npm run test` with no `next build` step — that, not skipLibCheck, is what leaves backend route/build validation unexercised in CI.

---

### [LOW] Five OMM_Mobile npm scripts are PowerShell-only and cannot run on the macOS machine that operates this project
*buildhealth · PARTIALLY_CONFIRMED · repos: OMM_Mobile*

**Evidence**

OMM_Mobile/package.json:42-46 — `verify:backend`, `verify:metro`, `stop:metro`, `clear:metro`, `start:dev` all invoke `powershell -ExecutionPolicy Bypass -File ./scripts/*.ps1`. On this host: `which powershell pwsh` -> `powershell not found` / `pwsh not found`. Also two backend debug scripts are outside the typecheck net: OMM_BACKEND/tsconfig.json:21 includes `**/*.ts`, which does not match `.mts`, so `scripts/debug-grosvenor-auto.mts` and `scripts/probe-scrape-soi-results.mts` are the only two source files in the repo tsc never sees (confirmed by diffing `tsc --listFiles` against `find`).

**Why it matters**

Minor, but `verify:backend` and `verify:metro` sound like the diagnostics you'd reach for when the app can't reach api.offmarketmatch.com.au — and they will just error out. The .mts gap matters only if a probe script is ever promoted to production use.

**Remediation**

Port the five .ps1 scripts to .mjs (the repo already uses that pattern for expo-start.mjs, generate-well-known.mjs, verify-delete-guards.mjs) or delete them. Add `"**/*.mts"` to OMM_BACKEND/tsconfig.json's include array.

**Verifier correction**

Five OMM_Mobile npm scripts (package.json:42-46 — verify:backend, verify:metro, stop:metro, clear:metro, start:dev) shell out to `powershell` and fail immediately on this macOS host (`sh: powershell: command not found`, reproduced). Four of the five are in fact Windows-only, not just PowerShell-only: verify-metro-env.ps1 and stop-metro.ps1 use Get-NetTCPConnection, clear-metro-cache.ps1 uses $env:TEMP, and start-dev.ps1 chains both — so installing pwsh would fix only verify:backend. A sixth Windows-only helper, scripts/sync-railway-env-local.ps1, is named in those scripts' error messages and has no macOS equivalent (OMM_BACKEND has the ported .sh). Impact is limited: verify:backend's function is already covered cross-platform by scripts/verify-api-domain.mjs (same /api/mobile/health probe plus CORS and bundle checks), README documents the cross-platform `npm run start`, the aggregate `npm run verify` contains no PowerShell, and no CI or Railway/EAS config references any .ps1. Separately, the .mts assertion is wrong: OMM_BACKEND/tsconfig.json includes only `**/*.ts` and `**/*.tsx` while setting allowJs:true, so 15 non-node_modules source files — not 2 — are outside the typecheck net (next.config.js, 8 .mjs, 4 .cjs, 2 .mts); the 2 .mts are simply the only TypeScript ones. And probe-scrape-soi-results.mts is not a dormant probe: it is already wired to the live script `probe:scrape-soi` at OMM_BACKEND/package.json:24.

---

### [LOW] The backend↔enrichment shared HMAC secret silently falls back to CLERK_SECRET_KEY, putting a live Clerk secret key on the enrichment worker
*config · PARTIALLY_CONFIRMED · repos: OMM_BACKEND*

**Evidence**

OMM_BACKEND/src/lib/enrichment-internal-proxy-auth.ts:9-13 —
```
function enrichmentProxySecret(): string | null {
  const dedicated = process.env.ENRICHMENT_PROXY_SECRET?.trim();
  if (dedicated) return dedicated;
  return process.env.CLERK_SECRET_KEY?.trim() || null;
}
```
:37-38 `const expected = enrichmentProxyAuthToken(userId); if (!expected) return null;`

`ENRICHMENT_PROXY_SECRET` appears in neither application-backend nor application-enrichment, in production or staging (grep over all four variable dumps). So the HMAC key in use is CLERK_SECRET_KEY.

Production application-enrichment vars: CLERK_SECRET_KEY=sk_live_[REDACTED] — identical to application-backend's. Staging both sides: sk_test_[REDACTED].

ENRICHMENT_SERVICE_ORIGIN=http://application-enrichment.railway.internal:8080 (backend), consumed at src/lib/platform-api-proxy.ts:13.

**Why it matters**

Two problems from one line. (a) Blast radius: a live Clerk *secret* key — full Clerk Backend API authority to list, modify and delete every user — is deployed to the enrichment worker solely so it can compute an HMAC. Nothing in the enrichment contract requires Clerk admin power. (b) Rotation trap: the day CLERK_SECRET_KEY is rotated on one service and not the other, `resolveProxiedEnrichmentUserId` returns null on every request (line 43) and all proxied enrichment calls start failing auth with no config error, no startup check and no log naming the cause — it fails as "unauthenticated", which reads like a user problem, not a deploy problem.

**Remediation**

Generate a dedicated random secret and set ENRICHMENT_PROXY_SECRET identically on application-backend and application-enrichment (per environment), then remove the CLERK_SECRET_KEY fallback in enrichment-internal-proxy-auth.ts:12 so a missing secret is a loud boot failure. Once the fallback is gone, drop CLERK_SECRET_KEY from application-enrichment entirely unless something else there genuinely needs it.

**Verifier correction**

The backend→enrichment HMAC secret does silently fall back to CLERK_SECRET_KEY (OMM_BACKEND/src/lib/enrichment-internal-proxy-auth.ts:9-13), and since ENRICHMENT_PROXY_SECRET is set on neither application-backend nor application-enrichment in production, the live Clerk secret key is in fact the HMAC key. But this puts no additional secret on the enrichment worker: application-enrichment runs the SAME OMM_BACKEND codebase (Dockerfile.enrichment), and all three enrichment handlers independently verify the Clerk bearer via verifyToken({ secretKey: CLERK_SECRET_KEY }), so that service needs the live Clerk secret regardless. The rotation-divergence failure is likewise not caused by this line — it would break the worker's own JWT verification anyway — is mitigated by provisioning CLERK_SECRET_KEY as a Railway reference to application-backend (scripts/railway-connect-enrichment.sh:32), and is explicitly NOT silent: enrichment-route-shell.ts:36-45 rewrites a worker 401/403 into a 502 `enrichment_service_auth_failed` with a comment naming CLERK_SECRET_KEY mismatch as the cause. What is left is a low-severity key-hygiene issue: an auth-provider secret reused as an HMAC key, with no dedicated secret, no config validation, and a deterministic never-expiring token over the bare user id. Two better findings surfaced next to it: (1) commit e359979's stated fix is incomplete — the handlers still require the Bearer, so if it truly doesn't survive private networking the routes 401 anyway; (2) application-enrichment is exposed on a public Railway domain, so those PropertyData/Playwright routes are internet-reachable behind only the Clerk bearer.

---

### [LOW] Production waitlist emails are sent from Resend's sandbox domain and fail silently for every recipient
*config · PARTIALLY_CONFIRMED · repos: OMM_App*

**Evidence**

website-frontend production: WAITLIST_FROM_EMAIL="MATCH <onboarding@resend.dev>".
OMM_App/apps/web/src/lib/email.ts:22-23 `const FROM = process.env.WAITLIST_FROM_EMAIL ?? "MATCH <onboarding@resend.dev>";` — the env var is set to the same sandbox value as the fallback.
email.ts:49-56 sends with `from: FROM`; :58-60 catches and logs. The Resend SDK v6 (`"resend": "^6.12.3"`, package.json:33) returns `{ data, error }` rather than throwing on API errors, so a 403 never reaches that catch — line 57 `return { ok: true }` runs regardless.
OMM_App/apps/web/app/api/waitlist/route.ts:143-145 `const { subject, html, text } = waitlistThankYouEmail(record.name); await sendEmail({ to: email, … });` — result discarded.
The domain is demonstrably verified on this Resend account: application-backend sets RESEND_FROM_EMAIL="OMM Support <contact@offmarketmatch.com.au>".

**Why it matters**

`onboarding@resend.dev` is Resend's shared sandbox sender — it only delivers to the account owner's own verified address and rejects everything else. NEXT_PUBLIC_WAITLIST_MODE=true means the waitlist IS the marketing site's entire conversion path right now, so every prospect who signs up gets nothing, the signup row saves fine, the endpoint returns `{ok:true}`, and no error is logged anywhere. This fails completely invisibly.

**Remediation**

Set WAITLIST_FROM_EMAIL="MATCH <hello@offmarketmatch.com.au>" (or contact@, already verified) on website-frontend. Change email.ts to inspect the SDK's returned `error` field and log it, and make the sandbox default in line 23 throw when RAILWAY_ENVIRONMENT_NAME === 'production'.

**Verifier correction**

The waitlist email sender is misconfigured but the code path is currently unreachable in production, so the claimed silent-failure impact does not occur. Two separate facts:

(1) LATENT, LOW (the claim, corrected): `OMM_App/apps/web/src/lib/email.ts:22-23` sends from `MATCH <onboarding@resend.dev>` — both the fallback and the production `WAITLIST_FROM_EMAIL` on `website-frontend`. Because Resend SDK v6 (`node_modules/resend/dist/index.mjs:1071-1124`) returns `{data, error}` and never throws, `email.ts:48-57`'s try/catch cannot observe a 403 and `return { ok: true }` executes unconditionally; `app/api/waitlist/route.ts:144` discards the result. This is a genuine defect, but it is dead code today. Fix is one env var: `offmarketmatch.com.au` is already `verified` on the same Resend key that `application-backend` uses (`OMM Support <contact@offmarketmatch.com.au>`). Also worth checking the `{ok:false}` return value at the call site.

(2) CRITICAL, and the actual reason no one gets an email — file as a separate finding: the table `waitlist_applications` does not exist in the production Postgres (verified against `information_schema.tables`: 25 public tables, none matching `%waitlist%`, on the same `railway` DB `website-frontend` connects to). `OMM_App/apps/web/drizzle/0001_wakeful_thunderbolt.sql` defines it but `railway.json` never runs migrations (`preDeployCommand: ["true"]`). With `NEXT_PUBLIC_WAITLIST_MODE=true` making the waitlist the site's entire conversion path, every POST to `/api/waitlist` fails at `route.ts:107-111`, is caught at `:134`, logs `[waitlist] DB insert failed`, and returns HTTP 500 — the user sees "Could not save your application. Please try again." and no lead is captured. It fails loudly and totally, not silently.

---

### [LOW] No secrets leak through the client bundle — EXPO_PUBLIC_/NEXT_PUBLIC_ surface is clean
*config · CONFIRMED · repos: OMM_Mobile*

**Evidence**

Downloaded the live production bundle: https://app.offmarketmatch.com.au/_expo/static/js/web/entry-a93518b61fc3849c4f3a64b29092ad41.js (5.5 MB) plus index.html, then scanned for `sk_live_[A-Za-z0-9]+`, `sk_test_[A-Za-z0-9]+`, `postgresql://…`, `re_[A-Za-z0-9_]{20,}`, `tsec_…`, `whsec_…`. Only bare SDK prefix literals `sk_live_` / `sk_test_` matched (Clerk's own key-type checks) — no key material, no DSN, no Resend or S3 credential.

Expected public values are present and correct: pk_live_Y2xlcmsub2ZmbWFya2V0bWF0Y2guY29tLmF1JA and https://api.offmarketmatch.com.au. Every EXPO_PUBLIC_* var on application-frontend (CLERK_PUBLISHABLE_KEY, API_URL, MOBILE_API_ORIGIN, WEB_ORIGIN, SENTRY_DSN, USE_LOCAL_BACKEND) is legitimately public.

**Why it matters**

Recorded as a verified negative so this doesn't get re-audited. The exposure risk in this project is not the client bundle — it is the server-side variable placement covered in the other findings (prod DSN on application-frontend, sk_live on application-enrichment, sk_test + prod DATABASE_URL on website-frontend).

**Remediation**

No action. Keep it that way: nothing secret should ever be named EXPO_PUBLIC_* or NEXT_PUBLIC_*, and this grep is worth adding as a post-build CI step against dist/.

**Verifier correction**

Confirmed clean. Minor evidentiary caveat: a loose `re_[A-Za-z0-9_]{20,}` pattern also matches the minified identifier `re_[REDACTED]_before_request` (a false positive, not just the bare SDK prefixes the investigator noted) — but no Resend key material is present. Additionally verified beyond the original scope: no source map is deployed (`.js.map` 404s to the SPA fallback, dist/ has no .map files), and the apparent 200s for /.env, /package.json, /.env.production are the SPA index.html fallback, not the real files. DATABASE_URL and RESEND_API_KEY exist on the application-frontend service but lack the EXPO_PUBLIC_ prefix, so Expo never inlines them — structurally and empirically absent from the bundle.

---

### [LOW] `packages/shared/src/mobile-api.ts` is a duplicated wire contract that has already drifted from the server on 6 of 13 shared types — and 29 of its 30 exports are dead
*drift · PARTIALLY_CONFIRMED · repos: OMM_Mobile, OMM_BACKEND*

**Evidence**

`OMM_Mobile/packages/shared/src/mobile-api.ts:1` — "keep aligned with `OMM_BACKEND` handlers and dashboard fixtures". The server-side twin is `OMM_BACKEND/src/server-data/fixtures.ts`. Structural comparison of the 13 type names present in both:
- `Listing` — BACKEND adds `coverPhotoUrl?`, `publishedAt?`, `cars?`, `addressDisclosure?: "disclose" | "not_disclose"`; mobile's copy stops at `soiAttached`.
- `MessageThread` — BACKEND adds `lastMessageAt?`, `referralStatus?: "pending"|"interested"|"declined"|"withdrawn"`, and a whole `referralDeal?` object (stage, salePriceAud, feeAud, availableActions…); mobile declares none of them, and declares `pinned` required where the server sends it optional.
- `Brief` — BACKEND has `minBaths`, `minCars`, typed `status: BriefStatus`, `matches: BriefMatch[]`, `replies: BriefReply[]`; mobile has `status: string`, `matches: unknown[]`, `replies: unknown[]` and no minBaths/minCars.
- `AuthorityExpiring` — mobile has an extra `soiAttached?` the server never sends.
- `ListingEnquiryRow` — same fields, reordered.
Only one type is actually imported anywhere: grep across `OMM_Mobile/app|lib|components` returns 5 hits, all `import type { InspectionActivityItem } from '../packages/shared/src/mobile-api'` (activities-feed.ts:3, inspection-booking-guards.ts:4, message-thread-reason.ts:7, mobile-messages-api.ts:1, omm-messages-context.tsx:16) — and `InspectionActivityItem` is the one type the backend does NOT define.
The package is also mis-branded: `packages/shared/package.json` → `"name": "@unlisted/shared"`.

**Why it matters**

244 lines presenting themselves as the API contract, where the only load-bearing type is one the server doesn't share, and the rest silently disagree with what the server actually returns. `addressDisclosure` is the dangerous omission: it is the flag that decides whether a listing's street address is shown or suppressed, and the shared contract doesn't know it exists. Anyone who "just uses the shared type" for a new screen will ship the address of a non-disclosed property.

**Remediation**

Delete every type in `packages/shared/src/mobile-api.ts` except `InspectionActivityItem`, and either move that one into `lib/` or promote it into OMM_BACKEND so the server is the single definition. Long term: generate the client types from the backend route handlers rather than hand-mirroring them.

**Verifier correction**

`OMM_Mobile/packages/shared/src/mobile-api.ts` is a stale, type-only duplicate of the backend's fixture types: 21 of its 22 exports are unimported anywhere in the repo, and 3 of the 13 type names it shares with `OMM_BACKEND/src/server-data/fixtures.ts` have substantively drifted (Listing missing coverPhotoUrl/publishedAt/cars/addressDisclosure; Brief missing minBaths/minCars and using untyped status/matches/replies; MessageThread missing lastMessageAt/referralStatus/referralDeal). A fourth, AuthorityExpiring, carries a phantom `soiAttached?` the server never sends. The remaining 9 — including ListingEnquiryRow, which differs only in field order and is therefore structurally identical — are unchanged. The single imported export, `InspectionActivityItem`, does have a server twin: `InspectionActivityRow` at OMM_BACKEND/src/db/queries.ts:3325, identical apart from `bookedForAtIso: string | null` vs `?: string`, which lib/mobile-messages-api.ts already guards. The addressDisclosure privacy hazard is theoretical only: OMM_Mobile carries its own current wire types (lib/mobile-home-api.ts MobileHomeListing, lib/omm-messages.ts StoredThread) that do include addressDisclosure and referralDeal, and all ~30 live call sites suppress non-disclosed addresses correctly. The file is also mis-branded as "@unlisted/shared" and, being `export type` only, compiles to nothing. This is a dead-code cleanup (delete the file, relocate InspectionActivityItem to lib/), not a live correctness or privacy defect.

---

### [LOW] Design tokens have fully diverged between web and product — different ink, different accent, different primary; only the font binaries are actually shared
*drift · PARTIALLY_CONFIRMED · repos: OMM_App, OMM_Mobile*

**Evidence**

`OMM_App/apps/web/app/globals.css:1-23`:
```css
--ink: #000000;  --accent: #38bdf8;  --accent-pressed: #0ea5e9;
--forest: var(--accent);  --surface: #f8fafc;  --surface-muted: #f2f2f7;
```
`OMM_Mobile/constants/theme.ts:9-65`:
```ts
black: "#242D3D",      // ink
accent: "#61B5F2",
cobalt: "#0047AB",     // "Brand primary — cobalt"
frost: "#F2F2F7",
```
So web ink `#000000` vs product ink `#242D3D`; web accent `#38bdf8` vs product accent `#61B5F2`; the product's declared brand primary `#0047AB` (cobalt) appears nowhere in the website. Clerk on the website is skinned to yet another value — `OMM_App/apps/web/lib/clerk-appearance.ts:6` `colorPrimary: "#000000"` — while the product's Clerk flows use cobalt.
The product also disagrees with itself: `OMM_Mobile/tailwind.config.js:12` `frost: '#FAFAFA'` vs `constants/theme.ts:40` `frost: "#F2F2F7"`, two values for one named token.
The only genuinely shared asset is the typeface, and it is duplicated by copy not by reference — `md5 OMM_App/apps/web/public/fonts/Satoshi-Regular.ttf` = `4da5359f3f975b25249e8cfcf142f39e` = `OMM_Mobile/assets/fonts/Satoshi-Regular.ttf`; Medium = `7bec814954d059a7e7dae047285eedbc` in both. `OMM_App/apps/web/lib/fonts.ts:3` claims "Matches mobile `Fonts.regular` / `Fonts.medium`" — true today, and true only because someone copied the file.

**Why it matters**

A user signs in on www (black + sky blue) and lands on app. (navy + cobalt). There is no shared token source, so this cannot converge by accident — and the two `frost` values inside OMM_Mobile prove the drift already happens within a single repo. Not a launch blocker on its own, but it is why the two properties will never look like one product.

**Remediation**

Publish the palette from one place (a tiny `@omm/tokens` package, or a generated CSS custom-property file checked into both). Start by reconciling `tailwind.config.js` `frost` with `constants/theme.ts` — that one is a straight bug.

**Verifier correction**

Design tokens are genuinely unshared between OMM_App and OMM_Mobile — there is no common token package (OMM_App/packages/ is empty, apps/web/package.json has no token dep), and the only shared asset is the Satoshi typeface, duplicated as byte-identical copies (md5 4da5359f3f975b25249e8cfcf142f39e / 7bec814954d059a7e7dae047285eedbc in both). The values do diverge: web --ink #000000 vs product #242D3D, web --accent #38bdf8 vs product #61B5F2, and the product's declared brand primary #0047AB (cobalt) appears nowhere in apps/web. This is reachable on a live journey: OMM_App/apps/web/app/components/AuthModalShell.tsx:113 renders Clerk <SignIn> with forceRedirectUrl -> https://app.offmarketmatch.com.au, and the web CTA is forced pure black (apps/web/app/find.css:1676) while the product's CTA is cobalt (lib/button-surface-styles.ts:73 -> #0047AB).

Two of the original supporting claims should be dropped or downgraded. First, the intra-repo frost conflict is dead code, not proof of live drift: OMM_Mobile/tailwind.config.js:12 frost '#FAFAFA' is never consumed by any utility class — only five files in the repo use className=, and they use only `glass-tab-trigger`/`glass-tab-icon-slot`; global.css hardcodes rgba(36,45,61,...). It is a documentation/config inconsistency (also mirrored in .cursor/skills/unlisted-brand-guardian/SKILL.md:35), with zero rendered effect. Second, "black + sky blue" misdescribes the website: app/find.css, the marketing homepage/about CSS, references var(--accent)/var(--forest) zero times, and several accent-styled selectors in globals.css (.suburbs-table, .mode-toggle-segment, .ledger-tab, .soi-step) have no matching component and are residue from the deleted /app workspace. The website reads as monochrome black-and-white; the real clash is monochrome-black www vs navy+cobalt app.

Severity is low, not medium: purely cosmetic, no functional impact, and the sharpest evidence is weaker than stated. The durable point is structural — nothing forces convergence, so any future brand decision has to be applied twice by hand.

---

### [LOW] `referral-pricing.ts` is copy-pasted across OMM_BACKEND and OMM_Mobile; formulas agree today but the eligibility rule and the output separator already don't
*drift · PARTIALLY_CONFIRMED · repos: OMM_BACKEND, OMM_Mobile*

**Evidence**

`OMM_BACKEND/src/lib/referral-pricing.ts:1-3` — "Mirrors OMM_APP `lib/referral-pricing.ts` — keep formulas aligned when changing either copy. Server is the contract for `POST /api/mobile/referral-quote`." The header points at the wrong repo: OMM_APP is now marketing-only and contains no such file; the real twin is `OMM_Mobile/lib/referral-pricing.ts`.
Diff of the two files: the shared maths (`resolvePriceGuideRange`, `commissionPoolRangeFromGuide`, `referralFeeFromCommissionPool`, `referralFeeMidEstimateAud`, `ILLUSTRATIVE_COMMISSION_OF_SALE_PCT = 2.5`) is character-identical. Two things are not:
1. Separator — backend `formatReferralEstimateLine`/`formatCommissionPoolLine` return `` `${lo} — ${hi}` `` (em dash, lines 57 and 67); the mobile copy returns `` `${lo} - ${hi}` `` (hyphen) and returns `'-'` where the server returns `'—'` for the null case. The mobile screen shows the server string when the quote call succeeds and its own local string when it doesn't (`lib/use-mobile-referral-quote.ts:58` "returns `null` when API is off-line"), so the same field renders two different ways on the same screen depending on connectivity.
2. Eligibility — `eligibleReferralFromOmmRole` exists only in the backend (lines 80-84, `r !== "buyer agent"`, case-insensitive on a trimmed string) and is consumed by `app/api/mobile/referral-quote/route.ts:7`. The client re-implements it inline and case-sensitively in two separate screens: `app/(tabs)/add/referral.tsx:125` `const eligibleReferral = role !== 'Buyer Agent';` and `app/(tabs)/add/review.tsx:128` (same line).
Other constants duplicated by hand and currently in agreement: `SLIDER_TICK_PCTS = [10, 25]` (route.ts:24 / referral.tsx:45), min/max share 10/25 (route.ts:22-23 / referral.tsx:43-44), and `COMMISSION_PRESETS = [2.0, 2.2, 2.5, 2.75, 3.0]` (route.ts:25 / referral.tsx:41 as `COMMISSION_ASSUMPTION_PRESETS`).

**Why it matters**

Referral fees are money. Five constants and one eligibility rule governing them are maintained by hand in two repos with a comment pointing at a third that no longer has the file. They agree today; nothing enforces that they agree tomorrow, and the client's case-sensitive `role !== 'Buyer Agent'` will already disagree with the server's case-insensitive check for any legacy metadata value like `"buyer agent"` — which the backend's own `normalizeOmmRoleFromUnknown` (`src/lib/omm-role.ts:15`) shows it expects, since it carries a `"Vendor Agent" → "Vendor advocate"` legacy alias.

**Remediation**

Fix the stale header comment to name OMM_Mobile. Have the mobile screens call `eligibleReferralFromOmmRole` via the quote response's existing `eligibleReferral` field rather than re-deriving it, and normalise the separator to one character. Move the slider bounds and commission presets to server-supplied values only — the quote response already carries `sliderTickPct` and `commissionPresets` (`lib/mobile-referral-quote-api.ts:108,131`), so the client-side copies are redundant.

**Verifier correction**

`referral-pricing.ts` is genuinely duplicated between `OMM_BACKEND/src/lib/` and `OMM_Mobile/lib/` (mobile is a superset; the five shared maths functions are byte-identical), and the backend's header comment points at OMM_APP, which no longer contains the file — the real twin is OMM_Mobile. Two real drifts exist. (1) Separator: backend emits em dash `—` for ranges and the null placeholder, mobile emits hyphen `-`, and `referral.tsx:259-260` / `:166-167` render the server string online and the local string offline, so the commission-pool line changes punctuation with connectivity. (2) Five hand-duplicated constants (min/max 10/25, `SLIDER_TICK_PCTS`, `COMMISSION_PRESETS`) agree today with nothing enforcing it — though `commissionPresets` is echoed by the API and preferred when online. The claimed eligibility divergence is REFUTED: `eligibleReferralFromOmmRole` does exist only on the server, but the client comparison `role !== 'Buyer Agent'` can never see a raw metadata string — `getUserRole()` and `parseOmmRoleFromUnknown` restrict it to the canonical closed set or `null`, and that same normalized value is the only source of the server's `workspaceRole`, so the two agree on every reachable input including legacy `"buyer agent"` (both → eligible). The server's `.toLowerCase()` is unreachable, and the `"Vendor Agent"` alias cited as evidence is present identically in both repos. Separately, the sharper defect the claim missed is in `review.tsx:132`: online it shows a single min-price dollar figure (collapsed by `normalizeReferralQuoteForMinPrice`) while offline it shows a full lo–hi range, so the referral amount on the final publish step changes shape, not just punctuation, with connectivity — and `audDisplayPreferMin` splits on the hyphen while the server sends an em dash, a latent silent failure. Severity remains low overall (illustrative, non-persisted quote figures), with the review-screen shape mismatch the one piece worth fixing first.

---
