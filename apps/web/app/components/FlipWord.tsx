"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  words: string[];
  dwellMs?: number;
  exitMs?: number;
  className?: string;
};

export default function FlipWord({
  words,
  dwellMs = 2800,
  exitMs = 220,
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exiting">("visible");
  const [enabled, setEnabled] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!enabled) return () => { mounted.current = false; };

    const interval = setInterval(() => {
      if (!mounted.current) return;
      setPhase("exiting");
      setTimeout(() => {
        if (!mounted.current) return;
        setIndex((i) => (i + 1) % words.length);
        setPhase("visible");
      }, exitMs);
    }, dwellMs);

    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [enabled, words.length, dwellMs, exitMs]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  const current = words[index];
  const count = current.length;

  return (
    <span className={`flip-word ${className}`}>
      <span className="flip-word-ghost" aria-hidden="true">{longest}</span>
      {enabled ? (
        <span
          key={`word-${index}`}
          className={`flip-word-stage ${phase === "exiting" ? "is-exiting" : ""}`}
        >
          {current.split("").map((ch, i) => (
            <span
              key={`${index}-${i}`}
              className={`flip-word-char ${phase === "exiting" ? "is-exiting" : "is-entering"}`}
              style={{ ["--ci" as string]: i, ["--cc" as string]: count }}
            >
              {ch}
            </span>
          ))}
        </span>
      ) : (
        <span className="flip-word-stage">{words[0]}</span>
      )}
    </span>
  );
}
