import Image from "next/image";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import AboutIntroHero from "../components/AboutIntroHero";
import ApplyJoinCta from "../components/ApplyJoinCta";

export const metadata = {
  title: "About - MATCH",
  description:
    "MATCH is a members' network for off-market Australian property - private campaigns, buyer briefs, and introductions before the portals.",
};

const principles = [
  {
    title: "Quiet first.",
    body: "Private campaigns. No portal sign, no open-home queue.",
  },
  {
    title: "Buyers write briefs.",
    body: "Plain-English brief. Agents search before they shortlist.",
  },
  {
    title: "Agents keep the relationship.",
    body: "MATCH introduces. You keep the agent.",
  },
  {
    title: "Built for the long hold.",
    body: "Match quality over speed. Built for how often people move.",
  },
  {
    title: "Australian, private, permanent.",
    body: "Melbourne-founded. No ad revenue. No data sales.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="find-page find-page--about">
        <section
          className="about-panel about-panel--intro"
          aria-labelledby="about-intro-title"
        >
          <AboutIntroHero />
        </section>

        <section
          className="about-panel about-panel--thesis"
          aria-labelledby="about-thesis-heading"
        >
          <div className="about-panel__inner about-detail">
            <div className="find-product__inner">
              <div className="find-product__intro">
                <p className="find-page__kicker">Our thesis</p>
                <h2 className="find-product__title" id="about-thesis-heading">
                  <span className="find-product__title-strong">
                    The real estate market
                  </span>
                  <span className="find-product__title-soft">
                    was never meant to be loud.
                  </span>
                </h2>
              </div>
              <div className="find-product__steps-wrap">
                <h3 className="find-steps__heading">Context:</h3>
                <ol className="find-steps">
                  <li className="find-step">
                    <span className="find-step__num" aria-hidden="true">
                      01
                    </span>
                    <p className="find-step__copy">
                      <span className="find-step__title">
                        Premium became performance.
                      </span>
                      <span className="find-step__text">
                        {" "}
                        Drones, signboards, strangers at the door. Most good
                        sales still start quietly: a vendor mentions a move, an
                        agent recalls a buyer, a meeting before a photo is
                        taken.
                      </span>
                    </p>
                  </li>
                  <li className="find-step">
                    <span className="find-step__num" aria-hidden="true">
                      02
                    </span>
                    <p className="find-step__copy">
                      <span className="find-step__title">
                        MATCH runs that path.
                      </span>
                      <span className="find-step__text">
                        {" "}
                        Private listings, verified buyer briefs, introductions
                        before the campaign goes public. Melbourne-founded,
                        member-funded, no portal revenue.
                      </span>
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section
          className="about-panel about-panel--founder about-panel--tall"
          aria-labelledby="about-founder-heading"
        >
          <div className="about-panel__inner find-page__about-founder">
            <figure className="find-page__about-founder-media">
              <Image
                src="/about/anton-zhouk-founder.png"
                alt="Anton Zhouk, founder of MATCH"
                width={682}
                height={1024}
                className="find-page__about-founder-photo"
                sizes="(max-width: 900px) 100vw, 42vw"
                priority
              />
            </figure>
            <div className="find-page__about-founder-copy">
              <p className="find-page__kicker">Founder</p>
              <h2 className="find-product__title" id="about-founder-heading">
                <span className="find-product__title-strong">Anton Zhouk</span>
                <span className="find-product__title-soft">Founder, MATCH</span>
              </h2>
              <p className="find-page__about-founder-role">
                Founding Director, A&mdash;Z Real Estate
              </p>
              <div className="find-page__about-founder-steps">
                <h3 className="find-steps__heading">Background:</h3>
                <ol className="find-steps">
                  <li className="find-step">
                    <span className="find-step__num" aria-hidden="true">
                      01
                    </span>
                    <p className="find-step__copy">
                      <span className="find-step__title">
                        Licensed agent and auctioneer.
                      </span>
                      <span className="find-step__text">
                        {" "}
                        Former Marshall White and hockingstuart. Runs
                        A&mdash;Z from Hawthorn, focused on off-market
                        campaigns in Boroondara.
                      </span>
                    </p>
                  </li>
                  <li className="find-step">
                    <span className="find-step__num" aria-hidden="true">
                      02
                    </span>
                    <p className="find-step__copy">
                      <span className="find-step__title">
                        $500M+ transacted.
                      </span>
                      <span className="find-step__text">
                        {" "}
                        MATCH is the same model at network scale: private
                        listings, verified buyer briefs, and introductions
                        before a property reaches the portals.
                      </span>
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section
          className="about-panel about-panel--principles about-panel--tall"
          aria-labelledby="about-principles-heading"
        >
          <div className="about-panel__inner about-detail">
            <div className="find-product__inner">
              <div className="find-product__intro">
                <p className="find-page__kicker">Principles</p>
                <h2 className="find-product__title" id="about-principles-heading">
                  <span className="find-product__title-strong">
                    What we will not
                  </span>
                  <span className="find-product__title-soft">
                    trade away.
                  </span>
                </h2>
              </div>
              <div className="find-product__steps-wrap">
                <h3 className="find-steps__heading">Includes:</h3>
                <ol className="find-steps">
                  {principles.map((p, i) => (
                    <li className="find-step" key={p.title}>
                      <span className="find-step__num" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="find-step__copy">
                        <span className="find-step__title">{p.title}</span>
                        <span className="find-step__text"> {p.body}</span>
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="find-cta" aria-labelledby="about-cta-title">
          <div className="find-cta__inner">
            <h2 id="about-cta-title" className="find-cta__title">
              Ready to search off-market?
            </h2>
            <p className="find-cta__text">
              Apply for membership. Browse private listings across Victoria.
            </p>
            <ApplyJoinCta className="btn-pill btn-pill--hero find-cta__cta" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
