"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, User } from "lucide-react";
import { PageHeader, ProgressBar, StatusBadge } from "@/components/common";
import { layerProgress, layerStats } from "@/lib/calc";
import { LAYER_META, WORK_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function MainlinesPage() {
  const { data, filters } = useStore();
  const layers = [...data.layers]
    .sort((a, b) => a.order - b.order)
    .filter((l) => filters.layer === "all" || l.id === filters.layer)
    .filter((l) => filters.owner === "all" || l.owner === filters.owner || l.participants.includes(filters.owner))
    .filter((l) => filters.tone === "all" || WORK_STATUS[l.status].tone === filters.tone);

  return (
    <div>
      <PageHeader title="三层主线" description="业务回血 → 生态位构建 → 阿里总部价值体现。点击卡片查看主线详情、KR、任务、风险与周更新。" />
      <div className="grid gap-4 lg:grid-cols-3">
        {layers.map((l, i) => {
          const p = layerProgress(data, l);
          const s = layerStats(data, l.id);
          const lastUpdate = [...l.weeklyUpdates].sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? l.updatedAt;
          return (
            <Link
              key={l.id}
              href={`/mainlines/${l.id}`}
              className="group flex flex-col rounded-lg border border-slate-200 bg-white transition-colors hover:border-blue-300"
            >
              <div className={cn("h-1 rounded-t-lg", LAYER_META[l.id].accent)} />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400">第 {i + 1} 层</span>
                  <StatusBadge tone={WORK_STATUS[l.status].tone} label={WORK_STATUS[l.status].label} />
                </div>
                <h2 className="mt-1 text-base font-semibold text-slate-900">{l.name}</h2>
                <div className="flex-1">
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{l.positioning}</p>
                  <div className="mt-3 rounded-md border-l-2 border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[11px] leading-relaxed">
                    <span className="font-medium text-slate-500">当前阶段：</span>
                    <span className="text-slate-700">{l.currentStage}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={p} tone={WORK_STATUS[l.status].tone} className="h-2" />
                  <span className="text-lg font-semibold tabular-nums text-slate-900">{p}%</span>
                </div>

                <dl className="mt-4 mb-4 grid grid-cols-3 gap-2 text-center">
                  <Stat label="KR 完成" value={`${s.krDone}/${s.krTotal}`} />
                  <Stat label="任务完成" value={`${s.taskDone}/${s.taskTotal}`} />
                  <Stat label="未关闭风险" value={String(s.openRisks)} warn={s.highRisks > 0} />
                </dl>

                <div className="flex items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {l.owner}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" /> 最近更新 {lastUpdate}
                  </span>
                  <ArrowRight className="ml-auto size-3.5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {!layers.length && <p className="py-10 text-center text-xs text-slate-400">当前筛选条件下没有主线</p>}
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-md bg-slate-50 py-2">
      <dd className={cn("text-sm font-semibold tabular-nums", warn ? "text-orange-700" : "text-slate-800")}>{value}</dd>
      <dt className="text-[11px] text-slate-500">{label}</dt>
    </div>
  );
}
