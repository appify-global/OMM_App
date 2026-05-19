"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../../components/SiteFooter";
import { agentProfile } from "../../_data/fixtures";

type Form = {
  displayName: string;
  email: string;
  phone: string;
  pushMessages: boolean;
  pushOffers: boolean;
  emailDigest: boolean;
  smsAlerts: boolean;
};

const INITIAL: Form = {
  displayName: agentProfile.name,
  email: agentProfile.email,
  phone: agentProfile.phone,
  pushMessages: true,
  pushOffers: true,
  emailDigest: false,
  smsAlerts: true,
};

export default function AccountSettingsPage() {
  const [form, setForm] = useState<Form>(INITIAL);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Account settings</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · General</span>
            </p>
            <h1 className="subpage-title">
              Account <em>settings</em>.
            </h1>
            <p className="page-lede">
              Your display name, contact details, and how OMM reaches you.
            </p>
          </div>
        </header>

        <form
          className="subpage-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <Fieldset
            kicker="i"
            title="Identity"
            lede="How you appear to buyers, vendors and other agents on OMM."
          >
            <Field
              label="Display name"
              hint="Your name as it appears on listings, briefs and replies."
              value={form.displayName}
              onChange={(v) => update("displayName", v)}
            />
            <Field
              label="Email"
              hint="Used for sign-in, billing and important notices."
              type="email"
              value={form.email}
              onChange={(v) => update("email", v)}
            />
            <Field
              label="Phone"
              hint="Buyers may reach you on this number when you allow it on a listing."
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
            />
          </Fieldset>

          <Fieldset
            kicker="ii"
            title="Notifications"
            lede="Choose how we tap you on the shoulder. You can change these any time."
          >
            <Toggle
              label="Push notifications for messages"
              hint="A new enquiry, a reply, or a thread update."
              value={form.pushMessages}
              onChange={(v) => update("pushMessages", v)}
            />
            <Toggle
              label="Push notifications for offers"
              hint="When a buyer makes an offer on one of your listings."
              value={form.pushOffers}
              onChange={(v) => update("pushOffers", v)}
            />
            <Toggle
              label="Daily email digest"
              hint="One quiet email per morning with the day's headlines."
              value={form.emailDigest}
              onChange={(v) => update("emailDigest", v)}
            />
            <Toggle
              label="SMS for time-sensitive items"
              hint="Inspection reschedules, contract sign-offs, expiring authorities."
              value={form.smsAlerts}
              onChange={(v) => update("smsAlerts", v)}
            />
          </Fieldset>

          <Fieldset
            kicker="iii"
            title="Security"
            lede="Sign-in protection."
          >
            <ul className="settings-list">
              <li>
                <SettingsLink
                  label="Change password"
                  hint="Last changed 12 March 2026"
                  href="/app/profile/account/password"
                />
              </li>
              <li>
                <SettingsLink
                  label="Two-factor authentication"
                  hint="Not enabled · Recommended"
                  href="/app/profile/account/2fa"
                  badge="Off"
                />
              </li>
              <li>
                <SettingsLink
                  label="Active sessions"
                  hint="3 devices signed in"
                  href="/app/profile/account/sessions"
                />
              </li>
            </ul>
          </Fieldset>

          <footer className="subpage-form-footer">
            {saved ? (
              <p className="subpage-form-saved">
                <em>Saved</em> · changes are live
              </p>
            ) : null}
            <div className="subpage-form-actions">
              <Link href="/app/profile" className="dash-cta is-ghost">
                Cancel
              </Link>
              <button type="submit" className="dash-cta">
                Save changes
              </button>
            </div>
          </footer>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}

function Fieldset({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="subpage-fieldset">
      <legend className="subpage-fieldset-legend">
        <span className="subpage-fieldset-kicker">{kicker}</span>
        <span className="subpage-fieldset-title">{title}</span>
      </legend>
      <p className="subpage-fieldset-lede">{lede}</p>
      <div className="subpage-fieldset-body">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="subpage-field">
      <span className="subpage-field-label">{label}</span>
      <input
        type={type}
        className="subpage-field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="subpage-field-hint">{hint}</span> : null}
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
        {hint ? <span className="subpage-toggle-hint">{hint}</span> : null}
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

function SettingsLink({
  label,
  hint,
  href,
  badge,
}: {
  label: string;
  hint: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="settings-row">
      <span className="settings-row-text">
        <span className="settings-row-label">{label}</span>
        <span className="settings-row-hint">{hint}</span>
      </span>
      {badge ? <span className="settings-row-badge">{badge}</span> : null}
      <span className="settings-row-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
