import type { ReactNode } from "react";

import { WorkEmailSessionGuard } from "../components/WorkEmailSessionGuard";
import { fetchAppShellFromBackend } from "@/lib/backend-web-loaders";

import AppShell from "./_components/AppShell";

export const dynamic = "force-dynamic";

function initialsFromName(name: string | null | undefined) {
  if (!name?.trim()) return "U";
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[1]![0]!).toUpperCase();
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  let initials = "U";
  let hasUnread = false;
  try {
    const shell = await fetchAppShellFromBackend();
    initials = initialsFromName(shell.nameForInitials);
    hasUnread = shell.hasUnreadNotifications;
  } catch {
    // Backend unset or unreachable — degrade shell gracefully
  }
  return (
    <>
      <WorkEmailSessionGuard />
      <AppShell userInitials={initials} hasUnreadNotifications={hasUnread}>
        {children}
      </AppShell>
    </>
  );
}
