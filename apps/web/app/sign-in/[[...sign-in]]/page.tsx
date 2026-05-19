import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <header className="auth-masthead">
        <Link href="/" className="auth-wordmark">
          Off the Market Match
        </Link>
        <p className="auth-issue">
          Vol. I &middot; Issue 04 &middot; Sign in
        </p>
      </header>

      <section className="auth-shell">
        <div className="auth-side">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>I &middot; Sign in</span>
          </p>
          <h1 className="auth-side-title">
            Welcome <em>back</em>.
          </h1>
          <p className="auth-side-lede">
            Pick up where you left off &mdash; your listings, briefs and
            messages are waiting.
          </p>
          <p className="auth-side-foot">
            New to Off the Market Match?{" "}
            <Link href="/sign-up">Apply to join →</Link>
          </p>
        </div>

        <div className="auth-form">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/app"
          />
        </div>
      </section>
    </main>
  );
}
