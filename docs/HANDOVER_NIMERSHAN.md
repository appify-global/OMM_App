# Handover — MATCH marketing website

**This repo is the marketing website only.** It used to also hold an
authenticated `/app` workspace, an `/api/mobile/*` surface and an `apps/mobile`
Expo client. Those were superseded and removed — the product now lives in its
own repos. If you are looking for the app or the API, they are not here.

## Where everything lives

One Railway project, `OMM: Web & Mobile Platform`:

| Repo | Railway service | Domain | What it is |
|---|---|---|---|
| `appify-global/OMM_App` *(this one)* | `website-frontend` | www.offmarketmatch.com.au | Marketing site |
| `appify-global/OMM_Mobile` | `application-frontend` | app.offmarketmatch.com.au | **The product.** One Expo Router codebase → iOS, Android and web (react-native-web) |
| `appify-global/OMM_BACKEND` | `application-backend` | api.offmarketmatch.com.au | **The API.** Serves `/api/mobile/*`, port **3102** locally. Owns the Drizzle schema/migrations |
| `appify-global/OMM_ENRICHMENT` | `application-enrichment` | — | PropertyData / SOI generation |

Shared services: Postgres, Redis, an `application-imagery` bucket, and
`omm-dashboard`.

Clerk is one instance across all of them — the web session and the mobile
Bearer token come from the same application.

## Contents of this repo

| Path | Purpose |
|---|---|
| [`apps/web`](../apps/web) | Next.js marketing site. Home, about, listings, suburbs, briefs, insights, waitlist, Clerk auth shell |
| [`apps/web/src/db`](../apps/web/src/db) | Drizzle client + queries. Used only by the waitlist, the Clerk webhook and notification reads |
| [`packages/shared`](../packages/shared) | Legacy types for the removed mobile API. Imported nowhere — safe to delete |

## Run locally

```sh
npm install
npm run dev            # port 3101
```

Copy [`.env.example`](../.env.example) to `apps/web/.env.local`. See the README
for the full variable table.

**Typechecking — read this.** Run:

```sh
cd apps/web && npx tsc --noEmit --ignoreDeprecations 6.0
```

Without `--ignoreDeprecations`, `tsc` aborts on a `TS5101` deprecation error in
`tsconfig.json` and **exits 0 without checking a single file**. A plain
`tsc --noEmit` reports success even when imports are broken.

**Don't run a production build while the dev server is running** — both write
to the same `.next`, and it corrupts what the dev server serves.

## Site behaviour worth knowing

- **Waitlist mode** (`NEXT_PUBLIC_WAITLIST_MODE`, default on) redirects
  `/sign-in` and `/sign-up` to home and swaps every CTA for the waitlist modal.
  The modal requires a **real estate licence number** — the site is pitched at
  licensed listing agents and buyers agents, not consumers.
- **Links into the product** use `APP_ORIGIN`
  ([`apps/web/app/lib/nav.ts`](../apps/web/app/lib/nav.ts)), which defaults to
  app.offmarketmatch.com.au and is overridable with `NEXT_PUBLIC_APP_ORIGIN`.
  That covers the Dashboard button, the post-signup redirect, and the legal
  links on `/welcome` (Terms, Privacy, Community Guidelines all live in
  `OMM_Mobile`).
- **Hero copy is width-constrained.** `.hero-find__title` and
  `.hero-find__lede` are `white-space: nowrap` above 560px / 720px, so
  replacement strings must be no longer than what they replace or they will
  overflow. Below those breakpoints they clamp to `14ch` / `32ch` and wrap.

## Deploy

Railway builds with `build:website` and starts with `start:website` — see
[`railway.json`](../railway.json). Healthcheck is `/api/healthz`, which
middleware deliberately skips Clerk for.
