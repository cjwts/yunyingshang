"use client";

import { PageHeader } from "@/components/common";
import { KrTable } from "@/components/kr-table";
import { krProgress } from "@/lib/calc";
import { WORK_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import type { WorkStatus } from "@/types";

export default function ObjectivesPage() {
  const { data } = useStore();
  const counts = (Object.keys(WORK_STATUS) as WorkStatus[]).map((s) => ({
    s,
    n: data.keyResults.filter((k) => k.status === s).length,
  }));
  const lowConfidence = data.keyResults.filter((k) => k.confidence === "low").length;
  const avg = data.keyResults.length
    ? Math.round(data.keyResults.reduce((a, k) => a + krProgress(k), 0) / data.keyResults.length)
    : 0;

  return (
    <div>
      <PageHeader
        title="目标与 KR"
        description="按三层主线分组。当前值、状态、置信度可直接在表格内修改（回车或失焦保存）；其他字段点右侧编辑。"
      />
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <Summary label="KR 总数" value={data.keyResults.length} />
        <Summary label="平均完成度" value={`${avg}%`} />
        {counts.map(({ s, n }) => (
          <Summary key={s} label={WORK_STATUS[s].label} value={n} tone={WORK_STATUS[s].tone} />
        ))}
        <Summary label="低置信度" value={lowConfidence} tone={lowConfidence ? "orange" : undefined} />
      </div>
      <KrTable />
    </div>
  );
}

const TONE_TEXT = { gray: "text-slate-600", blue: "text-blue-700", orange: "text-orange-700", green: "text-emerald-700" };

function Summary({ label, value, tone }: { label: string; value: number | string; tone?: keyof typeof TONE_TEXT }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${tone ? TONE_TEXT[tone] : "text-slate-900"}`}>{value}</span>
    </div>
  );
}
