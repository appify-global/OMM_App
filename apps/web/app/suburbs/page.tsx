import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { fetchSuburbs } from "../lib/api";

export const metadata = {
  title: "Suburbs — PreMarket",
  description: "The private-market index — median, trend and active campaign count across Australia's premium suburbs.",
};

const trendClass: Record<string, string> = {
  rising: "trend-up",
  flat: "trend-flat",
  cooling: "trend-down",
};

export default async function SuburbsPage() {
  const suburbs = await fetchSuburbs();
  const totalActive = suburbs.reduce((sum, s) => sum + s.activeListings, 0);
  const totalPrivate = suburbs.reduce((sum, s) => sum + s.privateCampaigns, 0);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-shell">
          <header className="page-masthead">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Index</span>
              </p>
              <h1>
                Suburbs, by <em>quiet movement</em>.
              </h1>
              <p className="page-lede">
                A running index of Australia&rsquo;s premium suburbs, tracking
                median price, twelve-month change, active campaigns and the
                share running privately. Updated weekly from agent-reported data.
              </p>
            </div>
            <dl className="page-stats">
              <div>
                <dt>Suburbs tracked</dt>
                <dd>{suburbs.length}</dd>
              </div>
              <div>
                <dt>Active listings</dt>
                <dd>{totalActive}</dd>
              </div>
              <div>
                <dt>Private campaigns</dt>
                <dd>{totalPrivate}</dd>
              </div>
            </dl>
          </header>

          <div className="suburbs-table-wrap">
            <table className="suburbs-table">
              <thead>
                <tr>
                  <th scope="col">Suburb</th>
                  <th scope="col">Median</th>
                  <th scope="col">12&nbsp;mo</th>
                  <th scope="col">Active</th>
                  <th scope="col">Private</th>
                  <th scope="col" aria-label="Action" />
                </tr>
              </thead>
              <tbody>
                {suburbs.map((s) => (
                  <tr key={s.slug}>
                    <th scope="row" className="suburb-name">
                      {s.name}
                      <small>{s.state}</small>
                    </th>
                    <td>{s.median}</td>
                    <td className={trendClass[s.trend]}>{s.twelveMonth}</td>
                    <td>{s.activeListings}</td>
                    <td>{s.privateCampaigns}</td>
                    <td style={{ textAlign: "right" }}>
                      <a
                        href={`/suburbs/${s.slug}`}
                        style={{
                          fontFamily: "Inter, system-ui, sans-serif",
                          fontSize: 12,
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                          color: "var(--ink)",
                          textDecoration: "none",
                        }}
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
