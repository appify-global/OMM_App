"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef } from "react";
import { clerkAuthAppearance } from "../../lib/clerk-appearance";

type AuthMode = "sign-in" | "sign-up";

type Props = {
  mode: AuthMode;
};

export default function AuthModalShell({ mode }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isSignIn = mode === "sign-in";

  const close = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return (
    <div
      className="auth-modal__scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="auth-modal__close"
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>

        <header className="auth-modal__head">
          <Link href="/" className="auth-modal__brand" aria-label="MATCH home">
            <Image
              src="/match-logo.png"
              alt="MATCH"
              width={118}
              height={22}
              priority
              className="auth-modal__logo"
            />
          </Link>
          <h1 id={titleId} className="auth-modal__title">
            {isSignIn ? "Welcome back." : "Apply to join."}
          </h1>
          <p className="auth-modal__lede">
            {isSignIn ? (
              <>
                <span className="auth-modal__lede-strong">
                  Your listings, briefs and messages.
                </span>{" "}
                <span className="auth-modal__lede-soft">
                  Pick up where you left off.
                </span>
              </>
            ) : (
              <>
                <span className="auth-modal__lede-strong">
                  Membership for verified buyers and agents.
                </span>{" "}
                <span className="auth-modal__lede-soft">
                  We&rsquo;ll verify your details before activating access.
                </span>
              </>
            )}
          </p>
        </header>

        <div className="auth-modal__clerk">
          {isSignIn ? (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/app"
              appearance={clerkAuthAppearance}
            />
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/sign-up/step-2"
              appearance={clerkAuthAppearance}
            />
          )}
        </div>

        <p className="auth-modal__swap">
          {isSignIn ? (
            <>
              New to MATCH?{" "}
              <Link href="/sign-up" className="auth-modal__swap-link">
                Apply to join →
              </Link>
            </>
          ) : (
            <>
              Already a member?{" "}
              <Link href="/sign-in" className="auth-modal__swap-link">
                Sign in →
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
