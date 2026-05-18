# Unlisted

Monorepo for the Unlisted product (PreMarket).

## Apps

- [`apps/web`](apps/web) — Next.js (marketing + authenticated `/app` + Postgres via Drizzle + **`/api/mobile/*`** JSON for the native client).
- **Expo mobile** lives at **repo root** — [`app/`](app/) (Expo Router, NativeWind). Same Clerk app + same backend URLs as web.

## Common commands

```sh
npm install
npm run dev          # Next.js (default dev server, port 3101)
npm run dev:mobile   # Expo (--localhost; use dev:mobile:lan for a physical device)
npm run build:website
npm run start:website
```

Production deploy (Railway) uses `build:website` and `start:website` — see [`railway.json`](railway.json).

### Mobile dev (root Expo app)

1. Copy [`.env.example`](.env.example) to `.env` at repo root **or** set the same vars in EAS/build.
2. Use the **same** Clerk publishable key as web: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (web) = `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (Expo).
3. Point `EXPO_PUBLIC_API_URL` at your Next **origin**. Local default: **`http://127.0.0.1:3101`** (see `apps/web/package.json`).
4. Run `npm run dev` (web) and `npm run dev:mobile` (Expo). For a phone on the network use `npm run dev:mobile:lan` and set `EXPO_PUBLIC_API_URL` to your machine’s LAN IP.

Native calls **`GET/POST`** routes under **`/api/mobile/*`** on that origin (Bearer token auth). **`CLERK_SECRET_KEY`** in `apps/web/.env` is required so those handlers can verify JWTs.

**Railway:** use the same publishable key and set `EXPO_PUBLIC_API_URL` to your Railway site origin (no trailing slash). Configure `expo.extra.eas.projectId` in [`app.json`](app.json) and use [`eas.json`](eas.json) for builds.

See [`docs/HANDOVER_NIMERSHAN.md`](docs/HANDOVER_NIMERSHAN.md) for more detail.
