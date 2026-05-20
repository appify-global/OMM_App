import Link from "next/link";

import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

export const metadata = {
  title: "Legal — MATCH",
  description:
    "Legal information for Off the Market Match: platform scope, disclaimers, and Victorian law.",
};

const legalTopics = [
  {
    title: "What we do (and don't).",
    body:
      "MATCH is an introduction platform for verified members, buyers and agents. We do not provide legal, financial or investment advice and we don't transact on your behalf — negotiations, contracts and settlement stay between you and your professional advisers.",
  },
  {
    title: "Listings & privacy.",
    body:
      "Off-market listings, briefs and messages shared on MATCH are furnished by members under their own responsibility. We use reasonable safeguards and access controls described in our documentation; misuse or unauthorised sharing remains a breach of membership rules.",
  },
  {
    title: "Accurate representations.",
    body:
      "Property details, estimates and timelines are indicative unless confirmed in writing between parties. Agents and vendors are responsible for the accuracy of what they publish; buyers should satisfy themselves via inspection, strata searches and valuation.",
  },
  {
    title: "Australian Consumer Law.",
    body:
      "Nothing here limits rights you cannot contract out of — including statutory guarantees where they apply to services we supply in Australia.",
  },
  {
    title: "Liability caps.",
    body:
      "To the maximum extent permitted by law, MATCH's aggregate liability arising from platform use is limited to re-supply of the affected service or the fees paid to us for that service in the prior twelve months, except where statute says otherwise.",
  },
  {
    title: "Governing law.",
    body:
      "These notices are governed by the laws of Victoria, Australia. Parties submit to the courts of Victoria unless a mandatory jurisdiction applies elsewhere.",
  },
];

export default function LegalPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-shell legal-page">
          <header className="page-masthead">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Terms &amp; transparency</span>
              </p>
              <h1>
                Straight answers on<br />
                how we <em>operate.</em>
              </h1>
              <p className="page-lede">
                MATCH connects people seriously interested in Australian
                property — without turning every conversation into a
                billboard. Below is where we outline platform boundaries,
                responsibility and jurisdiction. Nothing here replaces tailored
                legal advice when you&apos;re underwriting a decision.
              </p>
              <p className="legal-updated">
                Last updated{" "}
                <time dateTime="2026-05-19">19 May 2026</time>
              </p>
            </div>
          </header>

          <section className="about-narrative legal-narrative-accent">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Plain language first</span>
              </p>
              <h2>
                Contracts don&apos;t have to<br />
                sound cruel to be<br />
                <em>enforceable.</em>
              </h2>
            </div>
            <div className="about-narrative-body">
              <p>
                The property market thrives on goodwill and precision.
                Litigation is expensive; misunderstandings earlier in the funnel
                are cheaper to prevent. MATCH documents are drafted to be human
                in tone but serious in substance: who holds data, where risk sits,
                what happens when a campaign ends, and how we cooperate with law
                enforcement when required — while protecting member
                privacy where the law permits.
              </p>
              <p>
                If you need a solicitor, conveyancer or accountant, we urge you to
                appoint one familiar with Victorian real estate workflows. MATCH
                can recommend categories of advisers but cannot choose one on your
                behalf.
              </p>
              <p>
                For privacy-specific rights (access, correction, deletion requests),
                we maintain a parallel policy pathway. Regulatory notices or
                statutory requests should be routed through our designated
                contact channel so responses can be logged and audited.
              </p>
            </div>
          </section>

          <section className="about-principles">
            {legalTopics.map((topic) => (
              <article className="about-principle" key={topic.title}>
                <h3>{topic.title}</h3>
                <p>{topic.body}</p>
              </article>
            ))}
          </section>

          <section className="legal-closing" aria-label="Further information">
            <div className="legal-closing__inner">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Still need certainty?</span>
              </p>
              <p className="legal-closing__copy">
                For membership terms you accept inside the signed-in product, see
                the latest version surfaced at account creation or renewal.
                Regulatory correspondence for{" "}
                <strong>Off the Market Match Pty Ltd</strong> should be mailed to
                the registered office on public record — or use the envelope on
                your subscription invoice until a public contact desk is linked
                here.
              </p>
              <nav className="legal-closing__links" aria-label="Related pages">
                <Link href="/privacy">Privacy</Link>
                <Link href="/about">About MATCH</Link>
                <Link href="/">Home</Link>
              </nav>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
