"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function segment(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

/** Subtle Y shift from scroll progress (px at full scrub). */
function layerY(progress: number, maxPx: number) {
  return `translate3d(0, ${progress * maxPx}px, 0)`;
}

export default function HeroFind() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(mq.matches);
    syncMotion();
    mq.addEventListener("change", syncMotion);

    let frame = 0;
    const measure = () => {
      const wrap = scrollRef.current;
      if (!wrap || mq.matches) {
        setProgress(0);
        return;
      }
      const runway = wrap.offsetHeight - window.innerHeight;
      if (runway <= 0) {
        setProgress(0);
        return;
      }
      const top = wrap.getBoundingClientRect().top;
      setProgress(clamp01(-top / runway));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      mq.removeEventListener("change", syncMotion);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Landing stays intact for the first ~35% of the scrub */
  const introFade = 1 - easeOutCubic(segment(progress, 0.35, 0.72));
  const buildEase = easeOutCubic(progress);
  const apartmentTransform = reducedMotion
    ? undefined
    : `translate3d(0, calc(12% + ${buildEase * -32}px), 0) scale(${1 + buildEase * 0.06})`;

  return (
    <div ref={scrollRef} className="hero-find-scroll">
      <section className="hero-find hero-find--sticky" aria-label="Introduction">
        <div
          className="hero-find__sky"
          style={reducedMotion ? undefined : { transform: layerY(progress, 18) }}
          aria-hidden="true"
        />

        <div
          className="hero-find__clouds hero-find__clouds--property"
          style={reducedMotion ? undefined : { transform: layerY(progress, 28) }}
          aria-hidden="true"
        >
          <img
            src="/hero/cloud.png"
            alt=""
            width={1024}
            height={576}
            decoding="async"
            className="hero-find__clouds-img hero-find__clouds-img--property hero-find__clouds-img--property-left"
          />
          <img
            src="/hero/cloud.png"
            alt=""
            width={1024}
            height={576}
            decoding="async"
            className="hero-find__clouds-img hero-find__clouds-img--property hero-find__clouds-img--property-right"
          />
        </div>

        <div
          className="hero-find__apartment"
          style={reducedMotion ? undefined : { transform: apartmentTransform }}
          aria-hidden="true"
        >
          <img
            src="/hero/victoria.png?v=5"
            alt=""
            width={1430}
            height={552}
            decoding="async"
            fetchPriority="high"
            className="hero-find__apartment-img"
          />
        </div>

        <div
          className="hero-find__clouds hero-find__clouds--roof"
          style={reducedMotion ? undefined : { transform: layerY(progress, 34) }}
          aria-hidden="true"
        >
          <img
            src="/hero/cloud.png"
            alt=""
            width={1024}
            height={576}
            decoding="async"
            className="hero-find__clouds-img hero-find__clouds-img--roof"
          />
        </div>

        <div
          className="hero-find__headline"
          style={
            reducedMotion
              ? undefined
              : {
                  opacity: introFade,
                  transform: `translate3d(0, ${-progress * 36}px, 0)`,
                }
          }
        >
          <h1 className="hero-find__title">Search before it&rsquo;s listed</h1>
        </div>

        <div
          className="hero-find__clouds hero-find__clouds--text"
          style={reducedMotion ? undefined : { transform: layerY(progress, 22) }}
          aria-hidden="true"
        >
          <img
            src="/hero/cloud.png"
            alt=""
            width={1024}
            height={576}
            decoding="async"
            className="hero-find__clouds-img hero-find__clouds-img--text hero-find__clouds-img--text-left"
          />
          <img
            src="/hero/cloud.png"
            alt=""
            width={1024}
            height={576}
            decoding="async"
            className="hero-find__clouds-img hero-find__clouds-img--text hero-find__clouds-img--text-right"
          />
        </div>

        <div
          className="hero-find__actions"
          style={
            reducedMotion
              ? undefined
              : {
                  opacity: introFade,
                  transform: `translate3d(0, ${-progress * 24}px, 0)`,
                }
          }
        >
          <p className="hero-find__lede">
            <span className="hero-find__lede-strong">
              Off-market property across Victoria.
            </span>{" "}
            <span className="hero-find__lede-soft">
              See homes before they hit the public market.
            </span>
          </p>
          <Link href="/sign-up" className="btn-pill btn-pill--hero">
            <span className="btn-pill__label" aria-hidden="true">
              <span className="btn-pill__label-text">Apply to join</span>
              <span className="btn-pill__label-text btn-pill__label-text--clone">
                Apply to join
              </span>
            </span>
            <span className="sr-only">Apply to join</span>
            <span className="btn-pill-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
