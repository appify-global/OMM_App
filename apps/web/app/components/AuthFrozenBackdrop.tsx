"use client";

import { useLayoutEffect, useRef } from "react";
import { readHeroScrollY } from "../lib/hero-motion";

type Props = {
  children: React.ReactNode;
};

/** Pins homepage scroll position when auth modal is open. */
export default function AuthFrozenBackdrop({ children }: Props) {
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scrollY = readHeroScrollY();
    const el = pageRef.current;
    if (!el || scrollY <= 0) return;
    el.style.transform = `translate3d(0, ${-scrollY}px, 0)`;
  }, []);

  return (
    <div ref={pageRef} className="auth-route__page" inert aria-hidden="true">
      {children}
    </div>
  );
}
