import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import FindPageMasthead from "../components/FindPageMasthead";
import { fetchListings } from "../lib/api";

export const metadata = {
  title: "Listings - MATCH",
  description:
    "Private campaigns, quiet listings and off-market property for MATCH members.",
};

type ListingsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function matchesQuery(
  listing: Awaited<ReturnType<typeof fetchListings>>[number],
  q: string,
) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    listing.address,
    listing.suburb,
    listing.state,
    listing.postcode,
    listing.agent,
    listing.agency,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

const filters = [
  "All",
  "Private campaign",
  "Quiet listing",
  "Matched buyers",
  "Coming soon",
  "Open for inspection",
] as const;

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const { q } = await searchParams;
  const allListings = await fetchListings();
  const listings = q ? allListings.filter((l) => matchesQuery(l, q)) : allListings;

  return (
    <>
      <SiteHeader />
      <main className="home-find find-page">
        <div className="find-page__inner">
          <FindPageMasthead
            kicker="Private listings"
            title={
              <>
                <span className="find-page__title-strong">Listings</span>
                <span className="find-page__title-soft">
                  {" "}
                  before they reach the market.
                </span>
              </>
            }
            lede={
              <>
                Every property below is off-market or in quiet campaign. As a
                member you can request an introduction and we&rsquo;ll connect
                you with the listing agent.
                {q ? (
                  <>
                    {" "}
                    Showing results for{" "}
                    <span className="find-page__title-strong">{q}</span>.
                  </>
                ) : null}
              </>
            }
            stats={[
              { label: "Live campaigns", value: listings.length },
              { label: "New this week", value: 4 },
              { label: "Matched buyers", value: "4.8k" },
            ]}
          />

          <div className="find-page__filters" role="group" aria-label="Filter listings">
            {filters.map((f, i) => (
              <button
                type="button"
                key={f}
                className={`find-page__filter${i === 0 ? " is-active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="find-page__grid">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/app/listings/${l.id}`}
                className="find-portfolio-card"
              >
                <div
                  className="find-portfolio-card__media"
                  style={{ backgroundImage: `url(${l.image})` }}
                  aria-hidden="true"
                />
                <div className="find-portfolio-card__body">
                  <p className="find-portfolio-card__tag">
                    No. {l.folio} · {l.tag}
                  </p>
                  <h2>{l.address}</h2>
                  <p className="find-portfolio-card__meta">
                    {l.suburb}, {l.state} {l.postcode}
                  </p>
                  <dl className="find-portfolio-card__details">
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
                  <span className="find-portfolio-card__cta">
                    View listing <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
