import Link from "next/link";
import { notFound } from "next/navigation";

import SiteFooter from "../../../../components/SiteFooter";
import { offMarketMatches, savedSearches } from "../../../_data/fixtures";

type Params = { params: Promise<{ id: string }> };

export default async function SavedSearchDetailPage({ params }: Params) {
  const { id } = await params;
  const search = savedSearches.find((s) => s.id === id);
  if (!search) notFound();

  const matches = offMarketMatches;

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/saved/searches">Saved searches</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">{search.title}</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · Saved search</span>
            </p>
            <h1 className="subpage-title">
              <em>{search.title}</em>.
            </h1>
            <p className="page-lede">{search.criteria}</p>
          </div>
          <div className="search-detail-actions">
            <button type="button" className="dash-cta is-ghost">
              Edit filters
            </button>
            <button type="button" className="dash-cta is-ghost">
              {search.alertsOn ? "Pause alerts" : "Enable alerts"}
            </button>
            <button type="button" className="dash-cta is-ghost">
              Delete
            </button>
          </div>
        </header>

        <section className="billing-strip">
          <div className="billing-strip-tile">
            <p className="kpi-label">New matches</p>
            <p className="kpi-value">{search.newCount}</p>
            <p className="kpi-meta">since you last visited</p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">All matches</p>
            <p className="kpi-value">{matches.length}</p>
            <p className="kpi-meta">in scope</p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">Alerts</p>
            <p className="kpi-value">
              <em>{search.alertsOn ? "On" : "Off"}</em>
            </p>
            <p className="kpi-meta">instant</p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">Last run</p>
            <p className="kpi-value">
              <em>2h ago</em>
            </p>
            <p className="kpi-meta">automatic</p>
          </div>
        </section>

        <section className="dispute-section">
          <header className="dispute-section-head">
            <h2 className="dispute-section-title">Matches</h2>
            <p className="dispute-section-meta">{matches.length} on record</p>
          </header>
          <ul className="search-grid" role="list">
            {matches.map((m) => (
              <li key={m.id}>
                <article className="search-card">
                  <p className="search-card-pill">
                    {m.status} · {m.matchPercent}%
                  </p>
                  <h3 className="search-card-title">{m.title}</h3>
                  <p className="search-card-price">{m.priceRange}</p>
                  <dl className="search-card-stats">
                    <div>
                      <dt>Beds</dt>
                      <dd>{m.beds}</dd>
                    </div>
                    <div>
                      <dt>Baths</dt>
                      <dd>{m.baths}</dd>
                    </div>
                    <div>
                      <dt>Land</dt>
                      <dd>{m.landSqm}m²</dd>
                    </div>
                  </dl>
                  <footer className="search-card-foot">
                    <Link
                      href={`/app/listings/${m.id}`}
                      className="search-card-link"
                    >
                      View →
                    </Link>
                    <button type="button" className="search-card-save">
                      ♡
                    </button>
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
