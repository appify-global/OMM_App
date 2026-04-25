"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "../../components/SiteFooter";
import {
  activeListings,
  archivedListings,
  authorityExpiringSoon,
  draftListings,
  listingPerformance,
  offMarketMatches,
} from "../_data/fixtures";

type Tab = "active" | "drafts" | "off-market" | "archive";

const TAB_LABELS: { id: Tab; label: string; section: string; count: number }[] = [
  { id: "active", label: "Active", section: "i", count: activeListings.length },
  { id: "drafts", label: "Drafts", section: "ii", count: draftListings.length },
  {
    id: "off-market",
    label: "Off-market",
    section: "iii",
    count: offMarketMatches.length,
  },
  {
    id: "archive",
    label: "Archive",
    section: "iv",
    count: archivedListings.length,
  },
];

export default function AppListingsPage() {
  const [tab, setTab] = useState<Tab>("active");

  const totalViews = listingPerformance.reduce((s, r) => s + r.views7d, 0);
  const totalLeads = listingPerformance.reduce((s, r) => s + r.enquiries7d, 0);

  return (
    <>
      <main className="dash">
        <header className="dash-masthead">
          <div className="dash-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Portfolio</span>
            </p>
            <h1>
              Your <em>listings</em>, in <span className="dash-name">private</span>.
            </h1>
          </div>
          <Link href="/app/listings/new" className="dash-cta">
            <span className="dash-cta-mark" aria-hidden="true">＋</span>
            <span>New listing</span>
          </Link>
        </header>

        <section className="dash-kpis" aria-label="Portfolio metrics">
          <KpiTile
            kicker="i"
            label="Active listings"
            value={activeListings.length}
            delta={{ tone: "up", text: "+1 this week" }}
          />
          <KpiTile
            kicker="ii"
            label="Net views (7d)"
            value={totalViews}
            delta={{ tone: "up", text: "+12% wk/wk" }}
          />
          <KpiTile
            kicker="iii"
            label="Leads (7d)"
            value={totalLeads}
            delta={{ tone: "up", text: "+3 this week" }}
          />
          <KpiTile
            kicker="iv"
            label="Avg. days listed"
            value="14"
            delta={{ tone: "muted", text: "Median 12d" }}
          />
          <KpiTile
            kicker="v"
            label="Authorities expiring"
            value={authorityExpiringSoon.length}
            delta={{ tone: "warn", text: "Soonest 6d" }}
          />
        </section>

        <nav className="ledger-tabs" aria-label="Listing scope">
          {TAB_LABELS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={"ledger-tab" + (tab === t.id ? " is-active" : "")}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
            >
              <span className="ledger-tab-section">{t.section}</span>
              <span className="ledger-tab-label">{t.label}</span>
              <span className="ledger-tab-count">{t.count}</span>
            </button>
          ))}
        </nav>

        {tab === "active" ? <ActivePanel /> : null}
        {tab === "drafts" ? <DraftsPanel /> : null}
        {tab === "off-market" ? <OffMarketPanel /> : null}
        {tab === "archive" ? <ArchivePanel /> : null}

        <section className="dash-row dash-row--split">
          <article className="studio-card studio-card--compact">
            <div className="studio-card-text">
              <p className="section-kicker section-kicker--inverse">
                <span className="sq sq--outline sq--sm" aria-hidden="true" />
                <span>The Atelier</span>
              </p>
              <h2>
                Publish a <em>property</em>.
              </h2>
              <p>
                Auto-fill from PriceFinder. SOI in five steps. Authority
                captured, witnessed, archived.
              </p>
            </div>
            <Link href="/app/listings/new" className="studio-card-cta">
              Begin a campaign <span aria-hidden="true">→</span>
            </Link>
          </article>

          <article className="dash-panel">
            <header className="dash-panel-head">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Barometer</span>
              </p>
              <h2>
                Performance <em>this week</em>
              </h2>
              <Link href="/app/listings/performance" className="section-see-all">
                Full report <span aria-hidden="true">→</span>
              </Link>
            </header>
            <ul className="barometer-list">
              {listingPerformance.map((row, i) => {
                const pct = Math.min(100, Math.round((row.views7d / 350) * 100));
                return (
                  <li key={row.id} className="barometer-row">
                    <div className="barometer-head">
                      <span className="dispatch-folio">
                        No. {String(i + 1).padStart(2, "0")}
                      </span>
                      <Link
                        href={"/app/listings/" + row.listingId}
                        className="barometer-title"
                      >
                        {row.listingTitle}
                      </Link>
                      <span className="barometer-stats">
                        <em>{row.views7d}</em> views · <em>{row.enquiries7d}</em> leads
                      </span>
                    </div>
                    <div
                      className="barometer-bar"
                      role="progressbar"
                      aria-valuenow={row.views7d}
                      aria-valuemin={0}
                      aria-valuemax={350}
                    >
                      <span style={{ width: pct + "%" }} />
                    </div>
                    <div className="barometer-foot">
                      <span>Conversion <em>{row.conversionPct}%</em></span>
                      <span>vs. category avg 1.4%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        </section>
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

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "ACTIVE"
      ? "ok"
      : status === "SOI PENDING"
      ? "warn"
      : status === "OFF-MARKET" || status === "PRIVATE" || status === "EXCLUSIVE"
      ? "ink"
      : status === "SOLD"
      ? "forest"
      : status === "WITHDRAWN" || status === "EXPIRED"
      ? "muted"
      : "muted";
  return <span className={"status-pill is-" + tone}>{status}</span>;
}

function ActivePanel() {
  return (
    <section className="dash-row">
      <article className="dash-panel">
        <header className="dash-panel-head">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>Active</span>
          </p>
          <h2>
            Currently <em>on market</em>
          </h2>
          <Link href="/app/listings/export" className="section-see-all">
            Export <span aria-hidden="true">→</span>
          </Link>
        </header>
        <div className="ledger-scroll">
          <table className="ledger-table ledger-table--wide">
            <thead>
              <tr>
                <th scope="col">Folio</th>
                <th scope="col">Listing</th>
                <th scope="col">Status</th>
                <th scope="col" className="ledger-num">Guide</th>
                <th scope="col" className="ledger-num">Beds</th>
                <th scope="col" className="ledger-num">Bath</th>
                <th scope="col" className="ledger-num">Land</th>
                <th scope="col" className="ledger-num">Views</th>
                <th scope="col" className="ledger-num">Leads</th>
                <th scope="col" className="ledger-num">Auth</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {activeListings.map((l, i) => (
                <tr key={l.id}>
                  <td className="ledger-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <Link href={"/app/listings/" + l.id} className="ledger-link">
                      <span className="ledger-title">{l.title}</span>
                      <span className="ledger-sub-inline">{l.address}</span>
                    </Link>
                  </td>
                  <td>
                    <StatusPill status={l.status} />
                  </td>
                  <td className="ledger-num">{l.priceRange}</td>
                  <td className="ledger-num">{l.beds}</td>
                  <td className="ledger-num">{l.baths}</td>
                  <td className="ledger-num">{l.landSqm}m²</td>
                  <td className="ledger-num">{l.views7d}</td>
                  <td className="ledger-num">{l.leads}</td>
                  <td className="ledger-num">
                    {l.authorityDaysLeft !== null ? (
                      l.authorityDaysLeft <= 7 ? (
                        <span className="ledger-warn">
                          <em>{l.authorityDaysLeft}</em>d
                        </span>
                      ) : (
                        <span>
                          <em>{l.authorityDaysLeft}</em>d
                        </span>
                      )
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="ledger-num">
                    <Link
                      href={"/app/listings/" + l.id}
                      className="ledger-action"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function DraftsPanel() {
  return (
    <section className="dash-row">
      <article className="dash-panel">
        <header className="dash-panel-head">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>Drafts</span>
          </p>
          <h2>
            Awaiting <em>publication</em>
          </h2>
        </header>
        <ul className="dispatch-list dispatch-list--tight">
          {draftListings.map((d, i) => {
            const pct = Math.round((d.step / d.totalSteps) * 100);
            return (
              <li key={d.id}>
                <Link
                  href={"/app/listings/" + d.id + "/edit"}
                  className="dispatch-row dispatch-row--draft"
                >
                  <span className="dispatch-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="dispatch-body">
                    <strong>{d.title}</strong>
                    <span className="dispatch-sub">
                      {d.address} · last edited {d.lastEditedDays}d ago
                    </span>
                  </span>
                  <span className="draft-progress">
                    <span className="draft-progress-track">
                      <span
                        className="draft-progress-bar"
                        style={{ width: pct + "%" }}
                      />
                    </span>
                    <span className="draft-progress-label">
                      Step <em>{d.step}</em> / {d.totalSteps}
                    </span>
                  </span>
                  <span className="dispatch-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}

function OffMarketPanel() {
  return (
    <section className="dash-row">
      <article className="dash-panel">
        <header className="dash-panel-head">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>Off-market</span>
          </p>
          <h2>
            Discreet <em>matches</em>
          </h2>
          <Link href="/app/briefs" className="section-see-all">
            Linked briefs <span aria-hidden="true">→</span>
          </Link>
        </header>
        <div className="ledger-scroll">
          <table className="ledger-table ledger-table--wide">
            <thead>
              <tr>
                <th scope="col">Folio</th>
                <th scope="col">Listing</th>
                <th scope="col">Status</th>
                <th scope="col" className="ledger-num">Guide</th>
                <th scope="col" className="ledger-num">Beds</th>
                <th scope="col" className="ledger-num">Bath</th>
                <th scope="col" className="ledger-num">Land</th>
                <th scope="col" className="ledger-num">Match</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {offMarketMatches.map((m, i) => (
                <tr key={m.id}>
                  <td className="ledger-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <Link href={"/app/listings/" + m.id} className="ledger-link">
                      <span className="ledger-title">{m.title}</span>
                    </Link>
                  </td>
                  <td>
                    <StatusPill status={m.status} />
                  </td>
                  <td className="ledger-num">{m.priceRange}</td>
                  <td className="ledger-num">{m.beds}</td>
                  <td className="ledger-num">{m.baths}</td>
                  <td className="ledger-num">{m.landSqm}m²</td>
                  <td className="ledger-num">
                    <em>{m.matchPercent}%</em>
                  </td>
                  <td className="ledger-num">
                    <Link
                      href={"/app/listings/" + m.id}
                      className="ledger-action"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function ArchivePanel() {
  return (
    <section className="dash-row">
      <article className="dash-panel">
        <header className="dash-panel-head">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>Archive</span>
          </p>
          <h2>
            Closed <em>campaigns</em>
          </h2>
        </header>
        <div className="ledger-scroll">
          <table className="ledger-table ledger-table--wide">
            <thead>
              <tr>
                <th scope="col">Folio</th>
                <th scope="col">Listing</th>
                <th scope="col">Outcome</th>
                <th scope="col">Closed</th>
                <th scope="col" className="ledger-num">Final price</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {archivedListings.map((a, i) => (
                <tr key={a.id}>
                  <td className="ledger-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <Link href={"/app/listings/" + a.id} className="ledger-link">
                      <span className="ledger-title">{a.title}</span>
                      <span className="ledger-sub-inline">{a.address}</span>
                    </Link>
                  </td>
                  <td>
                    <StatusPill status={a.closedReason} />
                  </td>
                  <td>
                    <span className="ledger-muted">{a.closedAt}</span>
                  </td>
                  <td className="ledger-num">
                    {a.finalPrice ? (
                      <em>{a.finalPrice}</em>
                    ) : (
                      <span className="ledger-muted">—</span>
                    )}
                  </td>
                  <td className="ledger-num">
                    <Link
                      href={"/app/listings/" + a.id}
                      className="ledger-action"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
