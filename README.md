# Unlisted (web)

Next.js repo for **Unlisted / PreMarket** — marketing site and authenticated **`/app`**.

Mobile (Expo) lives in sibling repo **`../OMM_APP`** (same machine path: **`Documents/OMM_APP`**).

## Architecture

| Surface | Repo / path |
| -------- | ----------- |
| **Web** | This repo: [`apps/web`](apps/web) — port **3101** |
| **Mobile** | [`../OMM_APP`](../OMM_APP) — Expo |
| **API** | **`../OMM_BACKEND`** (recommended) — **`/api/mobile/*`**, Postgres, Clerk — port **3102** |

Server-side data loaders in Next call **`BACKEND_URL`** / **`NEXT_PUBLIC_BACKEND_URL`** → **`OMM_BACKEND`**.

The native app calls **`EXPO_PUBLIC_API_URL`** / **`EXPO_PUBLIC_MOBILE_API_ORIGIN`** at the **`/api/mobile/*`** host (see **`../OMM_APP/.env.example`**).

**Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in **`apps/web/.env.local`** must match **`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`** in **`../OMM_APP/.env`**.

## Commands

```sh
npm install
npm run dev          # Next.js in apps/web, port 3101
npm run dev:backend  # Starts ../OMM_BACKEND if present (port 3102)
npm run build:website
npm run start:website
```

- Web env: **`apps/web/.env.local`** (see [`.env.example`](.env.example)).
- Mobile env: **`../OMM_APP/.env`**.

Production (e.g. Railway): set **`EXPO_PUBLIC_*`** origins on the Expo/EAS side to your deployed API/web URL as documented in mobile README.

See [`docs/LOCAL_DEV_TROUBLESHOOTING.md`](docs/LOCAL_DEV_TROUBLESHOOTING.md).

See [`docs/HANDOVER_NIMERSHAN.md`](docs/HANDOVER_NIMERSHAN.md) for more detail.
