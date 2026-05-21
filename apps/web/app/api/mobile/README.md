# Mobile API routes (deprecated in local dev)

**Use sibling `OMM_BACKEND`** (`npm run dev:backend` from OMM repo root, port **3102**) for `/api/mobile/*`.

Expo (`EXPO_PUBLIC_MOBILE_API_ORIGIN` / `EXPO_PUBLIC_API_URL`) and web `/app` RSC (`BACKEND_URL`) should point at **3102**, not this Next app on **3101**.

These files remain for single-host Railway deploys that serve UI + API from one service. When split, treat **OMM_BACKEND** as the source of truth and sync route changes there first.
