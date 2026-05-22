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

Mobile calls **`EXPO_PUBLIC_API_URL`** (or **`EXPO_PUBLIC_MOBILE_API_ORIGIN`**) → the same **`/api/mobile/*`** host.

## Commands

```sh
npm install
npm run dev          # Next.js in apps/web, port 3101
npm run dev:backend  # Starts ../OMM_BACKEND if present (port 3102)
npm run build:website
npm run start:website
```

- Web env: **`apps/web/.env.local`** — Clerk publishable key, **`BACKEND_URL=http://127.0.0.1:3102`**, etc.
- Mobile env: **`../OMM_APP/.env`** — **`EXPO_PUBLIC_*`** origins (see that repo’s **`.env.example`**).

See [`docs/LOCAL_DEV_TROUBLESHOOTING.md`](docs/LOCAL_DEV_TROUBLESHOOTING.md).

See [`docs/HANDOVER_NIMERSHAN.md`](docs/HANDOVER_NIMERSHAN.md) for more detail.
