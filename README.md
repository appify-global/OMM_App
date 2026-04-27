# Unlisted

Monorepo for the Unlisted product (PreMarket).

## Apps

- [`apps/web`](apps/web) — Next.js app (web + JSON APIs for native).
- [`apps/mobile`](apps/mobile) — Expo / React Native app (native UI, same Clerk app and backend).

## Common commands

```sh
npm install
npm run dev          # Next.js (default dev server)
npm run dev:mobile   # Expo (--localhost; use dev:mobile:lan for a physical device)
npm run build:website
npm run start:website
```

Production deploy (Railway) uses `build:website` and `start:website` — see [`railway.json`](railway.json).

### Mobile dev

1. Copy [`apps/mobile/.env.example`](apps/mobile/.env.example) to `apps/mobile/.env`.
2. Use the **same** Clerk publishable key as web (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` on web = `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` on mobile).
3. Point `EXPO_PUBLIC_API_URL` at your Next dev server (default web dev port is **3101** — see `apps/web/package.json`).
4. Run `npm run dev` in one terminal and `npm run dev:mobile` in another. For a phone on the network, use `npm run dev:mobile:lan` and set `EXPO_PUBLIC_API_URL` to your machine’s LAN address.

**Same app as Railway:** use the same Clerk publishable key as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` on Railway (`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in EAS or local). Point `EXPO_PUBLIC_API_URL` at your Railway URL (e.g. `https://…up.railway.app`) for builds or local testing against prod — see [`docs/HANDOVER_NIMERSHAN.md`](docs/HANDOVER_NIMERSHAN.md#mobile-using-the-same-backend-as-railway).
