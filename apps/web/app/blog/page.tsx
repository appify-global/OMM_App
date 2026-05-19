import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { fetchPosts } from "../lib/api";

export const metadata = {
  title: "Blog — OMM",
  description: "Field notes, agent practice and market letters from the OMM editors.",
};

export default async function BlogPage() {
  const posts = await fetchPosts();
  const feature = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.id !== feature.id);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-shell">
          <header className="page-masthead">
            <div>
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Blog</span>
              </p>
              <h1>
                <em>Field notes</em> from<br />the private market.
              </h1>
              <p className="page-lede">
                Essays, primers, data and interviews. Written by our editors
                with agents, buyers and owners across Australia.
              </p>
            </div>
            <dl className="page-stats">
              <div>
                <dt>Published</dt>
                <dd>{posts.length}</dd>
              </div>
              <div>
                <dt>Subscribers</dt>
                <dd>12.4k</dd>
              </div>
            </dl>
          </header>

          <article className="blog-feature">
            <Link
              href={`/blog/${feature.slug}`}
              className="blog-feature-image"
              style={{ backgroundImage: `url(${feature.image})` }}
              aria-label={feature.title}
            />
            <div className="blog-feature-body">
              <p className="blog-feature-meta">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>{feature.category}</span>
                <span aria-hidden="true">·</span>
                <span>{feature.date}</span>
              </p>
              <h2>
                <Link
                  href={`/blog/${feature.slug}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {feature.title}
                </Link>
              </h2>
              <p>{feature.dek}</p>
              <p className="blog-feature-byline">
                By {feature.author} &middot; {feature.readTime} read
              </p>
            </div>
          </article>

          <div className="blog-grid">
            {rest.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="blog-card">
                <div
                  className="blog-card-image"
                  style={{ backgroundImage: `url(${p.image})` }}
                  aria-hidden="true"
                />
                <p className="blog-card-meta">
                  <span className="sq sq--filled sq--sm" aria-hidden="true" />
                  <span>{p.category}</span>
                </p>
                <h3>{p.title}</h3>
                <small>
                  {p.author} &middot; {p.readTime} read
                </small>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
