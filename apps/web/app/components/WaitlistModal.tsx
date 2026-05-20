"use client";

import { useEffect, useId, useRef, useState } from "react";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  source?: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  licence: string;
}

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  licence: "",
};

export default function WaitlistModal({ open, onClose, source = "web" }: WaitlistModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 80);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(() => {
        setForm(initial);
        setStatus("idle");
        setError(null);
      }, 220);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const licence = form.licence.trim();

    if (!name || !email || !phone || !licence) {
      setError("All fields are required.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, licence, source }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch (err) {
      console.error("[WaitlistModal] submit failed", err);
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  };

  const submitLabel =
    status === "submitting" ? "Submitting…" : "Join the waitlist";

  return (
    <div
      className="apply-modal__scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="apply-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="apply-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {status === "sent" ? (
          <div className="apply-modal__success">
            <p className="apply-modal__eyebrow">Application received</p>
            <h2 id={titleId} className="apply-modal__title">
              You&rsquo;re on the list, {form.name.split(" ")[0] || "there"}.
            </h2>
            <p className="apply-modal__lede">
              We&rsquo;ve sent a confirmation to <strong>{form.email}</strong>.
              We&rsquo;re reviewing applications in small batches and will be
              in touch shortly.
            </p>
            <button
              type="button"
              className="apply-modal__submit"
              onClick={onClose}
            >
              <span className="btn-pill__label" aria-hidden="true">
                <span className="btn-pill__label-text">Close</span>
                <span className="btn-pill__label-text btn-pill__label-text--clone">
                  Close
                </span>
              </span>
              <span className="sr-only">Close</span>
            </button>
          </div>
        ) : (
          <>
            <div className="apply-modal__head">
              <h2 id={titleId} className="apply-modal__title">
                Join the MATCH waitlist.
              </h2>
              <p className="apply-modal__lede">
                MATCH is opening to verified agents in small batches. Share a
                few details and we&rsquo;ll be in touch.
              </p>
            </div>

            <form className="apply-modal__form" onSubmit={handleSubmit} noValidate>
              <div className="apply-modal__row">
                <label className="apply-modal__field">
                  <span className="apply-modal__label">Full name</span>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="apply-modal__input"
                    placeholder="Jordan Reid"
                  />
                </label>
              </div>

              <div className="apply-modal__row">
                <label className="apply-modal__field">
                  <span className="apply-modal__label">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="apply-modal__input"
                    placeholder="you@agency.com.au"
                  />
                </label>
              </div>

              <div className="apply-modal__row">
                <label className="apply-modal__field">
                  <span className="apply-modal__label">Phone number</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="apply-modal__input"
                    placeholder="+61 4xx xxx xxx"
                  />
                </label>
              </div>

              <div className="apply-modal__row">
                <label className="apply-modal__field">
                  <span className="apply-modal__label">
                    Real estate licence number
                  </span>
                  <input
                    type="text"
                    required
                    value={form.licence}
                    onChange={(e) => update("licence", e.target.value)}
                    className="apply-modal__input"
                    placeholder="e.g. VIC 123456"
                  />
                </label>
              </div>

              {error && (
                <p className="apply-modal__error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="apply-modal__submit apply-modal__submit--anim"
                disabled={status === "submitting"}
              >
                <span className="btn-pill__label" aria-hidden="true">
                  <span className="btn-pill__label-text">{submitLabel}</span>
                  <span className="btn-pill__label-text btn-pill__label-text--clone">
                    {submitLabel}
                  </span>
                </span>
                <span className="sr-only">{submitLabel}</span>
                <span className="btn-pill-arrow" aria-hidden="true">
                  →
                </span>
              </button>

              <p className="apply-modal__foot">
                We verify every agent against the state register before
                approving access. No spam, no data sales.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
