#!/usr/bin/env node
/**
 * Runs a single SQL migration file against DATABASE_URL.
 * Idempotent-friendly: each statement is wrapped in a transaction;
 * "already exists" errors are reported but don't abort the whole run.
 *
 * Usage:
 *   node scripts/run-migration.mjs drizzle/0001_wakeful_thunderbolt.sql
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: ".env.local" });
loadEnv();

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-migration.mjs <path-to-sql>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set in env.");
  process.exit(1);
}

const sql = readFileSync(resolve(file), "utf8");
const statements = sql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
});

await client.connect();
console.log(`Connected. Applying ${statements.length} statement(s) from ${file}\n`);

let applied = 0;
let skipped = 0;
for (const [i, stmt] of statements.entries()) {
  const preview = stmt.replace(/\s+/g, " ").slice(0, 90);
  try {
    await client.query(stmt);
    applied++;
    console.log(`  ✓ [${i + 1}] ${preview}${preview.length === 90 ? "…" : ""}`);
  } catch (err) {
    const msg = err.message || String(err);
    if (/already exists/i.test(msg)) {
      skipped++;
      console.log(`  · [${i + 1}] skipped (already exists) — ${preview.slice(0, 60)}…`);
    } else {
      console.error(`  ✗ [${i + 1}] FAILED — ${msg}`);
      console.error(`     stmt: ${preview}`);
      await client.end();
      process.exit(1);
    }
  }
}

await client.end();
console.log(`\nDone. Applied: ${applied}, Skipped: ${skipped}`);
