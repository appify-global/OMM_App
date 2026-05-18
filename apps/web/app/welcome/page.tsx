import Link from "next/link";

import SiteFooter from "../components/SiteFooter";

export default function WelcomePage() {
  return (
    <>
      <main className="auth-page">
        <header className="auth-masthead">
          <Link href="/" className="auth-wordmark">
            PreMarket
          </Link>
          <p className="auth-issue">
            Vol. I &middot; Issue 04 &middot; Off-market property, before it
            reaches the listings.
          </p>
        </header>

        <section className="auth-hero">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>I &middot; Welcome</span>
          </p>
          <h1 className="auth-hero-title">
            A quiet marketplace for
            <em> serious </em>
            property.
          </h1>
          <p className="auth-hero-lede">
            PreMarket is where Australia&rsquo;s most considered agents and
            buyers meet, before a listing ever goes public. Members only,
            verified credentials, no clutter.
          </p>

          <ul className="auth-pitch" role="list">
            <li>
              <span className="auth-pitch-num">i</span>
              <div>
                <p className="auth-pitch-title">For sellers</p>
                <p className="auth-pitch-body">
                  Pre-market campaigns. Statement of Information in minutes.
                  A folio of buyers who already know what they want.
                </p>
              </div>
            </li>
            <li>
              <span className="auth-pitch-num">ii</span>
              <div>
                <p className="auth-pitch-title">For buyers</p>
                <p className="auth-pitch-body">
                  Briefs that bring properties to you. Saved searches with
                  meaningful matches. Off-market homes, before they aren&rsquo;t.
                </p>
              </div>
            </li>
            <li>
              <span className="auth-pitch-num">iii</span>
              <div>
                <p className="auth-pitch-title">For everyone</p>
                <p className="auth-pitch-body">
                  Verified agents. Honest reviews. Clear records. A
                  marketplace built on the boring fundamentals of trust.
                </p>
              </div>
            </li>
          </ul>

          <div className="auth-cta-row">
            <Link href="/sign-up" className="dash-cta">
              Apply to join
            </Link>
            <Link href="/sign-in" className="dash-cta is-ghost">
              I have an account
            </Link>
          </div>

          <p className="auth-fineprint">
            By continuing you agree to our{" "}
            <Link href="/app/profile/legal/terms">Terms</Link>,{" "}
            <Link href="/app/profile/legal/privacy">Privacy policy</Link> and{" "}
            <Link href="/app/profile/legal/community">
              Community guidelines
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
