"use client";

import { useState } from "react";
import { ExternalLink, LayoutGrid, Pencil, Plus, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LayerBadge, PageHeader, Pill, StatusBadge } from "@/components/common";
import { EntityDialog } from "@/components/entity-dialog";
import { passFilters } from "@/lib/calc";
import { assetFields, newAsset } from "@/lib/fields";
import { ASSET_STATUS, ASSET_TYPE } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types";

export default function AssetsPage() {
  const { data, upsert, remove, filters } = useStore();
  const [view, setView] = useState<"card" | "table">("card");
  const [editing, setEditing] = useState<{ asset: Asset; isNew: boolean } | null>(null);

  const items = data.assets
    .filter((a) => passFilters({ ...filters, timeRange: "all" }, { ...a, tone: ASSET_STATUS[a.status].tone }))
    .sort((a, b) => b.usageCount - a.usageCount || b.updatedAt.localeCompare(a.updatedAt));
  const provinces = new Set(data.assets.flatMap((a) => a.usedProvinces));
  const totalUse = data.assets.reduce((s, a) => s + a.usageCount, 0);

  const edit = (a: Asset) => setEditing({ asset: a, isNew: false });

  return (
    <div>
      <PageHeader
        title="方案卡与资产"
        description="重点看“被销售实际使用”：一张方案卡被多少省份、多少次实际用于销售场景。"
        actions={
          <>
            <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
              {(
                [
                  ["card", LayoutGrid, "卡片"],
                  ["table", Rows3, "表格"],
                ] as const
              ).map(([v, Icon, label]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn("flex h-6 items-center gap-1 rounded px-2 text-xs", view === v ? "bg-slate-800 text-white" : "text-slate-500")}
                >
                  <Icon className="size-3.5" /> {label}
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing({ asset: newAsset(), isNew: true })}>
              <Plus /> 新增资产
            </Button>
          </>
        }
      />
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <Stat label="资产总数" value={data.assets.length} />
        <Stat label="已发布" value={data.assets.filter((a) => a.status === "published").length} />
        <Stat label="覆盖省份" value={provinces.size} />
        <Stat label="销售实际使用次数" value={totalUse} />
      </div>

      {!items.length && <EmptyState text="当前筛选条件下没有资产" />}

      {view === "card" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <div key={a.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5">
                <Pill className="border-blue-200 bg-blue-50 text-blue-800">{ASSET_TYPE[a.type]}</Pill>
                <LayerBadge layerId={a.layerId} />
                <StatusBadge tone={ASSET_STATUS[a.status].tone} label={ASSET_STATUS[a.status].label} />
                <Button size="icon-xs" variant="ghost" className="ml-auto" onClick={() => edit(a)} aria-label="编辑资产">
                  <Pencil />
                </Button>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                {a.name} <span className="font-normal text-slate-400">{a.version}</span>
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="text-xl font-semibold tabular-nums text-slate-900">{a.usedProvinces.length}</div>
                  <div className="text-[11px] text-slate-500">被使用省份</div>
                </div>
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="text-xl font-semibold tabular-nums text-slate-900">{a.usageCount}</div>
                  <div className="text-[11px] text-slate-500">销售实际使用次数</div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">{a.usedProvinces.length ? a.usedProvinces.join("、") : "尚未被销售使用"}</p>
              <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-slate-500">
                <span>
                  {a.owner} · 更新 {a.updatedAt}
                </span>
                {a.link && (
                  <a href={a.link} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-blue-700 hover:underline">
                    打开 <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        items.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[900px] text-xs">
              <thead className="bg-slate-50 text-left text-[11px] text-slate-500">
                <tr>
                  {["资产名称", "类型", "层级", "版本", "负责人", "状态", "使用省份", "使用次数", "最近更新", ""].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {a.link ? (
                        <a href={a.link} target="_blank" rel="noreferrer" className="hover:text-blue-700 hover:underline">
                          {a.name}
                        </a>
                      ) : (
                        a.name
                      )}
                    </td>
                    <td className="px-3 py-2">{ASSET_TYPE[a.type]}</td>
                    <td className="px-3 py-2">
                      <LayerBadge layerId={a.layerId} />
                    </td>
                    <td className="px-3 py-2">{a.version}</td>
                    <td className="px-3 py-2">{a.owner}</td>
                    <td className="px-3 py-2">
                      <StatusBadge tone={ASSET_STATUS[a.status].tone} label={ASSET_STATUS[a.status].label} />
                    </td>
                    <td className="px-3 py-2">{a.usedProvinces.length}</td>
                    <td className="px-3 py-2 font-semibold tabular-nums">{a.usageCount}</td>
                    <td className="px-3 py-2 tabular-nums text-slate-500">{a.updatedAt}</td>
                    <td className="px-3 py-2">
                      <Button size="icon-xs" variant="ghost" onClick={() => edit(a)} aria-label="编辑资产">
                        <Pencil />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <EntityDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "新增资产" : "编辑资产"}
        fields={assetFields}
        initial={editing?.asset ?? newAsset()}
        onSubmit={(a) => upsert("assets", { ...a, usageCount: Number(a.usageCount) })}
        onDelete={editing && !editing.isNew ? () => remove("assets", editing.asset.id) : undefined}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-slate-900">{value}</span>
    </div>
  );
}
