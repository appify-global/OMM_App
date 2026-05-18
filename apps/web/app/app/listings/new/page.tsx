"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteFooter from "../../../components/SiteFooter";

type StepId = 1 | 2 | 3 | 4 | 5;

const STEPS: { id: StepId; section: string; label: string; sub: string }[] = [
  { id: 1, section: "I", label: "Address", sub: "Identity & boundaries" },
  { id: 2, section: "II", label: "Property", sub: "Particulars & features" },
  { id: 3, section: "III", label: "Comparables", sub: "Three recent sales" },
  { id: 4, section: "IV", label: "Indicative price", sub: "Statement of value" },
  { id: 5, section: "V", label: "Review", sub: "Vendor counter-signature" },
];

type Comp = {
  id: string;
  address: string;
  date: string;
  price: string;
};

type Form = {
  address: string;
  pricefinderId: string;
  title: string;
  beds: string;
  baths: string;
  landSqm: string;
  features: string;
  description: string;
  comps: Comp[];
  priceLow: string;
  priceHigh: string;
  vendorName: string;
  vendorEmail: string;
  vendorSignature: string;
};

const INITIAL_FORM: Form = {
  address: "",
  pricefinderId: "",
  title: "",
  beds: "",
  baths: "",
  landSqm: "",
  features: "",
  description: "",
  comps: [
    { id: "c1", address: "", date: "", price: "" },
    { id: "c2", address: "", date: "", price: "" },
    { id: "c3", address: "", date: "", price: "" },
  ],
  priceLow: "",
  priceHigh: "",
  vendorName: "",
  vendorEmail: "",
  vendorSignature: "",
};

