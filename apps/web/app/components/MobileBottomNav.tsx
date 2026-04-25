"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = {
  href: string;
  label: string;
  section: string;
  match: (path: string) => boolean;
};

const TABS: Tab[] = [
  {
    href: "/listings",
    label: "Listings",
    section: "I",
    match: (p) => p.startsWith("/listings"),
  },
  {
    href: "/suburbs",
    label: "Suburbs",
    section: "II",
    match: (p) => p.startsWith("/suburbs"),
  },
  {
    href: "/briefs",
    label: "Briefs",
    section: "III",
    match: (p) => p.startsWith("/briefs"),
  },
  {
    href: "/blog",
    label: "Blog",
    section: "IV",
    match: (p) => p.startsWith("/blog"),
  },
  {
    href: "/about",
    label: "About",
    section: "V",
    match: (p) => p.startsWith("/about"),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(pathname !== "/");

  // never render on /app/* — the workspace has its own bottom nav
  const isAppRoute = pathname.startsWith("/app");

  useEffect(() => {
    // on non-home pages the nav should show straight away
    if (pathname !== "/") {
      setVisible(true);
      return;
    }

    const hero = document.querySelector<HTMLElement>(".hero");
    if (!hero) {
      setVisible(true);
      return;
    }

    // show the nav once less than 35% of the hero is still visible
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.intersectionRatio < 0.35);
      },
      { threshold: [0, 0.2, 0.35, 0.5, 0.75, 1] },
    );

    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

  if (isAppRoute) return null;

  return (
    <nav
      className={`mobile-bottom-nav ${visible ? "is-visible" : ""}`}
      aria-label="Primary mobile navigation"
    >
      <ul>
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`mobile-bottom-nav-tab ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="mobile-bottom-nav-section" aria-hidden="true">
                  {tab.section}
                </span>
                <span className="mobile-bottom-nav-label">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
