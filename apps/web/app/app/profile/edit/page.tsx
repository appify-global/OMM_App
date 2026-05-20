"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteFooter from "../../../components/SiteFooter";
import { agentProfile } from "../../_data/fixtures";

type Form = {
  name: string;
  title: string;
  firm: string;
  licence: string;
  abn: string;
  email: string;
  phone: string;
  bio: string;
  headline: string;
  suburbs: string[];
  languages: string[];
  specialties: string[];
  yearsExperience: number;
  websiteUrl: string;
  instagramHandle: string;
  linkedinUrl: string;
  showPhoneOnListings: boolean;
  showEmailOnListings: boolean;
  showOnDirectory: boolean;
};

const SUGGESTED_SPECIALTIES = [
  "Period homes",
  "Off-market",
  "Pre-market",
  "Vendor advocacy",
  "Investor sales",
  "Coastal",
  "Apartments",
  "Family homes",
  "First home buyers",
  "Subdivision",
];

const SUGGESTED_LANGUAGES = [
  "English",
  "Mandarin",
  "Cantonese",
  "Italian",
  "Greek",
  "Vietnamese",
  "Arabic",
  "Spanish",
  "Hindi",
];

const INITIAL: Form = {
  name: agentProfile.name,
  title: agentProfile.title,
  firm: agentProfile.firm,
  licence: agentProfile.licence,
  abn: agentProfile.abn,
  email: agentProfile.email,
  phone: agentProfile.phone,
  bio: agentProfile.bio,
  headline: "Quiet, considered campaigns for Bayside &amp; the inner-east.",
  suburbs: [...agentProfile.suburbs],
  languages: ["English", "Mandarin"],
  specialties: ["Period homes", "Off-market", "Vendor advocacy"],
  yearsExperience: 12,
  websiteUrl: "https://azrealestate.com.au/john-lim",
  instagramHandle: "@johnlim.azre",
  linkedinUrl: "https://linkedin.com/in/johnlim-azre",
  showPhoneOnListings: true,
  showEmailOnListings: true,
  showOnDirectory: true,
};

