"use client";

import { useState } from "react";
import ApplyModal from "./ApplyModal";
import WaitlistModal from "./WaitlistModal";
import { isWaitlistMode } from "../lib/site-mode";

type Props = {
  className?: string;
  label?: string;
  source?: string;
};

export default function ApplyJoinCta({
  className = "btn-pill btn-pill--hero",
  label,
  source,
}: Props) {
  const [open, setOpen] = useState(false);
  const waitlist = isWaitlistMode();
  const buttonLabel = label ?? (waitlist ? "Join the waitlist" : "Apply to join");

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        <span className="btn-pill__label" aria-hidden="true">
          <span className="btn-pill__label-text">{buttonLabel}</span>
          <span className="btn-pill__label-text btn-pill__label-text--clone">
            {buttonLabel}
          </span>
        </span>
        <span className="sr-only">{buttonLabel}</span>
        <span className="btn-pill-arrow" aria-hidden="true">
          →
        </span>
      </button>
      {waitlist ? (
        <WaitlistModal
          open={open}
          onClose={() => setOpen(false)}
          source={source}
        />
      ) : (
        <ApplyModal open={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
