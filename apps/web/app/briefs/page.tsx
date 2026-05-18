import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { fetchBriefs } from "../lib/api";

export const metadata = {
  title: "Buyer briefs — PreMarket",
  description: "Tell the private market what you want. Agents see briefs before they ever build a campaign.",
};

export default async function BriefsPage() {
  const briefs = await fetchBriefs();

  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-shell">
          <header className="page-masthead">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Brief</span>
              </p>
              <h1>
                Tell the market, <em>precisely</em><br />what you want.
              </h1>
              <p className="page-lede">
                A buyer brief is a private record of the home you intend to buy.
                Agents running quiet campaigns search briefs before they build
                shortlists. The sharper your brief, the earlier you&rsquo;re seen.
              </p>
            </div>
            <dl className="page-stats">
              <div>
                <dt>Active briefs</dt>
                <dd>4.8k</dd>
              </div>
              <div>
                <dt>Agents searching</dt>
                <dd>1.1k</dd>
              </div>
              <div>
                <dt>Matched in 14d</dt>
                <dd>96%</dd>
              </div>
            </dl>
          </header>

          <div className="briefs-layout">
            <form className="brief-form">
              <h2>Post a brief</h2>
              <div className="brief-form-field">
                <label htmlFor="brief-type">What are you looking for</label>
                <input
                  id="brief-type"
                  type="text"
                  placeholder="Family home, 4 bed, character"
                  required
                />
              </div>
              <div className="brief-form-field">
                <label htmlFor="brief-suburbs">Target suburbs</label>
                <input
                  id="brief-suburbs"
                  type="text"
                  placeholder="Kew, Hawthorn, Balwyn"
                  required
                />
              </div>
              <div className="brief-form-field">
                <label htmlFor="brief-budget">Budget range</label>
                <input
                  id="brief-budget"
                  type="text"
                  placeholder="$3.5m – 4.5m"
                  required
                />
              </div>
              <div className="brief-form-field">
                <label htmlFor="brief-timing">Timing</label>
                <select id="brief-timing" defaultValue="">
                  <option value="" disabled>Select timing</option>
                  <option>Settling in 30 days</option>
                  <option>Settling in 60 days</option>
                  <option>Settling in 90 days</option>
                  <option>Settling in 120+ days</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div className="brief-form-field">
                <label htmlFor="brief-notes">Notes for agents</label>
                <textarea
                  id="brief-notes"
                  placeholder="Must-haves, deal breakers, anything that helps an agent recognise the right home."
                />
              </div>
              <button type="submit" className="brief-form-submit">
                Post brief privately
              </button>
              <p className="modal-fineprint">
                Your brief is visible only to verified agents. You can&rsquo;t
                be searched by name, and your identity stays private until you
                choose to reveal it.
              </p>
            </form>

            <div>
              <p className="section-kicker" style={{ marginBottom: 18 }}>
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>Recent briefs</span>
              </p>
              <div className="brief-examples">
                {briefs.map((b) => (
                  <article className="brief-row" key={b.id}>
                    <div className="brief-row-folio">{b.id.toUpperCase()}</div>
                    <div className="brief-row-body">
                      <h3>{b.buyerAlias}</h3>
                      <p>
                        {b.type} &middot; {b.suburbs.join(", ")} &middot;{" "}
                        {b.budget} &middot; {b.timing}
                      </p>
                    </div>
                    <div className="brief-row-meta">
                      <strong>{b.matched}</strong>
                      matches
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
