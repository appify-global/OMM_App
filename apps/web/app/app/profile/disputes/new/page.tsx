"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../../../components/SiteFooter";

const REASONS = [
  "Introduction overlap",
  "Co-agency fee allocation",
  "Vendor introduction conflict",
  "Buyer poaching",
  "Misrepresentation",
  "Something else",
];

export default function NewDisputePage() {
  const [reason, setReason] = useState(REASONS[0]);
  const [counterparty, setCounterparty] = useState("");
  const [listing, setListing] = useState("");
  const [amount, setAmount] = useState("");
  const [body, setBody] = useState("");
  const [filed, setFiled] = useState(false);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile/disputes">Disputes</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">New</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>II · Dealings</span>
            </p>
            <h1 className="subpage-title">
              Raise a <em>dispute</em>.
            </h1>
            <p className="page-lede">
              A formal record of the disagreement. Trust &amp; Safety will
              mediate within two business days.
            </p>
          </div>
        </header>

        {filed ? (
          <section className="subpage-success">
            <p className="subpage-success-kicker">Filed</p>
            <h2 className="subpage-success-title">
              Dispute raised. We&rsquo;ll be in touch.
            </h2>
            <p className="subpage-success-lede">
              Both parties have been notified. A mediator will reach out within
              two business days.
            </p>
            <div className="subpage-form-actions">
              <Link href="/app/profile/disputes" className="dash-cta">
                View disputes
              </Link>
            </div>
          </section>
        ) : (
          <form
            className="subpage-form"
            onSubmit={(e) => {
              e.preventDefault();
              setFiled(true);
            }}
          >
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">i</span>
                <span className="subpage-fieldset-title">The reason</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Pick the closest fit. You can add nuance below.
              </p>
              <div className="subpage-fieldset-body">
                <ul className="topic-list" role="list">
                  {REASONS.map((r) => (
                    <li key={r}>
                      <button
                        type="button"
                        className={
                          "topic-chip" + (reason === r ? " is-active" : "")
                        }
                        onClick={() => setReason(r)}
                      >
                        {r}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </fieldset>

            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">ii</span>
                <span className="subpage-fieldset-title">The parties</span>
              </legend>
              <p className="subpage-fieldset-lede">
                The other agent or firm involved.
              </p>
              <div className="subpage-fieldset-body">
                <label className="subpage-field">
                  <span className="subpage-field-label">Counterparty</span>
                  <input
                    type="text"
                    className="subpage-field-input"
                    value={counterparty}
                    onChange={(e) => setCounterparty(e.target.value)}
                    placeholder="Anton Zhouk · RT Edgar"
                    required
                  />
                </label>
                <label className="subpage-field">
                  <span className="subpage-field-label">
                    Listing / address
                  </span>
                  <input
                    type="text"
                    className="subpage-field-input"
                    value={listing}
                    onChange={(e) => setListing(e.target.value)}
                    placeholder="1240 Park Ave, Brighton"
                  />
                </label>
                <label className="subpage-field">
                  <span className="subpage-field-label">
                    Amount at stake (optional)
                  </span>
                  <input
                    type="text"
                    className="subpage-field-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="$18,400.00"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">iii</span>
                <span className="subpage-fieldset-title">Your account</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Plain language. Dates, names, and what you have on record.
              </p>
              <div className="subpage-fieldset-body">
                <label className="subpage-field">
                  <span className="subpage-field-label">Statement</span>
                  <textarea
                    className="subpage-field-input subpage-field-input--area"
                    rows={10}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="On 14 March I introduced the buyer..."
                    required
                  />
                  <span className="subpage-field-hint">
                    You&rsquo;ll be able to upload supporting evidence after
                    filing.
                  </span>
                </label>
              </div>
            </fieldset>

            <footer className="subpage-form-footer">
              <p className="subpage-form-fineprint">
                Filing in good faith is required by our{" "}
                <Link href="/app/profile/legal/community">
                  Community guidelines
                </Link>
                .
              </p>
              <div className="subpage-form-actions">
                <Link
                  href="/app/profile/disputes"
                  className="dash-cta is-ghost"
                >
                  Cancel
                </Link>
                <button type="submit" className="dash-cta">
                  File dispute
                </button>
              </div>
            </footer>
          </form>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
