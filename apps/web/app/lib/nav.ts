/**
 * The product lives in its own repo/deployment (`OMM_Mobile` →
 * app.offmarketmatch.com.au). This site is marketing only, so anything that
 * sends a signed-in member "into the app" has to leave this origin.
 * Override locally with NEXT_PUBLIC_APP_ORIGIN.
 */
export const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_ORIGIN ?? "https://app.offmarketmatch.com.au";

export type NavItem = {
  label: string;
  href: string;
  /** Renders as inert text (no link) while in waitlist / pre-launch mode. */
  disabled?: boolean;
};

/**
 * Header + footer nav. Search / Suburbs / Briefs / Insights used to be
 * fixture-backed pages here; they were removed once the product moved to
 * OMM_Mobile. They stay listed as inert labels so the surface is implied
 * pre-launch — give them a real href only when there is something to link to.
 */
export const headerNavItems: NavItem[] = [
  { label: "Search", href: "/", disabled: true },
  { label: "Suburbs", href: "/", disabled: true },
  { label: "Briefs", href: "/", disabled: true },
  { label: "Insights", href: "/", disabled: true },
  { label: "About", href: "/about" },
];
