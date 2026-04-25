"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { todayDateline } from "../../lib/nav";

const appNavItems = [
  { label: "Home", href: "/app", section: "I" },
  { label: "Listings", href: "/app/listings", section: "II" },
  { label: "Briefs", href: "/app/briefs", section: "III" },
  { label: "Messages", href: "/app/messages", section: "IV" },
  { label: "Profile", href: "/app/profile", section: "V" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <header className="site-header">
        <div className="masthead-rule" aria-hidden="true">
          <span>PreMarket &middot; Workspace</span>
          <span>{todayDateline()}</span>
          <span>Vol. I — Issue 04</span>
        </div>
        <div className="masthead">
          <Link className="brand" href="/app" aria-label="PreMarket workspace">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark-line" />
              <span className="brand-mark-glyphs">
                <span className="brand-mark-square brand-mark-square--filled" />
                <span className="brand-mark-square brand-mark-square--outline" />
              </span>
            </span>
            <span className="brand-wordmark">
              <span className="brand-pre">Pre</span>
              <span className="brand-market">Market</span>
              <span className="brand-tld">.com.au</span>
            </span>
          </Link>
          <nav className="primary-nav" aria-label="Workspace navigation">
            {appNavItems.map((item) => {
              const active =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  aria-current={active ? "page" : undefined}
                  className={active ? "is-active" : undefined}
                >
                  <span className="nav-section">{item.section}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="account-actions">
            <Link
              href="/app/notifications"
              className="account-bell"
              aria-label="Notifications"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 1.5a4.5 4.5 0 0 0-4.5 4.5v3.2L3 12h12l-1.5-2.8V6A4.5 4.5 0 0 0 9 1.5Z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M7 14a2 2 0 0 0 4 0"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="account-bell-dot" aria-hidden="true" />
            </Link>
            <Link href="/app/profile" className="account-cta">
              JL
            </Link>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
