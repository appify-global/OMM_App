import Link from "next/link";
import type { Listing } from "../lib/api";

type Props = {
  suburbLabel: string;
  listings: Listing[];
};

function LockIcon() {
  return (
    <svg
      className="find-listing-card__lock-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function FindNearbyListings({ suburbLabel, listings }: Props) {
  const headingId = "featured-listings";

  return (
    <section className="find-listings" aria-labelledby={headingId}>
      <div className="find-listings__inner">
        <header className="find-listings__head">
          <div>
            <p className="find-listings__eyebrow">Private listings</p>
            <h2 id={headingId}>Properties near {suburbLabel}</h2>
          </div>
          <Link href="/sign-up" className="find-link">
            View all
          </Link>
        </header>
        <div className="find-listings__grid">
          {listings.map((item) => (
            <Link
              key={item.id}
              href="/sign-up"
              className="find-listing-card find-listing-card--locked"
              aria-label={`${item.address}, ${item.suburb} - members only`}
            >
              <div className="find-listing-card__media">
                <div
                  className="find-listing-card__img"
                  style={{ backgroundImage: `url(${item.image})` }}
                  aria-hidden="true"
                />
                <div className="find-listing-card__lock">
                  <LockIcon />
                  <span className="find-listing-card__lock-label">
                    Members only
                  </span>
                </div>
              </div>
              <div className="find-listing-card__body">
                <div className="find-listing-card__body-blur" aria-hidden="true">
                  <h3>{item.address}</h3>
                  <p>
                    {item.suburb}, {item.state} · {item.priceGuide}
                  </p>
                </div>
                <p className="find-listing-card__body-mask">
                  Address available to members
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
