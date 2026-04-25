import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../../components/SiteFooter";
import {
  getThreadById,
  threads,
  type Message,
} from "../../_data/fixtures";
import ThreadComposer from "./ThreadComposer";

type Params = Promise<{ id: string }>;

export default async function ThreadDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const thread = getThreadById(id);
  if (!thread) notFound();

  const groupedMessages = groupByDate(thread.messages);

  const otherThreads = threads.filter((t) => t.id !== thread.id).slice(0, 4);

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/app/messages">Messages</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">
            {thread.participant.name}
          </span>
        </nav>

        <header className="thread-header">
          <div className="thread-header-main">
            <Link
              href="/app/messages"
              className="thread-back"
              aria-label="Back to messages"
            >
              ←
            </Link>
            <span
              className={
                "thread-avatar thread-avatar--lg" +
                (thread.participant.isOnline ? " is-online" : "")
              }
              aria-hidden="true"
            >
              {thread.participant.initials}
            </span>
            <div className="thread-header-text">
              <p className="section-kicker">
                <span className="sq sq--filled sq--sm" aria-hidden="true" />
                <span>{thread.category}</span>
              </p>
              <h1 className="thread-title">
                {thread.participant.name}
                {thread.participant.firm ? (
                  <span className="thread-title-firm">
                    {" "}
                    · {thread.participant.firm}
                  </span>
                ) : null}
              </h1>
              <p className="thread-context-line">
                <span className="thread-context-label">Re.</span>{" "}
                {thread.context}
                <span
                  className={
                    "thread-presence" +
                    (thread.participant.isOnline ? " is-online" : "")
                  }
                >
                  {thread.participant.isOnline ? "Active now" : "Offline"}
                </span>
              </p>
            </div>
          </div>

          <div className="thread-header-actions">
            <button type="button" className="thread-action-btn">
              View listing
            </button>
            <button type="button" className="thread-action-btn is-ghost">
              Pin
            </button>
            <button type="button" className="thread-action-btn is-ghost">
              ⋯
            </button>
          </div>
        </header>

        <section className="thread-shell">
          <article className="thread-canvas" aria-label="Conversation">
            <ol className="thread-stream" role="list">
              {groupedMessages.map((group) => (
                <li key={group.label} className="thread-group">
                  <div className="thread-date" aria-hidden="true">
                    <span className="thread-date-rule" />
                    <span className="thread-date-label">{group.label}</span>
                    <span className="thread-date-rule" />
                  </div>
                  <ul className="thread-entries" role="list">
                    {group.messages.map((m, i, arr) => {
                      const prev = arr[i - 1];
                      const isFirstOfRun =
                        !prev || prev.direction !== m.direction;
                      const isIn = m.direction === "IN";
                      const senderName = isIn
                        ? thread.participant.name
                        : "You";
                      return (
                        <li
                          key={m.id}
                          className={
                            "thread-entry is-" +
                            m.direction.toLowerCase() +
                            (isFirstOfRun ? " is-run-first" : "")
                          }
                        >
                          {isFirstOfRun ? (
                            <header className="thread-entry-head">
                              <span className="thread-entry-name">
                                {senderName}
                              </span>
                              <span className="thread-entry-rule" aria-hidden="true" />
                              <span className="thread-entry-time">{m.time}</span>
                            </header>
                          ) : null}
                          {m.body ? (
                            <p className="thread-entry-body">{m.body}</p>
                          ) : null}
                          {m.attachments && m.attachments.length > 0 ? (
                            <ul className="thread-attachments" role="list">
                              {m.attachments.map((a) => (
                                <li
                                  key={a.id}
                                  className="thread-attachment"
                                >
                                  <span
                                    className="thread-attachment-kind"
                                    aria-hidden="true"
                                  >
                                    {a.kind}
                                  </span>
                                  <span className="thread-attachment-body">
                                    <span className="thread-attachment-name">
                                      {a.filename}
                                    </span>
                                    {a.caption ? (
                                      <span className="thread-attachment-caption">
                                        {a.caption}
                                      </span>
                                    ) : null}
                                  </span>
                                  <span
                                    className="thread-attachment-icon"
                                    aria-hidden="true"
                                  >
                                    ↓
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>

            <ThreadComposer recipient={thread.participant.name} />
          </article>

          <aside className="thread-rail" aria-label="Thread context">
            <section className="dash-panel">
              <header className="dash-panel-head">
                <h3 className="dash-panel-title">Conversation particulars</h3>
              </header>
              <dl className="brief-particulars">
                <div>
                  <dt>Category</dt>
                  <dd>{thread.category}</dd>
                </div>
                <div>
                  <dt>Context</dt>
                  <dd>{thread.context}</dd>
                </div>
                <div>
                  <dt>Participant</dt>
                  <dd>
                    {thread.participant.name}
                    {thread.participant.firm
                      ? " · " + thread.participant.firm
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    {thread.participant.isOnline
                      ? "Active now"
                      : "Last seen recently"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="dash-panel">
              <header className="dash-panel-head">
                <h3 className="dash-panel-title">Quick attach</h3>
              </header>
              <div className="thread-quick-attach">
                <button type="button" className="thread-quick-btn">
                  <span className="thread-quick-mark">SOI</span>
                  <span>Latest SOI</span>
                </button>
                <button type="button" className="thread-quick-btn">
                  <span className="thread-quick-mark">⌂</span>
                  <span>Listing card</span>
                </button>
                <button type="button" className="thread-quick-btn">
                  <span className="thread-quick-mark">§</span>
                  <span>Contract pack</span>
                </button>
                <button type="button" className="thread-quick-btn">
                  <span className="thread-quick-mark">▢</span>
                  <span>Floor plan</span>
                </button>
              </div>
            </section>

            <section className="dash-panel">
              <header className="dash-panel-head">
                <h3 className="dash-panel-title">Other threads</h3>
                <Link href="/app/messages" className="section-see-all">
                  All →
                </Link>
              </header>
              <ul className="thread-mini-list">
                {otherThreads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={"/app/messages/" + t.id}
                      className="thread-mini-row"
                    >
                      <span className="thread-mini-avatar" aria-hidden="true">
                        {t.participant.initials}
                      </span>
                      <span className="thread-mini-body">
                        <span className="thread-mini-name">
                          {t.participant.name}
                        </span>
                        <span className="thread-mini-preview">{t.preview}</span>
                      </span>
                      <span className="thread-mini-time">{t.lastTime}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function groupByDate(
  messages: Message[],
): { label: string; messages: Message[] }[] {
  const groups: { label: string; messages: Message[] }[] = [];
  let current: { label: string; messages: Message[] } | null = null;
  for (const m of messages) {
    if (m.dateGroup) {
      current = { label: m.dateGroup, messages: [m] };
      groups.push(current);
    } else if (current) {
      current.messages.push(m);
    } else {
      current = { label: "TODAY", messages: [m] };
      groups.push(current);
    }
  }
  return groups;
}
