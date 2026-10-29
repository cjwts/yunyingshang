"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DueDate, EmptyState, LayerBadge, Pill } from "@/components/common";
import { EntityDialog } from "@/components/entity-dialog";
import { InlineStatusSelect } from "@/components/inline-edit";
import { passFilters } from "@/lib/calc";
import { newRisk, riskFields } from "@/lib/fields";
import { RISK_LEVEL, RISK_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import type { LayerId, Risk, RiskStatus } from "@/types";

export function RiskTable({ layerId, applyFilters = true }: { layerId?: LayerId; applyFilters?: boolean }) {
  const { data, upsert, remove, filters } = useStore();
  const [editing, setEditing] = useState<{ risk: Risk; isNew: boolean } | null>(null);

  const items = data.risks
    .filter(
      (r) =>
        (!layerId || r.layerId === layerId) &&
        (!applyFilters || passFilters(filters, { ...r, tone: RISK_STATUS[r.status].tone })),
    )
    .sort(
      (a, b) =>
        Number(a.status === "closed") - Number(b.status === "closed") ||
        RISK_LEVEL[b.level].weight - RISK_LEVEL[a.level].weight ||
        a.dueDate.localeCompare(b.dueDate),
    );

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setEditing({ risk: newRisk(layerId), isNew: true })}>
          <Plus /> 新增风险
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-xs">
          <thead className="bg-slate-50 text-left text-[11px] text-slate-500">
            <tr>
              <th className="w-12 px-3 py-2 font-medium">等级</th>
              <th className="px-2 py-2 font-medium">风险描述</th>
              {!layerId && <th className="px-2 py-2 font-medium">层级</th>}
              <th className="px-2 py-2 font-medium">影响</th>
              <th className="px-2 py-2 font-medium">应对措施</th>
              <th className="px-2 py-2 font-medium">负责人</th>
              <th className="px-2 py-2 font-medium">截止日</th>
              <th className="px-2 py-2 font-medium">状态</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className={r.status === "closed" ? "border-t border-slate-100 opacity-60" : "border-t border-slate-100 hover:bg-slate-50/60"}>
                <td className="px-3 py-2">
                  <Pill className={RISK_LEVEL[r.level].className}>{RISK_LEVEL[r.level].label}</Pill>
                </td>
                <td className="max-w-72 px-2 py-2 font-medium text-slate-800">{r.description}</td>
                {!layerId && (
                  <td className="px-2 py-2">
                    <LayerBadge layerId={r.layerId} />
                  </td>
                )}
                <td className="max-w-52 px-2 py-2 text-slate-600">{r.impact}</td>
                <td className="max-w-64 px-2 py-2 text-slate-600">{r.mitigation}</td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-700">{r.owner}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <DueDate date={r.dueDate} done={r.status === "closed"} />
                </td>
                <td className="px-2 py-2">
                  <InlineStatusSelect<RiskStatus> value={r.status} meta={RISK_STATUS} onChange={(v) => upsert("risks", { ...r, status: v })} />
                </td>
                <td className="px-2 py-2">
                  <Button size="icon-xs" variant="ghost" onClick={() => setEditing({ risk: r, isNew: false })} aria-label="编辑风险">
                    <Pencil />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <EmptyState text="当前筛选条件下没有风险项" />}
      </div>
      <EntityDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "新增风险" : "编辑风险"}
        fields={riskFields}
        initial={editing?.risk ?? newRisk()}
        onSubmit={(r) => upsert("risks", r)}
        onDelete={editing && !editing.isNew ? () => remove("risks", editing.risk.id) : undefined}
      />
    </div>
  );
}
