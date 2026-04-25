import Link from "next/link";

import SiteFooter from "../../../components/SiteFooter";
import { activeListings, savedSearches } from "../../_data/fixtures";

const SAVED_LISTINGS = activeListings.slice(0, 3);

export default function SavedListingsPage() {
  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Saved</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · Discover</span>
            </p>
            <h1 className="subpage-title">
              Your <em>saved</em> listings.
            </h1>
            <p className="page-lede">
              Properties you&rsquo;ve favoured for a closer look. Add a private
              note to remember why.
            </p>
          </div>
        </header>

        <section className="saved-tabs">
          <Link href="/app/saved/searches" className="saved-tab">
            Searches · {savedSearches.length}
          </Link>
          <Link href="/app/saved/listings" className="saved-tab is-active">
            Listings · {SAVED_LISTINGS.length}
          </Link>
        </section>

        {SAVED_LISTINGS.length === 0 ? (
          <section className="saved-empty">
            <p className="reviews-empty">
              <em>You haven&rsquo;t saved any listings yet.</em>
            </p>
            <Link href="/app/search" className="dash-cta">
              Browse listings
            </Link>
          </section>
        ) : (
          <ul className="search-grid" role="list">
            {SAVED_LISTINGS.map((l) => (
              <li key={l.id}>
                <article className="search-card">
                  <p className="search-card-pill is-ghost">{l.status}</p>
                  <h3 className="search-card-title">{l.title}</h3>
                  <p className="search-card-meta">{l.address}</p>
                  <p className="search-card-price">{l.priceRange}</p>
                  <dl className="search-card-stats">
                    <div>
                      <dt>Beds</dt>
                      <dd>{l.beds}</dd>
                    </div>
                    <div>
                      <dt>Baths</dt>
                      <dd>{l.baths}</dd>
                    </div>
                    <div>
                      <dt>Land</dt>
                      <dd>{l.landSqm}m²</dd>
                    </div>
                  </dl>
                  <footer className="search-card-foot">
                    <Link
                      href={`/app/listings/${l.id}`}
                      className="search-card-link"
                    >
                      View →
                    </Link>
                    <button
                      type="button"
                      className="search-card-save is-on"
                      aria-label="Saved"
                    >
                      ♥
                    </button>
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
