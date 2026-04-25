import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="splash-page">
      <div className="splash-mark" aria-hidden="true">
        <span className="sq sq--filled" />
        <span className="sq sq--filled" />
      </div>
      <p className="splash-wordmark">PreMarket</p>
      <p className="splash-tagline">
        <em>Off-market property,</em> before it reaches the listings.
      </p>
      <Link href="/welcome" className="splash-link">
        Enter →
      </Link>
    </main>
  );
}
