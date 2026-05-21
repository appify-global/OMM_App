# Unlisted

Monorepo for the Unlisted product (PreMarket).

## Apps

- [`apps/web`](apps/web) — Next.js marketing + authenticated `/app` (port **3101**). UI only for data: server fetches **`OMM_BACKEND`** via **`BACKEND_URL`**.
- **[`OMM_BACKEND`](../OMM_BACKEND)** — API service (port **3102**): **`/api/mobile/*`**, Clerk webhooks, Postgres/Drizzle. **`DATABASE_URL`** + **`CLERK_*`** in **`OMM_BACKEND/.env.local`** (sync from `apps/web/.env.local`).
- **Expo mobile** — repo root [`app/`](app/). **`EXPO_PUBLIC_MOBILE_API_ORIGIN`** / **`EXPO_PUBLIC_API_URL`** → **3102**; **`EXPO_PUBLIC_WEB_ORIGIN`** → **3101** (support forms). See **`docs/LOCAL_DEV_TROUBLESHOOTING.md`**.

## Common commands

```sh
npm install
npm run dev          # Web UI (apps/web), port 3101
npm run dev:backend  # API (OMM_BACKEND), port 3102 — required for mobile publish + /app data
npm run dev:mobile   # Expo (--localhost; use dev:mobile:lan for a physical device)
npm run build:website
npm run start:website
```

**Expo `.env`**: API → **`http://127.0.0.1:3102`**, web → **`http://127.0.0.1:3101`** ([`.env.example`](.env.example)). **`OMM_BACKEND/.env.local`**: **`DATABASE_URL`**, **`CLERK_SECRET_KEY`**, webhook secret. **`apps/web/.env.local`**: **`BACKEND_URL=http://127.0.0.1:3102`**, Clerk publishable key.

Production: deploy **OMM_BACKEND** with mobile routes; set Expo **`EXPO_PUBLIC_API_URL`** and web **`NEXT_PUBLIC_BACKEND_URL`** to that HTTPS host.

### Mobile dev (root Expo app)

1. Copy [`.env.example`](.env.example) to `.env` (**3102** API, **3101** web). Copy Clerk/DB vars to **`../OMM_BACKEND/.env.local`**. Run **`npm run dev:backend`** and **`npm run dev`** in two terminals.
2. Restart Metro after `.env` changes.

Configure `expo.extra.eas.projectId` in [`app.json`](app.json) / [`eas.json`](eas.json) for EAS builds.

See [`docs/LOCAL_DEV_TROUBLESHOOTING.md`](docs/LOCAL_DEV_TROUBLESHOOTING.md) for **404 / publish HTML alerts**, **`OMM_BACKEND`**, and Next.js lockfile / pnpm notes.

See [`docs/HANDOVER_NIMERSHAN.md`](docs/HANDOVER_NIMERSHAN.md) for more detail.
