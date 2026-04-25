"use client";

import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import type { HomePageLoaderData } from "./_data/rsc-loaders";
import ModeToggle, { useMode } from "./_components/ModeToggle";

export default function AppHomeClient({
  data,
}: {
  data: HomePageLoaderData;
}) {
  const [mode, setMode] = useMode();

  return (
    <>
      <main className="dash">
        <header className="dash-masthead">
          <div className="dash-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Studio</span>
            </p>
            <h1>
              Good <em>afternoon</em>,{" "}
              <span className="dash-name">{data.userFirstName}.</span>
            </h1>
          </div>
          <ModeToggle mode={mode} onChange={setMode} />
        </header>

        {mode === "selling" ? <SellingDash s={data.selling} /> : <BuyingDash b={data.buying} />}
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
  tone = "ink",
  href,
}: {
  kicker: string;
  label: string;
  value: string | number;
  delta?: { tone: "up" | "down" | "warn" | "muted"; text: string };
  tone?: "ink" | "forest";
  href?: string;
}) {
  const Tag = (href ? Link : "div") as typeof Link;
  return (
    <Tag
      className={"kpi-tile" + (href ? " is-linked" : "") + (tone === "forest" ? " is-forest" : "")}
      href={href ?? "#"}
    >
      <span className="kpi-kicker">{kicker}</span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
      {delta ? (
        <span className={"kpi-delta is-" + delta.tone}>{delta.text}</span>
      ) : null}
    </Tag>
  );
}

