"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpStep2() {
  const router = useRouter();
  const [role, setRole] = useState<"AGENT" | "BUYER">("AGENT");
  const [licence, setLicence] = useState("");
  const [firm, setFirm] = useState("");
  const [referral, setReferral] = useState("");

  return (
    <main className="auth-page">
      <header className="auth-masthead">
        <Link href="/" className="auth-wordmark">
          PreMarket
        </Link>
        <p className="auth-issue">
          Vol. I &middot; Issue 04 &middot; Apply to join
        </p>
      </header>

      <section className="auth-shell">
        <div className="auth-side">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>II &middot; Step 2 of 4</span>
          </p>
          <h1 className="auth-side-title">
            Tell us who you <em>are</em>.
          </h1>
          <p className="auth-side-lede">
            Your role on PreMarket. Agents will be verified against state
            licensing registers.
          </p>
          <ol className="auth-stepper" role="list">
            <li className="is-done">Account &amp; password</li>
            <li className="is-current">Identity &amp; role</li>
            <li>Verify phone</li>
            <li>Profile &amp; suburbs</li>
          </ol>
        </div>

        <form
          className="auth-form auth-form--padded"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/sign-up/step-3");
          }}
        >
          <fieldset className="auth-fieldset">
            <legend className="auth-legend">I&rsquo;m here as a&hellip;</legend>
            <div className="auth-radio-row">
              <label
                className={"auth-radio" + (role === "AGENT" ? " is-on" : "")}
              >
                <input
                  type="radio"
                  name="role"
                  value="AGENT"
                  checked={role === "AGENT"}
                  onChange={() => setRole("AGENT")}
                />
                <span className="auth-radio-title">Real estate agent</span>
                <span className="auth-radio-hint">
                  I list, sell or co-agent properties professionally.
                </span>
              </label>
              <label
                className={"auth-radio" + (role === "BUYER" ? " is-on" : "")}
              >
                <input
                  type="radio"
                  name="role"
                  value="BUYER"
                  checked={role === "BUYER"}
                  onChange={() => setRole("BUYER")}
                />
                <span className="auth-radio-title">Buyer</span>
                <span className="auth-radio-hint">
                  I&rsquo;m looking for a home, investment, or pied-à-terre.
                </span>
              </label>
            </div>
          </fieldset>

          {role === "AGENT" ? (
            <>
              <label className="subpage-field">
                <span className="subpage-field-label">Licence number</span>
                <input
                  type="text"
                  className="subpage-field-input"
                  value={licence}
                  onChange={(e) => setLicence(e.target.value)}
                  placeholder="VIC 084 921"
                  required
                />
                <span className="subpage-field-hint">
                  We verify against state registers. Takes up to 24h.
                </span>
              </label>
              <label className="subpage-field">
                <span className="subpage-field-label">Firm</span>
                <input
                  type="text"
                  className="subpage-field-input"
                  value={firm}
                  onChange={(e) => setFirm(e.target.value)}
                  placeholder="AZ Real Estate"
                  required
                />
              </label>
            </>
          ) : (
            <label className="subpage-field">
              <span className="subpage-field-label">
                How did you hear about PreMarket? (optional)
              </span>
              <input
                type="text"
                className="subpage-field-input"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                placeholder="Through my buyer's agent"
              />
            </label>
          )}

          <footer className="auth-form-footer">
            <Link href="/sign-up" className="dash-cta is-ghost">
              Back
            </Link>
            <button type="submit" className="dash-cta">
              Continue →
            </button>
          </footer>
        </form>
      </section>
    </main>
  );
}
