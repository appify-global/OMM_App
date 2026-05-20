"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  suburbs: string[];
}

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  suburbs: [],
};

/* Curated suburb list mirrors MOCK_SUBURBS in lib/api.ts.
 * Kept inline (vs imported) so this client modal stays free of the
 * server-only fetch surface and ships a tiny static payload. */
const SUBURB_OPTIONS: { name: string; state: string }[] = [
  { name: "Hawthorn", state: "VIC" },
  { name: "Kew", state: "VIC" },
  { name: "Camberwell", state: "VIC" },
  { name: "Toorak", state: "VIC" },
  { name: "South Yarra", state: "VIC" },
  { name: "Malvern", state: "VIC" },
  { name: "Armadale", state: "VIC" },
  { name: "Brighton", state: "VIC" },
  { name: "St Kilda", state: "VIC" },
  { name: "Mosman", state: "NSW" },
  { name: "Double Bay", state: "NSW" },
  { name: "Vaucluse", state: "NSW" },
];

export default function ApplyModal({ open, onClose }: ApplyModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const suburbWrapRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const suburbListId = useId();
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [suburbOpen, setSuburbOpen] = useState(false);
  const [suburbQuery, setSuburbQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (suburbOpen) {
          setSuburbOpen(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);

    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose, suburbOpen]);

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(() => {
        setForm(initial);
        setStatus("idle");
        setSuburbOpen(false);
        setSuburbQuery("");
      }, 220);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Click-outside for the suburb dropdown - doesn't close the modal,
  // just collapses the menu. Uses mousedown so it fires before option click
  // can race with the close.
  useEffect(() => {
    if (!suburbOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!suburbWrapRef.current?.contains(e.target as Node)) {
        setSuburbOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [suburbOpen]);

  const filteredSuburbs = useMemo(() => {
    const q = suburbQuery.trim().toLowerCase();
    if (!q) return SUBURB_OPTIONS;
    return SUBURB_OPTIONS.filter((s) =>
      `${s.name} ${s.state}`.toLowerCase().includes(q)
    );
  }, [suburbQuery]);

  if (!open) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSuburb = (name: string) => {
    setForm((prev) => {
      const has = prev.suburbs.includes(name);
      return {
        ...prev,
        suburbs: has
          ? prev.suburbs.filter((s) => s !== name)
          : [...prev.suburbs, name],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setStatus("submitting");
    // TODO: wire to /api/apply once the endpoint exists
    await new Promise((r) => window.setTimeout(r, 600));
    setStatus("sent");
  };

  const submitLabel =
    status === "submitting" ? "Sending…" : "Submit application";

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
              Thanks, {form.name.split(" ")[0] || "we got you"}.
            </h2>
            <p className="apply-modal__lede">
              We&rsquo;ll review your application and get back to you at{" "}
              <strong>{form.email}</strong> within 24 hours.
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
              <p className="apply-modal__eyebrow">Private property access</p>
              <h2 id={titleId} className="apply-modal__title">
                Apply to join MATCH.
              </h2>
              <p className="apply-modal__lede">
                Membership is invite-only. Share a few details and we&rsquo;ll
                be in touch within 24 hours.
              </p>
            </div>

            <form className="apply-modal__form" onSubmit={handleSubmit}>
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

              <div className="apply-modal__row apply-modal__row--split">
                <label className="apply-modal__field">
                  <span className="apply-modal__label">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="apply-modal__input"
                    placeholder="you@domain.com"
                  />
                </label>
                <label className="apply-modal__field">
                  <span className="apply-modal__label">Phone</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="apply-modal__input"
                    placeholder="+61 4xx xxx xxx"
                  />
                </label>
              </div>

              <div className="apply-modal__row">
                <div className="apply-modal__field" ref={suburbWrapRef}>
                  <span className="apply-modal__label" id={`${suburbListId}-label`}>
                    Suburbs of interest{" "}
                    <span className="apply-modal__hint">(optional)</span>
                  </span>
                  <div
                    className={`suburb-select ${suburbOpen ? "is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="suburb-select__trigger"
                      aria-haspopup="listbox"
                      aria-expanded={suburbOpen}
                      aria-labelledby={`${suburbListId}-label`}
                      onClick={() => setSuburbOpen((v) => !v)}
                    >
                      {form.suburbs.length === 0 ? (
                        <span className="suburb-select__placeholder">
                          Select suburbs
                        </span>
                      ) : (
                        <span className="suburb-select__tags">
                          {form.suburbs.map((s) => (
                            <span key={s} className="suburb-select__tag">
                              {s}
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={`Remove ${s}`}
                                className="suburb-select__tag-x"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSuburb(s);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleSuburb(s);
                                  }
                                }}
                              >
                                ×
                              </span>
                            </span>
                          ))}
                        </span>
                      )}
                      <span
                        className="suburb-select__chev"
                        aria-hidden="true"
                      >
                        ▾
                      </span>
                    </button>

                    {suburbOpen && (
                      <div className="suburb-select__menu" role="presentation">
                        <input
                          type="text"
                          className="suburb-select__search"
                          placeholder="Search suburb"
                          value={suburbQuery}
                          onChange={(e) => setSuburbQuery(e.target.value)}
                          autoFocus
                        />
                        <ul
                          className="suburb-select__list"
                          role="listbox"
                          aria-multiselectable="true"
                          id={suburbListId}
                        >
                          {filteredSuburbs.length === 0 && (
                            <li className="suburb-select__empty">
                              No matches
                            </li>
                          )}
                          {filteredSuburbs.map((s) => {
                            const checked = form.suburbs.includes(s.name);
                            return (
                              <li
                                key={`${s.name}-${s.state}`}
                                role="option"
                                aria-selected={checked}
                                className={`suburb-select__option ${
                                  checked ? "is-checked" : ""
                                }`}
                                onClick={() => toggleSuburb(s.name)}
                              >
                                <span className="suburb-select__check" aria-hidden="true">
                                  {checked ? "✓" : ""}
                                </span>
                                <span className="suburb-select__option-name">
                                  {s.name}
                                </span>
                                <span className="suburb-select__option-state">
                                  {s.state}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
                Already a member?{" "}
                <a href="/sign-in" className="apply-modal__foot-link">
                  Sign in →
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
