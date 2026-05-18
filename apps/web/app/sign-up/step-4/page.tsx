"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTED = [
  "Brighton",
  "Hawthorn",
  "Kew",
  "Toorak",
  "South Yarra",
  "Camberwell",
  "Hampton",
  "Sandringham",
  "Malvern",
  "Albert Park",
];

export default function SignUpStep4() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const toggle = (s: string) =>
    setSuburbs((prev) =>
      prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s],
    );

  const addCustom = () => {
    const v = draft.trim();
    if (v && !suburbs.includes(v)) setSuburbs((p) => [...p, v]);
    setDraft("");
  };

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
            <span>IV &middot; Step 4 of 4</span>
          </p>
          <h1 className="auth-side-title">
            Your <em>profile</em>.
          </h1>
          <p className="auth-side-lede">
            A face, a line, and the suburbs you cover. You can refine all of
            this later in settings.
          </p>
          <ol className="auth-stepper" role="list">
            <li className="is-done">Account &amp; password</li>
            <li className="is-done">Identity &amp; role</li>
            <li className="is-done">Verify phone</li>
            <li className="is-current">Profile &amp; suburbs</li>
          </ol>
        </div>

        <form
          className="auth-form auth-form--padded"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/app");
          }}
        >
          <label className="subpage-field">
            <span className="subpage-field-label">Display name</span>
            <input
              type="text"
              className="subpage-field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Lim"
              required
            />
          </label>

          <label className="subpage-field">
            <span className="subpage-field-label">
              Headline (optional)
            </span>
            <input
              type="text"
              className="subpage-field-input"
              value={headline}
              maxLength={120}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="One line on how you work"
            />
            <span className="subpage-field-hint">
              {headline.length} / 120
            </span>
          </label>

          <div className="subpage-field">
            <span className="subpage-field-label">
              Suburbs you cover
            </span>
            <ul className="topic-list" role="list">
              {SUGGESTED.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className={
                      "topic-chip" + (suburbs.includes(s) ? " is-active" : "")
                    }
                    onClick={() => toggle(s)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>

            <div className="suburb-input-row" style={{ marginTop: 16 }}>
              <input
                type="text"
                className="subpage-field-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Add another suburb"
              />
              <button
                type="button"
                className="dash-cta is-ghost"
                onClick={addCustom}
              >
                Add
              </button>
            </div>

            {suburbs.filter((s) => !SUGGESTED.includes(s)).length > 0 ? (
              <ul className="suburb-tags" role="list">
                {suburbs
                  .filter((s) => !SUGGESTED.includes(s))
                  .map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        className="suburb-tag"
                        onClick={() =>
                          setSuburbs((p) => p.filter((v) => v !== s))
                        }
                      >
                        <span>{s}</span>
                        <span aria-hidden="true">×</span>
                      </button>
                    </li>
                  ))}
              </ul>
            ) : null}
          </div>

          <footer className="auth-form-footer">
            <Link href="/sign-up/step-3" className="dash-cta is-ghost">
              Back
            </Link>
            <button
              type="submit"
              className="dash-cta"
              disabled={!name || suburbs.length < 1}
            >
              Enter PreMarket →
            </button>
          </footer>
        </form>
      </section>
    </main>
  );
}
