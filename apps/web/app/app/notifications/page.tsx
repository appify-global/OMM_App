"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import SiteFooter from "../../components/SiteFooter";

type NotificationKind =
  | "NEW_MATCH"
  | "NEW_ENQUIRY"
  | "NEW_OFFER"
  | "INSPECTION"
  | "MESSAGE"
  | "BRIEF_REPLY"
  | "REVIEW"
  | "DISPUTE"
  | "BILLING"
  | "SYSTEM";

type Notif = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  read: boolean;
  occurredAt: string;
};

const NOTIFS: Notif[] = [
  {
    id: "ntf-01",
    kind: "NEW_ENQUIRY",
    title: "New enquiry from Sarah Jenkins",
    body: "About 1240 Park Ave, Brighton — \"We loved the campaign brief, when can we view?\"",
    href: "/app/messages",
    read: false,
    occurredAt: "2h ago",
  },
  {
    id: "ntf-02",
    kind: "NEW_OFFER",
    title: "Offer received on Hawthorn City Center",
    body: "$2.05M from a pre-approved buyer — Anton Zhouk acting.",
    href: "/app/listings/lst-hawthorn-city-center",
    read: false,
    occurredAt: "4h ago",
  },
  {
    id: "ntf-03",
    kind: "INSPECTION",
    title: "Inspection booked",
    body: "Saturday 10:30am — 8 Wattle Pde, Kew. 3 buyers confirmed.",
    href: "/app/listings",
    read: false,
    occurredAt: "Yesterday",
  },
  {
    id: "ntf-04",
    kind: "REVIEW",
    title: "Sarah Jenkins left you a 5★ review",
    body: "\"He protected the vendor's privacy from day one and brought us three pre-market matches…\"",
    href: "/app/profile/reviews",
    read: false,
    occurredAt: "2 days ago",
  },
  {
    id: "ntf-05",
    kind: "DISPUTE",
    title: "DR-1042 — mediator update",
    body: "Please upload supporting evidence by Fri 25 Apr.",
    href: "/app/profile/disputes/dis-01",
    read: true,
    occurredAt: "3 days ago",
  },
  {
    id: "ntf-06",
    kind: "BILLING",
    title: "Invoice INV-20445 issued",
    body: "$890.00 due 29 Apr — SOI generation on 8 Wattle Pde.",
    href: "/app/profile/billing",
    read: true,
    occurredAt: "4 days ago",
  },
  {
    id: "ntf-07",
    kind: "BRIEF_REPLY",
    title: "Tom Reid replied to your brief",
    body: "Marshall White have a pre-market match in Kew — viewing this Saturday.",
    href: "/app/briefs",
    read: true,
    occurredAt: "5 days ago",
  },
  {
    id: "ntf-08",
    kind: "NEW_MATCH",
    title: "New match for 'Bayside family home'",
    body: "1240 Park Ave, Brighton — 96% match on your saved search.",
    href: "/app/saved/searches/ss-boroondara",
    read: true,
    occurredAt: "6 days ago",
  },
];

const KIND_LABEL: Record<NotificationKind, string> = {
  NEW_MATCH: "Match",
  NEW_ENQUIRY: "Enquiry",
  NEW_OFFER: "Offer",
  INSPECTION: "Inspection",
  MESSAGE: "Message",
  BRIEF_REPLY: "Brief",
  REVIEW: "Review",
  DISPUTE: "Dispute",
  BILLING: "Billing",
  SYSTEM: "System",
};

type Filter = "ALL" | "UNREAD" | "DEALINGS" | "PRACTICE";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [items, setItems] = useState(NOTIFS);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === "UNREAD") return !n.read;
      if (filter === "DEALINGS")
        return ["NEW_ENQUIRY", "NEW_OFFER", "MESSAGE", "BRIEF_REPLY"].includes(
          n.kind,
        );
      if (filter === "PRACTICE")
        return ["REVIEW", "DISPUTE", "BILLING", "SYSTEM"].includes(n.kind);
      return true;
    });
  }, [filter, items]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <>
      <main className="dash">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link href="/app">Home</Link>
          <span aria-hidden="true">·</span>
          <span className="dash-breadcrumb-current">Notifications</span>
        </nav>

        <header className="subpage-masthead">
          <div>
            <p className="section-kicker">
              <span className="sq sq--filled sq--sm" aria-hidden="true" />
              <span>I · Notifications</span>
            </p>
            <h1 className="subpage-title">
              The day&rsquo;s <em>headlines</em>.
            </h1>
            <p className="page-lede">
              Enquiries, offers, reviews and quiet system notes. We try not to
              tap your shoulder unless something matters.
            </p>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="dash-cta is-ghost"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          ) : null}
        </header>

        <section className="reviews-controls">
          <ul className="messages-filters" role="list">
            {(
              [
                ["ALL", `All · ${items.length}`],
                ["UNREAD", `Unread · ${unreadCount}`],
                ["DEALINGS", "Dealings"],
                ["PRACTICE", "Practice"],
              ] as const
            ).map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  className={
                    "messages-chip" + (filter === id ? " is-active" : "")
                  }
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {filtered.length === 0 ? (
          <p className="reviews-empty">
            <em>All caught up.</em>
          </p>
        ) : (
          <ul className="notif-list" role="list">
            {filtered.map((n) => (
              <li key={n.id} className={"notif-row" + (n.read ? "" : " is-unread")}>
                <Link
                  href={n.href}
                  className="notif-row-link"
                  onClick={() => markRead(n.id)}
                >
                  <div className="notif-row-head">
                    <span className="notif-row-kind">{KIND_LABEL[n.kind]}</span>
                    {!n.read ? (
                      <span className="notif-row-dot" aria-hidden="true" />
                    ) : null}
                    <span className="notif-row-time">{n.occurredAt}</span>
                  </div>
                  <p className="notif-row-title">{n.title}</p>
                  <p className="notif-row-body">{n.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
