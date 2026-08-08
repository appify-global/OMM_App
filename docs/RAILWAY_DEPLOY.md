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

## GitHub Actions backup (optional)

Workflow: [`.github/workflows/deploy-railway.yml`](../.github/workflows/deploy-railway.yml)

Runs on every push to `main` **only if** `RAILWAY_TOKEN` is set in GitHub repo secrets.

### One-time: add `RAILWAY_TOKEN`

1. Railway → project **OMM: Web & Mobile Platform** → **Settings** → **Tokens** → **Create token** (environment: **production**).
2. GitHub → **appify-global/OMM_App** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. Name: `RAILWAY_TOKEN` · Value: paste the token from step 1.

Without this secret, the workflow is skipped; native Railway autodeploy still applies.

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
