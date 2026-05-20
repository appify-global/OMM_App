import ApplyJoinCta from "./ApplyJoinCta";
import HeroFind from "./HeroFind";
import FindNearbyListings from "./FindNearbyListings";
import { fetchFeaturedListingsForSuburb } from "../lib/api";
import { getVisitorGeo } from "../lib/geo";

export default async function HomePageContent() {
  const geo = await getVisitorGeo();
  const nearbyListings = await fetchFeaturedListingsForSuburb(
    geo.suburbFilter,
    3,
  );

  return (
    <main className="home-find">
      <HeroFind />

      <section className="find-product" aria-labelledby="how-match">
        <div className="find-product__inner">
          <div className="find-product__intro">
            <h2 className="find-product__title" id="how-match">
              <span className="find-product__title-strong">
                Off-market property,
              </span>
              <span className="find-product__title-soft">built for buyers.</span>
            </h2>
            <ApplyJoinCta className="btn-pill btn-pill--hero find-product__cta" />
          </div>

          <div className="find-product__steps-wrap">
            <h3 className="find-steps__heading">Steps:</h3>
            <ol className="find-steps">
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  01
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">Apply to join.</span>
                  <span className="find-step__text">
                    {" "}
                    Verified members get access to private campaigns across
                    Victoria. No portal noise, no seller spam.
                  </span>
                </p>
              </li>
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  02
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">Set your buyer brief.</span>
                  <span className="find-step__text">
                    {" "}
                    Tell us suburbs, budget and what matters. Agents search
                    briefs before they build shortlists.
                  </span>
                </p>
              </li>
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  03
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">See homes early.</span>
                  <span className="find-step__text">
                    {" "}
                    Browse private listings, save searches and message agents
                    when something fits. Before it hits Domain or REA.
                  </span>
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section
        className="find-product find-product--platform"
        aria-labelledby="product-features"
      >
        <div className="find-product__inner">
          <div className="find-product__intro">
            <h2 className="find-product__title" id="product-features">
              <span className="find-product__title-strong">
                Private campaigns,
              </span>
              <span className="find-product__title-soft">built for members.</span>
            </h2>
            <ApplyJoinCta className="btn-pill btn-pill--hero find-product__cta" />
          </div>

          <div className="find-product__steps-wrap">
            <h3 className="find-steps__heading">Includes:</h3>
            <ol className="find-steps">
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  01
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">Private listings.</span>
                  <span className="find-step__text">
                    {" "}
                    Campaigns you will not find on the portals. Off-market and
                    quiet stock, curated for members - search by suburb, price
                    and property type.
                  </span>
                </p>
              </li>
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  02
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">Buyer briefs.</span>
                  <span className="find-step__text">
                    {" "}
                    Your intent, in front of the right agents. One brief. Agents
                    with matching stock reply privately with listings and
                    off-market suggestions.
                  </span>
                </p>
              </li>
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  03
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">Direct access.</span>
                  <span className="find-step__text">
                    {" "}
                    Message agents when a property fits. Private conversations
                    with listing agents - no public enquiry forms, no shared
                    buyer leads.
                  </span>
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <FindNearbyListings
        suburbLabel={geo.suburbLabel}
        listings={nearbyListings}
      />

      <section className="find-cta" aria-labelledby="find-cta-title">
        <div className="find-cta__inner">
          <h2 id="find-cta-title" className="find-cta__title">
            Ready to search off-market?
          </h2>
          <p className="find-cta__text">
            Apply for membership. Browse private listings across Victoria.
          </p>
          <ApplyJoinCta className="btn-pill btn-pill--hero find-cta__cta" />
        </div>
      </section>
    </main>
  );
}
