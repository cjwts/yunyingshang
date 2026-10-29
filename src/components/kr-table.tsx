"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DueDate, EmptyState, LayerBadge, ProgressBar } from "@/components/common";
import { EntityDialog } from "@/components/entity-dialog";
import { InlineNumber, InlineStatusSelect, InlineTextSelect } from "@/components/inline-edit";
import { krProgress, passFilters } from "@/lib/calc";
import { krFields, newKr } from "@/lib/fields";
import { CONFIDENCE, LAYER_IDS, LAYER_META, PHASE_META, WORK_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import type { Confidence, KeyResult, LayerId, WorkStatus } from "@/types";

export function KrTable({ layerId, applyFilters = true }: { layerId?: LayerId; applyFilters?: boolean }) {
  const { data, upsert, remove, filters } = useStore();
  const [editing, setEditing] = useState<{ kr: KeyResult; isNew: boolean } | null>(null);

  const visible = data.keyResults.filter(
    (k) =>
      (!layerId || k.layerId === layerId) &&
      (!applyFilters || passFilters(filters, { ...k, tone: WORK_STATUS[k.status].tone })),
  );
  const groups = (layerId ? [layerId] : LAYER_IDS).map((id) => ({ id, items: visible.filter((k) => k.layerId === id) }));

  const patch = (kr: KeyResult, p: Partial<KeyResult>) => upsert("keyResults", { ...kr, ...p });

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setEditing({ kr: newKr(layerId), isNew: true })}>
          <Plus /> 新增 KR
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[960px] text-xs">
          <thead className="bg-slate-50 text-left text-[11px] text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">KR 名称</th>
              {!layerId && <th className="px-2 py-2 font-medium">层级</th>}
              <th className="px-2 py-2 font-medium">当前 / 目标</th>
              <th className="w-36 px-2 py-2 font-medium">进度</th>
              <th className="px-2 py-2 font-medium">负责人</th>
              <th className="px-2 py-2 font-medium">截止日</th>
              <th className="px-2 py-2 font-medium">状态</th>
              <th className="px-2 py-2 font-medium">置信度</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <GroupRows key={g.id} show={!layerId} layerId={g.id} count={g.items.length}>
                {g.items.map((k) => {
                  const p = krProgress(k);
                  return (
                    <tr key={k.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-800">{k.name}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400">{PHASE_META[k.phase].name}</div>
                      </td>
                      {!layerId && (
                        <td className="px-2 py-2">
                          <LayerBadge layerId={k.layerId} />
                        </td>
                      )}
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <InlineNumber value={k.currentValue} onCommit={(v) => patch(k, { currentValue: v })} />/
                          <span className="tabular-nums">{k.targetValue}</span>
                          <span>{k.unit}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={p} tone={WORK_STATUS[k.status].tone} />
                          <span className="w-8 text-right tabular-nums text-slate-600">{p}%</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-slate-700">{k.owner}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <DueDate date={k.dueDate} done={k.status === "done"} />
                      </td>
                      <td className="px-2 py-2">
                        <InlineStatusSelect<WorkStatus> value={k.status} meta={WORK_STATUS} onChange={(v) => patch(k, { status: v })} />
                      </td>
                      <td className="px-2 py-2">
                        <InlineTextSelect<Confidence>
                          value={k.confidence}
                          onChange={(v) => patch(k, { confidence: v })}
                          options={(Object.keys(CONFIDENCE) as Confidence[]).map((c) => ({
                            value: c,
                            label: CONFIDENCE[c].label,
                            className: CONFIDENCE[c].className,
                          }))}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Button size="icon-xs" variant="ghost" onClick={() => setEditing({ kr: k, isNew: false })} aria-label="编辑 KR">
                          <Pencil />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </GroupRows>
            ))}
          </tbody>
        </table>
        {!visible.length && <EmptyState text="当前筛选条件下没有 KR" />}
      </div>
      <EntityDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "新增 KR" : "编辑 KR"}
        fields={krFields}
        initial={editing?.kr ?? newKr()}
        onSubmit={(kr) => upsert("keyResults", { ...kr, targetValue: Number(kr.targetValue), currentValue: Number(kr.currentValue) })}
        onDelete={editing && !editing.isNew ? () => remove("keyResults", editing.kr.id) : undefined}
      />
    </div>
  );
}

function GroupRows({ show, layerId, count, children }: { show: boolean; layerId: LayerId; count: number; children: React.ReactNode }) {
  if (!show) return <>{children}</>;
  if (!count) return null;
  return (
    <>
      <tr className="border-t border-slate-200 bg-slate-50/70">
        <td colSpan={9} className="px-3 py-1.5 text-[11px] font-semibold text-slate-600">
          {LAYER_META[layerId].name} · {count} 条
        </td>
      </tr>
      {children}
    </>
  );
}
