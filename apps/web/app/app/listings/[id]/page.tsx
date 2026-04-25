import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../../components/SiteFooter";
import {
  getListingDetail,
  latestEnquiries,
} from "../../_data/fixtures";

type Params = Promise<{ id: string }>;

export default async function ListingDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const listing = getListingDetail(id);
  if (!listing) notFound();

  const enquiriesForListing = latestEnquiries.filter(
    (e) => e.listingTitle === listing.title,
  );
  const conv =
    listing.views30d > 0
      ? Math.round((listing.enquiries30d / listing.views30d) * 1000) / 10
      : 0;
  const authorityWarn =
    listing.authorityDaysLeft !== null && listing.authorityDaysLeft <= 7;

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/listings">Portfolio</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">{listing.title}</span>
        </nav>

        <header className="dash-masthead listing-masthead">
          <div className="dash-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Campaign</span>
              <span className="kicker-sep" aria-hidden="true">·</span>
              <span className={"status-pill is-" + statusTone(listing.status)}>
                {listing.status}
              </span>
            </p>
            <h1>
              {listing.title.split(" ").slice(0, -1).join(" ")}{" "}
              <em>{listing.title.split(" ").slice(-1)[0]}</em>
            </h1>
            <p className="listing-address">
              {listing.address} ·{" "}
              <span className="listing-guide">{listing.priceRange}</span>
            </p>
          </div>
          <div className="listing-actions">
            <Link
              href={"/app/listings/" + listing.id + "/edit"}
              className="dash-cta dash-cta--ghost"
            >
              Edit listing
            </Link>
            <Link
              href={"/app/listings/" + listing.id + "/promote"}
              className="dash-cta"
            >
              Promote campaign
            </Link>
          </div>
        </header>

        <section className="listing-gallery" aria-label="Imagery">
          {listing.images.map((img, i) => (
            <figure
              key={i}
              className={"plate" + (i === 0 ? " plate--lead" : "")}
            >
              <div className="plate-frame" aria-hidden="true">
                <span className="plate-folio">
                  Plate {String.fromCharCode(0x2160 + i)}
                </span>
              </div>
              <figcaption>{img.caption}</figcaption>
            </figure>
          ))}
        </section>

        <section className="dash-kpis" aria-label="Campaign metrics">
          <KpiTile
            kicker="i"
            label="Views (30d)"
            value={listing.views30d}
            delta={{ tone: "up", text: "+12% wk/wk" }}
          />
          <KpiTile
            kicker="ii"
            label="Enquiries (30d)"
            value={listing.enquiries30d}
            delta={{ tone: "up", text: "+3 this week" }}
          />
          <KpiTile
            kicker="iii"
            label="Conversion"
            value={conv + "%"}
            delta={{ tone: "muted", text: "Cat. avg 1.4%" }}
          />
          <KpiTile
            kicker="iv"
            label="Days on market"
            value={listing.campaignStartedDays}
          />
          <KpiTile
            kicker="v"
            label={authorityWarn ? "Authority — renew" : "Authority"}
            value={
              listing.authorityDaysLeft !== null
                ? listing.authorityDaysLeft + "d"
                : "—"
            }
            delta={
              authorityWarn
                ? { tone: "warn", text: "Expires soon" }
                : { tone: "muted", text: "Signed " + listing.authoritySigned }
            }
          />
        </section>

        <section className="dash-row dash-row--split">
          <article className="dash-panel">
            <header className="dash-panel-head">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Property</span>
              </p>
              <h2>
                Editorial <em>summary</em>
              </h2>
            </header>
            <div className="listing-summary">
              <p className="listing-lede">{listing.description}</p>
              <dl className="listing-meta-grid">
                <div>
                  <dt>Beds</dt>
                  <dd>
                    <em>{listing.beds}</em>
                  </dd>
                </div>
                <div>
                  <dt>Bath</dt>
                  <dd>
                    <em>{listing.baths}</em>
                  </dd>
                </div>
                <div>
                  <dt>Land</dt>
                  <dd>
                    <em>{listing.landSqm}</em>m²
                  </dd>
                </div>
                <div>
                  <dt>Guide</dt>
                  <dd>{listing.priceRange}</dd>
                </div>
              </dl>
              <div className="listing-features">
                <p className="features-kicker">Of note</p>
                <ul>
                  {listing.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <article className="dash-panel">
            <header className="dash-panel-head">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Schedule</span>
              </p>
              <h2>
                Inspections &amp; <em>vendor</em>
              </h2>
              <Link
                href={"/app/listings/" + listing.id + "/schedule"}
                className="section-see-all"
              >
                Manage <span aria-hidden="true">→</span>
              </Link>
            </header>
            <ul className="dispatch-list dispatch-list--tight">
              {listing.inspections.map((ins, i) => (
                <li key={i}>
                  <div className="dispatch-row dispatch-row--static">
                    <span className="dispatch-folio">
                      No. {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="dispatch-body">
                      <strong>{ins.day}</strong>
                      <span className="dispatch-sub">{ins.time}</span>
                    </span>
                    <span className="dispatch-num">
                      <em>{ins.rsvps}</em> rsvp
                    </span>
                  </div>
                </li>
              ))}
              <li>
                <div className="dispatch-row dispatch-row--static">
                  <span className="dispatch-folio">No. {String(listing.inspections.length + 1).padStart(2, "0")}</span>
                  <span className="dispatch-body">
                    <strong>Private inspections</strong>
                    <span className="dispatch-sub">
                      Booked through the workspace
                    </span>
                  </span>
                  <span className="dispatch-num">
                    <em>{listing.privateInspections}</em>
                  </span>
                </div>
              </li>
            </ul>
            <div className="vendor-strip">
              <p className="features-kicker">The Vendor</p>
              <p className="vendor-name">{listing.vendorName}</p>
              <p className="vendor-mail">{listing.vendorEmail}</p>
              <p className="vendor-auth">
                Authority signed <em>{listing.authoritySigned}</em>
              </p>
            </div>
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
                Enquiries on <em>this listing</em>
              </h2>
              <Link
                href="/app/messages"
                className="section-see-all"
              >
                Open inbox <span aria-hidden="true">→</span>
              </Link>
            </header>
            {enquiriesForListing.length > 0 ? (
              <ul className="dispatch-list dispatch-list--tight">
                {enquiriesForListing.map((enq, i) => (
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
                        <span className="dispatch-sub">{enq.address}</span>
                      </span>
                      <span className="dispatch-time">{enq.hoursAgo}H</span>
                      <span className="dispatch-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dash-empty">No enquiries yet on this campaign.</p>
            )}
          </article>

          <article className="studio-card studio-card--compact">
            <div className="studio-card-text">
              <p className="section-kicker section-kicker--inverse">
                <span className="sq sq--outline sq--sm" aria-hidden="true" />
                <span>Statement of Information</span>
              </p>
              <h2>
                {listing.soiAttached ? (
                  <>
                    SOI <em>attached</em>.
                  </>
                ) : (
                  <>
                    SOI <em>required</em>.
                  </>
                )}
              </h2>
              <p>
                {listing.soiAttached
                  ? "Statement of Information lodged 16 Apr. Three comparable sales referenced. Vendor counter-signed digitally."
                  : "Victoria requires a Statement of Information for residential listings under $10M. Five-step capture; we pre-fill comparables from PriceFinder."}
              </p>
            </div>
            <Link
              href={"/app/listings/" + listing.id + "/soi"}
              className="studio-card-cta"
            >
              {listing.soiAttached ? "View SOI" : "Begin SOI capture"}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        </section>

        <section className="dash-row">
          <article className="dash-panel">
            <header className="dash-panel-head">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Ledger</span>
              </p>
              <h2>
                Campaign <em>activity</em>
              </h2>
            </header>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th scope="col">Folio</th>
                  <th scope="col">Event</th>
                  <th scope="col">Detail</th>
                  <th scope="col" className="ledger-num">When</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ledger-folio">No. 01</td>
                  <td>
                    <span className="ledger-title">Authority signed</span>
                  </td>
                  <td>
                    <span className="ledger-muted">
                      {listing.vendorName} · digital
                    </span>
                  </td>
                  <td className="ledger-num">
                    <em>{listing.campaignStartedDays}</em>d ago
                  </td>
                </tr>
                <tr>
                  <td className="ledger-folio">No. 02</td>
                  <td>
                    <span className="ledger-title">Listing published</span>
                  </td>
                  <td>
                    <span className="ledger-muted">
                      Imagery + SOI lodged · pre-market 48h
                    </span>
                  </td>
                  <td className="ledger-num">
                    <em>{Math.max(0, listing.campaignStartedDays - 1)}</em>d ago
                  </td>
                </tr>
                <tr>
                  <td className="ledger-folio">No. 03</td>
                  <td>
                    <span className="ledger-title">Open for enquiry</span>
                  </td>
                  <td>
                    <span className="ledger-muted">
                      Released to subscribed buyers
                    </span>
                  </td>
                  <td className="ledger-num">
                    <em>{Math.max(0, listing.campaignStartedDays - 2)}</em>d ago
                  </td>
                </tr>
                <tr>
                  <td className="ledger-folio">No. 04</td>
                  <td>
                    <span className="ledger-title">First inspection</span>
                  </td>
                  <td>
                    <span className="ledger-muted">
                      Public · {listing.inspections[0]?.rsvps ?? 0} attendees
                    </span>
                  </td>
                  <td className="ledger-num">
                    <em>{Math.max(0, listing.campaignStartedDays - 4)}</em>d ago
                  </td>
                </tr>
              </tbody>
            </table>
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

function statusTone(status: string) {
  if (status === "ACTIVE") return "ok";
  if (status === "SOI PENDING") return "warn";
  if (status === "SOLD") return "forest";
  if (
    status === "OFF-MARKET" ||
    status === "PRIVATE" ||
    status === "EXCLUSIVE"
  )
    return "ink";
  return "muted";
}
