# Railway deploy (production)

## Automatic deploys from `main`

The **OMM** service on Railway is connected to `appify-global/OMM_App` and deploys from the **`main`** branch.

When you push or merge to `main`, Railway should build and deploy automatically (GitHub → Railway webhook).

**Service:** OMM · **Environment:** production · **Project:** Premarket.com.au - App

### If a push to `main` does not deploy

1. Railway dashboard → **OMM** → **Settings** → confirm **Connected branch** is `main` and **Autodeploy** is enabled.
2. Check **Deployments** for skipped builds (watch paths, failed healthcheck).
3. Manual redeploy: `railway redeploy --service OMM` from a linked repo directory, or Command Palette → **Deploy Latest Commit**.

## GitHub Actions backup (optional)

Workflow: [`.github/workflows/deploy-railway.yml`](../.github/workflows/deploy-railway.yml)

Runs on every push to `main` **only if** `RAILWAY_TOKEN` is set in GitHub repo secrets.

### One-time: add `RAILWAY_TOKEN`

1. Railway → project **Premarket.com.au - App** → **Settings** → **Tokens** → **Create token** (environment: **production**).
2. GitHub → **appify-global/OMM_App** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. Name: `RAILWAY_TOKEN` · Value: paste the token from step 1.

Without this secret, the workflow is skipped; native Railway autodeploy still applies.

## Build / start commands

From repo root [`railway.json`](../railway.json):

- **Build:** `npm run build:website`
- **Start:** `npm run start:website`
- **Healthcheck:** `/api/healthz`

## Manual deploy from your machine

```bash
cd /path/to/OMM_App
railway link   # Premarket.com.au - App → production → OMM
git checkout main && git pull
railway up     # uploads current directory (use only when needed)
# or, if GitHub-connected:
railway redeploy --service OMM
```
