"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ExternalLink, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, Panel, Pill, ProgressBar, StatusBadge } from "@/components/common";
import { EntityDialog } from "@/components/entity-dialog";
import { KrTable } from "@/components/kr-table";
import { MilestoneList } from "@/components/milestone-list";
import { RiskTable } from "@/components/risk-table";
import { TaskBoard } from "@/components/task-board";
import { krAverageProgress, layerProgress, layerStats, todayISO } from "@/lib/calc";
import { evidenceFields, layerInfoFields, newEvidence, newWeeklyUpdate, weeklyUpdateFields } from "@/lib/fields";
import { LAYER_META, WORK_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { EvidenceLink, MainlineLayer, WeeklyUpdate } from "@/types";

export default function MainlineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, update } = useStore();
  const layer = data.layers.find((l) => l.id === id);
  const [editInfo, setEditInfo] = useState(false);
  const [editUpdate, setEditUpdate] = useState<{ wu: WeeklyUpdate; isNew: boolean } | null>(null);
  const [editEvidence, setEditEvidence] = useState<{ ev: EvidenceLink; isNew: boolean } | null>(null);

  if (!layer) {
    return (
      <EmptyState
        text="没有找到这条主线"
        action={
          <Link href="/mainlines" className="text-blue-700 hover:underline">
            返回三层主线
          </Link>
        }
      />
    );
  }

  const mutateLayer = (fn: (l: MainlineLayer) => void) =>
    update((d) => {
      const l = d.layers.find((x) => x.id === layer.id);
      if (l) {
        fn(l);
        l.updatedAt = todayISO();
      }
    });

  const p = layerProgress(data, layer);
  const krAvg = krAverageProgress(data, layer.id);
  const s = layerStats(data, layer.id);
  const milestones = data.milestones.filter((m) => m.layerId === layer.id);
  const updates = [...layer.weeklyUpdates].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <div>
        <Link href="/mainlines" className="inline-flex items-center gap-0.5 text-xs text-slate-500 hover:text-slate-800">
          <ChevronLeft className="size-3.5" /> 三层主线
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={cn("h-5 w-1 rounded-full", LAYER_META[layer.id].accent)} />
          <h1 className="text-lg font-semibold text-slate-900">{layer.name}</h1>
          <StatusBadge tone={WORK_STATUS[layer.status].tone} label={WORK_STATUS[layer.status].label} />
          <div className="ml-auto flex gap-2">
            {data.layers
              .filter((l) => l.id !== layer.id)
              .sort((a, b) => a.order - b.order)
              .map((l) => (
                <Link key={l.id} href={`/mainlines/${l.id}`} className="text-xs text-blue-700 hover:underline">
                  {l.name}
                </Link>
              ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="定位与要解决的问题"
          className="lg:col-span-2"
          actions={
            <Button size="xs" variant="outline" onClick={() => setEditInfo(true)}>
              <Pencil /> 编辑
            </Button>
          }
        >
          <p className="text-sm leading-relaxed font-medium text-slate-800">{layer.positioning}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{layer.problem}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
            <Meta label="负责人" value={layer.owner} />
            <Meta label="参与人" value={layer.participants.join("、") || "—"} />
            <Meta label="起止时间" value={`${layer.startDate} ~ ${layer.endDate}`} />
            <Meta label="当前阶段" value={layer.currentStage} />
          </dl>
        </Panel>
        <Panel title="进度">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold tabular-nums text-slate-900">{p}%</span>
            <span className="pb-1 text-[11px] text-slate-400">
              {krAvg !== null ? `KR 均值 ${krAvg}% · KR 变动时自动重算` : "可在“编辑”中手动调整"}
            </span>
          </div>
          <ProgressBar value={p} tone={WORK_STATUS[layer.status].tone} className="mt-2 h-2" />
          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <Meta label="KR 完成" value={`${s.krDone} / ${s.krTotal}`} />
            <Meta label="任务完成" value={`${s.taskDone} / ${s.taskTotal}`} />
            <Meta label="里程碑" value={`${milestones.filter((m) => m.status === "done").length} / ${milestones.length}`} />
            <Meta label="未关闭风险" value={`${s.openRisks}（高 ${s.highRisks}）`} />
          </dl>
        </Panel>
      </div>

      <Tabs defaultValue="updates">
        <TabsList className="flex-wrap">
          <TabsTrigger value="updates">周更新记录 · {updates.length}</TabsTrigger>
          <TabsTrigger value="kr">关键结果 KR · {s.krTotal}</TabsTrigger>
          <TabsTrigger value="tasks">任务 · {s.taskTotal}</TabsTrigger>
          <TabsTrigger value="milestones">里程碑 · {milestones.length}</TabsTrigger>
          <TabsTrigger value="risks">风险与问题 · {s.openRisks}</TabsTrigger>
          <TabsTrigger value="evidence">证据/链接 · {layer.evidence.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="mt-3">
          <div className="mb-2 flex justify-end">
            <Button size="sm" onClick={() => setEditUpdate({ wu: newWeeklyUpdate(layer.owner), isNew: true })}>
              <Plus /> 写本周更新
            </Button>
          </div>
          {!updates.length ? (
            <EmptyState text="还没有周更新记录" />
          ) : (
            <div className="space-y-3">
              {updates.map((u) => (
                <div key={u.id} className="group rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold tabular-nums text-slate-800">{u.date}</span>
                    <span className="text-slate-500">{u.author}</span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="ml-auto opacity-60 group-hover:opacity-100"
                      onClick={() => setEditUpdate({ wu: u, isNew: false })}
                      aria-label="编辑周更新"
                    >
                      <Pencil />
                    </Button>
                  </div>
                  <div className="mt-2 grid gap-3 text-xs md:grid-cols-3">
                    <UpdateBlock label="本周进展" text={u.progress} />
                    <UpdateBlock label="下周计划" text={u.nextPlan} />
                    <UpdateBlock label="需要支持" text={u.supportNeeded} highlight />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kr" className="mt-3">
          <KrTable layerId={layer.id} applyFilters={false} />
        </TabsContent>
        <TabsContent value="tasks" className="mt-3">
          <TaskBoard layerId={layer.id} applyFilters={false} />
        </TabsContent>
        <TabsContent value="milestones" className="mt-3">
          <Panel>
            <MilestoneList layerId={layer.id} applyFilters={false} />
          </Panel>
        </TabsContent>
        <TabsContent value="risks" className="mt-3">
          <RiskTable layerId={layer.id} applyFilters={false} />
        </TabsContent>
        <TabsContent value="evidence" className="mt-3">
          <div className="mb-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setEditEvidence({ ev: newEvidence(), isNew: true })}>
              <Plus /> 添加证据/链接
            </Button>
          </div>
          {!layer.evidence.length ? (
            <EmptyState text="还没有证据或链接，建议附上方案卡、文档、案例或数据看板" />
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {layer.evidence.map((ev) => (
                <li key={ev.id} className="group flex items-center gap-2 px-4 py-2.5 text-xs">
                  <Pill>{ev.kind}</Pill>
                  <span className="font-medium text-slate-800">{ev.title}</span>
                  {ev.url && (
                    <a href={ev.url} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 truncate text-blue-700 hover:underline">
                      {ev.url} <ExternalLink className="size-3" />
                    </a>
                  )}
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="ml-auto opacity-60 group-hover:opacity-100"
                    onClick={() => setEditEvidence({ ev, isNew: false })}
                    aria-label="编辑证据"
                  >
                    <Pencil />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <EntityDialog
        open={editInfo}
        onOpenChange={setEditInfo}
        title={`编辑主线 · ${layer.name}`}
        fields={layerInfoFields}
        initial={layer}
        onSubmit={(v) => mutateLayer((l) => Object.assign(l, v, { progress: Math.max(0, Math.min(100, Math.round(Number(v.progress) || 0))) }))}
      />
      <EntityDialog
        open={!!editUpdate}
        onOpenChange={(o) => !o && setEditUpdate(null)}
        title={editUpdate?.isNew ? "写本周更新" : "编辑周更新"}
        fields={weeklyUpdateFields}
        initial={editUpdate?.wu ?? newWeeklyUpdate()}
        onSubmit={(wu) =>
          mutateLayer((l) => {
            const i = l.weeklyUpdates.findIndex((x) => x.id === wu.id);
            if (i >= 0) l.weeklyUpdates[i] = wu;
            else l.weeklyUpdates.unshift(wu);
          })
        }
        onDelete={
          editUpdate && !editUpdate.isNew
            ? () => mutateLayer((l) => void (l.weeklyUpdates = l.weeklyUpdates.filter((x) => x.id !== editUpdate.wu.id)))
            : undefined
        }
      />
      <EntityDialog
        open={!!editEvidence}
        onOpenChange={(o) => !o && setEditEvidence(null)}
        title={editEvidence?.isNew ? "添加证据/链接" : "编辑证据/链接"}
        fields={evidenceFields}
        initial={editEvidence?.ev ?? newEvidence()}
        onSubmit={(ev) =>
          mutateLayer((l) => {
            const i = l.evidence.findIndex((x) => x.id === ev.id);
            if (i >= 0) l.evidence[i] = ev;
            else l.evidence.push(ev);
          })
        }
        onDelete={
          editEvidence && !editEvidence.isNew
            ? () => mutateLayer((l) => void (l.evidence = l.evidence.filter((x) => x.id !== editEvidence.ev.id)))
            : undefined
        }
      />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function UpdateBlock({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  const empty = !text || text === "无";
  return (
    <div className={cn("rounded-md p-2.5", highlight && !empty ? "bg-orange-50/70" : "bg-slate-50")}>
      <div className={cn("mb-1 text-[11px] font-medium", highlight && !empty ? "text-orange-700" : "text-slate-500")}>{label}</div>
      <p className="leading-relaxed whitespace-pre-wrap text-slate-700">{text || "—"}</p>
    </div>
  );
}
