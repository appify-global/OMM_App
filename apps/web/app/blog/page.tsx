import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import FindPageMasthead from "../components/FindPageMasthead";
import { fetchPosts } from "../lib/api";

export const metadata = {
  title: "Insights - MATCH",
  description: "Field notes, agent practice and market letters from MATCH.",
};

export default async function BlogPage() {
  const posts = await fetchPosts();
  const feature = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.id !== feature.id);

  return (
    <>
      <SiteHeader />
      <main className="home-find find-page">
        <div className="find-page__inner">
          <FindPageMasthead
            kicker="Insights"
            title={
              <>
                <span className="find-page__title-strong">Field notes</span>
                <span className="find-page__title-soft">
                  {" "}
                  from the private market.
                </span>
              </>
            }
            lede="Essays, primers, data and interviews - written with agents, buyers and owners across Australia."
            stats={[
              { label: "Published", value: posts.length },
              { label: "Subscribers", value: "12.4k" },
            ]}
          />

          <article className="find-page__blog-feature">
            <Link
              href={`/blog/${feature.slug}`}
              className="find-page__blog-feature-image"
              style={{ backgroundImage: `url(${feature.image})` }}
              aria-label={feature.title}
            />
            <div>
              <p className="find-page__kicker">
                {feature.category} · {feature.date}
              </p>
              <h2>
                <Link href={`/blog/${feature.slug}`}>{feature.title}</Link>
              </h2>
              <p className="find-page__blog-feature-desc">{feature.dek}</p>
              <p className="find-page__kicker">
                By {feature.author} · {feature.readTime} read
              </p>
            </div>
          </article>

          <div className="find-page__blog-grid">
            {rest.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="find-page__blog-card">
                <div
                  className="find-page__blog-card-image"
                  style={{ backgroundImage: `url(${p.image})` }}
                  aria-hidden="true"
                />
                <p className="find-page__kicker">{p.category}</p>
                <h3>{p.title}</h3>
                <p>
                  {p.author} · {p.readTime} read
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
