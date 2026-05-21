"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { NotificationListItem } from "../_data/notification-fixtures";
import SiteFooter from "../../components/SiteFooter";

import { getPublicBackendOrigin } from "@/lib/backend-public-origin";

const KIND_LABEL: Record<NotificationListItem["kind"], string> = {
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

export default function NotificationsPageClient({
  initialItems,
}: {
  initialItems: NotificationListItem[];
}) {
  const { getToken } = useAuth();
  const backendBase = getPublicBackendOrigin();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [items, setItems] = useState(initialItems);
  const [marking, setMarking] = useState(false);

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

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    try {
      const token = await getToken();
      if (!backendBase || !token) return;
      await fetch(
        `${backendBase}/api/mobile/notifications/${encodeURIComponent(id)}/read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
      );
    }
  };

  const markAllRead = async () => {
    const unread = items.filter((n) => !n.read);
    if (unread.length === 0) return;
    setMarking(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const token = await getToken();
      if (!backendBase || !token) return;
      await Promise.all(
        unread.map((n) =>
          fetch(
            `${backendBase}/api/mobile/notifications/${encodeURIComponent(n.id)}/read`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ),
      );
    } finally {
      setMarking(false);
    }
  };

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
              disabled={marking}
            >
              {marking ? "Marking…" : "Mark all read"}
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
                  onClick={() => {
                    if (!n.read) void markRead(n.id);
                  }}
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
