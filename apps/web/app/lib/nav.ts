export type NavItem = {
  label: string;
  href: string;
  /** Renders as inert text (no link) while in waitlist / pre-launch mode. */
  disabled?: boolean;
};

/** Top header - FIND-style horizontal nav.
 *  Pre-launch: only `About` is navigable. The rest stay visible (so the
 *  product surface is implied) but don't route anywhere. Flip `disabled`
 *  to false when the relevant page is ready to ship. */
export const headerNavItems: NavItem[] = [
  { label: "Search", href: "/listings", disabled: true },
  { label: "Suburbs", href: "/suburbs", disabled: true },
  { label: "Briefs", href: "/briefs", disabled: true },
  { label: "Insights", href: "/blog", disabled: true },
  { label: "About", href: "/about" },
];

/** Overlay menu - mobile / legacy. */
export const menuNavItems: NavItem[] = [
  { label: "Buy", href: "/listings", disabled: true },
  { label: "Suburbs", href: "/suburbs", disabled: true },
  { label: "Briefs", href: "/briefs", disabled: true },
  { label: "Insights", href: "/blog", disabled: true },
  { label: "About", href: "/about" },
];

export const navItems: NavItem[] = headerNavItems;

export function dockLabelForPath(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/listings")) return "Buy";
  if (pathname.startsWith("/suburbs")) return "Suburbs";
  if (pathname.startsWith("/briefs")) return "Briefs";
  if (pathname.startsWith("/blog")) return "Insights";
  if (pathname.startsWith("/about")) return "About";
  return "Menu";
}

export const todayDateline = (): string => {
  const d = new Date();
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};
