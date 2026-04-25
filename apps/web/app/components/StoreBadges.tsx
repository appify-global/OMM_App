"use client";

import { useState } from "react";
import ComingSoonModal from "./ComingSoonModal";

export default function StoreBadges() {
  const [open, setOpen] = useState<false | "ios" | "android">(false);

  return (
    <>
      <div className="store-badges" aria-label="Download the PreMarket app">
        <button
          type="button"
          className="store-badge"
          onClick={() => setOpen("ios")}
          aria-label="Download on the App Store (coming soon)"
        >
          <picture>
            <source
              media="(max-width: 980px)"
              srcSet="/badges/app-store-light.png?v=1"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/badges/app-store.png?v=3"
              alt="Download on the App Store"
              className="store-badge-img store-badge-img--apple"
            />
          </picture>
        </button>

        <button
          type="button"
          className="store-badge"
          onClick={() => setOpen("android")}
          aria-label="Get it on Google Play (coming soon)"
        >
          <picture>
            <source
              media="(max-width: 980px)"
              srcSet="/badges/google-play-light.png?v=1"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/badges/google-play.png?v=3"
              alt="Get it on Google Play"
              className="store-badge-img store-badge-img--google"
            />
          </picture>
        </button>
      </div>

      {open && (
        <ComingSoonModal platform={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
