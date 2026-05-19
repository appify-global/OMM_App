"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../../components/SiteFooter";

const TOPICS = [
  "Account & sign-in",
  "Listings & SOI",
  "Briefs & matching",
  "Messages",
  "Billing & payouts",
  "Trust & safety",
  "Something else",
];

export default function ContactSupportPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Contact support</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · General</span>
            </p>
            <h1 className="subpage-title">
              Contact <em>support</em>.
            </h1>
            <p className="page-lede">
              A real human will read this and write back, usually within the
              business day. For something urgent, ring the desk on{" "}
              <strong>1300 PRE MKT</strong>.
            </p>
          </div>
          <aside className="subpage-aside">
            <p className="subpage-aside-kicker">Hours</p>
            <p className="subpage-aside-line">Mon — Fri · 8.30am — 6.00pm AEDT</p>
            <p className="subpage-aside-kicker">Direct</p>
            <p className="subpage-aside-line">support@offmarketmatch.com</p>
          </aside>
        </header>

        {sent ? (
          <section className="subpage-success" aria-live="polite">
            <p className="subpage-success-kicker">Filed</p>
            <h2 className="subpage-success-title">
              Thank you. We&rsquo;ll be in touch.
            </h2>
            <p className="subpage-success-lede">
              Your note is in the queue. A confirmation has been sent to your
              inbox with a reference number.
            </p>
            <div className="subpage-form-actions">
              <button
                type="button"
                className="dash-cta is-ghost"
                onClick={() => {
                  setSent(false);
                  setSubject("");
                  setBody("");
                }}
              >
                Send another
              </button>
              <Link href="/app/profile" className="dash-cta">
                Back to profile
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
                <span className="subpage-fieldset-title">Topic</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Pick the closest fit so we can route your note quickly.
              </p>
              <div className="subpage-fieldset-body">
                <ul className="topic-list" role="list">
                  {TOPICS.map((t) => (
                    <li key={t}>
                      <button
                        type="button"
                        className={
                          "topic-chip" + (topic === t ? " is-active" : "")
                        }
                        onClick={() => setTopic(t)}
                      >
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </fieldset>

            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">ii</span>
                <span className="subpage-fieldset-title">Your message</span>
              </legend>
              <p className="subpage-fieldset-lede">
                A subject line, then the detail. Screenshots can come later by
                email.
              </p>
              <div className="subpage-fieldset-body">
                <label className="subpage-field">
                  <span className="subpage-field-label">Subject</span>
                  <input
                    type="text"
                    className="subpage-field-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="A short headline"
                    required
                  />
                </label>
                <label className="subpage-field">
                  <span className="subpage-field-label">Message</span>
                  <textarea
                    className="subpage-field-input subpage-field-input--area"
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tell us what's happening, and what you'd like to see happen."
                    required
                  />
                  <span className="subpage-field-hint">
                    {body.length} characters · please keep it under 2,000
                  </span>
                </label>
              </div>
            </fieldset>

            <footer className="subpage-form-footer">
              <p className="subpage-form-fineprint">
                By sending you agree to our{" "}
                <Link href="/app/profile/legal/terms">Terms of service</Link>.
              </p>
              <div className="subpage-form-actions">
                <Link href="/app/profile" className="dash-cta is-ghost">
                  Cancel
                </Link>
                <button type="submit" className="dash-cta">
                  Send to support
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
