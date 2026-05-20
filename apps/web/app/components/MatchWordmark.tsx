import Link from "next/link";

type Props = {
  variant?: "header" | "hero" | "scroll";
  asLink?: boolean;
};

/** FIND-inspired wordmark - bold MATCH with arrow on the A (like FIND’s F). */
export default function MatchWordmark({ variant = "header", asLink = true }: Props) {
  const className = `match-wordmark match-wordmark--${variant}`;

  const mark = (
    <span className={className}>
      M<span className="match-wordmark-glyph" aria-hidden="true">
        ↳
      </span>
      TCH
    </span>
  );

  if (!asLink) return mark;

  return (
    <Link href="/" className="match-wordmark-link" aria-label="MATCH home">
      {mark}
    </Link>
  );
}
