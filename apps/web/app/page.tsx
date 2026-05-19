import Link from "next/link";
import HeroFind from "./components/HeroFind";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

const featured = [
  {
    address: "502 Glenferrie Rd",
    suburb: "Hawthorn, VIC",
    price: "$4.8m – 5.2m",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85",
  },
  {
    address: "248 Auburn Rd",
    suburb: "Hawthorn, VIC",
    price: "$3.6m – 3.9m",
    image:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=85",
  },
  {
    address: "15 Power St",
    suburb: "Hawthorn, VIC",
    price: "On application",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=85",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="home-find">
        <HeroFind />

        <section className="find-why" aria-labelledby="why-match">
          <div className="find-why__grid">
            <p className="find-why__label" id="why-match">
              Why MATCH
            </p>
            <h2 className="find-why__headline">
              <strong>
                Your life&rsquo;s changing. Don&rsquo;t just find a place — find
                what&rsquo;s next.
              </strong>{" "}
              <span>
                We help you move forward with clarity, confidence, and the right
                agent by your side — before a home hits the public listings.
              </span>
            </h2>
          </div>
        </section>

        <section className="find-media" aria-label="Featured neighbourhood">
          <div className="find-media__frame">
            <img
              src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=85"
              alt="Tree-lined street in an established Melbourne suburb"
              loading="lazy"
            />
          </div>
        </section>

        <section className="find-listings" aria-labelledby="featured-listings">
          <div className="find-listings__inner">
            <header className="find-listings__head">
              <div>
                <p className="find-why__label">Private listings</p>
                <h2 id="featured-listings">Properties near Hawthorn</h2>
              </div>
              <Link href="/listings" className="find-link">
                View all
              </Link>
            </header>
            <div className="find-listings__grid">
              {featured.map((item) => (
                <Link
                  key={item.address}
                  href="/listings"
                  className="find-listing-card"
                >
                  <div
                    className="find-listing-card__img"
                    style={{ backgroundImage: `url(${item.image})` }}
                    aria-hidden="true"
                  />
                  <div className="find-listing-card__body">
                    <h3>{item.address}</h3>
                    <p>
                      {item.suburb} · {item.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
