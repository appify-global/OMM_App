"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteFooter from "../../components/SiteFooter";
import {
  threads,
  messagesShortcuts,
  type MessageThread,
} from "../_data/fixtures";

type Filter = "all" | "unread" | "buyers" | "listings" | "briefs";

const FILTERS: { id: Filter; label: string; section: string }[] = [
  { id: "all", label: "All", section: "i" },
  { id: "unread", label: "Unread", section: "ii" },
  { id: "buyers", label: "Buyers", section: "iii" },
  { id: "listings", label: "Listings", section: "iv" },
  { id: "briefs", label: "Briefs", section: "v" },
];

export default function AppMessagesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterThreads(threads, filter, query), [
    filter,
    query,
  ]);

  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Messages</span>
        </nav>

        <header className="dash-masthead">
          <div className="dash-masthead-text">
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>The Switchboard</span>
            </p>
            <h1>
              Your <em>correspondence</em>.
            </h1>
            <p className="page-lede">
              Buyers, agents, vendors. Every conversation private, every reply
              archived against its listing or brief.
            </p>
          </div>
          <div className="listing-actions">
            <Link href="/app/messages/new" className="dash-cta">
              <span className="dash-cta-mark" aria-hidden="true">＋</span>
              <span>New message</span>
            </Link>
          </div>
        </header>

        <section className="dash-kpis" aria-label="Inbox metrics">
          <KpiTile
            kicker="i"
            label="Total threads"
            value={threads.length}
            delta={{ tone: "muted", text: "Last 30 days" }}
          />
          <KpiTile
            kicker="ii"
            label="Unread"
            value={unreadCount}
            delta={
              unreadCount > 0
                ? { tone: "warn", text: "Awaiting reply" }
                : { tone: "muted", text: "All caught up" }
            }
          />
          <KpiTile
            kicker="iii"
            label="New enquiries"
            value={messagesShortcuts.newEnquiries}
            delta={{ tone: "up", text: "+1 today" }}
          />
          <KpiTile
            kicker="iv"
            label="Pending review"
            value={messagesShortcuts.pendingReviews}
            delta={{ tone: "warn", text: "Conveyancer awaiting" }}
          />
          <KpiTile
            kicker="v"
            label="Reply rate"
            value="94%"
            delta={{ tone: "up", text: "Median 22m" }}
          />
        </section>

        <section className="messages-shell">
          <aside className="messages-rail">
            <header className="messages-rail-head">
              <div className="messages-search">
                <span className="messages-search-icon" aria-hidden="true">
                  ⌕
                </span>
                <input
                  type="search"
                  className="messages-search-input"
                  placeholder="Search threads, people, listings…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search messages"
                />
              </div>

              <nav className="messages-filters" aria-label="Inbox filters">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={
                      "messages-chip" +
                      (filter === f.id ? " is-active" : "")
                    }
                    onClick={() => setFilter(f.id)}
                    aria-pressed={filter === f.id}
                  >
                    <span className="messages-chip-section">{f.section}</span>
                    <span className="messages-chip-label">{f.label}</span>
                    {f.id === "unread" && unreadCount > 0 ? (
                      <span className="messages-chip-count">{unreadCount}</span>
                    ) : null}
                  </button>
                ))}
              </nav>

              <div className="messages-shortcuts">
                <Link
                  href="/app/messages?filter=enquiries"
                  className="messages-shortcut"
                >
                  <span className="messages-shortcut-mark" aria-hidden="true">
                    <span className="sq sq--filled sq--sm" />
                  </span>
                  <span className="messages-shortcut-body">
                    <strong>{messagesShortcuts.newEnquiries} new enquiries</strong>
                    <span>Hawthorn City Center · Brighton Terrace</span>
                  </span>
                  <span className="messages-shortcut-arrow" aria-hidden="true">
                    ›
                  </span>
                </Link>
                <Link
                  href="/app/transactions"
                  className="messages-shortcut"
                >
                  <span className="messages-shortcut-mark" aria-hidden="true">
                    <span className="sq sq--outline sq--sm" />
                  </span>
                  <span className="messages-shortcut-body">
                    <strong>
                      {messagesShortcuts.pendingReviews} transactions awaiting review
                    </strong>
                    <span>Conveyancer has lodged contracts</span>
                  </span>
                  <span className="messages-shortcut-arrow" aria-hidden="true">
                    ›
                  </span>
                </Link>
              </div>
            </header>

            <ul className="thread-list">
              {filtered.length > 0 ? (
                filtered.map((t, i) => (
                  <li key={t.id}>
                    <Link
                      href={"/app/messages/" + t.id}
                      className={"thread-row" + (t.unread ? " is-unread" : "")}
                    >
                      <span className="thread-folio">
                        No. {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={
                          "thread-avatar" +
                          (t.participant.isOnline ? " is-online" : "")
                        }
                        aria-hidden="true"
                      >
                        {t.participant.initials}
                      </span>
                      <span className="thread-body">
                        <span className="thread-row-head">
                          <span className="thread-name">
                            {t.participant.name}
                            {t.participant.firm ? (
                              <span className="thread-firm">
                                {" "}
                                · {t.participant.firm}
                              </span>
                            ) : null}
                          </span>
                          <span className="thread-time">{t.lastTime}</span>
                        </span>
                        <span className="thread-context">{t.context}</span>
                        <span className="thread-preview">{t.preview}</span>
                      </span>
                      <span className="thread-meta">
                        <span className="category-tag">{t.category}</span>
                        {t.unread ? (
                          <span
                            className="thread-unread-dot"
                            aria-label="Unread"
                          />
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="thread-empty">
                  <p className="dash-empty">
                    No threads match this filter.{" "}
                    {query ? "Try a different search." : ""}
                  </p>
                </li>
              )}
            </ul>
          </aside>

          <section className="messages-canvas">
            <div className="messages-canvas-empty">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>The Switchboard</span>
              </p>
              <h2 className="messages-canvas-h2">
                Select a <em>thread</em>.
              </h2>
              <p className="messages-canvas-lede">
                Conversations are organised by listing, brief, or buyer.
                Anything sent here is private — only the participants and you
                can see it.
              </p>
              <ul className="messages-canvas-tips">
                <li>
                  <span className="dispatch-folio">No. 01</span>
                  <span>Drag &amp; drop documents directly into a reply</span>
                </li>
                <li>
                  <span className="dispatch-folio">No. 02</span>
                  <span>Use <em>/soi</em> to attach the latest SOI</span>
                </li>
                <li>
                  <span className="dispatch-folio">No. 03</span>
                  <span>
                    Use <em>/listing</em> to share a private listing card
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function filterThreads(
  list: MessageThread[],
  filter: Filter,
  query: string,
): MessageThread[] {
  const q = query.trim().toLowerCase();
  return list.filter((t) => {
    if (filter === "unread" && !t.unread) return false;
    if (filter === "buyers" && t.category !== "BUYER") return false;
    if (filter === "listings" && t.category !== "LISTING") return false;
    if (filter === "briefs" && t.category !== "BRIEF") return false;
    if (!q) return true;
    return (
      t.participant.name.toLowerCase().includes(q) ||
      t.preview.toLowerCase().includes(q) ||
      t.context.toLowerCase().includes(q)
    );
  });
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
