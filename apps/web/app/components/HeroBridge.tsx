"use client";

/**
 * Bridge section between the hero and "Why MATCH" -
 * giant MATCH wordmark reveals as it scrolls into view (FIND-style).
 * Uses CSS `animation-timeline: view()` so there's no JS on this section.
 */
export default function HeroBridge() {
  return (
    <section className="hero-bridge" aria-hidden="true">
      <div className="hero-bridge__clouds-top" />
      <div className="hero-bridge__inner">
        <p className="hero-bridge__eyebrow">Private property · Victoria</p>
        <h2 className="hero-bridge__wordmark">MATCH</h2>
        <p className="hero-bridge__tag">Off-market, before the portals.</p>
      </div>
      <div className="hero-bridge__clouds-bottom" />
    </section>
  );
}
