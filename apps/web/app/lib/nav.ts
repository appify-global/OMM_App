export type NavItem = {
  label: string;
  href: string;
};

/** Top header — FIND-style horizontal nav. */
export const headerNavItems: NavItem[] = [
  { label: "Search", href: "/listings" },
  { label: "Suburbs", href: "/suburbs" },
  { label: "Briefs", href: "/briefs" },
  { label: "Insights", href: "/blog" },
  { label: "About", href: "/about" },
];

/** Overlay menu — mobile / legacy. */
export const menuNavItems: NavItem[] = [
  { label: "Buy", href: "/listings" },
  { label: "Suburbs", href: "/suburbs" },
  { label: "Briefs", href: "/briefs" },
  { label: "Insights", href: "/blog" },
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

export const footerDirectoryLinks: string[][] = [
  [
    "Private property VIC",
    "Private property NSW",
    "Private property QLD",
    "Private property SA",
    "Private property WA",
    "Private property TAS",
  ],
  [
    "Hawthorn",
    "Kew",
    "Camberwell",
    "Toorak",
    "South Yarra",
    "Brighton",
  ],
  [
    "Create a buyer brief",
    "Saved searches",
    "View map search",
    "Buying off-market",
    "Property insights",
    "Agent messages",
  ],
];

export const footerDirectoryHeadings = ["By state", "By suburb", "By tool"];

export const footerLinks = [
  "About",
  "Contact",
  "Agent access",
  "Legal",
  "Privacy",
  "Site map",
  "Careers",
];

export const todayDateline = (): string => {
  const d = new Date();
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};
