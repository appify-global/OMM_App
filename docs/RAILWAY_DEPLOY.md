# Railway deploy (production)

## Automatic deploys from `main`

The **website-frontend** service on Railway is connected to `appify-global/OMM_App` and deploys from the **`main`** branch.

When you push or merge to `main`, Railway should build and deploy automatically (GitHub → Railway webhook).

**Service:** website-frontend · **Environment:** production · **Project:** OMM: Web & Mobile Platform

> The project also hosts `application-frontend` (the product, from `OMM_Mobile`)
> and `application-backend` (the API, from `OMM_BACKEND`). This repo only ever
> deploys `website-frontend` — don't redeploy the others from here.

### If a push to `main` does not deploy

1. Railway dashboard → **website-frontend** → **Settings** → confirm **Connected branch** is `main` and **Autodeploy** is enabled.
2. Check **Deployments** for skipped builds (watch paths, failed healthcheck).
3. Manual redeploy: `railway redeploy --service website-frontend` from a linked repo directory, or Command Palette → **Deploy Latest Commit**.

## Deploys are Railway-native only

There is deliberately **no GitHub Actions deploy workflow**. One existed
(`deploy-railway.yml`) and never worked: it used `if: ${{ secrets.RAILWAY_TOKEN }}`
at job level, which GitHub rejects as invalid, so every run failed in 0s with no
jobs. That permanent red check is the likely reason Railway marked pushes to
`main` as SKIPPED instead of deploying. Railway's own GitHub integration is the
only deploy path — keep it that way.

## CI

[`verify.yml`](../.github/workflows/verify.yml) typechecks and builds every PR
and push to `main`. Keep it green — typechecking was silently disabled here
once before and nothing noticed.

## Build / start commands

From repo root [`railway.json`](../railway.json), which selects the **RAILPACK**
builder (so `railpack.json` applies; there is deliberately no `nixpacks.toml`):

- **Build:** `npm run build:website`
- **Start:** `npm run start:website`
- **Healthcheck:** `/api/healthz`

## Manual deploy from your machine

```bash
cd /path/to/OMM_App
railway link   # OMM: Web & Mobile Platform → production → website-frontend
git checkout main && git pull
railway up     # uploads current directory (use only when needed)
# or, if GitHub-connected:
railway redeploy --service website-frontend
```
