import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../../../components/SiteFooter";
import { getDisputeById } from "../../../_data/fixtures";

type Params = { params: Promise<{ id: string }> };

export default async function DisputeDetailPage({ params }: Params) {
  const { id } = await params;
  const dispute = getDisputeById(id);
  if (!dispute) notFound();

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile/disputes">Disputes</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">{dispute.reference}</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>{dispute.reference}</span>
            </p>
            <h1 className="subpage-title">
              vs. <em>{dispute.counterparty}</em>
            </h1>
            <p className="page-lede">{dispute.summary}</p>
          </div>
          <span
            className={
              "dispute-row-status is-" +
              dispute.status.toLowerCase().replace(/\s+/g, "-")
            }
          >
            {dispute.status}
          </span>
        </header>

        <section className="dispute-meta-grid">
          <Meta label="Listing" value={dispute.listing ?? "—"} />
          <Meta label="Amount at stake" value={dispute.amountAtStake ?? "—"} />
          <Meta label="Opened" value={dispute.openedOn} />
          <Meta label="Mediator" value="OMM Trust & Safety" />
        </section>

        <section className="dispute-timeline">
          <header className="dispute-section-head">
            <h2 className="dispute-section-title">Timeline</h2>
            <p className="dispute-section-meta">
              {dispute.timeline.length} entries
            </p>
          </header>
          <ol className="dispute-stream" role="list">
            {dispute.timeline.map((m) => (
              <li
                key={m.id}
                className={
                  "dispute-entry is-" + m.author.toLowerCase()
                }
              >
                <header className="dispute-entry-head">
                  <span className="dispute-entry-name">{m.authorName}</span>
                  <span className="dispute-entry-rule" aria-hidden="true" />
                  <span className="dispute-entry-time">{m.posted}</span>
                </header>
                <p className="dispute-entry-body">{m.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {dispute.status !== "RESOLVED" ? (
          <section className="dispute-actions">
            <h2 className="dispute-section-title">Actions</h2>
            <ul className="dispute-action-grid" role="list">
              <li>
                <button type="button" className="dash-cta is-ghost">
                  Upload evidence
                </button>
              </li>
              <li>
                <button type="button" className="dash-cta is-ghost">
                  Message mediator
                </button>
              </li>
              <li>
                <button type="button" className="dash-cta is-ghost">
                  Withdraw dispute
                </button>
              </li>
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="dispute-meta">
      <p className="dispute-meta-label">{label}</p>
      <p className="dispute-meta-value">{value}</p>
    </div>
  );
}
