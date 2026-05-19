"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = {
  href: string;
  label: string;
  match: (path: string) => boolean;
};

const TABS: Tab[] = [
  { href: "/listings", label: "Buy", match: (p) => p.startsWith("/listings") },
  { href: "/suburbs", label: "Suburbs", match: (p) => p.startsWith("/suburbs") },
  { href: "/blog", label: "Insights", match: (p) => p.startsWith("/blog") },
  { href: "/#app-download", label: "App", match: () => false },
  { href: "/about", label: "Support", match: (p) => p.startsWith("/about") },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(pathname !== "/");
  const isAppRoute = pathname.startsWith("/app");

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(true);
      return;
    }

    const hero = document.querySelector<HTMLElement>(".hero-portal");
    if (!hero) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio < 0.4),
      { threshold: [0, 0.2, 0.4, 0.6, 1] },
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
                <span className="mobile-bottom-nav-label">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
