import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

import { WorkEmailAuthNotice } from "../../components/WorkEmailAuthNotice";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <header className="auth-masthead">
        <Link href="/" className="auth-wordmark">
          PreMarket
        </Link>
        <p className="auth-issue">
          Vol. I &middot; Issue 04 &middot; Apply to join
        </p>
      </header>

      <section className="auth-shell">
        <div className="auth-side">
          <p className="section-kicker">
            <span className="sq sq--filled sq--sm" aria-hidden="true" />
            <span>I &middot; Step 1 of 4</span>
          </p>
          <h1 className="auth-side-title">
            Apply to <em>join</em>.
          </h1>
          <p className="auth-side-lede">
            Membership is open to verified agents and serious buyers. We&rsquo;ll
            verify your details before activating your account.
          </p>
          <ol className="auth-stepper" role="list">
            <li className="is-current">Account &amp; password</li>
            <li>Identity &amp; role</li>
            <li>Verify phone</li>
            <li>Profile &amp; suburbs</li>
          </ol>
          <p className="auth-side-foot">
            Already a member? <Link href="/sign-in">Sign in →</Link>
          </p>
        </div>

        <div className="auth-form">
          <WorkEmailAuthNotice />
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/sign-up/step-2"
          />
        </div>
      </section>
    </main>
  );
}
