import type { AppData, GlobalFilters, KeyResult, LayerId, MainlineLayer, PhaseId, TimeRange, Tone } from "@/types";

const DAY = 86_400_000;

export function todayISO(): string {
  return toISO(new Date());
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  return toISO(new Date(d.getTime() + n * DAY));
}

/** 本周一 ~ 本周日 */
export function weekRange(ref: string = todayISO()): { start: string; end: string } {
  const d = new Date(ref + "T00:00:00");
  const dow = (d.getDay() + 6) % 7;
  const start = addDays(ref, -dow);
  return { start, end: addDays(start, 6) };
}

export function inRange(iso: string | undefined, start: string, end: string): boolean {
  return !!iso && iso >= start && iso <= end;
}

export function daysUntil(iso: string): number {
  return Math.round((new Date(iso + "T00:00:00").getTime() - new Date(todayISO() + "T00:00:00").getTime()) / DAY);
}

export function matchTimeRange(dueDate: string | undefined, range: TimeRange): boolean {
  if (range === "all" || !dueDate) return range === "all";
  const diff = daysUntil(dueDate);
  if (range === "overdue") return diff < 0;
  if (range === "week") {
    const { start, end } = weekRange();
    return inRange(dueDate, start, end);
  }
  if (range === "30d") return diff >= 0 && diff <= 30;
  if (range === "90d") return diff >= 0 && diff <= 90;
  return true;
}

export function krProgress(kr: Pick<KeyResult, "currentValue" | "targetValue">): number {
  if (!kr.targetValue) return 0;
  return Math.max(0, Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100)));
}

export function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/** 主线进度为存储值：可手动调整，该主线 KR 变动时由 store 按 KR 均值重算 */
export function layerProgress(_data: AppData, layer: MainlineLayer): number {
  return layer.progress;
}

export function krAverageProgress(data: AppData, layerId: LayerId): number | null {
  const krs = data.keyResults.filter((k) => k.layerId === layerId);
  return krs.length ? avg(krs.map(krProgress)) : null;
}

export function phaseProgress(data: AppData, phase: PhaseId): number {
  return avg(data.keyResults.filter((k) => k.phase === phase).map(krProgress));
}

export function layerStats(data: AppData, layerId: LayerId) {
  const krs = data.keyResults.filter((k) => k.layerId === layerId);
  const tasks = data.tasks.filter((t) => t.layerId === layerId);
  const risks = data.risks.filter((r) => r.layerId === layerId && r.status !== "closed");
  return {
    krDone: krs.filter((k) => k.status === "done").length,
    krTotal: krs.length,
    taskDone: tasks.filter((t) => t.status === "done").length,
    taskTotal: tasks.length,
    openRisks: risks.length,
    highRisks: risks.filter((r) => r.level === "high").length,
  };
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

/** 通用筛选：任何带 layerId / owner / 截止日 / 状态色调 的条目 */
export function passFilters(
  f: GlobalFilters,
  item: { layerId?: LayerId; owner?: string; dueDate?: string; tone?: Tone },
): boolean {
  if (f.layer !== "all" && item.layerId && item.layerId !== f.layer) return false;
  if (f.owner !== "all" && item.owner !== undefined && item.owner !== f.owner) return false;
  if (f.tone !== "all" && item.tone && item.tone !== f.tone) return false;
  if (f.timeRange !== "all" && !matchTimeRange(item.dueDate, f.timeRange)) return false;
  return true;
}

export function allOwners(data: AppData): string[] {
  const s = new Set<string>();
  data.layers.forEach((l) => s.add(l.owner));
  data.keyResults.forEach((k) => s.add(k.owner));
  data.tasks.forEach((t) => s.add(t.owner));
  data.risks.forEach((r) => s.add(r.owner));
  data.assets.forEach((a) => s.add(a.owner));
  return [...s].filter(Boolean).sort((a, b) => a.localeCompare(b, "zh"));
}
