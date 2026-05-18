import Constants from "expo-constants";

const PLACEHOLDER_CLERK_PK = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

const fromExtra =
  typeof Constants.expoConfig?.extra?.clerkPublishableKey === "string"
    ? Constants.expoConfig.extra.clerkPublishableKey.trim()
    : "";

const fromEnv = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

/** Publishable key: env (inlined) or `expo.extra` set in app.config.js from web `.env`. */
export const clerkPublishableKey =
  (fromEnv && fromEnv !== PLACEHOLDER_CLERK_PK ? fromEnv : "") ||
  (fromExtra && fromExtra !== PLACEHOLDER_CLERK_PK ? fromExtra : "") ||
  fromEnv;

/** Next.js app (`apps/web` default dev: port 3101). */
export const apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3101"
).replace(/\/$/, "");

/** Marketing site for deep links (blog posts, etc.). */
export const webBaseUrl = (
  process.env.EXPO_PUBLIC_WEB_URL ?? "https://omm-production.up.railway.app"
).replace(/\/$/, "");
