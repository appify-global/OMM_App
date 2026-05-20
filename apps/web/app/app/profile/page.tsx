import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import {
  accountHealth,
  agentProfile,
  agentReviews,
  disputes,
  invoices,
  payouts,
} from "../_data/fixtures";

export default function AppProfilePage() {
  const initials = agentProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Profile</span>
        </nav>

        <header className="profile-masthead">
          <div className="profile-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Member's Folio</span>
            </p>
            <h1 className="profile-name">
              {agentProfile.name}
              <span className="profile-name-rule" aria-hidden="true" />
              <span className="profile-name-meta">{agentProfile.title}</span>
            </h1>
            <p className="profile-firm-line">
              <span className="profile-firm">{agentProfile.firm}</span>
              <span aria-hidden="true">·</span>
              <span className="profile-licence">
                Licence {agentProfile.licence}
              </span>
              <span aria-hidden="true">·</span>
              <span className="profile-verified">{agentProfile.verifiedAt}</span>
            </p>
          </div>
          <div className="profile-masthead-aside">
            <div className="profile-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="profile-rating">
              <span className="profile-rating-stars" aria-hidden="true">
                ★★★★★
              </span>
              <span className="profile-rating-text">
                <strong>{agentProfile.rating.toFixed(1)}</strong>
                <span>· {agentProfile.reviewsCount} reviews</span>
              </span>
            </div>
            <Link href="/app/profile/edit" className="profile-edit-link">
              Edit profile →
            </Link>
          </div>
        </header>

        <section className="dash-kpis" aria-label="Profile metrics">
          <KpiTile
            kicker="i"
            label="Active listings"
            value={4}
            delta={{ tone: "up", text: "+1 this month" }}
          />
          <KpiTile
            kicker="ii"
            label="Reviews"
            value={agentProfile.reviewsCount}
            delta={{
              tone: "up",
              text: agentProfile.rating.toFixed(1) + " ★ avg",
            }}
          />
          <KpiTile
            kicker="iii"
            label="Open disputes"
            value={disputes.filter((d) => d.status !== "RESOLVED").length}
            delta={{ tone: "warn", text: "DR-1042 awaiting" }}
          />
          <KpiTile
            kicker="iv"
            label="Outstanding"
            value="$890"
            delta={{ tone: "warn", text: "INV-20445" }}
          />
          <KpiTile
            kicker="v"
            label="Member since"
            value={agentProfile.joinedYear}
            delta={{ tone: "muted", text: "Pro · Tier II" }}
          />
        </section>

        {/* Bio + suburbs */}
        <section className="profile-bio">
          <p className="profile-bio-body">
            <span className="profile-pullquote" aria-hidden="true">
              ❝
            </span>
            {agentProfile.bio}
          </p>
          <dl className="profile-bio-meta">
            <div>
              <dt>Specialist suburbs</dt>
              <dd>{agentProfile.suburbs.join(" · ")}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{agentProfile.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{agentProfile.phone}</dd>
            </div>
            <div>
              <dt>ABN</dt>
              <dd>{agentProfile.abn}</dd>
            </div>
          </dl>
        </section>

        {/* Account health strip */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h3 className="dash-panel-title">Account standing</h3>
            <Link href="/app/profile/account" className="section-see-all">
              Manage →
            </Link>
          </header>
          <ul className="standing-grid">
            <Standing
              label="Identity verification"
              value="Verified · 24 Apr"
              ok={accountHealth.identityVerified}
            />
            <Standing
              label="Payments connected"
              value="NAB ••• 4218"
              ok={accountHealth.paymentsConnected}
            />
            <Standing
              label="Two-factor"
              value={accountHealth.twoFactorEnabled ? "Enabled" : "Not enabled"}
              ok={accountHealth.twoFactorEnabled}
            />
            <Standing
              label="Notifications"
              value="Push · Email · SMS"
              ok={accountHealth.notificationsEnabled}
            />
            <Standing
              label="Review responses"
              value={
                accountHealth.reviewsResponded +
                "/" +
                accountHealth.reviewsTotal +
                " replied"
              }
              ok={
                accountHealth.reviewsResponded === accountHealth.reviewsTotal
              }
            />
          </ul>
        </section>

        {/* Three section index - General / Dealings / Privacy */}
        <section className="profile-index" aria-label="Profile sections">
          <ProfileSection
            kicker="I"
            heading="General"
            lede="Account, support &amp; feedback"
            items={[
              {
                label: "Account settings",
                href: "/app/profile/account",
                hint: "Display name, email, phone, notifications",
              },
              {
                label: "Contact support",
                href: "/app/profile/support",
                hint: "We respond within one business hour",
              },
              {
                label: "Share feedback",
                href: "/app/profile/feedback",
                hint: "Help shape the roadmap",
              },
            ]}
          />
          <ProfileSection
            kicker="II"
            heading="Dealings"
            lede="Reputation &amp; reconciliation"
            items={[
              {
                label: "Reviews",
                href: "/app/profile/reviews",
                hint: agentProfile.reviewsCount + " reviews · " +
                  agentProfile.rating.toFixed(1) + " ★ average",
              },
              {
                label: "Disputes",
                href: "/app/profile/disputes",
                hint: disputes.filter((d) => d.status !== "RESOLVED").length +
                  " active · " +
                  disputes.filter((d) => d.status === "RESOLVED").length +
                  " resolved",
              },
              {
                label: "Payments & billing",
                href: "/app/profile/billing",
                hint: invoices.filter((i) => i.status === "OUTSTANDING").length +
                  " outstanding · last payout 15 Apr",
              },
            ]}
          />
          <ProfileSection
            kicker="III"
            heading="Privacy & legal"
            lede="The fine print"
            items={[
              {
                label: "Terms of service",
                href: "/app/profile/legal/terms",
                hint: "Last updated 12 Mar 2026",
              },
              {
                label: "Community guidelines",
                href: "/app/profile/legal/community",
                hint: "How we keep the marketplace civil",
              },
              {
                label: "Privacy policy",
                href: "/app/profile/legal/privacy",
                hint: "How we handle your data",
              },
              {
                label: "Delete account",
                href: "/app/profile/danger",
                hint: "30-day grace period applies",
                tone: "danger",
              },
              {
                label: "Log out",
                href: "/logout",
                hint: "Sign out of this device",
                tone: "muted",
              },
            ]}
          />
        </section>

        {/* Recent reviews preview */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h3 className="dash-panel-title">Recent correspondence</h3>
            <Link href="/app/profile/reviews" className="section-see-all">
              All {agentProfile.reviewsCount} reviews →
            </Link>
          </header>
          <ul className="reply-thread profile-reviews">
            {agentReviews.slice(0, 3).map((r, i) => (
              <li key={r.id} className="reply-item">
                <div className="reply-head">
                  <span className="reply-agent">
                    <span className="dispatch-folio">
                      No. {String(i + 1).padStart(2, "0")}
                    </span>
                    {r.reviewer}
                    <span className="reply-firm"> · {r.reviewerRole}</span>
                  </span>
                  <span className="reply-time">
                    <span className="profile-stars" aria-hidden="true">
                      {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                    </span>
                    <span> · {r.posted}</span>
                  </span>
                </div>
                <p className="reply-body">{r.body}</p>
                {r.listing ? (
                  <p className="profile-review-tag">Re. {r.listing}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {/* Billing snapshot */}
        <section className="dash-row dash-row--split">
          <article className="dash-panel">
            <header className="dash-panel-head">
              <h3 className="dash-panel-title">Recent invoices</h3>
              <Link href="/app/profile/billing" className="section-see-all">
                All →
              </Link>
            </header>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="ledger-folio">{inv.reference}</td>
                    <td>{inv.date}</td>
                    <td>{inv.description}</td>
                    <td className="ledger-amount">{inv.amount}</td>
                    <td>
                      <span className="category-tag">{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="dash-panel">
            <header className="dash-panel-head">
              <h3 className="dash-panel-title">Payouts</h3>
              <Link
                href="/app/profile/billing/payouts"
                className="section-see-all"
              >
                History →
              </Link>
            </header>
            <ul className="payout-list">
              {payouts.map((p) => (
                <li key={p.id} className="payout-row">
                  <div className="payout-row-main">
                    <span className="payout-amount">{p.amount}</span>
                    <span className="payout-dest">{p.destination}</span>
                  </div>
                  <div className="payout-row-meta">
                    <span className="payout-date">{p.date}</span>
                    <span className="category-tag">{p.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ProfileSection({
  kicker,
  heading,
  lede,
  items,
}: {
  kicker: string;
  heading: string;
  lede: string;
  items: {
    label: string;
    href: string;
    hint: string;
    tone?: "danger" | "muted";
  }[];
}) {
  return (
    <article className="profile-section">
      <header className="profile-section-head">
        <span className="profile-section-kicker">{kicker}</span>
        <h2 className="profile-section-title">{heading}</h2>
        <p
          className="profile-section-lede"
          dangerouslySetInnerHTML={{ __html: lede }}
        />
      </header>
      <ul className="profile-section-list">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className={
                "profile-section-item" +
                (item.tone === "danger" ? " is-danger" : "") +
                (item.tone === "muted" ? " is-muted" : "")
              }
            >
              <span className="profile-section-item-text">
                <span className="profile-section-item-label">{item.label}</span>
                <span className="profile-section-item-hint">{item.hint}</span>
              </span>
              <span className="profile-section-item-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Standing({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <li className={"standing-item" + (ok ? " is-ok" : " is-warn")}>
      <span className="standing-mark" aria-hidden="true">
        {ok ? "✓" : "!"}
      </span>
      <span className="standing-text">
        <span className="standing-label">{label}</span>
        <span className="standing-value">{value}</span>
      </span>
    </li>
  );
}

function KpiTile({
  kicker,
  label,
  value,
  delta,
}: {
  kicker: string;
  label: string;
  value: string | number;
  delta?: { tone: "up" | "down" | "warn" | "muted"; text: string };
}) {
  return (
    <div className="kpi-tile">
      <span className="kpi-kicker">{kicker}</span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
      {delta ? (
        <span className={"kpi-delta is-" + delta.tone}>{delta.text}</span>
      ) : null}
    </div>
  );
}
