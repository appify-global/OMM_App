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
      width="13"
      height="13"
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
              className="find-listing-card"
              aria-label={`${item.tag} in ${item.suburb}, ${item.state}, ${item.priceGuide} - address available to members`}
            >
              <div className="find-listing-card__media">
                <div
                  className="find-listing-card__img"
                  style={{ backgroundImage: `url(${item.image})` }}
                  aria-hidden="true"
                />
                <span className="find-listing-card__tag">{item.tag}</span>
              </div>
              <div className="find-listing-card__body">
                <h3 className="find-listing-card__suburb">
                  {item.suburb}, {item.state}
                </h3>
                <p className="find-listing-card__price">{item.priceGuide}</p>
                <ul className="find-listing-card__specs">
                  <li>{item.bed} bed</li>
                  <li>{item.bath} bath</li>
                  <li>{item.car} car</li>
                  <li>{item.land}</li>
                </ul>
                <p className="find-listing-card__withheld">
                  <LockIcon />
                  Address on request
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
