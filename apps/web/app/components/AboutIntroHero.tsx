const stats = [
  { label: "Founded", value: "Melbourne" },
  { label: "Focus", value: "Buy-side" },
  { label: "Market", value: "Australia" },
] as const;

export default function AboutIntroHero() {
  return (
    <div className="about-hero about-hero--loaded">
      <div className="about-hero__scene" aria-hidden="true">
        <div className="hero-find__sky" />
        <div className="hero-find__sunset" />

        <div className="hero-find__clouds hero-find__clouds--text about-hero__clouds--text">
          <div className="hero-find__cloud-drift hero-find__cloud-drift--b">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--text hero-find__clouds-img--text-left"
            />
          </div>
          <div className="hero-find__cloud-drift hero-find__cloud-drift--a">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--text hero-find__clouds-img--text-right"
            />
          </div>
        </div>

        <div
          className="hero-find__clouds hero-find__clouds--front about-hero__clouds--front"
          style={{ opacity: 0.92, transform: "scale(1.08)" }}
        >
          <div className="hero-find__cloud-drift hero-find__cloud-drift--a">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--front-left"
            />
          </div>
          <div className="hero-find__cloud-drift hero-find__cloud-drift--c">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--front-center"
            />
          </div>
          <div className="hero-find__cloud-drift hero-find__cloud-drift--b">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--front-right"
            />
          </div>
          <div className="hero-find__cloud-drift hero-find__cloud-drift--d">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--front-top-left"
              style={{ opacity: 0.85, transform: "scale(1.05) scaleX(-1)" }}
            />
          </div>
          <div className="hero-find__cloud-drift hero-find__cloud-drift--e">
            <img
              src="/hero/cloud.png"
              alt=""
              width={1024}
              height={576}
              decoding="async"
              className="hero-find__clouds-img hero-find__clouds-img--front-top-right"
              style={{ opacity: 0.85, transform: "scale(1.05)" }}
            />
          </div>
        </div>
      </div>

      <div className="about-hero__content">
        <p className="find-page__kicker about-hero__kicker">About</p>
        <h1 className="about-hero__title" id="about-intro-title">
          <span className="about-hero__title-strong">A members&rsquo; network</span>
          <span className="about-hero__title-soft"> for the private market.</span>
        </h1>
        <p className="about-hero__lede">
          Private listings, buyer briefs, and introductions - before the portals.
        </p>
        <dl className="find-page__stats about-hero__stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