export default function NewListingPage() {
  const [step, setStep] = useState<StepId>(1);
  const [form, setForm] = useState<Form>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateComp = (idx: number, key: keyof Comp, value: string) =>
    setForm((f) => {
      const next = [...f.comps];
      next[idx] = { ...next[idx], [key]: value };
      return { ...f, comps: next };
    });

  const median = useMemo(() => {
    const lo = parseFloat(form.priceLow.replace(/[^\d.]/g, ""));
    const hi = parseFloat(form.priceHigh.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
    return ((lo + hi) / 2).toFixed(2);
  }, [form.priceLow, form.priceHigh]);

  const canAdvance = (() => {
    if (step === 1) return form.address.trim().length > 4;
    if (step === 2) return form.title && form.beds && form.baths && form.landSqm;
    if (step === 3) return form.comps.every((c) => c.address && c.price);
    if (step === 4) return form.priceLow && form.priceHigh;
    if (step === 5) return form.vendorName && form.vendorEmail && form.vendorSignature;
    return false;
  })();

  if (submitted) {
    return (
      <>
        <main className="dash">
          <section className="soi-success">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>SOI Lodged</span>
            </p>
            <h1 className="soi-success-h1">
              The campaign is <em>live</em>.
            </h1>
            <p className="soi-success-lede">
              Your Statement of Information has been counter-signed and
              archived. The listing is now visible to subscribed buyers in
              pre-market view for 48 hours before public release.
            </p>
            <div className="soi-success-actions">
              <Link href="/app/listings" className="dash-cta dash-cta--ghost">
                Back to Portfolio
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
          <Link href="/app/listings">Portfolio</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">New listing</span>
        </nav>

        <header className="dash-masthead">
          <div className="dash-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Atelier</span>
            </p>
            <h1>
              Statement of <em>Information</em>.
            </h1>
            <p className="page-lede">
              Five steps. Auto-filled from PriceFinder where available. Vendor
              counter-signs before public release.
            </p>
          </div>
        </header>

        <ol className="soi-stepper" aria-label="SOI progress">
          {STEPS.map((s) => {
            const state =
              s.id === step
                ? "is-current"
                : s.id < step
                ? "is-done"
                : "is-todo";
            return (
              <li key={s.id} className={"soi-step " + state}>
                <button
                  type="button"
                  onClick={() => s.id < step && setStep(s.id)}
                  disabled={s.id > step}
                  className="soi-step-btn"
                  aria-current={s.id === step ? "step" : undefined}
                >
                  <span className="soi-step-section">{s.section}</span>
                  <span className="soi-step-text">
                    <span className="soi-step-label">{s.label}</span>
                    <span className="soi-step-sub">{s.sub}</span>
                  </span>
                  <span className="soi-step-mark" aria-hidden="true">
                    {s.id < step ? "✓" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <section className="dash-row">
          <article className="dash-panel soi-panel">
            <header className="dash-panel-head">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Step {STEPS[step - 1].section}</span>
              </p>
              <h2>
                {STEPS[step - 1].label}{" "}
                <em>· {STEPS[step - 1].sub.toLowerCase()}</em>
              </h2>
            </header>

            <div className="soi-body">
              {step === 1 ? (
                <Step1
                  address={form.address}
                  pricefinderId={form.pricefinderId}
                  onAddress={(v) => update("address", v)}
                  onPricefinder={(v) => update("pricefinderId", v)}
                  onAutofill={() => {
                    setForm((f) => ({
                      ...f,
                      address: f.address || "88 Glenferrie Rd, Hawthorn VIC 3122",
                      pricefinderId: f.pricefinderId || "PF-VIC-3122-04412",
                      title: f.title || "Hawthorn City Center",
                      beds: f.beds || "4",
                      baths: f.baths || "3",
                      landSqm: f.landSqm || "650",
                      description:
                        f.description ||
                        "A poised Edwardian on a 650m² north-facing block, walking distance to Glenferrie Road. Five reception spaces, stone kitchen, private rear garden.",
                    }));
                  }}
                />
              ) : null}
              {step === 2 ? (
                <Step2
                  form={form}
                  onChange={update}
                />
              ) : null}
              {step === 3 ? (
                <Step3
                  comps={form.comps}
                  onChangeComp={updateComp}
                />
              ) : null}
              {step === 4 ? (
                <Step4
                  low={form.priceLow}
                  high={form.priceHigh}
                  median={median}
                  comps={form.comps}
                  onLow={(v) => update("priceLow", v)}
                  onHigh={(v) => update("priceHigh", v)}
                />
              ) : null}
              {step === 5 ? (
                <Step5
                  form={form}
                  median={median}
                  onChange={update}
                />
              ) : null}
            </div>

            <footer className="soi-footer">
              <button
                type="button"
                className="dash-cta dash-cta--ghost"
                onClick={() => setStep((s) => (Math.max(1, s - 1) as StepId))}
                disabled={step === 1}
              >
                ← Back
              </button>
              <p className="soi-footer-meta">
                Step <em>{step}</em> of {STEPS.length} · Autosaved
              </p>
              {step < 5 ? (
                <button
                  type="button"
                  className="dash-cta"
                  onClick={() =>
                    canAdvance && setStep((s) => (Math.min(5, s + 1) as StepId))
                  }
                  disabled={!canAdvance}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  className="dash-cta"
                  onClick={() => canAdvance && setSubmitted(true)}
                  disabled={!canAdvance}
                >
                  Lodge SOI →
                </button>
              )}
            </footer>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/* -------- STEPS -------- */

function Step1({
  address,
  pricefinderId,
  onAddress,
  onPricefinder,
  onAutofill,
}: {
  address: string;
  pricefinderId: string;
  onAddress: (v: string) => void;
  onPricefinder: (v: string) => void;
  onAutofill: () => void;
}) {
  return (
    <div className="soi-form">
      <p className="soi-help">
        Enter the property&rsquo;s street address. We&rsquo;ll attempt to
        match it to PriceFinder and pre-fill the rest of the form.
      </p>
      <Field
        label="Street address"
        kicker="i"
        hint="Include suburb, state, postcode."
      >
        <input
          type="text"
          className="soi-input"
          placeholder="88 Glenferrie Rd, Hawthorn VIC 3122"
          value={address}
          onChange={(e) => onAddress(e.target.value)}
        />
      </Field>
      <Field
        label="PriceFinder reference"
        kicker="ii"
        hint="Optional — populates automatically once matched."
      >
        <input
          type="text"
          className="soi-input"
          placeholder="PF-VIC-3122-04412"
          value={pricefinderId}
          onChange={(e) => onPricefinder(e.target.value)}
        />
      </Field>
      <button
        type="button"
        className="soi-autofill"
        onClick={onAutofill}
      >
        <span className="sq sq--filled sq--sm" aria-hidden="true" />
        <span>Auto-fill from PriceFinder</span>
      </button>
    </div>
  );
}

function Step2({
  form,
  onChange,
}: {
  form: Form;
  onChange: <K extends keyof Form>(key: K, value: Form[K]) => void;
}) {
  return (
    <div className="soi-form">
      <Field label="Listing title" kicker="i">
        <input
          type="text"
          className="soi-input"
          placeholder="Hawthorn City Center"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </Field>
      <div className="soi-grid soi-grid--3">
        <Field label="Beds" kicker="ii">
          <input
            type="number"
            className="soi-input"
            placeholder="4"
            value={form.beds}
            onChange={(e) => onChange("beds", e.target.value)}
          />
        </Field>
        <Field label="Bath" kicker="iii">
          <input
            type="number"
            className="soi-input"
            placeholder="3"
            value={form.baths}
            onChange={(e) => onChange("baths", e.target.value)}
          />
        </Field>
        <Field label="Land (m²)" kicker="iv">
          <input
            type="number"
            className="soi-input"
            placeholder="650"
            value={form.landSqm}
            onChange={(e) => onChange("landSqm", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Of note" kicker="v" hint="Six features, one per line.">
        <textarea
          className="soi-input soi-textarea"
          rows={5}
          placeholder={"Studio Tate stone kitchen\nPaul Bangay garden\nCellar (240 bottles)"}
          value={form.features}
          onChange={(e) => onChange("features", e.target.value)}
        />
      </Field>
      <Field label="Editorial summary" kicker="vi" hint="Two or three sentences.">
        <textarea
          className="soi-input soi-textarea"
          rows={4}
          placeholder="A poised Edwardian on a 650m² north-facing block…"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </Field>
    </div>
  );
}

function Step3({
  comps,
  onChangeComp,
}: {
  comps: Comp[];
  onChangeComp: (idx: number, key: keyof Comp, value: string) => void;
}) {
  return (
    <div className="soi-form">
      <p className="soi-help">
        Three sales of comparable properties within the last six months.
        Required by the Estate Agents (General, Accounts and Audit)
        Regulations 2018.
      </p>
      {comps.map((c, i) => (
        <div key={c.id} className="soi-comp">
          <div className="soi-comp-head">
            <span className="dispatch-folio">
              No. {String(i + 1).padStart(2, "0")}
            </span>
            <span className="soi-comp-label">Comparable {i + 1}</span>
          </div>
          <Field label="Address" kicker={["i", "ii", "iii"][i]}>
            <input
              type="text"
              className="soi-input"
              placeholder="14 Park St, Hawthorn"
              value={c.address}
              onChange={(e) => onChangeComp(i, "address", e.target.value)}
            />
          </Field>
          <div className="soi-grid soi-grid--2">
            <Field label="Date sold">
              <input
                type="text"
                className="soi-input"
                placeholder="Mar 2026"
                value={c.date}
                onChange={(e) => onChangeComp(i, "date", e.target.value)}
              />
            </Field>
            <Field label="Sale price">
              <input
                type="text"
                className="soi-input"
                placeholder="$2,150,000"
                value={c.price}
                onChange={(e) => onChangeComp(i, "price", e.target.value)}
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function Step4({
  low,
  high,
  median,
  comps,
  onLow,
  onHigh,
}: {
  low: string;
  high: string;
  median: string | null;
  comps: Comp[];
  onLow: (v: string) => void;
  onHigh: (v: string) => void;
}) {
  return (
    <div className="soi-form">
      <p className="soi-help">
        Indicative selling price as a range. The upper end may not exceed the
        lower by more than ten percent. Below, your declared comparables.
      </p>
      <div className="soi-grid soi-grid--2">
        <Field label="Lower range ($M)" kicker="i">
          <input
            type="text"
            className="soi-input"
            placeholder="2.0"
            value={low}
            onChange={(e) => onLow(e.target.value)}
          />
        </Field>
        <Field label="Upper range ($M)" kicker="ii">
          <input
            type="text"
            className="soi-input"
            placeholder="2.2"
            value={high}
            onChange={(e) => onHigh(e.target.value)}
          />
        </Field>
      </div>
      <div className="soi-pricecard">
        <p className="features-kicker">Indicative range</p>
        <p className="soi-pricecard-value">
          {low && high ? (
            <>
              <em>${low}M</em> &mdash; <em>${high}M</em>
            </>
          ) : (
            <span className="ledger-muted">Awaiting input</span>
          )}
        </p>
        {median ? (
          <p className="soi-pricecard-median">
            Median <em>${median}M</em>
          </p>
        ) : null}
      </div>
      <div className="soi-comps-mini">
        <p className="features-kicker">Declared comparables</p>
        <ul>
          {comps.map((c, i) => (
            <li key={c.id}>
              <span className="dispatch-folio">
                No. {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                {c.address || <span className="ledger-muted">—</span>}
              </span>
              <span className="ledger-num">
                {c.price ? <em>{c.price}</em> : <span className="ledger-muted">—</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Step5({
  form,
  median,
  onChange,
}: {
  form: Form;
  median: string | null;
  onChange: <K extends keyof Form>(key: K, value: Form[K]) => void;
}) {
  return (
    <div className="soi-form">
      <div className="soi-review">
        <div className="soi-review-block">
          <p className="features-kicker">Property</p>
          <p className="soi-review-line">
            <strong>{form.title || "—"}</strong>
            <span className="ledger-muted"> · {form.address || "—"}</span>
          </p>
          <p className="soi-review-line">
            <em>{form.beds || "—"}</em> bed · <em>{form.baths || "—"}</em>{" "}
            bath · <em>{form.landSqm || "—"}</em> m²
          </p>
        </div>
        <div className="soi-review-block">
          <p className="features-kicker">Indicative range</p>
          <p className="soi-review-line">
            <em>${form.priceLow || "—"}M</em> &mdash;{" "}
            <em>${form.priceHigh || "—"}M</em>
            {median ? (
              <span className="ledger-muted"> · median ${median}M</span>
            ) : null}
          </p>
        </div>
        <div className="soi-review-block">
          <p className="features-kicker">Comparables</p>
          <ul className="soi-review-list">
            {form.comps.map((c, i) => (
              <li key={c.id}>
                <span className="dispatch-folio">
                  No. {String(i + 1).padStart(2, "0")}
                </span>
                <span>{c.address || "—"}</span>
                <span className="ledger-num">
                  <em>{c.price || "—"}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="soi-grid soi-grid--2">
        <Field label="Vendor name" kicker="i">
          <input
            type="text"
            className="soi-input"
            placeholder="Mr & Mrs Whitfield"
            value={form.vendorName}
            onChange={(e) => onChange("vendorName", e.target.value)}
          />
        </Field>
        <Field label="Vendor email" kicker="ii">
          <input
            type="email"
            className="soi-input"
            placeholder="whitfield.estate@private.au"
            value={form.vendorEmail}
            onChange={(e) => onChange("vendorEmail", e.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Counter-signature"
        kicker="iii"
        hint="Type the vendor's full name to confirm authorisation. A signed PDF will be archived in the campaign ledger."
      >
        <input
          type="text"
          className="soi-input soi-signature"
          placeholder="Type vendor's full name to sign"
          value={form.vendorSignature}
          onChange={(e) => onChange("vendorSignature", e.target.value)}
        />
      </Field>
    </div>
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
