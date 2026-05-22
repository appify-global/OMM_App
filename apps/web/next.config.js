const path = require("path");
const { config: loadEnv } = require("dotenv");

// Share repo-root `.env` with Expo (CLERK_SECRET_KEY, DATABASE_URL) when not duplicated in `apps/web/.env.local`.
const repoRoot = path.join(__dirname, "../..");
loadEnv({ path: path.join(repoRoot, ".env.local") });
loadEnv({ path: path.join(repoRoot, ".env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: repoRoot,
  },
};

module.exports = nextConfig;