function SellingDash({ s }: { s: HomePageLoaderData["selling"] }) {
  return (
    <>
      <section className="dash-kpis" aria-label="Headline metrics">
        <KpiTile
          kicker="i"
          label="Active listings"
          value={s.activeListings.length}
          delta={{ tone: "up", text: "+1 this week" }}
          href="/app/listings"
        />
        <KpiTile
          kicker="ii"
          label="New enquiries"
          value={s.newEnquiriesCount}
          delta={{ tone: "up", text: "+2 today" }}
          href="/app/messages"
        />
        <KpiTile
          kicker="iii"
          label="Authorities expiring"
          value={s.authorityExpiringSoon.length}
          delta={{ tone: "warn", text: "Soonest 6d" }}
          href="/app/listings?filter=expiring"
        />
        <KpiTile
          kicker="iv"
          label="Buyer matches"
          value={s.buyerMatches.length}
          delta={{ tone: "muted", text: "Curated overnight" }}
          href="/app/briefs"
        />
        <KpiTile
          kicker="v"
          label="Net views (7d)"
          value={s.totalViews7d}
          delta={{ tone: "up", text: "+12% wk/wk" }}
          href="/app/listings"
        />
      </section>

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

        <article className="dispatch-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>Dispatches</span>
            </p>
            <h2>
              For your <em>attention</em>
            </h2>
          </header>
          <ul className="dispatch-list dispatch-list--tight">
            <li>
              <Link href="/app/messages" className="dispatch-row">
                <span className="dispatch-folio">No. 01</span>
                <span className="dispatch-body">
                  <strong>{s.newEnquiriesCount} new enquiries</strong>
                  <span className="dispatch-sub">
                    Hawthorn City Center · Brighton Terrace
                  </span>
                </span>
                <span className="dispatch-time">2H</span>
                <span className="dispatch-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <Link href="/app/transactions" className="dispatch-row">
                <span className="dispatch-folio">No. 02</span>
                <span className="dispatch-body">
                  <strong>
                    {s.transactionsAwaitingReviewCount} transactions awaiting review
                  </strong>
                  <span className="dispatch-sub">
                    Vendor disclosure pending counter-signature
                  </span>
                </span>
                <span className="dispatch-time">1D</span>
                <span className="dispatch-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <Link
                href="/app/listings/lst-brighton-terrace"
                className="dispatch-row"
              >
                <span className="dispatch-folio">No. 03</span>
                <span className="dispatch-body">
                  <strong>Brighton Terrace authority expires in 6 days</strong>
                  <span className="dispatch-sub">
                    Renew or release at vendor&rsquo;s discretion
                  </span>
                </span>
                <span className="dispatch-time dispatch-time--warn">⚠</span>
                <span className="dispatch-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </article>
      </section>

      <section className="dash-row dash-row--split">
        <article className="dash-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Portfolio</span>
            </p>
            <h2>
              Active <em>listings</em>
            </h2>
            <Link href="/app/listings" className="section-see-all">
              See all <span aria-hidden="true">→</span>
            </Link>
          </header>
          <table className="ledger-table">
            <thead>
              <tr>
                <th scope="col">Folio</th>
                <th scope="col">Listing</th>
                <th scope="col" className="ledger-num">Guide</th>
                <th scope="col" className="ledger-num">Views</th>
                <th scope="col" className="ledger-num">Leads</th>
                <th scope="col" className="ledger-num">Auth</th>
              </tr>
            </thead>
            <tbody>
              {s.activeListings.map((l, i) => (
                <tr key={l.id}>
                  <td className="ledger-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <Link
                      href={"/app/listings/" + l.id}
                      className="ledger-link"
                    >
                      <span className="ledger-title">{l.title}</span>
                      <span className="ledger-sub-inline">{l.status}</span>
                    </Link>
                  </td>
                  <td className="ledger-num">{l.priceRange}</td>
                  <td className="ledger-num">{l.views7d}</td>
                  <td className="ledger-num">{l.leads}</td>
                  <td className="ledger-num">
                    {l.authorityDaysLeft !== null ? (
                      <em>{l.authorityDaysLeft}d</em>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="dash-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Ledger</span>
            </p>
            <h2>
              Authority <em>expiring</em>
            </h2>
            <Link href="/app/listings?filter=expiring" className="section-see-all">
              See all <span aria-hidden="true">→</span>
            </Link>
          </header>
          <ul className="dispatch-list dispatch-list--tight">
            {s.authorityExpiringSoon.map((row, i) => (
              <li key={row.id}>
                <Link
                  href={"/app/listings/" + row.id + "/renew"}
                  className="dispatch-row dispatch-row--ledger"
                >
                  <span className="dispatch-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="dispatch-body">
                    <strong>{row.title}</strong>
                    <span className="dispatch-sub">{row.address}</span>
                  </span>
                  <span className="dispatch-num">
                    <em>{row.daysLeft}</em>d
                  </span>
                  <span className="dispatch-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dash-row dash-row--split">
        <article className="dash-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Inbox</span>
            </p>
            <h2>
              Latest <em>enquiries</em>
            </h2>
            <Link href="/app/messages" className="section-see-all">
              See all <span aria-hidden="true">→</span>
            </Link>
          </header>
          <ul className="dispatch-list dispatch-list--tight">
            {s.latestEnquiries.map((enq, i) => (
              <li key={enq.id}>
                <Link
                  href={"/app/messages/" + enq.id}
                  className="dispatch-row"
                >
                  <span className="dispatch-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="dispatch-body">
                    <strong>{enq.name}</strong>
                    <span className="dispatch-sub">
                      {enq.address} · re. {enq.listingTitle}
                    </span>
                  </span>
                  <span className="dispatch-time">{enq.hoursAgo}H</span>
                  <span className="dispatch-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="dash-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Switchboard</span>
            </p>
            <h2>
              New buyer <em>matches</em>
            </h2>
            <Link href="/app/briefs" className="section-see-all">
              See all <span aria-hidden="true">→</span>
            </Link>
          </header>
          <ul className="dispatch-list dispatch-list--tight">
            {s.buyerMatches.map((m, i) => (
              <li key={m.id}>
                <Link
                  href={"/app/briefs?suburb=" + encodeURIComponent(m.suburb)}
                  className="dispatch-row"
                >
                  <span className="dispatch-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="dispatch-body">
                    <strong>{m.suburb}</strong>
                    <span className="dispatch-sub">{m.criteria}</span>
                  </span>
                  <span className="dispatch-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}

function BuyingDash({ b }: { b: HomePageLoaderData["buying"] }) {
  return (
    <>
      <section className="dash-kpis" aria-label="Headline metrics">
        <KpiTile
          kicker="i"
          label="Saved searches"
          value={b.savedSearches.length}
          delta={{ tone: "muted", text: "Both with daily alerts" }}
          href="/app/saved"
        />
        <KpiTile
          kicker="ii"
          label="New replies"
          value={b.buyingNotifications.newAgentReplies}
          delta={{ tone: "up", text: "+1 today" }}
          href="/app/messages"
        />
        <KpiTile
          kicker="iii"
          label="Off-market matches"
          value={b.offMarketMatches.length}
          delta={{ tone: "up", text: "Avg 90% match" }}
          href="/app/listings?type=off-market"
        />
        <KpiTile
          kicker="iv"
          label="Pending review"
          value={b.buyingNotifications.transactionsAwaitingReview}
          delta={{ tone: "warn", text: "Conveyancer awaiting" }}
          href="/app/transactions"
        />
        <KpiTile
          kicker="v"
          label="Brief matches (30d)"
          value="13"
          delta={{ tone: "up", text: "+4 wk/wk" }}
          href="/app/briefs"
        />
      </section>

      <section className="dash-row dash-row--split">
        <article className="studio-card studio-card--compact">
          <div className="studio-card-text">
            <p className="section-kicker section-kicker--inverse">
              <span className="sq sq--outline sq--sm" aria-hidden="true" />
              <span>The Atelier</span>
            </p>
            <h2>
              Post a <em>brief</em>.
            </h2>
            <p>
              Suburbs, budget, timing. Broadcast in private to listing agents —
              matches return within twenty-four hours.
            </p>
          </div>
          <Link href="/app/briefs/new" className="studio-card-cta">
            Compose a brief <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="dispatch-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>Dispatches</span>
            </p>
            <h2>
              For your <em>attention</em>
            </h2>
          </header>
          <ul className="dispatch-list dispatch-list--tight">
            <li>
              <Link href="/app/messages" className="dispatch-row">
                <span className="dispatch-folio">No. 01</span>
                <span className="dispatch-body">
                  <strong>
                    {b.buyingNotifications.newAgentReplies} new agent replies
                  </strong>
                  <span className="dispatch-sub">
                    Quiet listings flagged for your saved briefs
                  </span>
                </span>
                <span className="dispatch-time">3H</span>
                <span className="dispatch-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <Link href="/app/transactions" className="dispatch-row">
                <span className="dispatch-folio">No. 02</span>
                <span className="dispatch-body">
                  <strong>
                    {b.buyingNotifications.transactionsAwaitingReview} transaction awaiting review
                  </strong>
                  <span className="dispatch-sub">
                    Conveyancer has lodged contract for counter-signature
                  </span>
                </span>
                <span className="dispatch-time">1D</span>
                <span className="dispatch-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <Link
                href="/app/listings?type=off-market"
                className="dispatch-row"
              >
                <span className="dispatch-folio">No. 03</span>
                <span className="dispatch-body">
                  <strong>2 new off-market matches above 88%</strong>
                  <span className="dispatch-sub">
                    Camberwell Family Home · Hawthorn Townhouse
                  </span>
                </span>
                <span className="dispatch-time">6H</span>
                <span className="dispatch-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </article>
      </section>

      <section className="dash-row dash-row--split">
        <article className="dash-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Portfolio</span>
            </p>
            <h2>
              Off-market <em>matches</em>
            </h2>
            <Link href="/app/listings?type=off-market" className="section-see-all">
              See all <span aria-hidden="true">→</span>
            </Link>
          </header>
          <table className="ledger-table">
            <thead>
              <tr>
                <th scope="col">Folio</th>
                <th scope="col">Listing</th>
                <th scope="col" className="ledger-num">Guide</th>
                <th scope="col" className="ledger-num">Plan</th>
                <th scope="col" className="ledger-num">Match</th>
              </tr>
            </thead>
            <tbody>
              {b.offMarketMatches.map((m, i) => (
                <tr key={m.id}>
                  <td className="ledger-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <Link
                      href={"/app/listings/" + m.id}
                      className="ledger-link"
                    >
                      <span className="ledger-title">{m.title}</span>
                      <span className="ledger-sub-inline">{m.status}</span>
                    </Link>
                  </td>
                  <td className="ledger-num">{m.priceRange}</td>
                  <td className="ledger-num">{m.beds} / {m.baths}</td>
                  <td className="ledger-num">
                    <em>{m.matchPercent}%</em>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="dash-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Watchlist</span>
            </p>
            <h2>
              Saved <em>searches</em>
            </h2>
            <Link href="/app/saved" className="section-see-all">
              See all <span aria-hidden="true">→</span>
            </Link>
          </header>
          <ul className="dispatch-list dispatch-list--tight">
            {b.savedSearches.map((row, i) => (
              <li key={row.id}>
                <Link href={"/app/saved/" + row.id} className="dispatch-row">
                  <span className="dispatch-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="dispatch-body">
                    <strong>{row.title}</strong>
                    <span className="dispatch-sub">
                      {row.criteria} · alerts {row.alertsOn ? "daily" : "off"}
                    </span>
                  </span>
                  <span className="dispatch-num">
                    <em>{row.newCount}</em>
                  </span>
                  <span className="dispatch-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dash-row">
        <article className="dash-panel">
          <header className="dash-panel-head">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Inbox</span>
            </p>
            <h2>
              Recent agent <em>replies</em>
            </h2>
            <Link href="/app/messages" className="section-see-all">
              See all <span aria-hidden="true">→</span>
            </Link>
          </header>
          <ul className="dispatch-list dispatch-list--tight">
            {b.recentAgentReplies.map((rep, i) => (
              <li key={rep.id}>
                <Link
                  href={"/app/messages/" + rep.id}
                  className="dispatch-row"
                >
                  <span className="dispatch-folio">
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="dispatch-body">
                    <strong>
                      {rep.agentName}
                      <span className="dispatch-firm"> · {rep.agentFirm}</span>
                    </strong>
                    <span className="dispatch-sub dispatch-sub--quote">
                      &ldquo;{rep.snippet}&rdquo;
                    </span>
                  </span>
                  <span className="dispatch-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
