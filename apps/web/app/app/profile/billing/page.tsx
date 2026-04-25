import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import { invoices, payouts } from "../../_data/fixtures";

export default function BillingPage() {
  const outstanding = invoices.filter((i) => i.status === "OUTSTANDING");
  const outstandingTotal = outstanding
    .reduce((s, i) => s + parseFloat(i.amount.replace(/[^0-9.]/g, "")), 0)
    .toLocaleString("en-AU", {
      style: "currency",
      currency: "AUD",
    });

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Billing</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>II · Dealings</span>
            </p>
            <h1 className="subpage-title">
              <em>Billing</em> centre.
            </h1>
            <p className="page-lede">
              Subscription, invoices, payouts and the bank account it all flows
              through.
            </p>
          </div>
        </header>

        <section className="billing-strip">
          <div className="billing-strip-tile">
            <p className="kpi-label">Plan</p>
            <p className="kpi-value">
              <em>Pro</em>
            </p>
            <p className="kpi-meta">$1,200 / month · renews 01 May</p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">Outstanding</p>
            <p className="kpi-value">{outstandingTotal}</p>
            <p className="kpi-meta">
              {outstanding.length} invoice{outstanding.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">Next payout</p>
            <p className="kpi-value">$3,210</p>
            <p className="kpi-meta">29 Apr · scheduled</p>
          </div>
          <div className="billing-strip-tile">
            <p className="kpi-label">Method</p>
            <p className="kpi-value">
              <em>Visa</em> ··· 4218
            </p>
            <p className="kpi-meta">Expires 09 / 28</p>
          </div>
        </section>

        <section className="billing-actions">
          <button type="button" className="dash-cta">
            Update payment method
          </button>
          <button type="button" className="dash-cta is-ghost">
            Change plan
          </button>
          <button type="button" className="dash-cta is-ghost">
            Update payout details
          </button>
          <Link href="/app/profile/billing/payouts" className="dash-cta is-ghost">
            View all payouts
          </Link>
        </section>

        <section className="dash-row dash-row--split">
          <article className="dash-panel">
            <header className="dash-panel-head">
              <h2 className="dash-panel-title">Invoices</h2>
              <span className="dash-panel-meta">
                {invoices.length} on record
              </span>
            </header>
            <table className="ledger" aria-label="Invoices">
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Date</th>
                  <th scope="col">Description</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td>{i.reference}</td>
                    <td>{i.date}</td>
                    <td>{i.description}</td>
                    <td>{i.amount}</td>
                    <td>
                      <span
                        className={
                          "ledger-status is-" + i.status.toLowerCase()
                        }
                      >
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="dash-panel">
            <header className="dash-panel-head">
              <h2 className="dash-panel-title">Recent payouts</h2>
              <Link
                href="/app/profile/billing/payouts"
                className="dash-panel-link"
              >
                See all
              </Link>
            </header>
            <ul className="payout-list" role="list">
              {payouts.map((p) => (
                <li key={p.id} className="payout-row">
                  <div>
                    <p className="payout-amount">{p.amount}</p>
                    <p className="payout-meta">
                      {p.destination} · {p.date}
                    </p>
                  </div>
                  <span
                    className={
                      "ledger-status is-" + p.status.toLowerCase().replace(/\s+/g, "-")
                    }
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
