"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Stage = "method" | "send" | "otp" | "new" | "done";

export default function ForgotPasswordPage() {
  const [stage, setStage] = useState<Stage>("method");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setOtpAt = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <main className="auth-page">
      <header className="auth-masthead">
        <Link href="/" className="auth-wordmark">
          PreMarket
        </Link>
        <p className="auth-issue">
          Vol. I &middot; Issue 04 &middot; Reset password
        </p>
      </header>

      <section className="auth-shell">
        <div className="auth-side">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>I &middot; Reset</span>
          </p>
          <h1 className="auth-side-title">
            Forgot your <em>password</em>?
          </h1>
          <p className="auth-side-lede">
            Happens to the best of us. Verify your contact details and
            we&rsquo;ll set you up with a new one.
          </p>
          <p className="auth-side-foot">
            Remembered it? <Link href="/sign-in">Sign in →</Link>
          </p>
        </div>

        {stage === "method" ? (
          <form
            className="auth-form auth-form--padded"
            onSubmit={(e) => {
              e.preventDefault();
              setStage("send");
            }}
          >
            <fieldset className="auth-fieldset">
              <legend className="auth-legend">Verify with</legend>
              <div className="auth-radio-row">
                <label
                  className={
                    "auth-radio" + (method === "email" ? " is-on" : "")
                  }
                >
                  <input
                    type="radio"
                    name="method"
                    checked={method === "email"}
                    onChange={() => setMethod("email")}
                  />
                  <span className="auth-radio-title">Email</span>
                  <span className="auth-radio-hint">
                    A link &amp; six-digit code, sent to your inbox.
                  </span>
                </label>
                <label
                  className={
                    "auth-radio" + (method === "phone" ? " is-on" : "")
                  }
                >
                  <input
                    type="radio"
                    name="method"
                    checked={method === "phone"}
                    onChange={() => setMethod("phone")}
                  />
                  <span className="auth-radio-title">Phone (SMS)</span>
                  <span className="auth-radio-hint">
                    A six-digit code by text message.
                  </span>
                </label>
              </div>
            </fieldset>

            <footer className="auth-form-footer">
              <Link href="/sign-in" className="dash-cta is-ghost">
                Cancel
              </Link>
              <button type="submit" className="dash-cta">
                Continue →
              </button>
            </footer>
          </form>
        ) : null}

        {stage === "send" ? (
          <form
            className="auth-form auth-form--padded"
            onSubmit={(e) => {
              e.preventDefault();
              setStage("otp");
            }}
          >
            <label className="subpage-field">
              <span className="subpage-field-label">
                {method === "email" ? "Email address" : "Mobile number"}
              </span>
              <input
                type={method === "email" ? "email" : "tel"}
                className="subpage-field-input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={
                  method === "email"
                    ? "you@example.com"
                    : "+61 4xx xxx xxx"
                }
                required
              />
            </label>

            <footer className="auth-form-footer">
              <button
                type="button"
                className="dash-cta is-ghost"
                onClick={() => setStage("method")}
              >
                Back
              </button>
              <button type="submit" className="dash-cta">
                Send code →
              </button>
            </footer>
          </form>
        ) : null}

        {stage === "otp" ? (
          <form
            className="auth-form auth-form--padded"
            onSubmit={(e) => {
              e.preventDefault();
              setStage("new");
            }}
          >
            <p className="auth-otp-lede">
              We&rsquo;ve sent a code to <em>{contact}</em>.
            </p>
            <div className="auth-otp-row">
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  className="auth-otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={(e) => setOtpAt(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !v && i > 0) {
                      refs.current[i - 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>
            <button type="button" className="danger-link">
              Resend code
            </button>
            <footer className="auth-form-footer">
              <button
                type="button"
                className="dash-cta is-ghost"
                onClick={() => setStage("send")}
              >
                Back
              </button>
              <button
                type="submit"
                className="dash-cta"
                disabled={otp.join("").length < 6}
              >
                Verify →
              </button>
            </footer>
          </form>
        ) : null}

        {stage === "new" ? (
          <form
            className="auth-form auth-form--padded"
            onSubmit={(e) => {
              e.preventDefault();
              if (pwd === confirm && pwd.length >= 8) setStage("done");
            }}
          >
            <label className="subpage-field">
              <span className="subpage-field-label">New password</span>
              <input
                type="password"
                className="subpage-field-input"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </label>
            <label className="subpage-field">
              <span className="subpage-field-label">Confirm password</span>
              <input
                type="password"
                className="subpage-field-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
              {confirm && confirm !== pwd ? (
                <span className="subpage-field-hint">
                  Passwords don&rsquo;t match yet.
                </span>
              ) : null}
            </label>

            <footer className="auth-form-footer">
              <button
                type="button"
                className="dash-cta is-ghost"
                onClick={() => setStage("otp")}
              >
                Back
              </button>
              <button
                type="submit"
                className="dash-cta"
                disabled={!pwd || pwd !== confirm || pwd.length < 8}
              >
                Set password →
              </button>
            </footer>
          </form>
        ) : null}

        {stage === "done" ? (
          <section className="auth-form auth-form--padded auth-done">
            <p className="subpage-success-kicker">Done</p>
            <h2 className="subpage-success-title">
              Password <em>updated</em>.
            </h2>
            <p className="subpage-success-lede">
              You can sign in with your new password now.
            </p>
            <Link href="/sign-in" className="dash-cta">
              Back to sign-in →
            </Link>
          </section>
        ) : null}
      </section>
    </main>
  );
}
