"use client";

import Link from "next/link";
import { menuNavItems } from "../lib/nav";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SiteMenu({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="site-menu" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="site-menu-panel">
        <p className="site-menu-label">Menu</p>
        <nav className="site-menu-nav" aria-label="Main">
          {menuNavItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-menu-meta">
          <div>
            <Link href="/blog" onClick={onClose}>
              Insights
            </Link>
            <Link href="/sign-up" onClick={onClose}>
              Create account
            </Link>
          </div>
          <div>
            <Link href="/sign-in" onClick={onClose}>
              Sign in
            </Link>
            <a href="mailto:hello@offmarketmatch.com">hello@offmarketmatch.com</a>
          </div>
        </div>
        <Link href="/sign-up" className="site-menu-cta" onClick={onClose}>
          <span aria-hidden="true">↳</span> Get started
        </Link>
      </div>
      <button type="button" className="site-menu-close" onClick={onClose} aria-label="Close menu">
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
