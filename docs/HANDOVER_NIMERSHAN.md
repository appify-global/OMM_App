# Handover — Unlisted (web + native)

## Apps

| Path | Purpose |
|------|---------|
| [`apps/web`](../apps/web) | Next.js — marketing, authenticated `/app` workspace (UI only for data; server components call **`NEXT_PUBLIC_BACKEND_URL`** with Clerk Bearer). |
| **[`OMM_BACKEND`](../../OMM_BACKEND)** (sibling folder) | API service — Drizzle + Postgres, **`/api/mobile/*`** for Expo and web, **`/api/webhooks/clerk`**. |
| [`app/`](../app/) (repo root) | Expo Router — uses **`EXPO_PUBLIC_API_URL`** → same origin as **`NEXT_PUBLIC_BACKEND_URL`**. |
| [`packages/shared`](../packages/shared) | Shared TS types for **`/api/mobile/*`** payloads — keep aligned with **`OMM_BACKEND`** route handlers. |

## Run locally

### API backend (required for `/app` + mobile)

```sh
cd /path/to/OMM_BACKEND
npm install
cp .env.example .env.local   # DATABASE_URL, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, …
npm run dev                  # port 3102
```

### Web (this monorepo)

```sh
cd /path/to/OMM
npm install
# apps/web/.env.local: NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:3102 (+ Clerk publishable key, etc.)
npm run dev                  # port 3101
```

## Native vs web UI

Marketing and authenticated **web UI** lives under `apps/web`. The native app (`app/` at repo root) is a separate React Native codebase (Expo Router) that should stay visually aligned with web product decisions via shared tokens/design language as you evolve both.

## Run mobile locally (root Expo app)

```sh
npm run dev:mobile
```

`dev:mobile` runs **`expo start --localhost`**. For a **physical device**, use **`npm run dev:mobile:lan`** and set **`EXPO_PUBLIC_API_URL`** to your Mac’s **LAN IP** and backend port (e.g. `http://192.168.x.x:3102`).

### Env (mobile)

Configure **repo root** `.env` (see [`../.env.example`](../.env.example)):

- **`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`** — must match web **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** (same Clerk application).
- **`EXPO_PUBLIC_API_URL`** — backend origin: local **`http://127.0.0.1:3102`**; prod: **`https://<your-backend-deployment>`** (no trailing slash).

## Environment (web)

In **`apps/web/.env.local`**:

- **`NEXT_PUBLIC_BACKEND_URL`** — public origin of **`OMM_BACKEND`** (used by RSC fetch + client notification calls).
- **`BACKEND_URL`** — optional server-only override (same as above if unset).
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** / Clerk web session vars as before.
- **No `DATABASE_URL`** on web — DB lives only on the backend.

## Environment (API backend)

See **`OMM_BACKEND/.env.example`**: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, etc.

## Mobile HTTP API (`/api/mobile/*`)

Implemented under **`OMM_BACKEND/app/api/mobile/`**. Each handler validates **`Authorization: Bearer`** via **`getUserIdFromMobileRequest`** (`OMM_BACKEND/src/lib/mobile-bearer-auth.ts`). Next.js web server components use the same JWT via **`auth().getToken()`** when calling the backend.

## Clerk webhook

Configure in Clerk Dashboard → Webhooks:

- **Endpoint:** `https://<backend-host>/api/webhooks/clerk` (the **`OMM_BACKEND`** deployment, not necessarily the marketing site).

## EAS / stores

- [`eas.json`](../eas.json) — **`development`**, **`preview`**, **`production`** build profiles at repo root.
- Set a real Expo project id in **`app.json`** → **`expo.extra.eas.projectId`**.
- EAS env: **`EXPO_PUBLIC_API_URL`** should be the **backend** public URL.

## Deploy (Railway)

- **Web (this repo):** [`railway.json`](../railway.json) — build/start `apps/web`. Set **`NEXT_PUBLIC_BACKEND_URL`** to your backend service URL (and ensure **`npm run build:website`** receives that var at build time if required).
- **Backend:** deploy **`OMM_BACKEND`** separately with `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, and the same Clerk application as web/Expo.
