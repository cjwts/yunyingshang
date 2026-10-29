"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Link2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DueDate, LayerBadge, Pill } from "@/components/common";
import { EntityDialog } from "@/components/entity-dialog";
import { compareDue, passFilters } from "@/lib/calc";
import { newTask, taskFields } from "@/lib/fields";
import { PRIORITY, TASK_STATUS, TASK_STATUS_ORDER, TONE_CLASS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { LayerId, Task, TaskStatus } from "@/types";

export function TaskBoard({ layerId, applyFilters = true }: { layerId?: LayerId; applyFilters?: boolean }) {
  const { data, upsert, remove, filters } = useStore();
  const [editing, setEditing] = useState<{ task: Task; isNew: boolean } | null>(null);

  const visible = data.tasks.filter(
    (t) =>
      (!layerId || t.layerId === layerId) &&
      (!applyFilters || passFilters(filters, { ...t, tone: TASK_STATUS[t.status].tone })),
  );

  const move = (t: Task, dir: -1 | 1) => {
    const i = TASK_STATUS_ORDER.indexOf(t.status) + dir;
    if (i >= 0 && i < TASK_STATUS_ORDER.length) upsert("tasks", { ...t, status: TASK_STATUS_ORDER[i] });
  };

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setEditing({ task: newTask(layerId), isNew: true })}>
          <Plus /> 新增任务
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUS_ORDER.map((status) => {
          const items = visible
            .filter((t) => t.status === status)
            .sort((a, b) => a.priority.localeCompare(b.priority) || compareDue(a.dueDate, b.dueDate));
          const meta = TASK_STATUS[status];
          return (
            <div key={status} className="flex flex-col rounded-lg border border-slate-200 bg-slate-100/60">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className={cn("size-2 rounded-full", TONE_CLASS[meta.tone].dot)} />
                <span className="text-xs font-semibold text-slate-700">{meta.label}</span>
                <span className="text-[11px] text-slate-400">{items.length}</span>
              </div>
              <div className="flex min-h-24 flex-col gap-2 px-2 pb-2">
                {items.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    showLayer={!layerId}
                    onEdit={() => setEditing({ task: t, isNew: false })}
                    onMove={(d) => move(t, d)}
                    onStatus={(s) => upsert("tasks", { ...t, status: s })}
                  />
                ))}
                {!items.length && <p className="py-6 text-center text-[11px] text-slate-400">暂无任务</p>}
              </div>
            </div>
          );
        })}
      </div>
      <EntityDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "新增任务" : "编辑任务"}
        fields={taskFields}
        initial={editing?.task ?? newTask()}
        onSubmit={(t) => upsert("tasks", t)}
        onDelete={editing && !editing.isNew ? () => remove("tasks", editing.task.id) : undefined}
      />
    </div>
  );
}

function TaskCard({
  task: t,
  showLayer,
  onEdit,
  onMove,
  onStatus,
}: {
  task: Task;
  showLayer: boolean;
  onEdit: () => void;
  onMove: (d: -1 | 1) => void;
  onStatus: (s: TaskStatus) => void;
}) {
  const idx = TASK_STATUS_ORDER.indexOf(t.status);
  return (
    <div className="group rounded-md border border-slate-200 bg-white p-2.5 shadow-xs">
      <div className="flex items-start gap-1.5">
        <Pill className={PRIORITY[t.priority].className}>{t.priority}</Pill>
        <button onClick={onEdit} className="flex-1 text-left text-xs leading-snug font-medium text-slate-800 hover:text-blue-700">
          {t.title}
        </button>
        <Button size="icon-xs" variant="ghost" className="opacity-60 group-hover:opacity-100" onClick={onEdit} aria-label="编辑任务">
          <Pencil />
        </Button>
      </div>
      {t.dependencies.length > 0 && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
          <Link2 className="size-3" /> 依赖：{t.dependencies.join("、")}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {showLayer && <LayerBadge layerId={t.layerId} />}
        {t.tags.map((tag) => (
          <Pill key={tag}>{tag}</Pill>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
        <span className="text-slate-600">{t.owner}</span>
        <DueDate date={t.dueDate} done={t.status === "done"} />
      </div>
      <div className="mt-2 flex items-center gap-1">
        <Button size="icon-xs" variant="outline" disabled={idx === 0} onClick={() => onMove(-1)} aria-label="移到上一列">
          <ChevronLeft />
        </Button>
        <div className="flex flex-1 gap-0.5">
          {TASK_STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => onStatus(s)}
              className={cn(
                "h-6 flex-1 rounded text-[10px] transition-colors",
                s === t.status ? cn(TONE_CLASS[TASK_STATUS[s].tone].badge, "border font-medium") : "text-slate-400 hover:bg-slate-100",
              )}
            >
              {TASK_STATUS[s].label}
            </button>
          ))}
        </div>
        <Button size="icon-xs" variant="outline" disabled={idx === TASK_STATUS_ORDER.length - 1} onClick={() => onMove(1)} aria-label="移到下一列">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
