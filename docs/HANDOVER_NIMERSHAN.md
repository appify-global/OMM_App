# Handover — Unlisted (web + native)

## Apps

| Path | Purpose |
|------|---------|
| [`apps/web`](../apps/web) | Next.js — marketing, authenticated `/app` workspace, `/api/mobile/*` JSON for the Expo app |
| [`apps/mobile`](../apps/mobile) | Expo React Native — native parity UI, Clerk, calls web APIs with `Authorization: Bearer` |
| [`packages/shared`](../packages/shared) | Shared TypeScript types for mobile API payloads |

## Run web locally

```sh
cd /path/to/omm
npm install
npm run dev
```

Next listens on **port 3101** by default (`apps/web/package.json`).

## Native UI vs web

Mobile reuses the same **design tokens** as [`apps/web/app/globals.css`](../apps/web/app/globals.css) (`apps/mobile/src/theme/tokens.ts`) and React Native primitives in [`apps/mobile/src/components/ui/`](../apps/mobile/src/components/ui/) (`Screen`, `AppText`, `Button`, `Card`, `TextField`) so styling stays aligned while staying on RN components.

Marketing **images** mirror the web home: [`hero-poster.jpg`](../apps/web/public/hero-poster.jpg) and store badges are copied under `apps/mobile/assets/`; listing and blog cards use the same Unsplash URLs as [`apps/web/app/page.tsx`](../apps/web/app/page.tsx). **`expo-image`** loads remote and local assets efficiently (not WebView). When the web hero poster changes, copy the file into `apps/mobile/assets/` again.

## Run mobile locally

```sh
npm run dev:mobile
```

`dev:mobile` runs Expo with **`--localhost`**, so the **iOS Simulator** and Metro use `127.0.0.1` (avoids broken `exp://` URLs when Personal Hotspot picks the wrong interface). For a **physical device** or Expo Go on Wi‑Fi, use `npm run dev:mobile:lan` instead (and set `EXPO_PUBLIC_API_URL` to your Mac’s LAN IP, not `127.0.0.1`).

Configure `apps/mobile/.env` from [`apps/mobile/.env.example`](../apps/mobile/.env.example):

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — must match web `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- `EXPO_PUBLIC_API_URL` — e.g. `http://127.0.0.1:3101` or your LAN IP for a physical device.

## Environment (web)

Copy [`.env.example`](../.env.example) to `apps/web/.env` (or set on Railway). Required for mobile APIs:

- `CLERK_SECRET_KEY` — verifies Bearer tokens on `/api/mobile/*`.

## Mobile HTTP API

Route handlers under `apps/web/app/api/mobile/` call the same loaders as RSC pages (e.g. `loadHomePageData`). Middleware skips cookie `auth.protect()` for `/api/mobile/*`; each handler uses `getUserIdFromMobileRequest` (`Authorization: Bearer` session JWT from Expo).

## EAS / stores

- [`apps/mobile/eas.json`](../apps/mobile/eas.json) defines `development`, `preview`, and `production` profiles.
- Set a real Expo project id in [`apps/mobile/app.json`](../apps/mobile/app.json) → `expo.extra.eas.projectId` (replace placeholder).
- Install EAS CLI: `npm run eas:build -w apps/mobile` or `npx eas-cli` from `apps/mobile`.

## Mobile using the same backend as Railway

The deployed Next app on Railway is the same backend the native app talks to (`/api/mobile/*`). Use **the same values Railway already has**, wired through Expo’s public env vars:

| Railway (web) | Mobile (Expo / EAS) | Notes |
|---------------|---------------------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Same string** — one Clerk “application”; copy from Railway’s service variables (or Clerk dashboard). |
| Public site URL (e.g. `https://your-app.up.railway.app`) | `EXPO_PUBLIC_API_URL` | Set to the **origin only** (no trailing slash), e.g. `https://your-app.up.railway.app`. |

**Local dev:** keep `EXPO_PUBLIC_API_URL=http://127.0.0.1:3101` (or LAN IP for a device). The Clerk key can stay only in `apps/web/.env` — see [`apps/mobile/app.config.js`](../apps/mobile/app.config.js).

**EAS builds (preview / production):** define those two variables for the build environment in [EAS Environment variables](https://docs.expo.dev/eas/environment-variables/) (Expo dashboard or `eas env:create`). They are not read from Railway automatically; **duplicate the same publishable key and set the API URL to your Railway hostname** so the installed app hits production.

**Clerk:** In the Clerk dashboard, ensure **allowed origins / redirect URLs** include your Railway URL and any Expo auth redirect URIs you use (see Clerk’s Expo docs) so sign-in works against the same Clerk instance.

## Deploy (Railway)

[`railway.json`](../railway.json): **Build** `npm install && npm run build:website`, **Start** `npm run start:website`.
