import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../../../components/SiteFooter";
import { getLegalDoc, legalDocs } from "../../../_data/fixtures";

type Params = { params: Promise<{ doc: string }> };

export async function generateStaticParams() {
  return Object.keys(legalDocs).map((doc) => ({ doc }));
}

export default async function LegalDocPage({ params }: Params) {
  const { doc } = await params;
  const data = getLegalDoc(doc);
  if (!data) notFound();

  const otherDocs = Object.values(legalDocs).filter((d) => d.slug !== doc);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/profile">Profile</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">{data.title}</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>{data.kicker}</span>
            </p>
            <h1 className="subpage-title">
              {data.title.split(" ").slice(0, -1).join(" ")}{" "}
              <em>{data.title.split(" ").slice(-1)[0]}</em>.
            </h1>
            <p className="page-lede">{data.intro}</p>
            <p className="legal-updated">{data.updated}</p>
          </div>
        </header>

        <section className="legal-grid">
          <article className="legal-body">
            {data.sections.map((s, i) => (
              <section key={s.title} className="legal-section">
                <header className="legal-section-head">
                  <span className="legal-section-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="legal-section-title">{s.title}</h2>
                </header>
                <div className="legal-section-body">
                  {s.body.map((p, j) => (
                    <p key={j} className="legal-section-p">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          <aside className="legal-rail">
            <p className="legal-rail-kicker">More documents</p>
            <ul className="legal-rail-list" role="list">
              {otherDocs.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/app/profile/legal/${d.slug}`}
                    className="legal-rail-link"
                  >
                    <span>{d.title}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="legal-rail-kicker">Need a hand?</p>
            <Link
              href="/app/profile/support"
              className="legal-rail-link"
            >
              <span>Contact support</span>
              <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
