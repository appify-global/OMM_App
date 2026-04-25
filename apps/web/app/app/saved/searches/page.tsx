import Link from "next/link";

import SiteFooter from "../../../components/SiteFooter";
import { savedSearches } from "../../_data/fixtures";

export default function SavedSearchesPage() {
  const totalNew = savedSearches.reduce((s, x) => s + x.newCount, 0);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/saved/listings">Saved</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Searches</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · Discover</span>
            </p>
            <h1 className="subpage-title">
              Saved <em>searches</em>.
            </h1>
            <p className="page-lede">
              Quiet, persistent enquiries. We&rsquo;ll alert you when something
              new fits your criteria.
            </p>
          </div>
          <Link href="/app/search" className="dash-cta">
            New search
          </Link>
        </header>

        <section className="saved-tabs">
          <Link href="/app/saved/searches" className="saved-tab is-active">
            Searches · {savedSearches.length}
          </Link>
          <Link href="/app/saved/listings" className="saved-tab">
            Listings
          </Link>
          {totalNew > 0 ? (
            <span className="saved-tab-meta">
              <em>{totalNew}</em> new matches across all
            </span>
          ) : null}
        </section>

        {savedSearches.length === 0 ? (
          <section className="saved-empty">
            <p className="reviews-empty">
              <em>No saved searches.</em>
            </p>
            <Link href="/app/search" className="dash-cta">
              Start a search
            </Link>
          </section>
        ) : (
          <ul className="saved-search-list" role="list">
            {savedSearches.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/app/saved/searches/${s.id}`}
                  className="saved-search-row"
                >
                  <div>
                    <p className="saved-search-name">{s.title}</p>
                    <p className="saved-search-criteria">{s.criteria}</p>
                    <p className="saved-search-foot">
                      Alerts {s.alertsOn ? "on" : "off"} ·{" "}
                      {s.newCount > 0
                        ? `${s.newCount} new`
                        : "no new matches"}
                    </p>
                  </div>
                  {s.newCount > 0 ? (
                    <span className="saved-search-badge">
                      <em>{s.newCount}</em>
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
