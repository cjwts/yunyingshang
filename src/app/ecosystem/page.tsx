"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DueDate, EmptyState, PageHeader, Pill, ProgressBar, StatusBadge } from "@/components/common";
import { EntityDialog } from "@/components/entity-dialog";
import { InlineStatusSelect } from "@/components/inline-edit";
import { passFilters } from "@/lib/calc";
import { newProvince, provinceFields } from "@/lib/fields";
import { ENTRY_TYPE, MATERIAL_STATUS, WORK_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import type { ProvinceEcosystem, WorkStatus } from "@/types";

export default function EcosystemPage() {
  const { data, upsert, remove, filters } = useStore();
  const [province, setProvince] = useState("all");
  const [editing, setEditing] = useState<{ pv: ProvinceEcosystem; isNew: boolean } | null>(null);

  const items = data.provinces.filter(
    (p) =>
      (province === "all" || p.province === province) &&
      passFilters({ ...filters, layer: "all" }, { owner: p.contact, dueDate: p.dueDate, tone: WORK_STATUS[p.status].tone }),
  );

  return (
    <div>
      <PageHeader
        title="Token 生态准入"
        description="一省一策：按省份跟踪入口类型、准入条件满足度、缺口与材料包。归属业务回血线。"
        actions={
          <Button size="sm" variant="outline" onClick={() => setEditing({ pv: newProvince(), isNew: true })}>
            <Plus /> 新增省份
          </Button>
        }
      />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {["all", ...data.provinces.map((p) => p.province)].map((p) => (
          <button
            key={p}
            onClick={() => setProvince(p)}
            className={`h-7 rounded-md border px-2.5 text-xs ${
              province === p ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p === "all" ? "全部省份" : p}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[1100px] text-xs">
          <thead className="bg-slate-50 text-left text-[11px] text-slate-500">
            <tr>
              {["省份", "入口类型", "条件满足度", "缺口项", "材料包", "对接人", "当前阶段", "下一步", "截止日", "状态", ""].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-3 py-2 font-semibold text-slate-800">{p.province}</td>
                <td className="px-3 py-2">
                  <Pill>{ENTRY_TYPE[p.entryType]}</Pill>
                </td>
                <td className="w-36 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={p.conditionFit} tone={p.conditionFit >= 80 ? "green" : p.conditionFit >= 50 ? "blue" : "orange"} />
                    <span className="w-8 text-right tabular-nums">{p.conditionFit}%</span>
                  </div>
                </td>
                <td className="max-w-56 px-3 py-2 text-slate-600">{p.gaps || "—"}</td>
                <td className="px-3 py-2">
                  <StatusBadge tone={MATERIAL_STATUS[p.materialStatus].tone} label={MATERIAL_STATUS[p.materialStatus].label} />
                </td>
                <td className="px-3 py-2 text-slate-700">{p.contact}</td>
                <td className="px-3 py-2 text-slate-700">{p.stage}</td>
                <td className="max-w-56 px-3 py-2 text-slate-600">{p.nextStep}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <DueDate date={p.dueDate} done={p.status === "done"} />
                </td>
                <td className="px-3 py-2">
                  <InlineStatusSelect<WorkStatus> value={p.status} meta={WORK_STATUS} onChange={(v) => upsert("provinces", { ...p, status: v })} />
                </td>
                <td className="px-3 py-2">
                  <Button size="icon-xs" variant="ghost" onClick={() => setEditing({ pv: p, isNew: false })} aria-label="编辑省份">
                    <Pencil />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <EmptyState text="当前筛选条件下没有省份记录" />}
      </div>
      <EntityDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "新增省份" : "编辑省份准入"}
        fields={provinceFields}
        initial={editing?.pv ?? newProvince()}
        onSubmit={(pv) => upsert("provinces", { ...pv, conditionFit: Math.max(0, Math.min(100, Number(pv.conditionFit))) })}
        onDelete={editing && !editing.isNew ? () => remove("provinces", editing.pv.id) : undefined}
      />
    </div>
  );
}
