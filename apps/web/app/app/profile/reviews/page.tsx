"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteFooter from "../../../components/SiteFooter";
import { agentProfile, agentReviews } from "../../_data/fixtures";

type Filter = "ALL" | "5" | "4" | "3" | "BUYERS" | "AGENTS";

export default function ReviewsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return agentReviews.filter((r) => {
      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "5"
            ? r.rating === 5
            : filter === "4"
              ? r.rating === 4
              : filter === "3"
                ? r.rating === 3
                : filter === "BUYERS"
                  ? r.reviewerRole.toLowerCase().startsWith("buyer")
                  : r.reviewerRole.toLowerCase().startsWith("agent");
      const matchesQuery =
        query.length === 0
          ? true
          : (r.body + r.reviewer + r.reviewerRole)
              .toLowerCase()
              .includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const avg =
    agentReviews.reduce((s, r) => s + r.rating, 0) / agentReviews.length;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: agentReviews.filter((r) => r.rating === n).length,
  }));

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Reviews</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>II · Dealings</span>
            </p>
            <h1 className="subpage-title">
              Your <em>reviews</em>.
            </h1>
            <p className="page-lede">
              The record of how buyers and other agents have found working
              alongside <strong>{agentProfile.name}</strong>.
            </p>
          </div>
          <Link href="/app/profile/reviews/new" className="dash-cta">
            Request a review
          </Link>
        </header>

        <section className="reviews-summary">
          <div className="reviews-score">
            <p className="reviews-score-num">{avg.toFixed(1)}</p>
            <p className="reviews-score-stars" aria-label={`${avg} of 5`}>
              {"★★★★★".slice(0, Math.round(avg))}
              <span aria-hidden="true">{"★★★★★".slice(Math.round(avg))}</span>
            </p>
            <p className="reviews-score-meta">
              from {agentReviews.length} reviews
            </p>
          </div>
          <ul className="reviews-bars" role="list">
            {counts.map(({ n, c }) => {
              const pct = (c / agentReviews.length) * 100;
              return (
                <li key={n} className="reviews-bar">
                  <span className="reviews-bar-label">{n} ★</span>
                  <span className="reviews-bar-track">
                    <span
                      className="reviews-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="reviews-bar-count">{c}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="reviews-controls">
          <div className="messages-search">
            <input
              type="search"
              className="messages-search-input"
              placeholder="Search reviews..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="messages-filters" role="list">
            {(
              [
                ["ALL", "All"],
                ["5", "5 stars"],
                ["4", "4 stars"],
                ["3", "3 stars"],
                ["BUYERS", "Buyers"],
                ["AGENTS", "Agents"],
              ] as const
            ).map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  className={
                    "messages-chip" + (filter === id ? " is-active" : "")
                  }
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="reviews-list">
          {filtered.length === 0 ? (
            <p className="reviews-empty">
              <em>No reviews</em> match that filter.
            </p>
          ) : (
            <ul className="reply-thread" role="list">
              {filtered.map((r) => (
                <li key={r.id} className="reply-row">
                  <header className="reply-row-head">
                    <span className="reply-row-author">{r.reviewer}</span>
                    <span className="reply-row-time">{r.posted}</span>
                  </header>
                  <p className="reply-row-meta">
                    {r.reviewerRole}
                    {r.listing ? ` · ${r.listing}` : ""}
                  </p>
                  <p
                    className="reply-row-stars"
                    aria-label={`${r.rating} of 5`}
                  >
                    {"★★★★★".slice(0, r.rating)}
                    <span aria-hidden="true">
                      {"★★★★★".slice(r.rating)}
                    </span>
                  </p>
                  <p className="reply-row-body">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
