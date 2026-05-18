import FlipWord from "./components/FlipWord";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import StoreBadges from "./components/StoreBadges";

const quickLinks = [
  {
    title: "Private listings",
    description: "Properties offered quietly, never advertised on portals.",
    eyebrow: "Section I",
    index: "01",
  },
  {
    title: "Buyer briefs",
    description: "Tell agents precisely the home you intend to buy.",
    eyebrow: "Section II",
    index: "02",
  },
  {
    title: "Saved searches",
    description: "A standing watch on the suburbs that matter to you.",
    eyebrow: "Section III",
    index: "03",
  },
  {
    title: "Market context",
    description: "Quiet movement, told through price and tenure data.",
    eyebrow: "Section IV",
    index: "04",
  },
];

const featuredListings = [
  {
    tag: "Private campaign",
    price: "$4.8m – 5.2m",
    address: "502 Glenferrie Rd",
    suburb: "Hawthorn, VIC",
    meta: "5 bed · 3 bath · 4 car",
    folio: "0241",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
  },
  {
    tag: "Matched buyers",
    price: "$3.6m – 3.9m",
    address: "248 Auburn Rd",
    suburb: "Hawthorn, VIC",
    meta: "4 bed · 2 bath · 2 car",
    folio: "0238",
    image:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    tag: "Quiet listing",
    price: "On application",
    address: "15 Power St",
    suburb: "Hawthorn, VIC",
    meta: "3 bed · 2 bath · 2 car",
    folio: "0233",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
  },
];

const insights = [
  { suburb: "Hawthorn", median: "$2.43m", growth: "+7.8%", listings: 14 },
  { suburb: "Kew", median: "$2.71m", growth: "+5.1%", listings: 9 },
  { suburb: "Camberwell", median: "$2.58m", growth: "+6.4%", listings: 11 },
  { suburb: "Toorak", median: "$5.85m", growth: "+9.2%", listings: 6 },
];

const propertyNews = [
  {
    category: "Field Notes",
    title: "How to approach a private property campaign",
    readTime: "4 min",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Buyer Practice",
    title: "What to know before buying off-market",
    readTime: "3 min",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Market Movement",
    title: "The suburbs where quiet demand is building",
    readTime: "5 min",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Buyer Practice",
    title: "How buyer briefs help surface private homes",
    readTime: "4 min",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Agent Practice",
    title: "What agents look for in serious buyer demand",
    readTime: "4 min",
    image:
      "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=900&q=85",
  },
];

