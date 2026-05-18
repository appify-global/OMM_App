# Handover — Unlisted (web + native)

## Apps

| Path | Purpose |
|------|---------|
| [`apps/web`](../apps/web) | Next.js — marketing, authenticated `/app` workspace, Drizzle + Postgres. Exposes **`/api/mobile/*`** JSON for the Expo app (same DB loaders as server components where applicable). |
| [`app/`](../app/) (repo root) | Expo Router + NativeWind — primary native client; uses Clerk Expo and **`EXPO_PUBLIC_API_URL`** to reach the Next app. |
| [`packages/shared`](../packages/shared) | Shared TypeScript surface for **`/api/mobile/*`** payloads (keep aligned with web route handlers). |

## Run web locally

```sh
cd /path/to/omm
npm install
npm run dev
```

Next listens on **port 3101** by default (`apps/web/package.json`).

## Native vs web UI

Marketing and authenticated **web UI** lives under `apps/web`. The native app (`app/` at repo root) is a separate React Native codebase (Expo Router) that should stay visually aligned with web product decisions via shared tokens/design language as you evolve both.

## Run mobile locally (root Expo app)

```sh
npm run dev:mobile
```

`dev:mobile` runs **`expo start --localhost`** so simulator + Metro resolve `127.0.0.1` cleanly. For a **physical device** or Expo Go on Wi‑Fi, use **`npm run dev:mobile:lan`** (`expo start`) and set **`EXPO_PUBLIC_API_URL`** to your Mac’s **LAN IP** (not `127.0.0.1`).

### Env (mobile)

Configure **repo root** `.env` (see [`../.env.example`](../.env.example)):

- **`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`** — must match web **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** (same Clerk application).
- **`EXPO_PUBLIC_API_URL`** — local: **`http://127.0.0.1:3101`**; device: **`http://<LAN-IP>:3101`**; prod: **`https://<your-deployment>`** origin only.

## Environment (web)

Copy [`.env.example`](../.env.example) hints into **`apps/web/.env`** (and Railway vars). Required for mobile APIs:

- **`CLERK_SECRET_KEY`** — verifies Bearer tokens on **`/api/mobile/*`** (must match the same Clerk app as publishable keys above).

## Mobile HTTP API (`/api/mobile/*`)

Route handlers under **`apps/web/app/api/mobile/`** implement JSON for authenticated native clients. Middleware skips cookie **`auth.protect()`** for **`/api/mobile/*`**; each handler validates **`Authorization: Bearer`** via **`getUserIdFromMobileRequest`** (`apps/web/src/lib/mobile-bearer-auth.ts`).

## EAS / stores

- [`eas.json`](../eas.json) — **`development`**, **`preview`**, **`production`** build profiles at repo root.
- Set a real Expo project id in **`app.json`** → **`expo.extra.eas.projectId`** (replace placeholder).
- EAS CLI: `npx eas-cli` from repo root (`eas build …` targets this app).

## Mobile using the same backend as Railway

The deployed Next app is the backend the native app talks to (**`/api/mobile/*`**). Mirror Railway web env into Expo/EAS:

| Railway (web) | Mobile (Expo / EAS) | Notes |
|---------------|---------------------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Same string** — one Clerk application. |
| Public site URL (e.g. `https://your-app.up.railway.app`) | `EXPO_PUBLIC_API_URL` | **Origin only**, no trailing slash. |

**EAS:** define **`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`** and **`EXPO_PUBLIC_API_URL`** for preview/production build profiles ([EAS environment variables](https://docs.expo.dev/eas/environment-variables/)).

**Clerk:** allowed origins / redirect URLs must include your Railway hostname and Clerk’s Expo redirect URI patterns.

## Deploy (Railway)

[`railway.json`](../railway.json): **Build** `npm install && npm run build:website`, **Start** `npm run start:website`.
