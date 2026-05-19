import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata = {
  title: "About — OMM",
  description: "OMM is a members' network for off-market Australian property.",
};

const principles = [
  {
    title: "Quiet first.",
    body:
      "Not every home wants a portal, a sign and a queue. We run campaigns privately, so vendors control the story and buyers meet the home, not the marketing.",
  },
  {
    title: "Buyers write briefs.",
    body:
      "A buyer brief is a plain-English record of what you actually want. Agents search briefs before they build shortlists, so intent travels before listings do.",
  },
  {
    title: "Agents keep the relationship.",
    body:
      "OMM introduces; we don&rsquo;t replace. Every conversation you have is with a vetted agent, not with us, and the relationship is yours to keep.",
  },
  {
    title: "Data stays private.",
    body:
      "Your brief is visible only to verified agents. Your name, email and phone are never exposed without you choosing to.",
  },
  {
    title: "Built for the long hold.",
    body:
      "We optimise for the right match over time, not the fastest match this week. A home is bought, on average, once every thirteen years — we build for that cadence.",
  },
  {
    title: "Australian, private, permanent.",
    body:
      "Independently owned, Melbourne-founded, and funded to outlast a market cycle. No ad revenue, no data sales, no portal games.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-shell">
          <header className="page-masthead">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Colophon</span>
              </p>
              <h1>
                A members&rsquo; network<br />
                for the <em>private market</em>.
              </h1>
              <p className="page-lede">
                OMM exists for the slice of the property market that
                doesn&rsquo;t want to be a property listing. Vendors who prefer
                discretion, buyers who&rsquo;d rather have an introduction than
                an inspection queue, and agents who&rsquo;d rather run a
                relationship than an auction.
              </p>
            </div>
          </header>

          <section className="about-narrative">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Our thesis</span>
              </p>
              <h2>
                The premium end of<br />
                the market was never<br />
                meant to be <em>loud</em>.
              </h2>
            </div>
            <div className="about-narrative-body">
              <p>
                Somewhere between the first property portal and the last bidding
                war, Australian real estate became a performance. Premium homes
                are photographed, drone-flown and broadcast to strangers in
                search of a faster auction. But the best sales, the ones
                everyone points to years later, almost never happen that way.
                They happen quietly &mdash; a vendor mentions a move, an agent
                remembers a buyer, and two people meet over coffee before a
                single photograph is taken.
              </p>
              <p>
                OMM rebuilds that quiet path as a product. Vendors list
                privately; agents search verified buyer briefs; introductions
                happen before the campaign ever goes public. The homes that
                want to be shouted about still get shouted about, elsewhere.
                We&rsquo;re interested in the ones that don&rsquo;t.
              </p>
              <p>
                We are Australian-owned, Melbourne-founded and funded to
                operate for the long hold. We take no portal fees, sell no
                buyer data, and carry no ads. The business is simple: members
                pay a subscription, agents pay a small referral, and the
                network keeps improving as it grows.
              </p>
            </div>
          </section>

          <section className="about-principles">
            {principles.map((p) => (
              <article className="about-principle" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
