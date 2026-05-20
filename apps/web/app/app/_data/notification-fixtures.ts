export type NotificationKind =
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

export type NotificationListItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  read: boolean;
  occurredAt: string;
};

/** Default inbox when `DATABASE_URL` is unset (local UI dev). */
export const defaultNotificationItems: NotificationListItem[] = [
  {
    id: "ntf-01",
    kind: "NEW_ENQUIRY",
    title: "New enquiry from Sarah Jenkins",
    body: "About 1240 Park Ave, Brighton - \"We loved the campaign brief, when can we view?\"",
    href: "/app/messages",
    read: false,
    occurredAt: "2h ago",
  },
  {
    id: "ntf-02",
    kind: "NEW_OFFER",
    title: "Offer received on Hawthorn City Center",
    body: "$2.05M from a pre-approved buyer - Anton Zhouk acting.",
    href: "/app/listings/lst-hawthorn-city-center",
    read: false,
    occurredAt: "4h ago",
  },
  {
    id: "ntf-03",
    kind: "INSPECTION",
    title: "Inspection booked",
    body: "Saturday 10:30am - 8 Wattle Pde, Kew. 3 buyers confirmed.",
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
    title: "DR-1042 - mediator update",
    body: "Please upload supporting evidence by Fri 25 Apr.",
    href: "/app/profile/disputes/dis-01",
    read: true,
    occurredAt: "3 days ago",
  },
  {
    id: "ntf-06",
    kind: "BILLING",
    title: "Invoice INV-20445 issued",
    body: "$890.00 due 29 Apr - SOI generation on 8 Wattle Pde.",
    href: "/app/profile/billing",
    read: true,
    occurredAt: "4 days ago",
  },
  {
    id: "ntf-07",
    kind: "BRIEF_REPLY",
    title: "Tom Reid replied to your brief",
    body: "Marshall White have a pre-market match in Kew - viewing this Saturday.",
    href: "/app/briefs",
    read: true,
    occurredAt: "5 days ago",
  },
  {
    id: "ntf-08",
    kind: "NEW_MATCH",
    title: "New match for 'Bayside family home'",
    body: "1240 Park Ave, Brighton - 96% match on your saved search.",
    href: "/app/saved/searches/ss-boroondara",
    read: true,
    occurredAt: "6 days ago",
  },
];