const heroTrust = [
  "1.2k private listings",
  "4.8k verified buyers",
  "96% matched within 14 days",
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-text">
              <p className="hero-kicker">
                <span className="sq sq--filled sq--sm sq--pulse" aria-hidden="true" />
                <span>The Private Market</span>
              </p>
              <h1 className="hero-headline">
                <FlipWord words={["Buy", "Sell"]} /> before<br />
                <em>the market</em> sees it.
              </h1>
              <p className="hero-lede">
                A members&rsquo; network for off-market property — quiet
                campaigns, confidential briefs and the homes that never reach
                the listings.
              </p>

              <form className="search-panel">
                <span className="search-glyph" aria-hidden="true">
                  <svg
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="7" cy="7" r="5" />
                    <path d="m11 11 3 3" />
                  </svg>
                </span>
                <input
                  className="search-input"
                  placeholder="Hawthorn, VIC 3122"
                  aria-label="Suburb, street or school zone"
                />
                <button className="filter-button" type="button">
                  Filters
                </button>
                <button className="search-submit" type="submit" aria-label="Search">
                  <span className="search-key">⏎</span>
                </button>
              </form>

              <StoreBadges />

              <dl className="hero-meta">
                {heroTrust.map((item, i) => (
                  <div key={item}>
                    <dt>
                      <span className="sq sq--filled sq--sm" aria-hidden="true" />
                      {String(i + 1).padStart(2, "0")}
                    </dt>
                    <dd>{item}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="hero-figure">
              <div className="hero-figure-frame">
                <video
                  className="hero-figure-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster="/hero-poster.jpg?v=3"
                  disableRemotePlayback
                  aria-hidden="true"
                >
                  <source
                    src="/hero.mp4?v=3"
                    type="video/mp4"
                    media="(min-width: 768px)"
                  />
                  <source src="/hero-720.mp4?v=3" type="video/mp4" />
                </video>
              </div>
              <figcaption>
                <span>No.&nbsp;0241</span>
                <span>Private campaign</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="quick-link-section">
          <div className="quick-link-grid">
            {quickLinks.map((link) => (
              <a className="quick-link-card" href="#" key={link.title}>
                <div className="quick-top-row">
                  <span className="quick-icon" aria-hidden="true">
                    {link.index}
                  </span>
                  <span className="quick-eyebrow">{link.eyebrow}</span>
                </div>
                <strong>{link.title}</strong>
                <p>{link.description}</p>
                <span className="quick-cta">
                  Read <span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="content-band">
          <header className="section-heading">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Portfolio</span>
            </p>
            <h2>Private listings, near Hawthorn.</h2>
            <p className="section-deadline">
              Three properties under quiet campaign &mdash; selected
              this week.
            </p>
            <a className="section-end" href="#">
              View the portfolio
              <span className="sq-pair" aria-hidden="true">
                <span className="sq sq--filled sq--sm" />
                <span className="sq sq--outline sq--sm" />
              </span>
            </a>
          </header>

          <div className="listing-grid">
            {featuredListings.map((listing) => (
              <article className="listing-card" key={listing.address}>
                <div
                  className="listing-image"
                  style={{ backgroundImage: `url(${listing.image})` }}
                  aria-hidden="true"
                />
                <div className="listing-body">
                  <p className="listing-folio">
                    <span className="sq sq--filled sq--sm" aria-hidden="true" />
                    <span>No. {listing.folio}</span>
                    <span aria-hidden="true">·</span>
                    <span>{listing.tag}</span>
                  </p>
                  <h3>{listing.address}</h3>
                  <p className="listing-suburb">{listing.suburb}</p>
                  <dl className="listing-meta">
                    <div>
                      <dt>Guide</dt>
                      <dd>{listing.price}</dd>
                    </div>
                    <div>
                      <dt>Plan</dt>
                      <dd>{listing.meta}</dd>
                    </div>
                  </dl>
                  <a className="listing-cta" href="#">
                    Request access <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="two-column-section">
          <article className="market-panel">
            <header className="section-heading compact">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Index</span>
              </p>
              <h2>Suburbs, by median.</h2>
            </header>
            <table className="suburb-table">
              <thead>
                <tr>
                  <th scope="col">Suburb</th>
                  <th scope="col">Median</th>
                  <th scope="col">12&nbsp;mo</th>
                  <th scope="col">Active</th>
                </tr>
              </thead>
              <tbody>
                {insights.map(({ suburb, median, growth, listings }) => (
                  <tr key={suburb}>
                    <th scope="row">
                      <a href="#">{suburb}</a>
                    </th>
                    <td>{median}</td>
                    <td className="suburb-growth">{growth}</td>
                    <td>{listings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="section-end" href="#">
              Read the full research
              <span className="sq-pair" aria-hidden="true">
                <span className="sq sq--filled sq--sm" />
                <span className="sq sq--outline sq--sm" />
              </span>
            </a>
          </article>

          <aside className="agent-panel">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Brief</span>
            </p>
            <h2>
              Tell the market <em>precisely</em><br />what you want.
            </h2>
            <p>
              A confidential brief reaches agents before a campaign begins.
              You name the streets, the budget, the timing. They reply when
              the right home appears.
            </p>
            <a href="#">
              Create a brief <span aria-hidden="true">→</span>
            </a>
          </aside>
        </section>

        <section className="app-band">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>The App</span>
          </p>
          <div className="app-band-body">
            <h2>Carry the private market<br />in your pocket.</h2>
            <p>
              Save properties, compare campaigns and reach agents from a
              single, quiet workspace.
            </p>
          </div>
          <a className="app-band-cta" href="#">
            Get the app <span aria-hidden="true">→</span>
          </a>
        </section>

        <section className="content-band latest-news">
          <header className="section-heading">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Blog</span>
            </p>
            <h2>From the editors.</h2>
            <a className="section-end" href="#">
              All entries
              <span className="sq-pair" aria-hidden="true">
                <span className="sq sq--filled sq--sm" />
                <span className="sq sq--outline sq--sm" />
              </span>
            </a>
          </header>

          <div className="news-rail-wrap">
            <div className="news-rail">
              {propertyNews.map((item, i) => (
                <a className="news-card" href="#" key={item.title}>
                  <div className="news-image-wrap">
                    <img src={item.image} alt="" />
                  </div>
                  <p className="news-meta">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.category}</span>
                  </p>
                  <span className="news-title">{item.title}</span>
                  <small>{item.readTime} read</small>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
