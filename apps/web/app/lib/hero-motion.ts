export const HERO_PROGRESS_KEY = "match-hero-progress";
export const HERO_SCROLL_Y_KEY = "match-hero-scroll-y";

export function saveHeroMotion(progress: number) {
  try {
    sessionStorage.setItem(HERO_PROGRESS_KEY, String(progress));
    sessionStorage.setItem(HERO_SCROLL_Y_KEY, String(window.scrollY));
  } catch {
    /* private mode / quota */
  }
}

export function readHeroProgress(): number {
  try {
    const raw = sessionStorage.getItem(HERO_PROGRESS_KEY);
    const n = raw == null ? 0 : Number.parseFloat(raw);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
  } catch {
    return 0;
  }
}

export function readHeroScrollY(): number {
  try {
    const raw = sessionStorage.getItem(HERO_SCROLL_Y_KEY);
    const n = raw == null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  } catch {
    return 0;
  }
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Call right before navigating to /sign-in so auth freezes the current hero frame. */
export function snapshotHeroMotion() {
  if (typeof window === "undefined") return;

  let progress = readHeroProgress();
  const wrap = document.querySelector<HTMLElement>(".hero-find-scroll");
  if (wrap) {
    const runway = wrap.offsetHeight - window.innerHeight;
    if (runway > 0) {
      const top = wrap.getBoundingClientRect().top;
      progress = clamp01(-top / runway);
    }
  }

  saveHeroMotion(progress);
}

/** Raw scrub progress from the sticky hero runway (0–1), 1:1 with scroll distance. */
export function readHeroRunwayProgress(wrap: HTMLElement | null) {
  if (!wrap) return 0;
  const runway = wrap.offsetHeight - window.innerHeight;
  if (runway <= 0) return 0;
  const top = wrap.getBoundingClientRect().top;
  return clamp01(-top / runway);
}

type HeroScrollDriverOptions = {
  getWrap: () => HTMLElement | null;
  onProgress: (progress: number) => void;
  isReducedMotion: () => boolean;
};

/**
 * Drives hero scrub progress for the luxury scroll timeline.
 *
 * Mobile / touch: progress is **1:1 with scroll position** every frame - no lerp.
 * The timeline's segment() + easeInOut* curves already encode the "heaviness"
 * (slow dissolve, held whiteout, etc.). Extra lerp was decoupling finger travel
 * from those beats so a hard flick barely moved the scene.
 *
 * Desktop: light lerp (0.08) on trackpad/wheel for glide between sparse events.
 */
export function attachHeroScrollDriver({
  getWrap,
  onProgress,
  isReducedMotion,
}: HeroScrollDriverOptions) {
  const touchPrimary = window.matchMedia("(pointer: coarse)").matches;
  const DESKTOP_LERP = 0.08;
  const EPSILON = 0.0005;

  let raf = 0;
  let targetProgress = 0;
  let displayProgress = 0;

  const publish = (p: number) => {
    displayProgress = p;
    onProgress(p);
    saveHeroMotion(p);
  };

  const readTarget = () => {
    if (isReducedMotion()) return 0;
    return readHeroRunwayProgress(getWrap());
  };

  const tickDesktop = () => {
    targetProgress = readTarget();
    const diff = targetProgress - displayProgress;
    if (Math.abs(diff) < EPSILON) {
      publish(targetProgress);
      raf = 0;
      return;
    }
    publish(displayProgress + diff * DESKTOP_LERP);
    raf = window.requestAnimationFrame(tickDesktop);
  };

  /** Touch: lock animation to scroll heaviness - pixels in, progress out. */
  const tickTouch = () => {
    publish(readTarget());
    raf = window.requestAnimationFrame(tickTouch);
  };

  const onScroll = () => {
    const next = readTarget();
    if (touchPrimary) {
      publish(next);
      return;
    }
    targetProgress = next;
    saveHeroMotion(targetProgress);
    if (!raf) raf = window.requestAnimationFrame(tickDesktop);
  };

  publish(readTarget());

  if (touchPrimary) {
    raf = window.requestAnimationFrame(tickTouch);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (raf) window.cancelAnimationFrame(raf);
  };
}
