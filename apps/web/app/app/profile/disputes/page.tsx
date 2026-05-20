import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import { disputes } from "../../_data/fixtures";

export default function DisputesListPage() {
  const open = disputes.filter((d) =>
    ["OPEN", "UNDER REVIEW", "ESCALATED"].includes(d.status),
  );
  const closed = disputes.filter((d) => d.status === "RESOLVED");

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Disputes</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>II · Dealings</span>
            </p>
            <h1 className="subpage-title">
              <em>Disputes</em>.
            </h1>
            <p className="page-lede">
              Where introductions clash, fees overlap or contracts go sideways.
              Trust &amp; Safety mediate, the record decides.
            </p>
          </div>
          <Link href="/app/profile/disputes/new" className="dash-cta">
            Raise a dispute
          </Link>
        </header>

        <section className="dispute-section">
          <header className="dispute-section-head">
            <h2 className="dispute-section-title">Open</h2>
            <p className="dispute-section-meta">{open.length} active</p>
          </header>
          {open.length === 0 ? (
            <p className="reviews-empty">
              <em>No open disputes.</em> Long may that hold.
            </p>
          ) : (
            <ul className="dispute-list" role="list">
              {open.map((d) => (
                <DisputeRow key={d.id} {...d} />
              ))}
            </ul>
          )}
        </section>

        <section className="dispute-section">
          <header className="dispute-section-head">
            <h2 className="dispute-section-title">Closed</h2>
            <p className="dispute-section-meta">{closed.length} on record</p>
          </header>
          {closed.length === 0 ? (
            <p className="reviews-empty">
              <em>Nothing yet.</em>
            </p>
          ) : (
            <ul className="dispute-list" role="list">
              {closed.map((d) => (
                <DisputeRow key={d.id} {...d} />
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function DisputeRow({
  id,
  reference,
  counterparty,
  status,
  raised,
  summary,
}: {
  id: string;
  reference: string;
  counterparty: string;
  status: string;
  raised: string;
  summary: string;
}) {
  return (
    <li>
      <Link href={`/app/profile/disputes/${id}`} className="dispute-row">
        <div className="dispute-row-head">
          <span className="dispute-row-ref">{reference}</span>
          <span className={"dispute-row-status is-" + status.toLowerCase().replace(/\s+/g, "-")}>
            {status}
          </span>
        </div>
        <p className="dispute-row-counterparty">
          vs. <em>{counterparty}</em>
        </p>
        <p className="dispute-row-summary">{summary}</p>
        <p className="dispute-row-meta">{raised}</p>
      </Link>
    </li>
  );
}
