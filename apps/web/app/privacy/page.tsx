import Link from "next/link";

import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

export const metadata = {
  title: "Privacy — MATCH",
  description:
    "How Off the Market Match collects, uses and protects member data in Australia.",
};

const privacyTopics = [
  {
    title: "What we collect.",
    body:
      "Account identifiers (such as email and mobile), verification artefacts you supply, buyer brief inputs, listing content you contribute, enquiry and message routing metadata, and technical logs needed to operate the platform securely (IP, session, diagnostics). Sensitive information is collected only where you choose to provide it and where the law allows.",
  },
  {
    title: "Why we use it.",
    body:
      "To create and authenticate your membership, facilitate introductions between buyers and agents, deliver notifications you've opted into, troubleshoot abuse or outages, fulfil legal obligations (including AML/CTF where relevant), and improve product quality using aggregated analytics that don't identify individuals.",
  },
  {
    title: "Sharing & subcontractors.",
    body:
      "We use vetted subprocessors — for infrastructure, identity, email/SMS delivery and observability — under written terms that constrain use to our instructions. Agents see only what you've chosen to disclose to progress a legitimate enquiry. Beyond that, disclosures occur only where you consent or where compelled by lawful authority.",
  },
  {
    title: "Retention & deletion.",
    body:
      "We keep personal information only as long as your account stays active plus a reasonable archival window for lawful dispute resolution unless a longer statutory period applies. You may request deletion where not prohibited by retention duties; backups roll forward on a disciplined schedule.",
  },
  {
    title: "Security.",
    body:
      "We apply layered access controls, monitoring, patching and segmented environments consistent with SaaS norms. Absolute security online is impossible — if you're affected by any incident materially impacting you, we'll notify consistent with Australia's notifiable breach scheme where those laws apply.",
  },
  {
    title: "Your rights (Australia).",
    body:
      "Under the Privacy Act 1988 (Cth) APPs regime you may seek access or correction via our privacy contact channel and lodge enquiries with regulators such as OAIC where unsatisfied with our reply. Overseas transfers, if introduced, proceed only via adequate safeguards authorised by law.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-shell privacy-page">
          <header className="page-masthead">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Privacy &amp; data</span>
              </p>
              <h1>
                Respect for<br />
                your <em>information.</em>
              </h1>
              <p className="page-lede">
                MATCH is built on discretion in the marketplace — privacy is part
                of the product promise. Below is how we handle personal information
                in Australia when you browse the site, join as a member, or run
                off‑market campaigns with us.
              </p>
              <p className="legal-updated">
                Last updated{" "}
                <time dateTime="2026-05-19">19 May 2026</time>
              </p>
            </div>
          </header>

          <section className="about-narrative privacy-narrative-accent">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Without the lecture</span>
              </p>
              <h2>
                Good privacy policy<br />
                reads like calm<br />
                <em>custody notes.</em>
              </h2>
            </div>
            <div className="about-narrative-body">
              <p>
                Buyers don&apos;t want their briefs scraped for cold calls. Agents
                don&apos;t want off-market dossiers pasted into spreadsheets.
                Sellers don&apos;t want every inspection recorded as a billboard.
                MATCH&apos;s posture is containment: minimise collection, constrain
                access, log material changes and default to introductions instead
                of broadcast.
              </p>
              <p>
                Cookies and similar IDs on marketing pages are constrained to strictly
                necessary functions where possible; analytics prefers aggregated
                patterns. Embedded authentication providers may deposit their own
                session cookies solely to fulfil sign-in obligations you initiate.
              </p>
              <p>
                If jurisdictional overlays apply (employees, minors, strata
                trustees), tell us plainly when you enquire — specialised flows may
                need tailored schedules we&apos;ll document case by case alongside
                this master policy statement.
              </p>
            </div>
          </section>

          <section className="about-principles">
            {privacyTopics.map((topic) => (
              <article className="about-principle" key={topic.title}>
                <h3>{topic.title}</h3>
                <p>{topic.body}</p>
              </article>
            ))}
          </section>

          <section className="legal-closing" aria-label="Contact and related pages">
            <div className="legal-closing__inner">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Questions or requests?</span>
              </p>
              <p className="legal-closing__copy">
                For access, correction, export or objection requests, quote your
                member email where possible — we authenticate before releasing
                information. Spam and bulk discovery requests unrelated to legitimate
                rights may be redirected; corporate addresses on public record prevail
                for regulator correspondence referencing{" "}
                <strong>Off the Market Match Pty Ltd.</strong>
              </p>
              <nav className="legal-closing__links" aria-label="Related pages">
                <Link href="/legal">Legal</Link>
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
