"use client";

import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common";
import { RiskTable } from "@/components/risk-table";
import { LAYER_IDS, LAYER_META } from "@/lib/meta";
import { useStore } from "@/lib/store";

export default function RisksPage() {
  const { data } = useStore();
  const open = data.risks.filter((r) => r.status !== "closed");
  const high = open.filter((r) => r.level === "high");

  return (
    <div>
      <PageHeader title="风险与问题" description="按状态、等级、截止日排序；状态可在表格内直接切换。" />
      <div className="mb-3 grid gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <ShieldAlert className="size-5 text-orange-600" />
          <div>
            <div className="text-2xl font-semibold tabular-nums text-orange-700">{high.length}</div>
            <div className="text-[11px] text-orange-700/80">未关闭高风险</div>
          </div>
        </div>
        {LAYER_IDS.map((id) => {
          const n = open.filter((r) => r.layerId === id);
          return (
            <div key={id} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-[11px] text-slate-500">{LAYER_META[id].name}</div>
              <div className="mt-1 text-sm">
                <span className="font-semibold tabular-nums text-slate-900">{n.length}</span>
                <span className="text-slate-500"> 项未关闭 · 高 </span>
                <span className="font-semibold tabular-nums text-orange-700">{n.filter((r) => r.level === "high").length}</span>
              </div>
            </div>
          );
        })}
      </div>
      <RiskTable />
    </div>
  );
}
