import type { ReactNode } from "react";

import { getUnreadNotificationCount, getCurrentUser } from "@/db/queries";
import { getAppUserId } from "@/lib/auth-user";

import AppShell from "./_components/AppShell";

function initialsFromName(name: string | null | undefined) {
  if (!name?.trim()) return "U";
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[1]![0]!).toUpperCase();
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const userId = await getAppUserId();
  const u = await getCurrentUser(userId);
  const unread = await getUnreadNotificationCount(userId);
  return (
    <AppShell
      userInitials={initialsFromName(u?.name)}
      hasUnreadNotifications={unread > 0}
    >
      {children}
    </AppShell>
  );
}
