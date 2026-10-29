"use client";

import { useState } from "react";
import { Ban, Check, Pencil, Plus, Scale, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/common";
import { EntityDialog, type FieldDef } from "@/components/entity-dialog";
import { todayISO, uid } from "@/lib/calc";
import { FDE_STAGES } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { FdeTrack } from "@/types";

const RULES = [
  { icon: Ban, title: "FDE 不接普通 ICT 定开", text: "只做滩头场景，守住“存量算力→可计费 Token”主线" },
  { icon: Scale, title: "FDE 项目三方评审", text: "产品市场 / 交付 / 销售三方评审通过才能进场" },
  { icon: Timer, title: "FDE 考核不看人天", text: "看可计费 Token、利用率、开通周期与回流资产" },
];

const RULE_LABELS: { key: keyof FdeTrack["ruleChecks"]; label: string }[] = [
  { key: "isBeachheadScenario", label: "属于滩头场景" },
  { key: "hasBackflowList", label: "有回流资产清单" },
  { key: "tripartiteReviewed", label: "三方评审通过" },
];

const basicFields: FieldDef[] = [
  { key: "scenario", label: "滩头场景名称", type: "text", required: true, full: true },
  { key: "city", label: "地市", type: "text", required: true },
  { key: "customer", label: "客户/对接部门", type: "text" },
  { key: "lead", label: "场景负责人", type: "text" },
  { key: "engineer", label: "交付工程师", type: "text" },
  { key: "pmm", label: "产品市场接口人", type: "text" },
  { key: "risks", label: "风险与阻塞", type: "list", full: true },
];

type Basic = { scenario: string; city: string; customer: string; lead: string; engineer: string; pmm: string; risks: string[] };

const newTrack = (): FdeTrack => ({
  id: uid("fde"),
  scenario: "",
  city: "",
  customer: "",
  members: [
    { role: "场景负责人", name: "" },
    { role: "交付工程师", name: "" },
    { role: "产品市场接口人", name: "" },
  ],
  successMetrics: [
    { name: "可计费 Token 量", target: "", current: "" },
    { name: "资源利用率", target: "", current: "" },
    { name: "服务开通周期", target: "", current: "" },
    { name: "政企客户调用持续性", target: "", current: "" },
  ],
  stage: "define",
  ruleChecks: { isBeachheadScenario: false, hasBackflowList: false, tripartiteReviewed: false },
  assets: ["配置模板", "对接规范", "报价逻辑", "异议话术", "方案卡版本"].map((name) => ({ name, done: false })),
  risks: [],
  updatedAt: todayISO(),
});

export default function FdePage() {
  const { data, upsert, remove } = useStore();
  const [editing, setEditing] = useState<{ track: FdeTrack; isNew: boolean } | null>(null);

  const save = (t: FdeTrack) => upsert("fdeTracks", { ...t, updatedAt: todayISO() });
  const toBasic = (t: FdeTrack): Basic => ({
    scenario: t.scenario,
    city: t.city,
    customer: t.customer,
    lead: t.members[0]?.name ?? "",
    engineer: t.members[1]?.name ?? "",
    pmm: t.members[2]?.name ?? "",
    risks: t.risks,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="FDE 滩头验证"
        description="跟踪 FDE 小分队的滩头场景：成功标准、阶段、接单规则检查与回流资产。"
        actions={
          <Button size="sm" variant="outline" onClick={() => setEditing({ track: newTrack(), isNew: true })}>
            <Plus /> 新增滩头场景
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-3">
        {RULES.map((r) => (
          <div key={r.title} className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
            <r.icon className="mt-0.5 size-4 shrink-0 text-blue-700" />
            <div>
              <div className="text-xs font-semibold text-blue-900">{r.title}</div>
              <div className="mt-0.5 text-[11px] text-blue-800/80">{r.text}</div>
            </div>
          </div>
        ))}
      </div>

      {!data.fdeTracks.length && <EmptyState text="还没有滩头场景" />}

      {data.fdeTracks.map((t) => {
        const stageIdx = FDE_STAGES.findIndex((s) => s.id === t.stage);
        const passAll = RULE_LABELS.every((r) => t.ruleChecks[r.key]);
        return (
          <Panel
            key={t.id}
            title={
              <span className="flex flex-wrap items-center gap-2">
                {t.scenario || "未命名场景"}
                <span className="text-xs font-normal text-slate-500">
                  {t.city} · {t.customer}
                </span>
              </span>
            }
            actions={
              <Button size="xs" variant="outline" onClick={() => setEditing({ track: t, isNew: false })}>
                <Pencil /> 编辑
              </Button>
            }
            bodyClassName="space-y-4"
          >
            <div>
              <div className="mb-2 text-[11px] font-medium text-slate-500">当前阶段（点击切换）</div>
              <div className="grid grid-cols-5 gap-1">
                {FDE_STAGES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => save({ ...t, stage: s.id })}
                    className={cn(
                      "rounded border px-1 py-1.5 text-[11px] transition-colors",
                      i < stageIdx && "border-emerald-200 bg-emerald-50 text-emerald-700",
                      i === stageIdx && "border-blue-600 bg-blue-600 font-medium text-white",
                      i > stageIdx && "border-slate-200 bg-white text-slate-400 hover:bg-slate-50",
                    )}
                  >
                    {i + 1}. {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-2 text-[11px] font-medium text-slate-500">成功标准</div>
                <table className="w-full text-xs">
                  <thead className="text-left text-[11px] text-slate-400">
                    <tr>
                      <th className="py-1 font-medium">指标</th>
                      <th className="py-1 font-medium">目标</th>
                      <th className="py-1 font-medium">当前</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.successMetrics.map((m, i) => (
                      <tr key={m.name} className="border-t border-slate-100">
                        <td className="py-1.5 pr-2 font-medium text-slate-700">{m.name}</td>
                        {(["target", "current"] as const).map((field) => (
                          <td key={field} className="py-1 pr-2">
                            <input
                              key={m[field]}
                              defaultValue={m[field]}
                              onBlur={(e) => {
                                if (e.target.value === m[field]) return;
                                const successMetrics = t.successMetrics.map((x, j) => (j === i ? { ...x, [field]: e.target.value } : x));
                                save({ ...t, successMetrics });
                              }}
                              className="h-6 w-full rounded border border-transparent px-1.5 text-xs text-slate-700 hover:border-slate-200 focus:border-blue-400 focus:outline-none"
                              placeholder="—"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-medium text-slate-500">FDE 成员</div>
                <ul className="space-y-1 text-xs">
                  {t.members.map((m) => (
                    <li key={m.role} className="flex justify-between rounded bg-slate-50 px-2 py-1.5">
                      <span className="text-slate-500">{m.role}</span>
                      <span className="font-medium text-slate-800">{m.name || "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  接单规则检查
                  <StatusBadge tone={passAll ? "green" : "orange"} label={passAll ? "全部通过" : "未全部通过"} />
                </div>
                <div className="space-y-1">
                  {RULE_LABELS.map((r) => (
                    <CheckRow
                      key={r.key}
                      label={r.label}
                      checked={t.ruleChecks[r.key]}
                      onToggle={() => save({ ...t, ruleChecks: { ...t.ruleChecks, [r.key]: !t.ruleChecks[r.key] } })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-medium text-slate-500">
                  回流资产 {t.assets.filter((a) => a.done).length}/{t.assets.length}
                </div>
                <div className="space-y-1">
                  {t.assets.map((a, i) => (
                    <CheckRow
                      key={a.name}
                      label={a.name}
                      checked={a.done}
                      onToggle={() => save({ ...t, assets: t.assets.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-medium text-slate-500">风险与阻塞</div>
                {t.risks.length ? (
                  <ul className="space-y-1 text-xs">
                    {t.risks.map((r) => (
                      <li key={r} className="rounded border border-orange-200 bg-orange-50 px-2 py-1.5 text-orange-800">
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">暂无</p>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">最近更新 {t.updatedAt}</p>
          </Panel>
        );
      })}

      <EntityDialog<Basic>
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "新增滩头场景" : "编辑滩头场景"}
        fields={basicFields}
        initial={editing ? toBasic(editing.track) : toBasic(newTrack())}
        onSubmit={(b) => {
          if (!editing) return;
          const t = editing.track;
          save({
            ...t,
            scenario: b.scenario,
            city: b.city,
            customer: b.customer,
            risks: b.risks,
            members: [
              { role: "场景负责人", name: b.lead },
              { role: "交付工程师", name: b.engineer },
              { role: "产品市场接口人", name: b.pmm },
            ],
          });
        }}
        onDelete={editing && !editing.isNew ? () => remove("fdeTracks", editing.track.id) : undefined}
      />
    </div>
  );
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-slate-50"
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded border",
          checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white",
        )}
      >
        {checked && <Check className="size-3" />}
      </span>
      <span className={checked ? "text-slate-800" : "text-slate-500"}>{label}</span>
    </button>
  );
}
