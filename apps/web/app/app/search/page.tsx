"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import SiteFooter from "../../components/SiteFooter";
import {
  activeListings,
  offMarketMatches,
  savedSearches,
} from "../_data/fixtures";

const PROPERTY_TYPES = ["House", "Townhouse", "Apartment", "Land", "Other"];
const SUBURBS = [
  "Brighton",
  "Hampton",
  "Hawthorn",
  "Kew",
  "Toorak",
  "South Yarra",
  "Camberwell",
  "Malvern",
];
const FEATURES = [
  "Period features",
  "Backyard",
  "Garage",
  "Pool",
  "Study",
  "City views",
  "Heritage",
];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [openFilters, setOpenFilters] = useState(true);
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>(["House"]);
  const [bedsMin, setBedsMin] = useState(0);
  const [bathsMin, setBathsMin] = useState(0);
  const [priceMax, setPriceMax] = useState(3_000_000);
  const [features, setFeatures] = useState<string[]>([]);
  const [showOff, setShowOff] = useState(true);

  const toggle = (
    arr: string[],
    set: (next: string[]) => void,
    v: string,
  ) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const results = useMemo(() => {
    const all = [
      ...activeListings.map((l) => ({
        kind: "live" as const,
        id: l.id,
        title: l.title,
        meta: l.address,
        priceRange: l.priceRange,
        beds: l.beds,
        baths: l.baths,
        landSqm: l.landSqm,
        match: 0,
      })),
      ...offMarketMatches.map((l) => ({
        kind: "off" as const,
        id: l.id,
        title: l.title,
        meta: l.status,
        priceRange: l.priceRange,
        beds: l.beds,
        baths: l.baths,
        landSqm: l.landSqm,
        match: l.matchPercent,
      })),
    ];

    return all.filter((r) => {
      if (!showOff && r.kind === "off") return false;
      if (q && !(r.title + r.meta).toLowerCase().includes(q.toLowerCase()))
        return false;
      if (bedsMin > 0 && r.beds < bedsMin) return false;
      if (bathsMin > 0 && r.baths < bathsMin) return false;
      if (suburbs.length > 0) {
        const matchSub = suburbs.some((s) =>
          (r.meta + r.title).toLowerCase().includes(s.toLowerCase()),
        );
        if (!matchSub) return false;
      }
      return true;
    });
  }, [q, showOff, bedsMin, bathsMin, suburbs]);

  const clearAll = () => {
    setQ("");
    setSuburbs([]);
    setTypes(["House"]);
    setBedsMin(0);
    setBathsMin(0);
    setPriceMax(3_000_000);
    setFeatures([]);
  };

  const fmtPrice = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
      : `$${(n / 1000).toFixed(0)}k`;

  const filterCount =
    suburbs.length +
    types.length +
    features.length +
    (bedsMin > 0 ? 1 : 0) +
    (bathsMin > 0 ? 1 : 0) +
    (priceMax < 3_000_000 ? 1 : 0);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Search</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · Discover</span>
            </p>
            <h1 className="subpage-title">
              Find your <em>next home</em>.
            </h1>
            <p className="page-lede">
              Browse the live market and uncover off-market matches a quiet
              algorithm has noted on your behalf.
            </p>
          </div>
        </header>

        <section className="search-bar">
          <input
            type="search"
            className="search-input"
            placeholder="Search by suburb, address or keyword…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className="dash-cta is-ghost"
            onClick={() => setOpenFilters((v) => !v)}
          >
            {openFilters ? "Hide filters" : "Filters"}
            {filterCount > 0 ? ` · ${filterCount}` : ""}
          </button>
        </section>

        <div className={"search-shell" + (openFilters ? " has-filters" : "")}>
          {openFilters ? (
            <aside className="search-filters" aria-label="Filters">
              <header className="search-filters-head">
                <h2 className="search-filters-title">Filters</h2>
                <button
                  type="button"
                  className="danger-link"
                  onClick={clearAll}
                >
                  Reset all
                </button>
              </header>

              <fieldset className="search-filter-group">
                <legend>Suburbs</legend>
                <ul className="topic-list" role="list">
                  {SUBURBS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        className={
                          "topic-chip" +
                          (suburbs.includes(s) ? " is-active" : "")
                        }
                        onClick={() => toggle(suburbs, setSuburbs, s)}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <fieldset className="search-filter-group">
                <legend>Property type</legend>
                <ul className="topic-list" role="list">
                  {PROPERTY_TYPES.map((t) => (
                    <li key={t}>
                      <button
                        type="button"
                        className={
                          "topic-chip" + (types.includes(t) ? " is-active" : "")
                        }
                        onClick={() => toggle(types, setTypes, t)}
                      >
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <fieldset className="search-filter-group">
                <legend>Beds &amp; baths</legend>
                <div className="search-stepper-row">
                  <div className="search-stepper">
                    <span className="search-stepper-label">Beds</span>
                    <div className="search-stepper-controls">
                      <button
                        type="button"
                        onClick={() => setBedsMin(Math.max(0, bedsMin - 1))}
                      >
                        −
                      </button>
                      <span>{bedsMin === 0 ? "Any" : `${bedsMin}+`}</span>
                      <button
                        type="button"
                        onClick={() => setBedsMin(Math.min(6, bedsMin + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="search-stepper">
                    <span className="search-stepper-label">Baths</span>
                    <div className="search-stepper-controls">
                      <button
                        type="button"
                        onClick={() => setBathsMin(Math.max(0, bathsMin - 1))}
                      >
                        −
                      </button>
                      <span>{bathsMin === 0 ? "Any" : `${bathsMin}+`}</span>
                      <button
                        type="button"
                        onClick={() => setBathsMin(Math.min(5, bathsMin + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset className="search-filter-group">
                <legend>Price ceiling</legend>
                <input
                  type="range"
                  min={500_000}
                  max={5_000_000}
                  step={50_000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(parseInt(e.target.value))}
                  className="search-range"
                />
                <p className="search-range-meta">
                  Up to <em>{fmtPrice(priceMax)}</em>
                </p>
              </fieldset>

              <fieldset className="search-filter-group">
                <legend>Features</legend>
                <ul className="topic-list" role="list">
                  {FEATURES.map((f) => (
                    <li key={f}>
                      <button
                        type="button"
                        className={
                          "topic-chip" +
                          (features.includes(f) ? " is-active" : "")
                        }
                        onClick={() => toggle(features, setFeatures, f)}
                      >
                        {f}
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <fieldset className="search-filter-group">
                <legend>Off-market</legend>
                <label className="subpage-toggle">
                  <span className="subpage-toggle-text">
                    <span className="subpage-toggle-label">
                      Include off-market matches
                    </span>
                    <span className="subpage-toggle-hint">
                      Properties not yet listed publicly.
                    </span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showOff}
                    className={"subpage-switch" + (showOff ? " is-on" : "")}
                    onClick={() => setShowOff((v) => !v)}
                  >
                    <span
                      className="subpage-switch-thumb"
                      aria-hidden="true"
                    />
                  </button>
                </label>
              </fieldset>
            </aside>
          ) : null}

          <section className="search-results" aria-label="Results">
            <header className="search-results-head">
              <p className="search-results-count">
                <em>{results.length}</em>{" "}
                {results.length === 1 ? "property" : "properties"} matching
              </p>
              <SaveSearchButton
                disabled={filterCount === 0 && !q}
                summary={
                  [
                    suburbs.join(", "),
                    bedsMin ? `${bedsMin}+ beds` : null,
                    `up to ${fmtPrice(priceMax)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "All filters"
                }
              />
            </header>

            {results.length === 0 ? (
              <p className="reviews-empty">
                <em>Nothing matches</em>, try widening your filters.
              </p>
            ) : (
              <ul className="search-grid" role="list">
                {results.map((r) => (
                  <li key={r.id}>
                    <article className="search-card">
                      {r.kind === "off" ? (
                        <p className="search-card-pill">
                          OFF-MARKET · {r.match}% match
                        </p>
                      ) : (
                        <p className="search-card-pill is-ghost">LIVE</p>
                      )}
                      <h3 className="search-card-title">{r.title}</h3>
                      <p className="search-card-meta">{r.meta}</p>
                      <p className="search-card-price">{r.priceRange}</p>
                      <dl className="search-card-stats">
                        <div>
                          <dt>Beds</dt>
                          <dd>{r.beds}</dd>
                        </div>
                        <div>
                          <dt>Baths</dt>
                          <dd>{r.baths}</dd>
                        </div>
                        <div>
                          <dt>Land</dt>
                          <dd>{r.landSqm}m²</dd>
                        </div>
                      </dl>
                      <footer className="search-card-foot">
                        <Link
                          href={`/app/listings/${r.id}`}
                          className="search-card-link"
                        >
                          View →
                        </Link>
                        <button
                          type="button"
                          className="search-card-save"
                          aria-label="Save"
                        >
                          ♡
                        </button>
                      </footer>
                    </article>
                  </li>
                ))}
              </ul>
            )}

            <aside className="search-cta-rail">
              <p className="search-cta-rail-kicker">
                <em>or</em> &middot; let buyers come to you
              </p>
              <p className="search-cta-rail-line">
                Post a buyer brief and have agents bring matching properties to
                your inbox.
              </p>
              <Link href="/app/briefs/new" className="dash-cta">
                Post a brief
              </Link>
            </aside>

            {savedSearches.length > 0 ? (
              <section className="search-recent">
                <h2 className="dispute-section-title">Your saved searches</h2>
                <ul className="search-recent-list" role="list">
                  {savedSearches.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/app/saved/searches/${s.id}`}
                        className="search-recent-row"
                      >
                        <span className="search-recent-row-name">
                          {s.title}
                        </span>
                        <span className="search-recent-row-meta">
                          {s.criteria}
                        </span>
                        {s.newCount > 0 ? (
                          <span className="search-recent-row-count">
                            {s.newCount} new
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function SaveSearchButton({
  disabled,
  summary,
}: {
  disabled: boolean;
  summary: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  if (saved) {
    return <p className="search-saved">Saved · we&rsquo;ll alert you</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        className="dash-cta"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Save this search
      </button>
    );
  }

  return (
    <form
      className="search-save-pop"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
        setOpen(false);
      }}
    >
      <label className="subpage-field">
        <span className="subpage-field-label">Name this search</span>
        <input
          type="text"
          className="subpage-field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={summary || "My search"}
          autoFocus
        />
      </label>
      <div className="subpage-form-actions">
        <button
          type="button"
          className="dash-cta is-ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button type="submit" className="dash-cta">
          Save
        </button>
      </div>
    </form>
  );
}
