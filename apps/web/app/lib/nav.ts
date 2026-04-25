export type NavItem = {
  label: string;
  href: string;
  section: string;
};

export const navItems: NavItem[] = [
  { label: "Listings", href: "/listings", section: "I" },
  { label: "Suburbs", href: "/suburbs", section: "II" },
  { label: "Briefs", href: "/briefs", section: "III" },
  { label: "Blog", href: "/blog", section: "IV" },
  { label: "About", href: "/about", section: "V" },
];

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
