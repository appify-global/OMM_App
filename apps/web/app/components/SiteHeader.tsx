"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, todayDateline } from "../lib/nav";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="masthead-rule" aria-hidden="true">
        <span>Off the Market Match &middot; The Private Network</span>
        <span>{todayDateline()}</span>
        <span>Established Melbourne 2026</span>
      </div>
      <div className="masthead">
        <Link className="brand" href="/" aria-label="Off the Market Match home">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-line" />
            <span className="brand-mark-glyphs">
              <span className="brand-mark-square brand-mark-square--filled" />
              <span className="brand-mark-square brand-mark-square--outline" />
            </span>
          </span>
          <span className="brand-wordmark">
            <span className="brand-name">OMM</span>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = pathname === item.href;
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
          <Link href="/members">Members</Link>
          <Link href="/sign-up" className="account-cta account-cta--signup">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
