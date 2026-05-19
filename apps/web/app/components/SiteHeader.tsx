"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { headerNavItems } from "../lib/nav";

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="site-header site-header--find">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="MATCH home">
          <Image
            src="/match-logo.png"
            alt="MATCH"
            width={118}
            height={22}
            priority
            className="brand-logo"
          />
        </Link>
        <nav className="site-header-nav" aria-label="Primary">
          {headerNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {isLoaded && isSignedIn ? (
          <div className="site-header-auth">
            <Link href="/app" className="btn-pill btn-pill--sm btn-pill--ghost">
              Dashboard
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "site-header-user-avatar",
                },
              }}
            />
          </div>
        ) : (
          <Link href="/sign-in" className="btn-pill btn-pill--sm">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
