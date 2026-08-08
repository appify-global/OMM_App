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
              <span className="find-product__title-soft">agent to agent.</span>
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
                  <span className="find-step__title">List it quietly.</span>
                  <span className="find-step__text">
                    {" "}
                    Load the stock your vendor isn&rsquo;t ready to advertise.
                    No signboard, no portal spend, no open-home queue.
                  </span>
                </p>
              </li>
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  02
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">Match on the brief.</span>
                  <span className="find-step__text">
                    {" "}
                    Buyers agents post what their client is genuinely chasing.
                    MATCH puts your property in front of the ones who fit.
                  </span>
                </p>
              </li>
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  03
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">Deal direct.</span>
                  <span className="find-step__text">
                    {" "}
                    Agent to agent, privately. You keep your vendor, they keep
                    their buyer, and the sale never goes public.
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
              <span className="find-product__title-strong">One network,</span>
              <span className="find-product__title-soft">
                both sides of the deal.
              </span>
            </h2>
            <ApplyJoinCta className="btn-pill btn-pill--hero find-product__cta" />
          </div>

          <div className="find-product__steps-wrap">
            <h3 className="find-steps__heading">Both sides:</h3>
            <ol className="find-steps">
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  01
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">If you list.</span>
                  <span className="find-step__text">
                    {" "}
                    Read real demand before you commit a vendor to a campaign.
                    Live interest, honest price feedback, and a sale that can
                    happen without ever going to market.
                  </span>
                </p>
              </li>
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  02
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">If you buy.</span>
                  <span className="find-step__text">
                    {" "}
                    One brief for your client, matched against off-market stock
                    across Victoria. Stop ringing around agencies for property
                    that was never advertised.
                  </span>
                </p>
              </li>
              <li className="find-step">
                <span className="find-step__num" aria-hidden="true">
                  03
                </span>
                <p className="find-step__copy">
                  <span className="find-step__title">
                    Your client stays yours.
                  </span>
                  <span className="find-step__text">
                    {" "}
                    Every member verified against the state register. MATCH
                    introduces and then gets out of the way - no shared leads,
                    no resold enquiries, no portal in the middle.
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
            Ready to work off-market?
          </h2>
          <p className="find-cta__text">
            Join the network behind Victoria&rsquo;s quiet sales. Licensed
            agents only.
          </p>
          <ApplyJoinCta className="btn-pill btn-pill--hero find-cta__cta" />
        </div>
      </section>
    </main>
  );
}
