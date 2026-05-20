"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../../components/SiteFooter";

export default function DangerZonePage() {
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"start" | "confirm" | "done">("start");
  const canDelete = confirm.toUpperCase() === "DELETE";

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Close account</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>III · Privacy &amp; legal</span>
            </p>
            <h1 className="subpage-title">
              Close <em>account</em>.
            </h1>
            <p className="page-lede">
              The end of the line. Closing your account removes your listings,
              briefs, messages and reviews from OMM.
            </p>
          </div>
        </header>

        {step === "done" ? (
          <section className="subpage-success">
            <p className="subpage-success-kicker">Closed</p>
            <h2 className="subpage-success-title">
              Your account has been closed.
            </h2>
            <p className="subpage-success-lede">
              We&rsquo;re sorry to see you go. A confirmation has been sent to
              your inbox. You may rejoin at any time.
            </p>
          </section>
        ) : (
          <>
            <section className="danger-callout">
              <h2 className="danger-callout-title">Before you do this</h2>
              <ul className="danger-list" role="list">
                <li>
                  <strong>Active listings</strong> will be withdrawn. Buyers who
                  have enquired will be notified.
                </li>
                <li>
                  <strong>Open disputes</strong> must be resolved before the
                  account can be closed.
                </li>
                <li>
                  <strong>Outstanding invoices</strong> must be settled. Pending
                  payouts will be released to your nominated account.
                </li>
                <li>
                  <strong>Reviews</strong> you have written will remain on the
                  recipient&rsquo;s profile.
                </li>
                <li>
                  <strong>Data</strong> will be deleted within 30 days, save
                  for records we are required by law to retain.
                </li>
              </ul>
            </section>

            {step === "start" ? (
              <section className="danger-pause">
                <h2 className="danger-pause-title">
                  Would a quieter inbox suffice?
                </h2>
                <p className="danger-pause-lede">
                  You can pause notifications, downgrade to the free tier, or
                  hide your profile temporarily, without losing your
                  history.
                </p>
                <ul className="danger-pause-actions" role="list">
                  <li>
                    <Link
                      href="/app/profile/account"
                      className="dash-cta is-ghost"
                    >
                      Quiet notifications
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/app/profile/billing"
                      className="dash-cta is-ghost"
                    >
                      Change plan
                    </Link>
                  </li>
                  <li>
                    <button type="button" className="dash-cta is-ghost">
                      Hide profile
                    </button>
                  </li>
                </ul>

                <hr className="danger-rule" />

                <button
                  type="button"
                  className="danger-link"
                  onClick={() => setStep("confirm")}
                >
                  I understand, continue to close my account
                </button>
              </section>
            ) : null}

            {step === "confirm" ? (
              <form
                className="subpage-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (canDelete) setStep("done");
                }}
              >
                <fieldset className="subpage-fieldset">
                  <legend className="subpage-fieldset-legend">
                    <span className="subpage-fieldset-kicker">i</span>
                    <span className="subpage-fieldset-title">
                      Tell us why (optional)
                    </span>
                  </legend>
                  <p className="subpage-fieldset-lede">
                    Your candid feedback helps us make a better OMM for
                    those who stay.
                  </p>
                  <div className="subpage-fieldset-body">
                    <label className="subpage-field">
                      <span className="subpage-field-label">Reason</span>
                      <textarea
                        className="subpage-field-input subpage-field-input--area"
                        rows={5}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="What prompted this decision?"
                      />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="subpage-fieldset">
                  <legend className="subpage-fieldset-legend">
                    <span className="subpage-fieldset-kicker">ii</span>
                    <span className="subpage-fieldset-title">Confirm</span>
                  </legend>
                  <p className="subpage-fieldset-lede">
                    Type <strong>DELETE</strong> in the box below to confirm
                    permanent closure.
                  </p>
                  <div className="subpage-fieldset-body">
                    <label className="subpage-field">
                      <span className="subpage-field-label">
                        Confirmation
                      </span>
                      <input
                        type="text"
                        className="subpage-field-input"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="DELETE"
                      />
                    </label>
                  </div>
                </fieldset>

                <footer className="subpage-form-footer">
                  <div className="subpage-form-actions">
                    <button
                      type="button"
                      className="dash-cta is-ghost"
                      onClick={() => setStep("start")}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="dash-cta is-danger"
                      disabled={!canDelete}
                    >
                      Close my account
                    </button>
                  </div>
                </footer>
              </form>
            ) : null}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
