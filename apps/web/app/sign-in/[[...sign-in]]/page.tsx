import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { clerkAuthAppearance } from "../../../lib/clerk-appearance";

import { WorkEmailAuthNotice } from "../../components/WorkEmailAuthNotice";

export default function SignInPage() {
  return (
    <main className="auth-find">
      <header className="auth-find__header">
        <Link href="/" className="auth-find__brand" aria-label="MATCH home">
          <Image
            src="/match-logo.png"
            alt="MATCH"
            width={118}
            height={22}
            priority
            className="auth-find__logo"
            style={{ width: 'auto' }}
          />
        </Link>
        <Link href="/" className="auth-find__back">
          Back to home
        </Link>
      </header>

      <section className="auth-find__shell" aria-labelledby="sign-in-heading">
        <div className="auth-find__copy">
          <h1 id="sign-in-heading" className="auth-find__title">
            Welcome back.
          </h1>
          <p className="auth-find__lede">
            <span className="auth-find__lede-strong">
              Your listings, briefs and messages.
            </span>{" "}
            <span className="auth-find__lede-soft">
              Pick up where you left off.
            </span>
          </p>
          <p className="auth-find__foot">
            New to MATCH?{" "}
            <Link href="/sign-up" className="auth-find__foot-link">
              Apply to join →
            </Link>
          </p>
        </div>

        <div className="auth-find__form">
          <WorkEmailAuthNotice />
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/app"
            appearance={clerkAuthAppearance}
          />
        </div>
      </section>
    </main>
  );
}
