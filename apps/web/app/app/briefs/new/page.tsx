"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../../components/SiteFooter";

type Form = {
  suburbs: string;
  budget: string;
  propertyType: string;
  minBeds: string;
  briefBody: string;
};

const INITIAL: Form = {
  suburbs: "",
  budget: "",
  propertyType: "",
  minBeds: "",
  briefBody: "",
};

const PLACEHOLDERS: Form = {
  suburbs: "Hawthorn, Camberwell, Kew (north of Barkers Rd)",
  budget: "$1.80M – $2.60M · flexible if sole mandate",
  propertyType: "Period home or renovated townhouse · 3–4 beds",
  minBeds: "3+ (4 preferred)",
  briefBody:
    "Relocating family · need childcare & primary schools walkable · 2 car spaces · 60–90 day settlement · must-have: north-facing living · avoid main roads & apartment blocks.",
};

export default function NewBriefPage() {
  const [form, setForm] = useState<Form>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSubmit =
    form.suburbs.trim() &&
    form.budget.trim() &&
    form.propertyType.trim() &&
    form.briefBody.trim();

  if (submitted) {
    return (
      <>
        <main className="dash">
          <section className="soi-success">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>Brief Lodged</span>
            </p>
            <h1 className="soi-success-h1">
              Now in <em>circulation</em>.
            </h1>
            <p className="soi-success-lede">
              Your brief has been broadcast in private to listing agents with
              relevant active and off-market stock. Replies typically arrive
              within twenty-four hours and will appear in your inbox.
            </p>
            <div className="soi-success-actions">
              <Link href="/app/briefs" className="dash-cta dash-cta--ghost">
                Back to Briefs
              </Link>
              <Link href="/app" className="dash-cta">
                Workspace home
              </Link>
            </div>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/briefs">Briefs</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Post a brief</span>
        </nav>

        <header className="dash-masthead">
          <div className="dash-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Atelier</span>
            </p>
            <h1>
              Post a buyer <em>brief</em>.
            </h1>
            <p className="page-lede">
              Be specific on suburbs, budget, and timing. Matches are private —
              only agents with relevant off-market stock will see your brief.
            </p>
          </div>
        </header>

        <section className="dash-row">
          <article className="dash-panel soi-panel">
            <header className="dash-panel-head">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Brief</span>
              </p>
              <h2>
                Five <em>particulars</em>
              </h2>
            </header>

            <div className="soi-body">
              <div className="soi-form">
                <Field
                  label="Preferred suburbs or areas"
                  kicker="i"
                  hint="Comma-separated. Be precise — boundaries help."
                >
                  <input
                    type="text"
                    className="soi-input"
                    placeholder={PLACEHOLDERS.suburbs}
                    value={form.suburbs}
                    onChange={(e) => update("suburbs", e.target.value)}
                  />
                </Field>

                <Field
                  label="Budget range"
                  kicker="ii"
                  hint="Indicate flexibility if a sole mandate is offered."
                >
                  <input
                    type="text"
                    className="soi-input"
                    placeholder={PLACEHOLDERS.budget}
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                  />
                </Field>

                <Field
                  label="Property type"
                  kicker="iii"
                  hint="Architectural style, era, configuration."
                >
                  <input
                    type="text"
                    className="soi-input"
                    placeholder={PLACEHOLDERS.propertyType}
                    value={form.propertyType}
                    onChange={(e) => update("propertyType", e.target.value)}
                  />
                </Field>

                <Field
                  label="Minimum bedrooms"
                  kicker="iv"
                  hint="Optional. Note any preferences in parentheses."
                >
                  <input
                    type="text"
                    className="soi-input"
                    placeholder={PLACEHOLDERS.minBeds}
                    value={form.minBeds}
                    onChange={(e) => update("minBeds", e.target.value)}
                  />
                </Field>

                <Field
                  label="Your brief"
                  kicker="v"
                  hint="The why. Schools, lifestyle, settlement, must-haves, dealbreakers."
                >
                  <textarea
                    className="soi-input soi-textarea"
                    rows={6}
                    placeholder={PLACEHOLDERS.briefBody}
                    value={form.briefBody}
                    onChange={(e) => update("briefBody", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <footer className="soi-footer">
              <button
                type="button"
                className="dash-cta dash-cta--ghost"
                onClick={() => {
                  setDraftSaved(true);
                  setTimeout(() => setDraftSaved(false), 2000);
                }}
              >
                {draftSaved ? "✓ Draft saved" : "Save draft & exit"}
              </button>
              <p className="soi-footer-meta">
                Private to listing agents · <em>autosaved</em>
              </p>
              <button
                type="button"
                className="dash-cta"
                onClick={() => canSubmit && setSubmitted(true)}
                disabled={!canSubmit}
              >
                Submit brief →
              </button>
            </footer>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  label,
  kicker,
  hint,
  children,
}: {
  label: string;
  kicker?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="soi-field">
      <span className="soi-field-head">
        {kicker ? <span className="soi-field-kicker">{kicker}</span> : null}
        <span className="soi-field-label">{label}</span>
      </span>
      {children}
      {hint ? <span className="soi-field-hint">{hint}</span> : null}
    </label>
  );
}
