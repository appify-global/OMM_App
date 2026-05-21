"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { snapshotHeroMotion } from "../lib/hero-motion";
import { headerNavItems } from "../lib/nav";
import { isWaitlistMode } from "../lib/site-mode";
import WaitlistModal from "./WaitlistModal";

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const { isSignedIn, isLoaded } = useAuth();
  const waitlist = isWaitlistMode();
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <header className="site-header site-header--find">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="MATCH home">
          <Image
            src="/match-logo.png?v=8"
            alt="Match"
            width={410}
            height={84}
            className="brand-logo"
            priority
            unoptimized
          />
        </Link>
        <nav className="site-header-nav" aria-label="Primary">
          {headerNavItems.map((item) => {
            if (item.disabled) {
              return (
                <span
                  key={item.href}
                  className="is-disabled"
                  aria-disabled="true"
                  title="Coming soon"
                >
                  {item.label}
                </span>
              );
            }
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
        {waitlist ? (
          <>
            <button
              type="button"
              className="btn-pill btn-pill--sm"
              onClick={() => setWaitlistOpen(true)}
            >
              Join waitlist
            </button>
            <WaitlistModal
              open={waitlistOpen}
              onClose={() => setWaitlistOpen(false)}
              source="header"
            />
          </>
        ) : isLoaded && isSignedIn ? (
          <div className="site-header-auth">
            <Link href="/app" className="btn-pill btn-pill--sm btn-pill--ghost">
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "site-header-user-avatar",
                },
              }}
            />
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="btn-pill btn-pill--sm"
            onClick={snapshotHeroMotion}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