export default function EditProfilePage() {
  const [form, setForm] = useState<Form>(INITIAL);
  const [suburbDraft, setSuburbDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const initials = useMemo(
    () =>
      form.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [form.name],
  );

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const toggleInArray = (key: "languages" | "specialties", value: string) => {
    setForm((prev) => {
      const has = prev[key].includes(value);
      const next = has
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value];
      return { ...prev, [key]: next };
    });
    setSaved(false);
  };

  const addSuburb = () => {
    const v = suburbDraft.trim();
    if (!v) return;
    if (form.suburbs.includes(v)) {
      setSuburbDraft("");
      return;
    }
    update("suburbs", [...form.suburbs, v]);
    setSuburbDraft("");
  };

  const removeSuburb = (s: string) => {
    update(
      "suburbs",
      form.suburbs.filter((x) => x !== s),
    );
  };

  const completion = useMemo(() => {
    const checks = [
      form.name.length > 0,
      form.title.length > 0,
      form.firm.length > 0,
      form.licence.length > 0,
      form.email.length > 0,
      form.phone.length > 0,
      form.bio.length >= 80,
      form.suburbs.length >= 3,
      form.languages.length >= 1,
      form.specialties.length >= 1,
      form.websiteUrl.length > 0,
    ];
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
  }, [form]);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Edit profile</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · General</span>
            </p>
            <h1 className="subpage-title">
              Edit your <em>profile</em>.
            </h1>
            <p className="page-lede">
              The face you wear in the marketplace. Keep it accurate, keep it
              human, buyers and co-agents read this carefully.
            </p>
          </div>
          <aside className="subpage-aside">
            <p className="subpage-aside-kicker">Completion</p>
            <p className="profile-completion">
              <span className="profile-completion-num">{completion}%</span>
            </p>
            <span className="profile-completion-track">
              <span
                className="profile-completion-fill"
                style={{ width: `${completion}%` }}
              />
            </span>
            {savedAt ? (
              <p className="subpage-aside-kicker">Last saved {savedAt}</p>
            ) : null}
          </aside>
        </header>

        <div className="edit-profile-shell">
          <form
            className="subpage-form edit-profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
              const now = new Date();
              setSavedAt(
                now.toLocaleTimeString("en-AU", {
                  hour: "numeric",
                  minute: "2-digit",
                }),
              );
            }}
          >
            {/* I - Photo & headline */}
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">i</span>
                <span className="subpage-fieldset-title">Photo &amp; headline</span>
              </legend>
              <p className="subpage-fieldset-lede">
                A clean portrait and a single line that captures how you work.
              </p>
              <div className="subpage-fieldset-body">
                <div className="avatar-upload">
                  <div className="avatar-upload-frame">
                    <span className="avatar-upload-initials">{initials}</span>
                  </div>
                  <div className="avatar-upload-text">
                    <p className="avatar-upload-label">Profile portrait</p>
                    <p className="avatar-upload-hint">
                      JPG or PNG · square crop · at least 600 × 600px ·
                      under 4MB
                    </p>
                    <div className="avatar-upload-actions">
                      <button type="button" className="dash-cta is-ghost">
                        Upload new
                      </button>
                      <button type="button" className="danger-link">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <label className="subpage-field">
                  <span className="subpage-field-label">Headline</span>
                  <input
                    type="text"
                    className="subpage-field-input"
                    value={form.headline}
                    maxLength={120}
                    onChange={(e) => update("headline", e.target.value)}
                    placeholder="One line on how you work"
                  />
                  <span className="subpage-field-hint">
                    {form.headline.length} / 120 &middot; appears under your name
                  </span>
                </label>
              </div>
            </fieldset>

            {/* II - Identity */}
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">ii</span>
                <span className="subpage-fieldset-title">Identity</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Your name, role and the firm behind the work.
              </p>
              <div className="subpage-fieldset-body">
                <div className="field-row">
                  <Field
                    label="Full name"
                    value={form.name}
                    onChange={(v) => update("name", v)}
                  />
                  <Field
                    label="Title"
                    value={form.title}
                    onChange={(v) => update("title", v)}
                    hint="e.g. Director · Sales advisory"
                  />
                </div>
                <Field
                  label="Firm"
                  value={form.firm}
                  onChange={(v) => update("firm", v)}
                />
                <div className="field-row">
                  <Field
                    label="Years of experience"
                    type="number"
                    value={String(form.yearsExperience)}
                    onChange={(v) =>
                      update("yearsExperience", parseInt(v || "0", 10))
                    }
                  />
                  <Field
                    label="Joined OMM"
                    value={String(agentProfile.joinedYear)}
                    onChange={() => undefined}
                    readOnly
                    hint="Set when you joined, cannot change"
                  />
                </div>
              </div>
            </fieldset>

            {/* III - Contact */}
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">iii</span>
                <span className="subpage-fieldset-title">Contact</span>
              </legend>
              <p className="subpage-fieldset-lede">
                How buyers and co-agents reach you. Sign-in details stay in
                Account settings.
              </p>
              <div className="subpage-fieldset-body">
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => update("phone", v)}
                />
                <div className="visibility-stack">
                  <Toggle
                    label="Show phone on my listings"
                    hint="Buyers can call you directly when this is on."
                    value={form.showPhoneOnListings}
                    onChange={(v) => update("showPhoneOnListings", v)}
                  />
                  <Toggle
                    label="Show email on my listings"
                    hint="Recommended, most enquiries come by email."
                    value={form.showEmailOnListings}
                    onChange={(v) => update("showEmailOnListings", v)}
                  />
                </div>
              </div>
            </fieldset>

            {/* IV - Bio */}
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">iv</span>
                <span className="subpage-fieldset-title">Bio</span>
              </legend>
              <p className="subpage-fieldset-lede">
                A short paragraph in your own voice. The best ones are honest
                and specific.
              </p>
              <div className="subpage-fieldset-body">
                <label className="subpage-field">
                  <span className="subpage-field-label">About you</span>
                  <textarea
                    className="subpage-field-input subpage-field-input--area"
                    rows={6}
                    value={form.bio}
                    maxLength={600}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Twelve years steering off-market campaigns across..."
                  />
                  <span className="subpage-field-hint">
                    {form.bio.length} / 600 &middot;{" "}
                    {form.bio.length < 80
                      ? "we recommend at least 80 characters"
                      : "looking good"}
                  </span>
                </label>
              </div>
            </fieldset>

            {/* V - Areas of practice */}
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">v</span>
                <span className="subpage-fieldset-title">Areas of practice</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Suburbs you cover and the kind of work you do best.
              </p>
              <div className="subpage-fieldset-body">
                <div className="subpage-field">
                  <span className="subpage-field-label">Suburbs</span>
                  <div className="suburb-input-row">
                    <input
                      type="text"
                      className="subpage-field-input"
                      value={suburbDraft}
                      onChange={(e) => setSuburbDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSuburb();
                        }
                      }}
                      placeholder="Add a suburb and press enter"
                    />
                    <button
                      type="button"
                      className="dash-cta is-ghost"
                      onClick={addSuburb}
                    >
                      Add
                    </button>
                  </div>
                  {form.suburbs.length > 0 ? (
                    <ul className="suburb-tags" role="list">
                      {form.suburbs.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            className="suburb-tag"
                            onClick={() => removeSuburb(s)}
                          >
                            <span>{s}</span>
                            <span aria-hidden="true">×</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="subpage-field-hint">
                      Add at least three suburbs you actively work.
                    </span>
                  )}
                </div>

                <div className="subpage-field">
                  <span className="subpage-field-label">Specialties</span>
                  <ul className="topic-list" role="list">
                    {SUGGESTED_SPECIALTIES.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          className={
                            "topic-chip" +
                            (form.specialties.includes(s) ? " is-active" : "")
                          }
                          onClick={() => toggleInArray("specialties", s)}
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <span className="subpage-field-hint">
                    Choose up to five, precision beats range.
                  </span>
                </div>

                <div className="subpage-field">
                  <span className="subpage-field-label">Languages</span>
                  <ul className="topic-list" role="list">
                    {SUGGESTED_LANGUAGES.map((l) => (
                      <li key={l}>
                        <button
                          type="button"
                          className={
                            "topic-chip" +
                            (form.languages.includes(l) ? " is-active" : "")
                          }
                          onClick={() => toggleInArray("languages", l)}
                        >
                          {l}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </fieldset>

            {/* VI - Credentials */}
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">vi</span>
                <span className="subpage-fieldset-title">Credentials</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Verified information, please keep these up to date.
              </p>
              <div className="subpage-fieldset-body">
                <Field
                  label="Licence number"
                  value={form.licence}
                  onChange={(v) => update("licence", v)}
                  hint="e.g. VIC 084 921"
                />
                <Field
                  label="ABN"
                  value={form.abn}
                  onChange={(v) => update("abn", v)}
                />
                <p className="credentials-note">
                  <em>Verified</em> &middot; {agentProfile.verifiedAt}
                </p>
              </div>
            </fieldset>

            {/* VII - Web presence */}
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">vii</span>
                <span className="subpage-fieldset-title">Web presence</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Optional links shown on your public profile.
              </p>
              <div className="subpage-fieldset-body">
                <Field
                  label="Website"
                  type="url"
                  value={form.websiteUrl}
                  onChange={(v) => update("websiteUrl", v)}
                  placeholder="https://"
                />
                <Field
                  label="Instagram"
                  value={form.instagramHandle}
                  onChange={(v) => update("instagramHandle", v)}
                  placeholder="@yourhandle"
                />
                <Field
                  label="LinkedIn"
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(v) => update("linkedinUrl", v)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </fieldset>

            {/* VIII - Visibility */}
            <fieldset className="subpage-fieldset">
              <legend className="subpage-fieldset-legend">
                <span className="subpage-fieldset-kicker">viii</span>
                <span className="subpage-fieldset-title">Visibility</span>
              </legend>
              <p className="subpage-fieldset-lede">
                Who can see your profile across OMM.
              </p>
              <div className="subpage-fieldset-body">
                <Toggle
                  label="List me in the public agent directory"
                  hint="Buyers can find you when this is on. Listings always remain visible."
                  value={form.showOnDirectory}
                  onChange={(v) => update("showOnDirectory", v)}
                />
              </div>
            </fieldset>

            <footer className="subpage-form-footer">
              {saved ? (
                <p className="subpage-form-saved">
                  <em>Saved</em> &middot; changes are live
                </p>
              ) : (
                <p className="subpage-form-fineprint">
                  Changes are visible across OMM within a minute.
                </p>
              )}
              <div className="subpage-form-actions">
                <Link href="/app/profile" className="dash-cta is-ghost">
                  Cancel
                </Link>
                <button type="submit" className="dash-cta">
                  Save profile
                </button>
              </div>
            </footer>
          </form>

          {/* Live preview rail */}
          <aside className="profile-preview" aria-label="Live preview">
            <p className="profile-preview-kicker">
              <em>Preview</em> &middot; how others see you
            </p>
            <article className="profile-preview-card">
              <div className="profile-preview-portrait">
                <span>{initials}</span>
              </div>
              <p className="profile-preview-name">{form.name || "Your name"}</p>
              <p className="profile-preview-title">
                {form.title}
                {form.firm ? ` · ${form.firm}` : ""}
              </p>
              {form.headline ? (
                <p className="profile-preview-headline">
                  &ldquo;
                  <span dangerouslySetInnerHTML={{ __html: form.headline }} />
                  &rdquo;
                </p>
              ) : null}
              <dl className="profile-preview-meta">
                <div>
                  <dt>Suburbs</dt>
                  <dd>
                    {form.suburbs.length > 0
                      ? form.suburbs.slice(0, 4).join(" · ") +
                        (form.suburbs.length > 4
                          ? ` +${form.suburbs.length - 4}`
                          : "")
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt>Specialties</dt>
                  <dd>
                    {form.specialties.length > 0
                      ? form.specialties.join(" · ")
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt>Languages</dt>
                  <dd>
                    {form.languages.length > 0
                      ? form.languages.join(", ")
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt>Experience</dt>
                  <dd>
                    {form.yearsExperience} years &middot; joined{" "}
                    {agentProfile.joinedYear}
                  </dd>
                </div>
              </dl>
              {form.bio ? (
                <p className="profile-preview-bio">
                  {form.bio.slice(0, 220)}
                  {form.bio.length > 220 ? "…" : ""}
                </p>
              ) : null}
            </article>
            <p className="profile-preview-foot">
              <Link href="/app/profile">View public profile →</Link>
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="subpage-field">
      <span className="subpage-field-label">{label}</span>
      <input
        type={type}
        className="subpage-field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {hint ? (
        <span
          className="subpage-field-hint"
          dangerouslySetInnerHTML={{ __html: hint }}
        />
      ) : null}
    </label>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="subpage-toggle">
      <span className="subpage-toggle-text">
        <span className="subpage-toggle-label">{label}</span>
        {hint ? (
          <span
            className="subpage-toggle-hint"
            dangerouslySetInnerHTML={{ __html: hint }}
          />
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        className={"subpage-switch" + (value ? " is-on" : "")}
        onClick={() => onChange(!value)}
      >
        <span className="subpage-switch-thumb" aria-hidden="true" />
      </button>
    </label>
  );
}
