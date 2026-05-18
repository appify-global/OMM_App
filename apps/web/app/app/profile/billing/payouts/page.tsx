import Link from "next/link";
import SiteFooter from "../../../../components/SiteFooter";
import { payouts } from "../../../_data/fixtures";

const HISTORY = [
  ...payouts,
  {
    id: "pay-3",
    date: "29 Mar 2026",
    amount: "$6,140.00",
    destination: "AZ Real Estate · NAB ••• 4218",
    status: "SETTLED" as const,
  },
  {
    id: "pay-4",
    date: "12 Mar 2026",
    amount: "$4,820.00",
    destination: "AZ Real Estate · NAB ••• 4218",
    status: "SETTLED" as const,
  },
  {
    id: "pay-5",
    date: "26 Feb 2026",
    amount: "$2,310.00",
    destination: "AZ Real Estate · NAB ••• 4218",
    status: "SETTLED" as const,
  },
];

export default function PayoutHistoryPage() {
  const settled = HISTORY.filter((p) => p.status === "SETTLED").length;
  const lifetime = HISTORY.reduce(
    (s, p) => s + parseFloat(p.amount.replace(/[^0-9.]/g, "")),
    0,
  ).toLocaleString("en-AU", { style: "currency", currency: "AUD" });

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile/billing">Billing</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Payouts</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>II · Dealings</span>
            </p>
            <h1 className="subpage-title">
              Payout <em>history</em>.
            </h1>
            <p className="page-lede">
              Every payment that has settled, or is on its way to settle, into
              your nominated account.
            </p>
          </div>
        </header>

        <section className="billing-strip">
          <div className="billing-strip-tile">
            <p className="kpi-label">Lifetime</p>
            <p className="kpi-value">{lifetime}</p>
            <p className="kpi-meta">across {HISTORY.length} payouts</p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">Settled</p>
            <p className="kpi-value">{settled}</p>
            <p className="kpi-meta">cleared to bank</p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">Destination</p>
            <p className="kpi-value">
              <em>NAB</em> ··· 4218
            </p>
            <p className="kpi-meta">AZ Real Estate</p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">Cadence</p>
            <p className="kpi-value">
              <em>Fortnightly</em>
            </p>
            <p className="kpi-meta">Mondays at 09:00 AEDT</p>
          </div>
        </section>

        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Ledger</h2>
            <span className="dash-panel-meta">
              {HISTORY.length} entries
            </span>
          </header>
          <table className="ledger" aria-label="Payout history">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Destination</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((p) => (
                <tr key={p.id}>
                  <td>{p.date}</td>
                  <td>{p.destination}</td>
                  <td>{p.amount}</td>
                  <td>
                    <span
                      className={
                        "ledger-status is-" +
                        p.status.toLowerCase().replace(/\s+/g, "-")
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
