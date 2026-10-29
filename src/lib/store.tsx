"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { krProgress, todayISO } from "@/lib/calc";
import { dataService } from "@/lib/dataService";
import type { AppData, GlobalFilters } from "@/types";

type Collection = "keyResults" | "tasks" | "milestones" | "risks" | "assets" | "fdeTracks" | "provinces";
type ItemOf<C extends Collection> = AppData[C][number];

interface StoreValue {
  data: AppData;
  update: (mutate: (draft: AppData) => void) => void;
  upsert: <C extends Collection>(collection: C, item: ItemOf<C>) => void;
  remove: (collection: Collection, id: string) => void;
  reset: () => Promise<void>;
  filters: GlobalFilters;
  setFilters: (f: GlobalFilters) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export const DEFAULT_FILTERS: GlobalFilters = { layer: "all", owner: "all", tone: "all", timeRange: "all" };

/** 写入前统一维护派生字段：KR 进度与历史、任务完成时间 */
function normalize(prev: AppData, next: AppData): AppData {
  const today = todayISO();
  const prevKr = new Map(prev.keyResults.map((k) => [k.id, k]));
  next.keyResults = next.keyResults.map((k) => {
    const old = prevKr.get(k.id);
    const history = [...(k.history ?? [])];
    const last = history[history.length - 1];
    if (!old || old.currentValue !== k.currentValue || !last) {
      if (last && last.date === today) history[history.length - 1] = { date: today, value: k.currentValue };
      else if (!last || last.value !== k.currentValue) history.push({ date: today, value: k.currentValue });
    }
    return { ...k, progress: krProgress(k), history };
  });
  next.tasks = next.tasks.map((t) => {
    if (t.status === "done" && !t.completedAt) return { ...t, completedAt: today };
    if (t.status !== "done" && t.completedAt) return { ...t, completedAt: undefined };
    return t;
  });
  return next;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS);
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await dataService.load();
      const initial = stored ?? (await dataService.reset());
      if (!cancelled) {
        loaded.current = true;
        setData(initial);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (data && loaded.current) void dataService.save(data);
  }, [data]);

  const update = useCallback((mutate: (draft: AppData) => void) => {
    setData((prev) => {
      if (!prev) return prev;
      const draft = structuredClone(prev);
      mutate(draft);
      return normalize(prev, draft);
    });
  }, []);

  const upsert = useCallback(
    <C extends Collection>(collection: C, item: ItemOf<C>) =>
      update((d) => {
        const list = d[collection] as ItemOf<C>[];
        const idx = list.findIndex((x) => x.id === item.id);
        if (idx >= 0) list[idx] = item;
        else list.push(item);
      }),
    [update],
  );

  const remove = useCallback(
    (collection: Collection, id: string) =>
      update((d) => {
        (d[collection] as { id: string }[]) = (d[collection] as { id: string }[]).filter((x) => x.id !== id);
      }),
    [update],
  );

  const reset = useCallback(async () => {
    setData(await dataService.reset());
    setFilters(DEFAULT_FILTERS);
  }, []);

  const value = useMemo(
    () => (data ? { data, update, upsert, remove, reset, filters, setFilters } : null),
    [data, update, upsert, remove, reset, filters],
  );

  if (!value) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">正在加载本地数据…</div>
    );
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
