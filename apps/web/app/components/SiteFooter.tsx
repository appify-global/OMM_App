import Link from "next/link";
import { headerNavItems } from "../lib/nav";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer site-footer--find">
      <div className="site-footer__inner">
        <p className="site-footer__imprint">
          &copy; {year} Off the Market Match Pty Ltd, Melbourne. All rights
          reserved.
        </p>
        <nav className="site-footer__nav" aria-label="Footer">
          {headerNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
