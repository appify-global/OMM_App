"use client";

import { useEffect, useRef, useState } from "react";
import {
  attachHeroScrollDriver,
  readHeroProgress,
} from "../lib/hero-motion";
import ApplyModal from "./ApplyModal";
import WaitlistModal from "./WaitlistModal";
import { isWaitlistMode } from "../lib/site-mode";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Slow-in, glide, slow-out - luxury feel for hero scrub */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Even smoother - used for the wordmark + building hero moves */
function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
}

function segment(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

/** Subtle Y shift from scroll progress (px at full scrub) - eased for luxury feel */
function layerY(progress: number, maxPx: number) {
  return `translate3d(0, ${easeInOutCubic(progress) * maxPx}px, 0)`;
}

export default function HeroFind() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionFrozen, setMotionFrozen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const waitlist = isWaitlistMode();
  const ctaLabel = waitlist ? "Join the waitlist" : "Apply to join";
  /** First-paint - false on SSR; flips true on mount for one unified hero fade-in. */
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Defer to the next frame so the browser paints the initial (hidden)
    // state once before the animation runs - guarantees the reveal is visible
    // even on cached loads. requestAnimationFrame is more reliable than
    // setTimeout(0) for "after first paint".
    const id = window.requestAnimationFrame(() => setLoaded(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(mq.matches);
    syncMotion();
    mq.addEventListener("change", syncMotion);

    const frozenForAuth = document.querySelector(".auth-route") !== null;
    if (frozenForAuth) {
      setMotionFrozen(true);
      setProgress(readHeroProgress());
      return () => {
        mq.removeEventListener("change", syncMotion);
      };
    }

    const detachScroll = attachHeroScrollDriver({
      getWrap: () => scrollRef.current,
      onProgress: setProgress,
      isReducedMotion: () => mq.matches,
    });

    return () => {
      mq.removeEventListener("change", syncMotion);
      detachScroll();
    };
  }, []);

  /* === Luxury scroll timeline - front-loaded so headline can HOLD at end ===
   * Runway: 480vh wrapper - 100vh sticky = 380vh scrub. Progress is 1:1 with
   * scroll on touch; ease curves below shape heaviness per scroll distance.
   *
   * 0.00 – 0.25  clouds drift in
   * 0.04 – 0.25  headline + lede + CTA fade out
   * 0.04 – 0.62  building scales slowly through middle of timeline
   * 0.10 – 0.58  MATCH wordmark eases in
   * 0.55 – 0.72  wordmark + building DISSOLVE into clouds
   * 0.58 – 0.82  cloudBloom - clouds swell + fill screen
   * 0.68 – 0.82  whiteout wash completes
   * 0.70 – 0.82  "Why MATCH" headline emerges
   * 0.82 – 1.00  HOLD - headline sits in the cleared frame for ~3 wheel ticks
   *               of "read me before continuing" time before sticky releases.
   */
  const cloudsRise = easeInOutCubic(segment(progress, 0.0, 0.25));
  const textFade = 1 - easeInOutCubic(segment(progress, 0.04, 0.25));
  const buildEase = easeInOutQuart(segment(progress, 0.04, 0.62));
  const wordmarkIn = easeInOutQuart(segment(progress, 0.1, 0.58));
  /** Dissolve: wordmark/building fade out into the clouds (not snap to white) */
  const dissolve = easeInOutCubic(segment(progress, 0.55, 0.72));
  /** Cloud bloom: clouds swell + brighten through the exit */
  const cloudBloom = easeInOutCubic(segment(progress, 0.58, 0.82));
  /** Whiteout: final wash, layered on top of bloomed clouds */
  const whiteout = easeInOutCubic(segment(progress, 0.68, 0.82));
  /** Next-section headline: emerges after dissolve, then HOLDS at full opacity
   *  for the final 18% of runway so users have time to read */
  const whyIn = easeInOutCubic(segment(progress, 0.7, 0.82));

  // Building scales up from bottom origin - never floats away
  // Slightly less aggressive zoom (1.0 → 1.22 vs 1.3) for refined feel
  const apartmentTransform = reducedMotion
    ? undefined
    : `scale(${1 + buildEase * 0.22})`;

  /** Building fades out into clouds (not into white) - never goes fully invisible
   *  until the very end so it has presence as it dissolves */
  const apartmentOpacity = reducedMotion ? 1 : 1 - dissolve * 0.92;

  const heroClass = [
    "hero-find",
    "hero-find--sticky",
    loaded ? "hero-find--loaded" : "hero-find--booting",
  ].join(" ");

  return (
    <div
      ref={scrollRef}
      className={`hero-find-scroll${motionFrozen ? " hero-find-scroll--frozen" : ""}`}
    >
      <section className={heroClass} aria-label="Introduction">
        <div className="hero-find__sky" aria-hidden="true" />
        <div className="hero-find__sunset" aria-hidden="true" />

        <div
          className="hero-find__clouds hero-find__clouds--property"
          style={reducedMotion ? undefined : { transform: layerY(progress, 28) }}
          aria-hidden="true"
        >
          <div className="hero-find__cloud-drift hero-find__cloud-drift--a">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--property hero-find__clouds-img--property-left"
            />
          </div>
          <div className="hero-find__cloud-drift hero-find__cloud-drift--b">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--property hero-find__clouds-img--property-right"
            />
          </div>
        </div>

        <div
          className="hero-find__apartment"
          style={
            reducedMotion
              ? undefined
              : { transform: apartmentTransform, opacity: apartmentOpacity }
          }
          aria-hidden="true"
        >
          <img
            src="/hero/penthouse.png?v=5"
            alt=""
            width={1010}
            height={286}
            decoding="async"
            fetchPriority="high"
            className="hero-find__apartment-img hero-find__apartment-img--tower hero-find__apartment-img--penthouse"
          />
        </div>

        {/* Cloud wisps hugging the tree tops & building base - masks edge halo */}
        <div
          className="hero-find__clouds hero-find__clouds--tree"
          style={reducedMotion ? undefined : { transform: layerY(progress, 18) }}
          aria-hidden="true"
        >
          <div className="hero-find__cloud-drift hero-find__cloud-drift--c">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--tree hero-find__clouds-img--tree-left"
            />
          </div>
          <div className="hero-find__cloud-drift hero-find__cloud-drift--d">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--tree hero-find__clouds-img--tree-right"
            />
          </div>
        </div>

        <div
          className="hero-find__headline"
          style={
            reducedMotion
              ? undefined
              : {
                  opacity: textFade,
                  transform: `translate3d(0, ${(1 - textFade) * -48}px, 0)`,
                }
          }
        >
          <h1 className="hero-find__title">
            <span className="hero-find__title-word hero-find__title-word--search">Search</span>{" "}
            <span className="hero-find__title-word hero-find__title-word--rest">before it&rsquo;s listed</span>
          </h1>
        </div>

        {/* Dense cloud halo BEHIND the wordmark - fills sky gaps around the letters
         * Drifts in alongside the wordmark for maximum cloudy atmosphere */}
        {!reducedMotion && wordmarkIn > 0.01 && (
          <div
            className="hero-find__clouds hero-find__clouds--wordmark"
            style={{
              // Stay strong through the bloom, fade with final whiteout only
              opacity: wordmarkIn * (1 - whiteout * 0.4) + cloudBloom * 0.3,
              transform: `scale(${0.95 + wordmarkIn * 0.15 + cloudBloom * 0.3})`,
            }}
            aria-hidden="true"
          >
            <div className="hero-find__cloud-drift hero-find__cloud-drift--b">
              <img
                src="/hero/cloud.png"
                alt=""
                width={1024}
                height={576}
                decoding="async"
                className="hero-find__clouds-img hero-find__clouds-img--wordmark-left"
              />
            </div>
            <div className="hero-find__cloud-drift hero-find__cloud-drift--a">
              <img
                src="/hero/cloud.png"
                alt=""
                width={1024}
                height={576}
                decoding="async"
                className="hero-find__clouds-img hero-find__clouds-img--wordmark-right"
              />
            </div>
            <div className="hero-find__cloud-drift hero-find__cloud-drift--c">
              <img
                src="/hero/cloud.png"
                alt=""
                width={1024}
                height={576}
                decoding="async"
                className="hero-find__clouds-img hero-find__clouds-img--wordmark-center"
              />
            </div>
          </div>
        )}

        {/* FIND-style giant wordmark - grows over the landing while scroll is captured
         * Sits ABOVE the wordmark cloud halo so letters punch through */}
        {!reducedMotion && wordmarkIn > 0.01 && (
          <div
            className="hero-find__wordmark"
            style={{
              opacity: Math.min(1, wordmarkIn * 1.2) * (1 - dissolve),
              transform: `translate(-50%, -50%) scale(${0.82 + wordmarkIn * 0.18 + dissolve * 0.08})`,
            }}
            aria-hidden="true"
          >
            <span className="hero-find__wordmark-text">MATCH</span>
          </div>
        )}

        <div
          className="hero-find__clouds hero-find__clouds--text"
          style={reducedMotion ? undefined : { transform: layerY(progress, 22) }}
          aria-hidden="true"
        >
          <div className="hero-find__cloud-drift hero-find__cloud-drift--b">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--text hero-find__clouds-img--text-left"
            />
          </div>
          <div className="hero-find__cloud-drift hero-find__cloud-drift--a">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--text hero-find__clouds-img--text-right"
            />
          </div>
        </div>

        {/* Front cloud bank - rises, grows & thickens as you scroll
         * Density peaks alongside the wordmark; sits BEHIND the letters (z-index)
         * Extra top puffs drift in around the wordmark for max atmosphere */}
        {!reducedMotion && cloudsRise > 0.01 && (
          <div
            className="hero-find__clouds hero-find__clouds--front"
            style={{
              // Bloom phase: clouds brighten + swell at exit so they become the transition
              opacity: 0.5 + cloudsRise * 0.4 + wordmarkIn * 0.15 + cloudBloom * 0.35,
              transform: `scale(${1 + cloudsRise * 0.25 + wordmarkIn * 0.12 + cloudBloom * 0.45})`,
            }}
            aria-hidden="true"
          >
            <div className="hero-find__cloud-drift hero-find__cloud-drift--a">
              <img
                src="/hero/cloud.png"
                alt=""
                width={1024}
                height={576}
                decoding="async"
                className="hero-find__clouds-img hero-find__clouds-img--front-left"
              />
            </div>
            <div className="hero-find__cloud-drift hero-find__cloud-drift--c">
              <img
                src="/hero/cloud.png"
                alt=""
                width={1024}
                height={576}
                decoding="async"
                className="hero-find__clouds-img hero-find__clouds-img--front-center"
              />
            </div>
            <div className="hero-find__cloud-drift hero-find__cloud-drift--b">
              <img
                src="/hero/cloud.png"
                alt=""
                width={1024}
                height={576}
                decoding="async"
                className="hero-find__clouds-img hero-find__clouds-img--front-right"
              />
            </div>
            {/* Top puffs - scroll-driven scale via inline style, ambient drift via wrapper.
             * Wrapper drift adds the alive feel; inline style still controls scroll reveal. */}
            <div className="hero-find__cloud-drift hero-find__cloud-drift--d">
              <img
                src="/hero/cloud.png"
                alt=""
                width={1024}
                height={576}
                decoding="async"
                className="hero-find__clouds-img hero-find__clouds-img--front-top-left"
                style={{
                  opacity: 0.4 + wordmarkIn * 0.55,
                  transform: `translate3d(${(1 - wordmarkIn) * -8}vw, 0, 0) scale(${0.9 + wordmarkIn * 0.25}) scaleX(-1)`,
                }}
              />
            </div>
            <div className="hero-find__cloud-drift hero-find__cloud-drift--e">
              <img
                src="/hero/cloud.png"
                alt=""
                width={1024}
                height={576}
                decoding="async"
                className="hero-find__clouds-img hero-find__clouds-img--front-top-right"
                style={{
                  opacity: 0.4 + wordmarkIn * 0.55,
                  transform: `translate3d(${(1 - wordmarkIn) * 8}vw, 0, 0) scale(${0.9 + wordmarkIn * 0.25})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Whiteout - cloud-into-white veil bridges hero to next section */}
        {!reducedMotion && whiteout > 0.01 && (
          <div
            className="hero-find__whiteout"
            style={{
              opacity: whiteout,
            }}
            aria-hidden="true"
          >
            <div className="hero-find__whiteout-veil" />
            <div className="hero-find__whiteout-fill" />
          </div>
        )}

        {/* "Why MATCH" reveal - emerges from the clouds during the dissolve
         * Sits in the same vertical zone as the wordmark so the eye stays anchored
         * Above the whiteout (z-index 9) so it's readable as the haze settles */}
        {!reducedMotion && whyIn > 0.01 && (
          <div
            className="hero-find__why-reveal"
            style={{
              opacity: whyIn,
              transform: "translate(0, -50%)",
            }}
            aria-hidden={whyIn < 0.5 ? "true" : undefined}
          >
            <p className="hero-find__why-eyebrow">Why MATCH</p>
            <h2 className="hero-find__why-headline">
              See the homes nobody else is showing you.
            </h2>
            <p className="hero-find__why-sub">
              Private listings across Victoria, before they hit the portals.
            </p>
          </div>
        )}

        <div
          className="hero-find__actions"
          style={
            reducedMotion
              ? undefined
              : {
                  opacity: textFade,
                  transform: `translate3d(0, ${(1 - textFade) * -32}px, 0)`,
                }
          }
        >
          <p className="hero-find__lede">
            <span className="hero-find__lede-strong">
              Off-market properties across Victoria.
            </span>{" "}
            <span className="hero-find__lede-soft">
              Buy homes before they hit the public market.
            </span>
          </p>
          <button
            type="button"
            onClick={() => setApplyOpen(true)}
            className="btn-pill btn-pill--hero"
          >
            <span className="btn-pill__label" aria-hidden="true">
              <span className="btn-pill__label-text">{ctaLabel}</span>
              <span className="btn-pill__label-text btn-pill__label-text--clone">
                {ctaLabel}
              </span>
            </span>
            <span className="sr-only">{ctaLabel}</span>
            <span className="btn-pill-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </section>
      {waitlist ? (
        <WaitlistModal
          open={applyOpen}
          onClose={() => setApplyOpen(false)}
          source="hero"
        />
      ) : (
        <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
      )}
    </div>
  );
}
