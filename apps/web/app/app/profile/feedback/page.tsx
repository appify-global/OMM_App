"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../../components/SiteFooter";

const KINDS = [
  { id: "love", label: "Something I love" },
  { id: "missing", label: "Something missing" },
  { id: "bug", label: "Something broken" },
  { id: "idea", label: "An idea for the future" },
] as const;

type KindId = (typeof KINDS)[number]["id"];

export default function FeedbackPage() {
  const [kind, setKind] = useState<KindId>("idea");
  const [body, setBody] = useState("");
  const [contactOk, setContactOk] = useState(true);
  const [sent, setSent] = useState(false);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Feedback</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · General</span>
            </p>
            <h1 className="subpage-title">
              Share <em>feedback</em>.
            </h1>
            <p className="page-lede">
              We read everything. The product is shaped by working agents and
              their feedback &mdash; please be candid.
            </p>
          </div>
        </header>

        {sent ? (
          <section className="subpage-success" aria-live="polite">
            <p className="subpage-success-kicker">Received</p>
            <h2 className="subpage-success-title">
              Thank you. Noted with care.
            </h2>
            <p className="subpage-success-lede">
              Your note has been logged with the product team. We&rsquo;ll
              follow up if anything is unclear.
            </p>
            <div className="subpage-form-actions">
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
                <span className="subpage-fieldset-title">What is this?</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Pick a flavour so we can sort it cleanly.
              </p>
              <div className="subpage-fieldset-body">
                <ul className="topic-list" role="list">
                  {KINDS.map((k) => (
                    <li key={k.id}>
                      <button
                        type="button"
                        className={
                          "topic-chip" + (kind === k.id ? " is-active" : "")
                        }
                        onClick={() => setKind(k.id)}
                      >
                        {k.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </fieldset>

            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">ii</span>
                <span className="subpage-fieldset-title">Your note</span>
              </legend>
              <p className="subpage-fieldset-lede">
                The more specific, the better &mdash; what you were doing, what
                you expected, what happened instead.
              </p>
              <div className="subpage-fieldset-body">
                <label className="subpage-field">
                  <span className="subpage-field-label">Tell us more</span>
                  <textarea
                    className="subpage-field-input subpage-field-input--area"
                    rows={10}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write freely. We'd rather have an honest paragraph than a polished sentence."
                    required
                  />
                </label>
                <label className="subpage-toggle">
                  <span className="subpage-toggle-text">
                    <span className="subpage-toggle-label">
                      It&rsquo;s ok to follow up by email
                    </span>
                    <span className="subpage-toggle-hint">
                      We may write back to clarify or thank you.
                    </span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={contactOk}
                    className={"subpage-switch" + (contactOk ? " is-on" : "")}
                    onClick={() => setContactOk((v) => !v)}
                  >
                    <span className="subpage-switch-thumb" aria-hidden="true" />
                  </button>
                </label>
              </div>
            </fieldset>

            <footer className="subpage-form-footer">
              <div className="subpage-form-actions">
                <Link href="/app/profile" className="dash-cta is-ghost">
                  Cancel
                </Link>
                <button type="submit" className="dash-cta">
                  Send feedback
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
