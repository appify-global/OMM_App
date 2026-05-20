"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../../../components/SiteFooter";

export default function RequestReviewPage() {
  const [recipient, setRecipient] = useState("");
  const [listing, setListing] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile/reviews">Reviews</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Request a review</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>II · Dealings</span>
            </p>
            <h1 className="subpage-title">
              Request a <em>review</em>.
            </h1>
            <p className="page-lede">
              We&rsquo;ll send a single, polite invitation. Your contact will be
              able to leave a star rating and a short note, nothing more.
            </p>
          </div>
        </header>

        {sent ? (
          <section className="subpage-success">
            <p className="subpage-success-kicker">Sent</p>
            <h2 className="subpage-success-title">
              Invitation on its way to {recipient || "your contact"}.
            </h2>
            <p className="subpage-success-lede">
              You&rsquo;ll see their review here once they&rsquo;ve posted it.
            </p>
            <div className="subpage-form-actions">
              <Link href="/app/profile/reviews" className="dash-cta">
                Back to reviews
              </Link>
            </div>
          </section>
        ) : (
          <form
            className="subpage-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">i</span>
                <span className="subpage-fieldset-title">Who&rsquo;s reviewing?</span>
              </legend>
              <p className="subpage-fieldset-lede">
                A buyer or co-agent you&rsquo;ve recently dealt with.
              </p>
              <div className="subpage-fieldset-body">
                <label className="subpage-field">
                  <span className="subpage-field-label">Name</span>
                  <input
                    type="text"
                    className="subpage-field-input"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Sarah Jenkins"
                    required
                  />
                </label>
                <label className="subpage-field">
                  <span className="subpage-field-label">Email</span>
                  <input
                    type="email"
                    className="subpage-field-input"
                    placeholder="sarah@example.com"
                    required
                  />
                </label>
                <label className="subpage-field">
                  <span className="subpage-field-label">
                    Listing or campaign (optional)
                  </span>
                  <input
                    type="text"
                    className="subpage-field-input"
                    value={listing}
                    onChange={(e) => setListing(e.target.value)}
                    placeholder="1240 Park Ave, Brighton"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">ii</span>
                <span className="subpage-fieldset-title">Personal note</span>
              </legend>
              <p className="subpage-fieldset-lede">
                A short message that goes alongside the invitation.
              </p>
              <div className="subpage-fieldset-body">
                <label className="subpage-field">
                  <span className="subpage-field-label">Note (optional)</span>
                  <textarea
                    className="subpage-field-input subpage-field-input--area"
                    rows={6}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="It was a pleasure working with you on..."
                  />
                </label>
              </div>
            </fieldset>

            <footer className="subpage-form-footer">
              <p className="subpage-form-fineprint">
                We&rsquo;ll only send this invitation once. No nudges or
                reminders.
              </p>
              <div className="subpage-form-actions">
                <Link href="/app/profile/reviews" className="dash-cta is-ghost">
                  Cancel
                </Link>
                <button type="submit" className="dash-cta">
                  Send invitation
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
