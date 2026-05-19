"use client";

import { useEffect, useState } from "react";

export type Mode = "selling" | "buying";

const STORAGE_KEY = "omm.mode";

export default function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (next: Mode) => void;
}) {
  return (
    <div className="mode-toggle" role="tablist" aria-label="Workspace mode">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "selling"}
        className={"mode-toggle-segment" + (mode === "selling" ? " is-active" : "")}
        onClick={() => onChange("selling")}
      >
        <span className="mode-toggle-section">i</span>
        <span className="mode-toggle-label">Selling</span>
      </button>
      <span className="mode-toggle-rule" aria-hidden="true" />
      <button
        type="button"
        role="tab"
        aria-selected={mode === "buying"}
        className={"mode-toggle-segment" + (mode === "buying" ? " is-active" : "")}
        onClick={() => onChange("buying")}
      >
        <span className="mode-toggle-section">ii</span>
        <span className="mode-toggle-label">Buying</span>
      </button>
    </div>
  );
}

export function useMode(): [Mode, (next: Mode) => void] {
  const [mode, setMode] = useState<Mode>("selling");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "selling" || stored === "buying") {
      setMode(stored);
    }
  }, []);

  const update = (next: Mode) => {
    setMode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable; silent fallback
    }
  };

  return [mode, update];
}
