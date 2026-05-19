"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function SignUpStep3() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
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
          Off the Market Match
        </Link>
        <p className="auth-issue">
          Vol. I &middot; Issue 04 &middot; Apply to join
        </p>
      </header>

      <section className="auth-shell">
        <div className="auth-side">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>III &middot; Step 3 of 4</span>
          </p>
          <h1 className="auth-side-title">
            Verify your <em>phone</em>.
          </h1>
          <p className="auth-side-lede">
            We&rsquo;ll text a six-digit code. Used for security and
            time-sensitive notifications only.
          </p>
          <ol className="auth-stepper" role="list">
            <li className="is-done">Account &amp; password</li>
            <li className="is-done">Identity &amp; role</li>
            <li className="is-current">Verify phone</li>
            <li>Profile &amp; suburbs</li>
          </ol>
        </div>

        {stage === "phone" ? (
          <form
            className="auth-form auth-form--padded"
            onSubmit={(e) => {
              e.preventDefault();
              setStage("otp");
            }}
          >
            <label className="subpage-field">
              <span className="subpage-field-label">Mobile number</span>
              <input
                type="tel"
                className="subpage-field-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+61 4xx xxx xxx"
                required
              />
              <span className="subpage-field-hint">
                Standard SMS rates may apply.
              </span>
            </label>

            <footer className="auth-form-footer">
              <Link href="/sign-up/step-2" className="dash-cta is-ghost">
                Back
              </Link>
              <button type="submit" className="dash-cta">
                Send code →
              </button>
            </footer>
          </form>
        ) : (
          <form
            className="auth-form auth-form--padded"
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/sign-up/step-4");
            }}
          >
            <p className="auth-otp-lede">
              We&rsquo;ve texted a code to{" "}
              <em>{phone || "your phone"}</em>. It expires in 10 minutes.
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
            <button
              type="button"
              className="danger-link"
              onClick={() => setStage("phone")}
            >
              Change number
            </button>

            <footer className="auth-form-footer">
              <button
                type="button"
                className="dash-cta is-ghost"
                onClick={() => setStage("phone")}
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
        )}
      </section>
    </main>
  );
}
