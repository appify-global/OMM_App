"use client";

import { useEffect, useRef, useState } from "react";

type Platform = "ios" | "android";

type Props = {
  platform: Platform;
  onClose: () => void;
};

const copy: Record<Platform, { title: string; store: string }> = {
  ios: {
    title: "On the App Store, soon.",
    store: "Apple App Store",
  },
  android: {
    title: "On Google Play, soon.",
    store: "Google Play",
  },
};

export default function ComingSoonModal({ platform, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    firstFieldRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform }),
      }).catch(() => null);
    } finally {
      setStatus("sent");
    }
  };

  const { title, store } = copy[platform];

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        className="modal-dialog"
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <p className="modal-kicker">
          <span className="sq sq--filled sq--sm" aria-hidden="true" />
          <span>Private beta</span>
        </p>
        <h2 id="coming-soon-title" className="modal-title">
          {title}
        </h2>
        <p className="modal-lede">
          The PreMarket app is in private beta with a small cohort of agents and
          buyers in Melbourne. Leave your email and we&rsquo;ll tell you the day
          it lands on {store}.
        </p>

        {status === "sent" ? (
          <div className="modal-success" role="status">
            <p className="modal-success-title">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              You&rsquo;re on the list.
            </p>
            <p>We&rsquo;ll be in touch the moment we ship.</p>
            <button type="button" className="modal-submit" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={onSubmit}>
            <label htmlFor="notify-email" className="modal-label">
              Email
            </label>
            <div className="modal-input-row">
              <input
                ref={firstFieldRef}
                id="notify-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modal-input"
              />
              <button
                type="submit"
                className="modal-submit"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending" : "Notify me"}
              </button>
            </div>
            <p className="modal-fineprint">
              We&rsquo;ll only email you once, when the app is live. No lists,
              no spam.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
