import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import FindPageMasthead from "../components/FindPageMasthead";
import { fetchBriefs } from "../lib/api";

export const metadata = {
  title: "Buyer briefs - MATCH",
  description:
    "Tell the private market what you want. Agents see briefs before they build a campaign.",
};

export default async function BriefsPage() {
  const briefs = await fetchBriefs();

  return (
    <>
      <SiteHeader />
      <main className="home-find find-page">
        <div className="find-page__inner">
          <FindPageMasthead
            kicker="Buyer briefs"
            title={
              <>
                <span className="find-page__title-strong">Tell the market</span>
                <span className="find-page__title-soft"> what you want.</span>
              </>
            }
            lede="A buyer brief is a private record of the home you intend to buy. Agents running quiet campaigns search briefs before they build shortlists."
            stats={[
              { label: "Active briefs", value: "4.8k" },
              { label: "Agents searching", value: "1.1k" },
              { label: "Matched in 14d", value: "96%" },
            ]}
          />

          <div className="find-page__split">
            <form className="find-page__panel">
              <h2>Post a brief</h2>
              <div className="find-page__field">
                <label htmlFor="brief-type">What are you looking for</label>
                <input
                  id="brief-type"
                  type="text"
                  placeholder="Family home, 4 bed, character"
                  required
                />
              </div>
              <div className="find-page__field">
                <label htmlFor="brief-suburbs">Target suburbs</label>
                <input
                  id="brief-suburbs"
                  type="text"
                  placeholder="Kew, Hawthorn, Balwyn"
                  required
                />
              </div>
              <div className="find-page__field">
                <label htmlFor="brief-budget">Budget range</label>
                <input
                  id="brief-budget"
                  type="text"
                  placeholder="$3.5m – 4.5m"
                  required
                />
              </div>
              <div className="find-page__field">
                <label htmlFor="brief-timing">Timing</label>
                <select id="brief-timing" defaultValue="">
                  <option value="" disabled>
                    Select timing
                  </option>
                  <option>Settling in 30 days</option>
                  <option>Settling in 60 days</option>
                  <option>Settling in 90 days</option>
                  <option>Settling in 120+ days</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div className="find-page__field">
                <label htmlFor="brief-notes">Notes for agents</label>
                <textarea
                  id="brief-notes"
                  placeholder="Must-haves, deal breakers, anything that helps an agent recognise the right home."
                />
              </div>
              <button type="submit" className="find-page__submit">
                Post brief privately
              </button>
              <p className="find-page__fineprint">
                Your brief is visible only to verified agents. Your identity
                stays private until you choose to reveal it.
              </p>
            </form>

            <div>
              <p className="find-page__kicker" style={{ marginBottom: 16 }}>
                Recent briefs
              </p>
              <div className="find-page__brief-list">
                {briefs.map((b) => (
                  <article className="find-page__brief-row" key={b.id}>
                    <div className="find-page__brief-id">{b.id.toUpperCase()}</div>
                    <div>
                      <h3>{b.buyerAlias}</h3>
                      <p>
                        {b.type} · {b.suburbs.join(", ")} · {b.budget} ·{" "}
                        {b.timing}
                      </p>
                    </div>
                    <div className="find-page__brief-matches">
                      <span>{b.matched}</span>
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
