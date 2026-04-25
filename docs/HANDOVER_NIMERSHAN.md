# Handover: Web → native iOS & Android (React Native / Expo)

**For:** Nimershan and team  
**Repository:** OMM / PreMarket (Unlisted) monorepo  
**Date:** April 2026  

This document explains how the product fits together today and a practical path to **production-ready native apps** on the App Store and Google Play using **React Native** (already in tree via **Expo**).

---

## 1. What you have in the repo

| Path | Role |
|------|------|
| `apps/web` | **Next.js** app — production web app, Clerk auth, Postgres (Drizzle), Railway deployment. This is the source of truth for **backend behaviour** and many **API contracts** you will mirror or call from mobile. |
| `apps/mobile` | **Expo (React Native)** app — `app.json` sets `com.unlisted.app` for iOS and Android. Screens live under `apps/mobile/src/screens`, navigation in `src/navigation`. |
| Root `package.json` | Monorepo scripts: `dev:web` → Next dev; `build:website` / `start:website` for the web app; `android` / `ios` in workspaces point at mobile where configured. |

**Today there is no `eas.json` in the repo.** Local development uses `expo start` and `expo run:ios` / `expo run:android` after prebuild. **Store builds** should use **EAS Build** (Expo’s cloud builders) so you do not have to own macOS build farms for iOS in CI.

---

## 2. How “native” fits the stack

- **React Native** = JavaScript/TypeScript UI that compiles to native views (not a WebView for the main shell). Your `apps/mobile` already uses this model.
- **Expo** = tooling, dev client, OTA updates (optional), and the standard path to **EAS Build** and **EAS Submit**.
- **“Same app as the website”** usually means: **same auth (Clerk)**, same **API base URL**, and shared product rules — not the same React DOM components. Expect to **call the same backend** (or Next route handlers) from `fetch` / React Query, not to import Next `app/` code into RN.

---

## 3. One-time: accounts and machines

### Everyone

- **Node 20+** and **npm 10+** (see root `package.json` `engines`).
- Clone the repo, `npm install` at the monorepo root (workspaces install `apps/web` and `apps/mobile`).

### iOS (you need at least one Mac or EAS in the cloud)

- **Apple Developer Program** (paid, org or individual) for TestFlight and App Store.
- **Expo account** (free tier exists; EAS has usage-based billing for builds).
- Optional local: **Xcode** (latest stable) for simulator and on-device debug.

### Android

- **Google Play Console** (one-time registration fee) for production tracks.
- **Android Studio** + SDK for emulators; physical device with USB debugging for real-world testing.

### Backend / secrets

- Web prod runs on **Railway**; env vars (Clerk, `DATABASE_URL`, etc.) are defined there. Mobile will need **its own** env for dev/staging: at minimum `EXPO_PUBLIC_*` variables for public keys (e.g. Clerk publishable key) and your API base URL. **Never** ship server secrets in the app binary.

---

## 4. Recommended path to TestFlight and Play (internal first)

This is the usual sequence for Expo SDK 50+; adjust versions from Expo docs if they differ when you read this.

### Step A — Link the project to Expo

1. In `apps/mobile`: `npx expo login` (or create org for the team).
2. Run `npx eas-cli init` or `npx create-expo-app` pattern from current Expo docs so **project ID** is registered — follow [Expo: Get started with EAS](https://docs.expo.dev/eas/) for the exact command for your SDK.

### Step B — Add EAS configuration (not yet in repo)

1. `npm i -D eas-cli` at repo root or use `npx eas-cli`.
2. `cd apps/mobile && eas build:configure`  
   - This creates **`eas.json`** with `development`, `preview`, and `production` profiles.
3. Commit `eas.json` and any `app.config.js` / `app.json` updates Expo suggests.

**Typical `eas.json` idea (you will get concrete JSON from the CLI):**

- **iOS:** `image` / Xcode version as recommended by Expo for your SDK.
- **Android:** `buildType: "app-bundle"` for Play (AAB).
- **Credentials:** let EAS manage them initially (`eas credentials`); later move to org-owned certs for enterprise compliance if needed.

### Step C — Build binaries

- **iOS (Ad Hoc or TestFlight):**  
  `eas build --platform ios --profile production`  
  (Use `preview` or `development` first if you use dev clients.)
- **Android (APK for sideload or AAB for Play):**  
  `eas build --platform android --profile production`

Download artefacts from the Expo dashboard or use `eas build:list`.

### Step D — Submit to stores (optional but saves time)

- `eas submit -p ios` and `eas submit -p android` after builds succeed, with App Store Connect and Play API keys configured (Expo documents key setup).

### Step E — OTA config updates (not native code)

- **EAS Update** can ship JS/asset updates without a new store review, within limits Apple/Google allow. Plan this after the first store release; it needs `expo-updates` and channel configuration.

---

## 5. Local development (agent workflow)

```bash
cd OMM_App
npm install
cd apps/mobile
npx expo start
# Press i for iOS simulator (Mac), a for Android emulator, or scan QR in Expo Go
```

For a **dev client** with native modules not in Expo Go:

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

Use a **real device** before calling any milestone “done” — especially push notifications, deep links, and Clerk flows.

---

## 6. Aligning mobile with the web backend

- **Clerk:** Web uses `@clerk/nextjs`. Mobile should use **Clerk’s Expo / React Native SDK** and the **same** Clerk project; configure allowed origins and native redirect URLs in the Clerk dashboard.
- **API:** Point the app at the deployed Next app (or a dedicated API) via `EXPO_PUBLIC_API_URL` (or similar). Reuse the same RLS/authorization rules as the server — **tokens from Clerk** in `Authorization` headers.
- **Parity:** Treat `apps/web` route handlers and Drizzle access patterns as the contract. Document any new mobile-only endpoints in this repo’s README or OpenAPI as you add them.

---

## 7. Store checklist (short)

**Apple**

- App Privacy labels, export compliance, sign-in with Apple if you offer third-party login (review guidelines).
- Screenshots, description, and **review account** (sandbox user) in App Store Connect.

**Google**

- Data safety form, target API level, 64-bit, signing key in Play (Play App Signing).
- Staged rollout recommended.

---

## 8. Production web deploy (this repo)

- **Railway** is configured at repo root with `railway.json`: build `npm run build:website`, start `npm run start:website` (see root `package.json`). Pushing to **`main`** triggers deploy if the Railway GitHub integration is connected to this repository.
- After push, confirm the Railway **OMM** (or current) service shows a new deployment and health checks pass.

---

## 9. Suggested next 2 sprints (mobile)

1. Add **EAS** + first **internal** iOS and Android builds; wire **Clerk Expo** to staging.
2. Replace mock/static data in sensitive flows with **real API** calls; add error boundaries and session refresh.

---

## 10. Contacts & references

- **Expo (EAS):** https://docs.expo.dev/eas/  
- **Clerk (Expo):** check Clerk’s current Expo quickstart.  
- **This codebase:** `apps/mobile/App.tsx` and `src/navigation/RootNavigator.tsx` for entry and routes.

**Questions** — Prefer issues or internal Slack with @mobile + link to a build URL from EAS for reproducibility.

---

*Generated for handover; keep this file updated as EAS and store processes change.*
