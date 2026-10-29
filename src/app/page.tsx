"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, CalendarClock, FileStack, Gauge, ListTodo, NotebookPen, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DueDate, EmptyState, LayerBadge, Panel, Pill, ProgressBar, StatusBadge } from "@/components/common";
import { avg, inRange, layerProgress, layerStats, passFilters, phaseProgress, weekRange } from "@/lib/calc";
import { LAYER_META, PHASE_IDS, PHASE_META, PRIORITY, RISK_LEVEL, RISK_STATUS, TASK_STATUS, WORK_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function Kpi({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub: string; icon: typeof Gauge; accent: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <Icon className={cn("size-4", accent)} />
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, update, filters } = useStore();
  const layers = [...data.layers].sort((a, b) => a.order - b.order);
  const { start, end } = weekRange();

  const avgProgress = avg(layers.map((l) => layerProgress(data, l)));
  const inProgressTasks = data.tasks.filter((t) => t.status === "in_progress").length;
  const blockedTasks = data.tasks.filter((t) => t.status === "blocked").length;
  const highRisks = data.risks.filter((r) => r.level === "high" && r.status !== "closed");
  const publishedAssets = data.assets.filter((a) => a.status === "published");
  const reusableAssets = data.assets.filter((a) => a.status !== "draft");

  const topRisks = data.risks
    .filter((r) => r.status !== "closed" && passFilters(filters, { ...r, tone: RISK_STATUS[r.status].tone }))
    .sort((a, b) => RISK_LEVEL[b.level].weight - RISK_LEVEL[a.level].weight || a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const todos = data.tasks
    .filter((t) => t.status !== "done" && passFilters(filters, { ...t, tone: TASK_STATUS[t.status].tone }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.priority.localeCompare(b.priority))
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="三层主线平均进度" value={`${avgProgress}%`} sub="按各主线 KR 完成度自动计算" icon={Gauge} accent="text-blue-600" />
        <Kpi label="进行中任务" value={String(inProgressTasks)} sub={`阻塞 ${blockedTasks} · 共 ${data.tasks.length} 项任务`} icon={ListTodo} accent="text-blue-600" />
        <Kpi label="高风险项（未关闭）" value={String(highRisks.length)} sub={`未关闭风险共 ${data.risks.filter((r) => r.status !== "closed").length} 项`} icon={ShieldAlert} accent="text-orange-600" />
        <Kpi label="已产出可复用资产" value={String(reusableAssets.length)} sub={`已发布 ${publishedAssets.length} · 方案卡/模板/话术包`} icon={FileStack} accent="text-emerald-600" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="三层主线进度"
          className="xl:col-span-2"
          bodyClassName="p-0"
          actions={
            <Link href="/mainlines" className="flex items-center gap-1 text-xs text-blue-700 hover:underline">
              看板 <ArrowRight className="size-3" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {layers.map((l) => {
              const p = layerProgress(data, l);
              const s = layerStats(data, l.id);
              const last = [...l.weeklyUpdates].sort((a, b) => b.date.localeCompare(a.date))[0];
              const updatedThisWeek = last && inRange(last.date, start, end);
              return (
                <Link key={l.id} href={`/mainlines/${l.id}`} className="block px-4 py-3 hover:bg-slate-50">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("h-4 w-1 rounded-full", LAYER_META[l.id].accent)} />
                    <span className="text-sm font-semibold text-slate-800">{l.name}</span>
                    <StatusBadge tone={WORK_STATUS[l.status].tone} label={WORK_STATUS[l.status].label} />
                    <span className="text-xs text-slate-500">负责人 {l.owner}</span>
                    <span className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
                      <span>
                        KR {s.krDone}/{s.krTotal}
                      </span>
                      <span className={s.openRisks ? "text-orange-700" : ""}>风险 {s.openRisks}</span>
                      <span className={updatedThisWeek ? "text-emerald-700" : "text-orange-700"}>
                        {updatedThisWeek ? `本周已更新 ${last.date.slice(5)}` : "本周未更新"}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar value={p} tone={WORK_STATUS[l.status].tone} className="h-2" />
                    <span className="w-10 text-right text-sm font-semibold tabular-nums text-slate-800">{p}%</span>
                  </div>
                  {last && <p className="mt-1.5 line-clamp-1 text-xs text-slate-500">最近进展：{last.progress}</p>}
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel title="阶段目标" icon={CalendarClock} bodyClassName="space-y-3">
          {PHASE_IDS.map((p) => {
            const v = phaseProgress(data, p);
            const krs = data.keyResults.filter((k) => k.phase === p);
            const current = data.settings.currentPhase === p;
            return (
              <div key={p} className={cn("rounded-md border p-3", current ? "border-blue-200 bg-blue-50/50" : "border-slate-200")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800">{PHASE_META[p].name}</span>
                  {current && <Pill className="border-blue-200 bg-blue-100 text-blue-800">当前</Pill>}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  {PHASE_META[p].window} · {krs.filter((k) => k.status === "done").length}/{krs.length} 条 KR 已完成
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar value={v} tone={v >= 100 ? "green" : "blue"} />
                  <span className="w-9 text-right text-xs font-semibold tabular-nums">{v}%</span>
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="最近风险 Top 5"
          icon={AlertTriangle}
          bodyClassName="p-0"
          actions={
            <Link href="/risks" className="text-xs text-blue-700 hover:underline">
              全部风险
            </Link>
          }
        >
          {!topRisks.length ? (
            <EmptyState text="没有未关闭的风险" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {topRisks.map((r) => (
                <li key={r.id} className="flex items-start gap-2 px-4 py-2.5">
                  <Pill className={RISK_LEVEL[r.level].className}>{RISK_LEVEL[r.level].label}</Pill>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800">{r.description}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">应对：{r.mitigation}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-[11px]">
                    <LayerBadge layerId={r.layerId} />
                    <span className="text-slate-500">{r.owner}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="本周待办 Top 8"
          icon={ListTodo}
          bodyClassName="p-0"
          actions={
            <Link href="/tasks" className="text-xs text-blue-700 hover:underline">
              任务看板
            </Link>
          }
        >
          {!todos.length ? (
            <EmptyState text="没有待办任务" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {todos.map((t) => (
                <li key={t.id} className="flex items-center gap-2 px-4 py-2">
                  <Pill className={PRIORITY[t.priority].className}>{t.priority}</Pill>
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-800">{t.title}</span>
                  <StatusBadge tone={TASK_STATUS[t.status].tone} label={TASK_STATUS[t.status].label} />
                  <span className="hidden w-10 text-[11px] text-slate-500 sm:inline">{t.owner}</span>
                  <span className="w-24 text-right text-[11px]">
                    <DueDate date={t.dueDate} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <HighlightsEditor key={data.settings.weeklyHighlights} value={data.settings.weeklyHighlights} onSave={(v) => update((d) => void (d.settings.weeklyHighlights = v))} />
    </div>
  );
}

function HighlightsEditor({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [text, setText] = useState(value);
  const dirty = text !== value;
  return (
    <Panel
      title="本周关键变化"
      icon={NotebookPen}
      actions={
        <>
          {dirty && <span className="text-[11px] text-orange-600">未保存</span>}
          <Button
            size="xs"
            disabled={!dirty}
            onClick={() => {
              onSave(text);
              toast.success("本周关键变化已保存，并会写入周报");
            }}
          >
            保存
          </Button>
        </>
      }
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="记录本周最值得向上同步的 3-5 条变化，例如：哪省准入推进、哪张方案卡被销售使用、哪个风险升级…"
        className="text-sm"
      />
    </Panel>
  );
}
