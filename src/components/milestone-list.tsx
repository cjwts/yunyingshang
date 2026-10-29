"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LayerBadge, StatusBadge } from "@/components/common";
import { EntityDialog } from "@/components/entity-dialog";
import { daysUntil, passFilters } from "@/lib/calc";
import { milestoneFields, newMilestone } from "@/lib/fields";
import { TONE_CLASS, WORK_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { LayerId, Milestone } from "@/types";

export function MilestoneList({ layerId, applyFilters = true }: { layerId?: LayerId; applyFilters?: boolean }) {
  const { data, upsert, remove, filters } = useStore();
  const [editing, setEditing] = useState<{ ms: Milestone; isNew: boolean } | null>(null);

  const items = data.milestones
    .filter(
      (m) =>
        (!layerId || m.layerId === layerId) &&
        (!applyFilters || passFilters(filters, { layerId: m.layerId, dueDate: m.date, tone: WORK_STATUS[m.status].tone })),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setEditing({ ms: newMilestone(layerId), isNew: true })}>
          <Plus /> 新增里程碑
        </Button>
      </div>
      {!items.length ? (
        <EmptyState text="暂无里程碑" />
      ) : (
        <ol className="relative ml-2 border-l border-slate-200">
          {items.map((m) => {
            const d = daysUntil(m.date);
            const tone = WORK_STATUS[m.status].tone;
            return (
              <li key={m.id} className="group relative pb-4 pl-5 last:pb-0">
                <span className={cn("absolute top-1 -left-[5px] size-2.5 rounded-full ring-4 ring-white", TONE_CLASS[tone].dot)} />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums text-slate-700">{m.date}</span>
                  <span className="text-[11px] text-slate-400">
                    {m.status === "done" ? "" : d >= 0 ? `还有 ${d} 天` : `已过 ${-d} 天`}
                  </span>
                  {!layerId && <LayerBadge layerId={m.layerId} />}
                  <StatusBadge tone={tone} label={WORK_STATUS[m.status].label} />
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="opacity-50 group-hover:opacity-100"
                    onClick={() => setEditing({ ms: m, isNew: false })}
                    aria-label="编辑里程碑"
                  >
                    <Pencil />
                  </Button>
                </div>
                <p className="mt-0.5 text-sm font-medium text-slate-800">{m.name}</p>
                {(m.dependency || m.note) && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {m.dependency && <>依赖：{m.dependency}</>}
                    {m.dependency && m.note && "　·　"}
                    {m.note}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
      <EntityDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "新增里程碑" : "编辑里程碑"}
        fields={milestoneFields}
        initial={editing?.ms ?? newMilestone()}
        onSubmit={(m) => upsert("milestones", m)}
        onDelete={editing && !editing.isNew ? () => remove("milestones", editing.ms.id) : undefined}
      />
    </div>
  );
}
