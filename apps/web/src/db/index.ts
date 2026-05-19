/**
 * OMM — Postgres client (Drizzle + node-postgres)
 *
 * Lazy-initialised so missing DATABASE_URL doesn't break:
 *   - Next.js build-time page data collection
 *   - Frontend dev where mocked fixtures are used
 *
 * The pool is only constructed on first actual use of `db` (i.e. when a real
 * query runs at request time).
 */

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __ommPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __ommDb: NodePgDatabase<typeof schema> | undefined;
}

function makePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local or your deployment env.",
    );
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
    max: 10,
  });
}

function getPool(): Pool {
  return (
    globalThis.__ommPgPool ??
    (globalThis.__ommPgPool = makePool())
  );
}

/**
 * Proxy-backed db handle: any property access forces lazy pool creation.
 * Avoids touching env vars during static analysis / build-time page data.
 */
export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_target, prop, receiver) {
      const real =
        globalThis.__ommDb ??
        (globalThis.__ommDb = drizzle(getPool(), { schema }));
      const value = Reflect.get(real, prop, receiver);
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
);

/**
 * For places that need the pool directly (seed teardown, health checks).
 * Calling this requires DATABASE_URL.
 */
export function getRawPool(): Pool {
  return getPool();
}

/** Backwards-compatible export — only call after env is loaded. */
export const pool = new Proxy({} as Pool, {
  get(_t, prop, receiver) {
    return Reflect.get(getPool(), prop, receiver);
  },
});

export { schema };
