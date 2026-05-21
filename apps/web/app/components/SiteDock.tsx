"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dockLabelForPath } from "../lib/nav";
import SiteMenu from "./SiteMenu";

export default function SiteDock() {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname.startsWith("/app")) return null;

  const label = dockLabelForPath(pathname);

  return (
    <>
      <nav className="site-dock" aria-label="Site navigation">
        <Link href="/" className="site-dock-logo" aria-label="Home">
          <Image
            src="/match-logo.png?v=8"
            alt=""
            width={410}
            height={84}
            className="site-dock-logo-img"
            unoptimized
          />
        </Link>
        <span className="site-dock-label">{label}</span>
        <button
          type="button"
          className="site-dock-menu"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
