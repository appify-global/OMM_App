import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { DisputeDetail, DisputeListRow } from '@/lib/disputes-mock';
import {
  appendAgentDisputeResponse,
  buildDisputeListRows,
  loadDisputeSnapshots,
  mergeDisputeDetail,
  raiseAgentDispute,
  withdrawAgentDispute,
  type RaiseDisputeInput,
} from '@/lib/agent-disputes';

type Ctx = {
  rows: DisputeListRow[];
  ready: boolean;
  refresh: () => Promise<void>;
  getDetail: (id: string) => DisputeDetail | null;
  raiseDispute: (input: RaiseDisputeInput) => Promise<string>;
  appendResponse: (id: string, message: string) => Promise<boolean>;
  withdrawDispute: (id: string) => Promise<boolean>;
};

const AgentDisputesContext = createContext<Ctx | null>(null);

export function AgentDisputesProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<Record<string, DisputeDetail>>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const rows = await loadDisputeSnapshots();
    setSnapshots(rows);
  }, []);

  useEffect(() => {
    let alive = true;
    loadDisputeSnapshots()
      .then((s) => {
        if (alive) setSnapshots(s);
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => buildDisputeListRows(snapshots), [snapshots]);

  const getDetail = useCallback(
    (id: string) => mergeDisputeDetail(id, snapshots),
    [snapshots],
  );

  const raiseDispute = useCallback(async (input: RaiseDisputeInput) => {
    const id = await raiseAgentDispute(input);
    await refresh();
    return id;
  }, [refresh]);

  const appendResponse = useCallback(
    async (id: string, message: string) => {
      const ok = await appendAgentDisputeResponse(id, message);
      if (ok) await refresh();
      return ok;
    },
    [refresh],
  );

  const withdrawDisputeFn = useCallback(
    async (id: string) => {
      const ok = await withdrawAgentDispute(id);
      if (ok) await refresh();
      return ok;
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      rows,
      ready,
      refresh,
      getDetail,
      raiseDispute,
      appendResponse,
      withdrawDispute: withdrawDisputeFn,
    }),
    [appendResponse, getDetail, raiseDispute, ready, refresh, rows, withdrawDisputeFn],
  );

  return <AgentDisputesContext.Provider value={value}>{children}</AgentDisputesContext.Provider>;
}

export function useAgentDisputes() {
  const ctx = useContext(AgentDisputesContext);
  if (!ctx) {
    throw new Error('useAgentDisputes must be used within AgentDisputesProvider');
  }
  return ctx;
}
