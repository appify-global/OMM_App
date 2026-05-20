import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../../components/SiteFooter";
import { getBriefById } from "../../_data/fixtures";

type Params = Promise<{ id: string }>;

export default async function BriefDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const brief = getBriefById(id);
  if (!brief) notFound();

  const avgMatch =
    brief.matches.length > 0
      ? Math.round(
          brief.matches.reduce((s, m) => s + m.matchPercent, 0) /
            brief.matches.length,
        )
      : 0;

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/briefs">Briefs</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">{brief.title}</span>
        </nav>

        <header className="dash-masthead listing-masthead">
          <div className="dash-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Brief</span>
              <span className="kicker-sep" aria-hidden="true">·</span>
              <span
                className={
                  "status-pill is-" +
                  (brief.status === "ACTIVE"
                    ? "ok"
                    : brief.status === "DRAFT"
                    ? "muted"
                    : brief.status === "PAUSED"
                    ? "warn"
                    : "ink")
                }
              >
                {brief.status}
              </span>
            </p>
            <h1>
              {brief.title.split(" ").slice(0, -1).join(" ")}{" "}
              <em>{brief.title.split(" ").slice(-1)[0]}</em>
            </h1>
            <p className="listing-address">
              Posted <em>{brief.postedDays}</em> days ago ·{" "}
              <span className="listing-guide">{brief.budget}</span>
            </p>
          </div>
          <div className="listing-actions">
            <Link
              href={"/app/briefs/" + brief.id + "/edit"}
              className="dash-cta dash-cta--ghost"
            >
              Edit brief
            </Link>
            <Link
              href={"/app/briefs/" + brief.id + "/pause"}
              className="dash-cta"
            >
              Pause brief
            </Link>
          </div>
        </header>

        <section className="dash-kpis" aria-label="Brief metrics">
          <KpiTile
            kicker="i"
            label="Matches"
            value={brief.matchCount}
            delta={{ tone: "up", text: "+5 wk/wk" }}
          />
          <KpiTile
            kicker="ii"
            label="Avg. score"
            value={avgMatch + "%"}
            delta={{ tone: "muted", text: "Curated overnight" }}
          />
          <KpiTile
            kicker="iii"
            label="Agent replies"
            value={brief.replies.length}
            delta={{ tone: "up", text: "+1 today" }}
          />
          <KpiTile
            kicker="iv"
            label="Unread"
            value={brief.unreadReplies}
            delta={
              brief.unreadReplies > 0
                ? { tone: "warn", text: "Awaiting your call" }
                : { tone: "muted", text: "All caught up" }
            }
          />
          <KpiTile
            kicker="v"
            label="Days posted"
            value={brief.postedDays}
            delta={{ tone: "muted", text: "Median 14d" }}
          />
        </section>

        <section className="dash-row dash-row--split">
          <article className="dash-panel">
            <header className="dash-panel-head">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Particulars</span>
              </p>
              <h2>
                Brief <em>summary</em>
              </h2>
              <Link
                href={"/app/briefs/" + brief.id + "/edit"}
                className="section-see-all"
              >
                Edit <span aria-hidden="true">→</span>
              </Link>
            </header>
            <div className="listing-summary">
              <dl className="brief-particulars">
                <div>
                  <dt>Suburbs</dt>
                  <dd>{brief.suburbs}</dd>
                </div>
                <div>
                  <dt>Budget</dt>
                  <dd>{brief.budget}</dd>
                </div>
                <div>
                  <dt>Property type</dt>
                  <dd>{brief.propertyType}</dd>
                </div>
                <div>
                  <dt>Min. beds</dt>
                  <dd>{brief.minBeds || "-"}</dd>
                </div>
              </dl>
              <div className="listing-features">
                <p className="features-kicker">The why</p>
                <p className="brief-body">{brief.briefBody}</p>
              </div>
            </div>
          </article>

          <article className="studio-card studio-card--compact">
            <div className="studio-card-text">
              <p className="section-kicker section-kicker--inverse">
                <span className="sq sq--outline sq--sm" aria-hidden="true" />
                <span>Privacy</span>
              </p>
              <h2>
                Visible only to <em>matched agents</em>.
              </h2>
              <p>
                Your name and contact details remain anonymous until you reply.
                Agents see the brief and a private channel - nothing more.
              </p>
            </div>
            <Link
              href="/app/profile/privacy"
              className="studio-card-cta"
            >
              Privacy settings <span aria-hidden="true">→</span>
            </Link>
          </article>
        </section>

        {brief.matches.length > 0 ? (
          <section className="dash-row">
            <article className="dash-panel">
              <header className="dash-panel-head">
                <p className="section-kicker">
                  <span className="sq sq--filled sq--sm" aria-hidden="true" />
                  <span>The Matches</span>
                </p>
                <h2>
                  Curated <em>overnight</em>
                </h2>
                <Link
                  href={"/app/briefs/" + brief.id + "/matches"}
                  className="section-see-all"
                >
                  See all <span aria-hidden="true">→</span>
                </Link>
              </header>
              <div className="ledger-scroll">
                <table className="ledger-table ledger-table--wide">
                  <thead>
                    <tr>
                      <th scope="col">Folio</th>
                      <th scope="col">Listing</th>
                      <th scope="col">Source</th>
                      <th scope="col">Agent</th>
                      <th scope="col" className="ledger-num">Guide</th>
                      <th scope="col" className="ledger-num">Match</th>
                      <th scope="col" />
                    </tr>
                  </thead>
                  <tbody>
                    {brief.matches.map((m, i) => (
                      <tr key={m.id}>
                        <td className="ledger-folio">
                          No. {String(i + 1).padStart(2, "0")}
                        </td>
                        <td>
                          <Link
                            href={"/app/listings/" + m.id}
                            className="ledger-link"
                          >
                            <span className="ledger-title">
                              {m.listingTitle}
                            </span>
                            <span className="ledger-sub-inline">
                              {m.address}
                            </span>
                          </Link>
                        </td>
                        <td>
                          <span
                            className={
                              "status-pill is-" +
                              (m.source === "OFF-MARKET"
                                ? "ink"
                                : m.source === "PRE-MARKET"
                                ? "ok"
                                : "forest")
                            }
                          >
                            {m.source}
                          </span>
                        </td>
                        <td>
                          <span className="ledger-title">{m.agentName}</span>
                          <span className="ledger-sub-inline">
                            {m.agentFirm}
                          </span>
                        </td>
                        <td className="ledger-num">{m.priceRange}</td>
                        <td className="ledger-num">
                          <em>{m.matchPercent}%</em>
                        </td>
                        <td className="ledger-num">
                          <Link
                            href={"/app/messages/" + m.id}
                            className="ledger-action"
                          >
                            Open →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {brief.replies.length > 0 ? (
          <section className="dash-row">
            <article className="dash-panel">
              <header className="dash-panel-head">
                <p className="section-kicker">
                  <span className="sq sq--filled sq--sm" aria-hidden="true" />
                  <span>The Switchboard</span>
                </p>
                <h2>
                  Agent <em>replies</em>
                </h2>
                <Link href="/app/messages" className="section-see-all">
                  Open inbox <span aria-hidden="true">→</span>
                </Link>
              </header>
              <ul className="reply-thread">
                {brief.replies.map((r, i) => (
                  <li key={r.id} className="reply-item">
                    <div className="reply-head">
                      <span className="dispatch-folio">
                        No. {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="reply-agent">
                        <span className="reply-agent-name">{r.agentName}</span>
                        <span className="reply-agent-firm">{r.agentFirm}</span>
                      </div>
                      <span className="reply-time">{r.hoursAgo}H AGO</span>
                    </div>
                    <p className="reply-body">{r.snippet}</p>
                    <div className="reply-actions">
                      <Link
                        href={"/app/messages/" + r.id}
                        className="reply-action"
                      >
                        Open thread <span aria-hidden="true">→</span>
                      </Link>
                      {r.matchId ? (
                        <Link
                          href={"/app/listings/" + r.matchId}
                          className="reply-action reply-action--muted"
                        >
                          View listing <span aria-hidden="true">→</span>
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function KpiTile({
  kicker,
  label,
  value,
  delta,
}: {
  kicker: string;
  label: string;
  value: string | number;
  delta?: { tone: "up" | "down" | "warn" | "muted"; text: string };
}) {
  return (
    <div className="kpi-tile">
      <span className="kpi-kicker">{kicker}</span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
      {delta ? (
        <span className={"kpi-delta is-" + delta.tone}>{delta.text}</span>
      ) : null}
    </div>
  );
}
