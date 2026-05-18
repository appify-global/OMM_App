import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { fetchListings } from "../lib/api";

export const metadata = {
  title: "Listings — PreMarket",
  description: "Private campaigns, quiet listings and off-market property, curated for PreMarket members.",
};

export default async function ListingsPage() {
  const listings = await fetchListings();
  const filters = ["All", "Private campaign", "Quiet listing", "Matched buyers", "Coming soon", "Open for inspection"];

  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-shell">
          <header className="page-masthead">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Portfolio</span>
              </p>
              <h1>
                <em>Listings</em>, before<br />they reach the market.
              </h1>
              <p className="page-lede">
                Every property below is being offered off-market or in quiet
                campaign. Access is member-gated: request an introduction and
                we&rsquo;ll bridge you to the agent or vendor directly.
              </p>
            </div>
            <dl className="page-stats">
              <div>
                <dt>Live campaigns</dt>
                <dd>{listings.length}</dd>
              </div>
              <div>
                <dt>New this week</dt>
                <dd>4</dd>
              </div>
              <div>
                <dt>Matched buyers</dt>
                <dd>4.8k</dd>
              </div>
            </dl>
          </header>

          <div className="listings-filters" role="group" aria-label="Filter listings">
            {filters.map((f, i) => (
              <button
                type="button"
                key={f}
                className={`listings-filter${i === 0 ? " is-active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="listings-grid-full">
            {listings.map((l) => (
              <article className="listing-card" key={l.id}>
                <div
                  className="listing-image"
                  style={{ backgroundImage: `url(${l.image})` }}
                  aria-hidden="true"
                />
                <div className="listing-body">
                  <p className="listing-folio">
                    <span className="sq sq--filled sq--sm" aria-hidden="true" />
                    <span>No. {l.folio}</span>
                    <span aria-hidden="true">·</span>
                    <span>{l.tag}</span>
                  </p>
                  <h3>{l.address}</h3>
                  <p className="listing-suburb">{l.suburb}, {l.state} {l.postcode}</p>
                  <dl className="listing-meta">
                    <div>
                      <dt>Guide</dt>
                      <dd>{l.priceGuide}</dd>
                    </div>
                    <div>
                      <dt>Plan</dt>
                      <dd>{l.plan}</dd>
                    </div>
                    <div>
                      <dt>Land</dt>
                      <dd>{l.land}</dd>
                    </div>
                    <div>
                      <dt>Agent</dt>
                      <dd>{l.agent}</dd>
                    </div>
                  </dl>
                  <a className="listing-cta" href="#">
                    Request access <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
