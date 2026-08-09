# Working in this repo

> # ⚠️ NOT LIVE — PRE-LAUNCH, NO REAL USERS
>
> **OMM has not launched. There are no customers and no real user data.**
> The Railway environment is named `production` and the database holds a few
> dozen rows, but those are **internal test records** — not people.
>
> So: **move fast.** Change the schema, drop and reshape tables, delete dead
> code, redeploy whenever. Do **not** hedge, stage rollouts, ask for approval
> before touching data, or add "this is production, are you sure?" caveats.
> None of that applies yet.
>
> The one thing that still matters is **not breaking the build for the team.**
>
> This paragraph exists because it kept getting re-litigated. When this ships to
> real agents, delete it — and then the caution is warranted.

## Context

OMM is four repos in one Railway project:

| Repo | Service | Domain | What it is |
|---|---|---|---|
| `OMM_App` | `website-frontend` | www.offmarketmatch.com.au | Marketing site only. Holds **no database access**. |
| `OMM_Mobile` | `application-frontend` | app.offmarketmatch.com.au | **The product** — one Expo Router codebase for iOS, Android and web. |
| `OMM_BACKEND` | `application-backend` | api.offmarketmatch.com.au | **The API** — owns the Drizzle schema and migrations. Port 3102 locally. |
| `OMM_ENRICHMENT` | `application-enrichment` | — | PropertyData / SOI generation. |

## Gotchas that have already cost time

- **`tsc` used to lie.** A deprecated `baseUrl` made it abort on `TS5101` and exit 0 *without checking anything*. Fixed in `OMM_App`; if a typecheck passes suspiciously fast, verify it actually ran.
- **Never run a production build while a dev server is running** — both write `.next` and it corrupts what the browser serves.
- **Migrations have never run in production** (`OMM_BACKEND/railway.toml` uses `releaseCommand`, which is not a Railway key). The live schema came from a hand-run `drizzle-kit push`.
- **Automated reports quote live secrets.** Scan anything generated before committing it — GitHub push protection has already blocked one.

Full architectural audit: `OMM_App/docs/ARCHITECTURE_AUDIT_2026-08-09.md`
