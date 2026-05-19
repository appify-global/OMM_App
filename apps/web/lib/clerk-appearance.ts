import type { Appearance } from "@clerk/types";

/** Shared Clerk skin — Satoshi, black pills, light card (auth pages). */
export const clerkAuthAppearance: Appearance = {
  variables: {
    colorPrimary: "#000000",
    colorBackground: "#ffffff",
    colorText: "#000000",
    colorTextSecondary: "rgba(0, 0, 0, 0.45)",
    colorInputBackground: "#ffffff",
    colorInputText: "#000000",
    colorNeutral: "rgba(0, 0, 0, 0.12)",
    borderRadius: "10px",
    fontFamily: "var(--font-satoshi), ui-sans-serif, system-ui, sans-serif",
    fontSize: "14px",
  },
  layout: {
    logoImageUrl: "/match-logo.png",
    logoLinkUrl: "/",
  },
  elements: {
    rootBox: "auth-find-clerk__root",
    cardBox: "auth-find-clerk__card-box",
    card: "auth-find-clerk__card",
    header: {
      display: "none",
    },
    headerTitle: "auth-find-clerk__header-title",
    headerSubtitle: "auth-find-clerk__header-subtitle",
    socialButtonsBlockButton: "auth-find-clerk__social-btn",
    formButtonPrimary: "auth-find-clerk__primary-btn",
    formFieldInput: "auth-find-clerk__input",
    footerActionLink: "auth-find-clerk__footer-link",
    identityPreviewEditButton: "auth-find-clerk__footer-link",
    formFieldLabel: "auth-find-clerk__label",
    dividerLine: "auth-find-clerk__divider-line",
    dividerText: "auth-find-clerk__divider-text",
  },
};
