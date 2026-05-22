# Local dev troubleshooting

## Expo: **`[fetchMobileHome]` 404**, HTML / `<!DOCTYPE` in errors, **`Could not publish`**

`/api/mobile/*` lives in sibling **`OMM_BACKEND`** (port **3102**). Marketing web + support forms stay on **`apps/web`** (port **3101**).

### Fix (recommended split)

1. **Two terminals:** from **`OMM`**, **`npm run dev`** (web UI on **3101**); from **`OMM_BACKEND`**, **`npm run dev`** (API on **3102**).
2. **`OMM_APP/.env`** (sibling **`Documents/OMM_APP`**):
   ```env
   EXPO_PUBLIC_MOBILE_API_ORIGIN=http://127.0.0.1:3102
   EXPO_PUBLIC_API_URL=http://127.0.0.1:3102
   EXPO_PUBLIC_WEB_ORIGIN=http://127.0.0.1:3101
   ```
3. **`../OMM_BACKEND/.env.local`** — **`DATABASE_URL`**, **`CLERK_SECRET_KEY`**, **`CLERK_WEBHOOK_SECRET`** (copy from `apps/web/.env.local`). Run **`cd ../OMM_BACKEND && npm run db:push`** once.
4. **`apps/web/.env.local`** — **`BACKEND_URL=http://127.0.0.1:3102`**, **`NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:3102`**, Clerk publishable key for the browser.

### Ports by device (API = 3102)

- **iOS Simulator:** `127.0.0.1:3102` for mobile API.
- **Android emulator:** `http://10.0.2.2:3102` for API env vars.
- **Physical device:** Mac LAN IP, e.g. `http://192.168.x.x:3102`.

### After env changes

Restart **OMM_BACKEND**, **Next web**, and **Expo** (from **`OMM_APP`**, `npm run start`).

### Smoke test

```bash
./scripts/test-mobile-publish.sh
```

Expect **401 JSON** (no auth), then **200** when `DEV_MOBILE_BYPASS_USER_ID` is set in `OMM_BACKEND/.env.local`.

---

## Single-host deploy (Railway: one URL for UI + API)

If production serves **`/api/mobile/*`** from the same Next service as the website, set Expo **`EXPO_PUBLIC_API_URL`** and web **`NEXT_PUBLIC_BACKEND_URL`** to that **one** HTTPS origin. Local split (3101 + 3102) is only for development.

---

## Next.js: `Failed to get registry from "pnpm"` / `ENOWORKSPACES` when patching the lockfile
