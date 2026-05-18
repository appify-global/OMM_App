const fs = require("fs");
const path = require("path");

const PLACEHOLDER_PK = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

/**
 * Local dev: reuse the same Clerk publishable key as Next (`apps/web/.env`) so you
 * don't maintain two copies. EAS/CI must set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY explicitly.
 */
function syncClerkPublishableKeyFromWebEnv() {
  const current = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  if (current && current !== PLACEHOLDER_PK) return;

  const webEnvPath = path.join(__dirname, "..", "web", ".env");
  if (!fs.existsSync(webEnvPath)) return;

  const raw = fs.readFileSync(webEnvPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key !== "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val && val !== PLACEHOLDER_PK) {
      process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = val;
    }
    break;
  }
}

module.exports = () => {
  syncClerkPublishableKeyFromWebEnv();
  const appJson = require("./app.json");
  const clerkPublishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  return {
    ...appJson,
    expo: {
      ...appJson.expo,
      extra: {
        ...appJson.expo.extra,
        clerkPublishableKey,
      },
    },
  };
};
