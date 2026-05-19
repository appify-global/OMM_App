import Link from "next/link";
import {
  footerDirectoryHeadings,
  footerDirectoryLinks,
  footerLinks,
} from "../lib/nav";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <section className="footer-directory" aria-label="Property directory">
        <header className="footer-masthead">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>The Colophon</span>
          </p>
          <h2>An index of the private market.</h2>
        </header>

        <div className="footer-link-columns">
          {footerDirectoryLinks.map((column, index) => (
            <div key={`footer-column-${index}`}>
              <p className="footer-column-label">
                {footerDirectoryHeadings[index]}
              </p>
              {column.map((link) => (
                <Link href="#" key={link}>
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="footer-base" aria-label="Company links">
        <p className="footer-imprint">
          &copy; Off the Market Match Pty Ltd, Melbourne. All rights reserved.
        </p>
        <nav aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link href="#" key={link}>
              {link}
            </Link>
          ))}
        </nav>
      </section>
    </footer>
  );
}
