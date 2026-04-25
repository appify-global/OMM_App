"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../components/SiteFooter";
import ModeToggle, { useMode } from "../_components/ModeToggle";
import {
  incomingBriefs,
  myPostedBriefs,
} from "../_data/fixtures";

type Tab = "active" | "drafts" | "archived";

export default function AppBriefsPage() {
  const [mode, setMode] = useMode();
  const [tab, setTab] = useState<Tab>("active");

  const isBuying = mode === "buying";
  const briefs = isBuying ? myPostedBriefs : incomingBriefs;

  const totalMatches = briefs.reduce((s, b) => s + b.matchCount, 0);
  const totalUnread = briefs.reduce((s, b) => s + b.unreadReplies, 0);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Briefs</span>
        </nav>

        <header className="dash-masthead">
          <div className="dash-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Switchboard</span>
            </p>
            <h1>
              {isBuying ? (
                <>
                  Your <em>briefs</em>, in private.
                </>
              ) : (
                <>
                  Briefs <em>seeking</em> stock.
                </>
              )}
            </h1>
            <p className="page-lede">
              {isBuying
                ? "Suburbs, budget, timing. Broadcast in private to listing agents — matches return within twenty-four hours."
                : "Buyers' briefs that match your active or off-market stock. Reply privately with a listing or an off-market suggestion."}
            </p>
          </div>
          <div className="listing-actions">
            <ModeToggle mode={mode} onChange={setMode} />
            {isBuying ? (
              <Link href="/app/briefs/new" className="dash-cta">
                <span className="dash-cta-mark" aria-hidden="true">＋</span>
                <span>Post a brief</span>
              </Link>
            ) : null}
          </div>
        </header>

        <section className="dash-kpis" aria-label="Brief metrics">
          <KpiTile
            kicker="i"
            label={isBuying ? "Active briefs" : "Incoming briefs"}
            value={briefs.length}
            delta={{
              tone: "up",
              text: isBuying ? "+1 this week" : "+2 this week",
            }}
          />
          <KpiTile
            kicker="ii"
            label="Total matches"
            value={totalMatches}
            delta={{ tone: "up", text: "+5 wk/wk" }}
          />
          <KpiTile
            kicker="iii"
            label={isBuying ? "Unread replies" : "Replies sent"}
            value={isBuying ? totalUnread : 8}
            delta={
              isBuying
                ? { tone: "warn", text: "Awaiting your call" }
                : { tone: "up", text: "+3 today" }
            }
          />
          <KpiTile
            kicker="iv"
            label="Avg. match score"
            value="89%"
            delta={{ tone: "muted", text: "Curated overnight" }}
          />
          <KpiTile
            kicker="v"
            label={isBuying ? "Days searching" : "Reply rate"}
            value={isBuying ? "11" : "62%"}
            delta={
              isBuying
                ? { tone: "muted", text: "Median 14d" }
                : { tone: "up", text: "vs. 41% mkt" }
            }
          />
        </section>

        <nav className="ledger-tabs" aria-label="Brief scope">
          <button
            type="button"
            className={"ledger-tab" + (tab === "active" ? " is-active" : "")}
            onClick={() => setTab("active")}
            aria-pressed={tab === "active"}
          >
            <span className="ledger-tab-section">i</span>
            <span className="ledger-tab-label">Active</span>
            <span className="ledger-tab-count">{briefs.length}</span>
          </button>
          <button
            type="button"
            className={"ledger-tab" + (tab === "drafts" ? " is-active" : "")}
            onClick={() => setTab("drafts")}
            aria-pressed={tab === "drafts"}
          >
            <span className="ledger-tab-section">ii</span>
            <span className="ledger-tab-label">Drafts</span>
            <span className="ledger-tab-count">0</span>
          </button>
          <button
            type="button"
            className={"ledger-tab" + (tab === "archived" ? " is-active" : "")}
            onClick={() => setTab("archived")}
            aria-pressed={tab === "archived"}
          >
            <span className="ledger-tab-section">iii</span>
            <span className="ledger-tab-label">Archived</span>
            <span className="ledger-tab-count">0</span>
          </button>
        </nav>

        {tab === "active" ? (
          <section className="dash-row">
            <article className="dash-panel">
              <header className="dash-panel-head">
                <p className="section-kicker">
                  <span className="sq sq--filled sq--sm" aria-hidden="true" />
                  <span>{isBuying ? "Yours" : "Inbound"}</span>
                </p>
                <h2>
                  {isBuying ? (
                    <>
                      Briefs in <em>circulation</em>
                    </>
                  ) : (
                    <>
                      Buyers seeking <em>your stock</em>
                    </>
                  )}
                </h2>
              </header>

              <ul className="brief-list">
                {briefs.map((b, i) => (
                  <li key={b.id}>
                    <Link
                      href={"/app/briefs/" + b.id}
                      className="brief-row"
                    >
                      <span className="brief-folio">
                        No. {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="brief-row-body">
                        <div className="brief-row-head">
                          <h3 className="brief-row-title">
                            {b.title.split(" ").slice(0, -1).join(" ")}{" "}
                            <em>{b.title.split(" ").slice(-1)[0]}</em>
                          </h3>
                          <span
                            className={
                              "status-pill is-" +
                              (b.status === "ACTIVE"
                                ? "ok"
                                : b.status === "DRAFT"
                                ? "muted"
                                : b.status === "PAUSED"
                                ? "warn"
                                : "ink")
                            }
                          >
                            {b.status}
                          </span>
                        </div>
                        <dl className="brief-row-meta">
                          <div>
                            <dt>Suburbs</dt>
                            <dd>{b.suburbs}</dd>
                          </div>
                          <div>
                            <dt>Budget</dt>
                            <dd>{b.budget}</dd>
                          </div>
                          <div>
                            <dt>Type</dt>
                            <dd>{b.propertyType}</dd>
                          </div>
                        </dl>
                      </div>
                      <div className="brief-row-stats">
                        <span className="brief-stat">
                          <span className="brief-stat-value">
                            <em>{b.matchCount}</em>
                          </span>
                          <span className="brief-stat-label">Matches</span>
                        </span>
                        {isBuying ? (
                          <span
                            className={
                              "brief-stat" +
                              (b.unreadReplies > 0 ? " is-warn" : "")
                            }
                          >
                            <span className="brief-stat-value">
                              <em>{b.unreadReplies}</em>
                            </span>
                            <span className="brief-stat-label">
                              Unread
                            </span>
                          </span>
                        ) : (
                          <span className="brief-stat">
                            <span className="brief-stat-value">
                              <em>{b.postedDays}</em>d
                            </span>
                            <span className="brief-stat-label">Posted</span>
                          </span>
                        )}
                        <span className="dispatch-arrow" aria-hidden="true">
                          →
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        ) : null}

        {tab === "drafts" ? (
          <section className="dash-row">
            <article className="dash-panel">
              <p className="dash-empty">
                No drafts. {isBuying ? "Compose a brief and save it for later." : "Drafts you save will appear here."}
              </p>
            </article>
          </section>
        ) : null}

        {tab === "archived" ? (
          <section className="dash-row">
            <article className="dash-panel">
              <p className="dash-empty">
                Nothing archived. Closed briefs and successful matches will be
                filed here.
              </p>
            </article>
          </section>
        ) : null}

        {isBuying ? null : (
          <section className="dash-row dash-row--split">
            <article className="studio-card studio-card--compact">
              <div className="studio-card-text">
                <p className="section-kicker section-kicker--inverse">
                  <span className="sq sq--outline sq--sm" aria-hidden="true" />
                  <span>The Atelier</span>
                </p>
                <h2>
                  Reply with <em>off-market</em>.
                </h2>
                <p>
                  See a brief that matches your stock? Reply privately with the
                  listing — only the buyer sees it.
                </p>
              </div>
              <Link href="/app/listings" className="studio-card-cta">
                Open portfolio <span aria-hidden="true">→</span>
              </Link>
            </article>

            <article className="dash-panel">
              <header className="dash-panel-head">
                <p className="section-kicker">
                  <span className="sq sq--filled sq--sm" aria-hidden="true" />
                  <span>The Reflex</span>
                </p>
                <h2>
                  Auto-match <em>your stock</em>
                </h2>
              </header>
              <ul className="dispatch-list dispatch-list--tight">
                <li>
                  <div className="dispatch-row dispatch-row--static">
                    <span className="dispatch-folio">No. 01</span>
                    <span className="dispatch-body">
                      <strong>Hawthorn City Center</strong>
                      <span className="dispatch-sub">
                        Matches 4 active briefs · highest 92%
                      </span>
                    </span>
                    <span className="dispatch-num">
                      <em>4</em>
                    </span>
                  </div>
                </li>
                <li>
                  <div className="dispatch-row dispatch-row--static">
                    <span className="dispatch-folio">No. 02</span>
                    <span className="dispatch-body">
                      <strong>Brighton Terrace</strong>
                      <span className="dispatch-sub">
                        Matches 1 active brief · 86%
                      </span>
                    </span>
                    <span className="dispatch-num">
                      <em>1</em>
                    </span>
                  </div>
                </li>
              </ul>
            </article>
          </section>
        )}
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
