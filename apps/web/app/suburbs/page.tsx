import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import FindPageMasthead from "../components/FindPageMasthead";
import { fetchSuburbs } from "../lib/api";

export const metadata = {
  title: "Suburbs - MATCH",
  description:
    "Median, trend and active campaign count across premium suburbs.",
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
      <main className="home-find find-page">
        <div className="find-page__inner">
          <FindPageMasthead
            kicker="Suburb index"
            title={
              <>
                <span className="find-page__title-strong">Suburbs</span>
                <span className="find-page__title-soft">
                  {" "}
                  by quiet movement.
                </span>
              </>
            }
            lede="A running index of premium suburbs - median price, twelve-month change, active campaigns and the share running privately."
            stats={[
              { label: "Suburbs tracked", value: suburbs.length },
              { label: "Active listings", value: totalActive },
              { label: "Private campaigns", value: totalPrivate },
            ]}
          />

          <div className="find-page__table-wrap">
            <table className="find-page__table">
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
                    <th scope="row" className="find-page__suburb-name">
                      {s.name}
                      <small>{s.state}</small>
                    </th>
                    <td>{s.median}</td>
                    <td className={trendClass[s.trend]}>{s.twelveMonth}</td>
                    <td>{s.activeListings}</td>
                    <td>{s.privateCampaigns}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/suburbs/${s.slug}`}
                        className="find-page__table-link"
                      >
                        View
                      </Link>
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
