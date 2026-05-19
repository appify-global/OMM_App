"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const SEARCH_SHORTCUTS = [
  { label: "Filters", href: "/listings" },
  { label: "Map", href: "/listings" },
  { label: "Saved search", href: "/sign-up" },
  { label: "Buyer brief", href: "/briefs" },
] as const;

type Props = {
  variant?: "cinema" | "inline";
};

export default function HeroSearch({ variant = "inline" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isCinema = variant === "cinema";

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
  }

  return (
    <div className={`hero-search-block ${isCinema ? "hero-search-block--cinema" : ""}`}>
      <form
        className={`search-panel ${isCinema ? "search-panel--cinema" : "search-panel--inline"}`}
        onSubmit={onSubmit}
      >
        <span className="search-glyph" aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
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
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suburb, street or school zone"
          aria-label="Suburb, street or school zone"
        />
        <button className="search-submit" type="submit">
          {isCinema ? "Search" : "Search"}
        </button>
      </form>
      {!isCinema && (
        <div className="search-shortcuts" role="group" aria-label="Search tools">
          {SEARCH_SHORTCUTS.map((item) => (
            <Link key={item.label} href={item.href} className="search-shortcut">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
