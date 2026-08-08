# OMM — Marketing website

Public marketing site for **MATCH** (Off the Market Match) — www.offmarketmatch.com.au.

> **This repo is the website only.** The product lives elsewhere. See
> [Where everything lives](#where-everything-lives) before you start looking for
> the app or the API in here.

## Contents

- [`apps/web`](apps/web) — Next.js marketing site: home, about, listings,
  suburbs, briefs, insights, the waitlist flow and the Clerk auth shell.
  Postgres via Drizzle backs the waitlist and Clerk webhooks.
- [`packages/shared`](packages/shared) — legacy TypeScript types for a mobile
  API that no longer lives here. Imported nowhere; safe to delete.

## Where everything lives

The product was split out of this repo. Four repos, one Railway project
(`OMM: Web & Mobile Platform`):

| Repo | Railway service | Domain | What it is |
|---|---|---|---|
| `appify-global/OMM_App` *(this one)* | `website-frontend` | www.offmarketmatch.com.au | Marketing site |
| `appify-global/OMM_Mobile` | `application-frontend` | app.offmarketmatch.com.au | **The product** — one Expo Router codebase for iOS, Android and web |
| `appify-global/OMM_BACKEND` | `application-backend` | api.offmarketmatch.com.au | **The API** — serves `/api/mobile/*`, port 3102 locally |
| `appify-global/OMM_ENRICHMENT` | `application-enrichment` | — | PropertyData / SOI generation |

An authenticated `/app` workspace, an `/api/mobile/*` surface and an
`apps/mobile` Expo app all used to live here. They were superseded by
`OMM_Mobile` + `OMM_BACKEND` and removed — the copies left behind had drifted
months out of date while still building and deploying, which made them look
current. Don't reintroduce them here.

Anything on the site that sends a signed-in member into the product links to
`APP_ORIGIN` ([`apps/web/app/lib/nav.ts`](apps/web/app/lib/nav.ts)), overridable
with `NEXT_PUBLIC_APP_ORIGIN`.

## Common commands

```sh
npm install
npm run dev            # Next.js dev server on port 3101
npm run build:website
npm run start:website
```

Production deploy (Railway) uses `build:website` and `start:website` — see
[`railway.json`](railway.json).

**Typechecking:** run `npx tsc --noEmit --ignoreDeprecations 6.0` from
`apps/web`. Without the flag, `tsc` aborts on a `TS5101` deprecation error in
`tsconfig.json` and exits 0 *without checking anything* — a plain
`tsc --noEmit` looks clean even when the code is broken.

## Environment

Copy [`.env.example`](.env.example) to `apps/web/.env.local`. Minimum for the
site to boot: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk auth + webhook verification |
| `DATABASE_URL` | Postgres — waitlist signups and Clerk user sync |
| `NEXT_PUBLIC_WAITLIST_MODE` | `true` (default) sends `/sign-in` and `/sign-up` home and swaps CTAs for the waitlist modal |
| `BYPASS_CLERK_AUTH` | Dev/staging only — skips sign-in on members-only pages |
| `NEXT_PUBLIC_APP_ORIGIN` | Overrides the product URL used by Dashboard / post-signup links |
| `RESEND_API_KEY` / `WAITLIST_FROM_EMAIL` | Waitlist thank-you email. Without it signups still save, no email sent |
| `IPINFO_TOKEN` / `GEO_DEV_CITY` | Home "Properties near …" geolocation |

See [`docs/HANDOVER_NIMERSHAN.md`](docs/HANDOVER_NIMERSHAN.md) for more detail.
