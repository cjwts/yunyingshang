"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Handshake, Link2, Plus, Quote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, ProgressBar } from "@/components/common";
import { InlineNumber } from "@/components/inline-edit";
import { BOUNDARY_STATUS } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AlibabaValue, BoundaryStatus } from "@/types";

type MetricKey = "ppuNodes" | "openTrekInstances" | "assetCards";

const METRICS: { key: MetricKey; title: string; desc: string; unit: string }[] = [
  { key: "ppuNodes", title: "PPU 上线节点", desc: "PPU 在电信地市算力超市 / Token 服务目录上线节点数", unit: "个" },
  { key: "openTrekInstances", title: "OpenTrek 承载实例", desc: "OpenTrek AI Gateway / Token 计量在省公司 Token 运营平台实际承载实例数", unit: "个" },
  { key: "assetCards", title: "可复制方案卡", desc: "地市智算盘活可复制方案卡数量", unit: "张" },
];

const BOUNDARY_ORDER: BoundaryStatus[] = ["none", "draft", "aligned", "executing"];

export default function AlibabaPage() {
  const { data, update } = useStore();
  const av = data.alibabaValue;
  const set = (fn: (v: AlibabaValue) => void) => update((d) => fn(d.alibabaValue));
  const boundaryIdx = BOUNDARY_ORDER.indexOf(av.boundaryStatus);

  return (
    <div className="space-y-4">
      <PageHeader
        title="阿里价值证明"
        description="不是“多卖 PPU 和 OpenTrek”，是“做阿里云不做的落地纵深”。三个可统计口径 + 边界对齐，每一项都要有事实底座。"
      />

      <div className="grid gap-3 md:grid-cols-3">
        {METRICS.map((m) => {
          const v = av[m.key];
          const p = v.target ? Math.min(100, Math.round((v.current / v.target) * 100)) : 0;
          return (
            <div key={m.key} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-800">{m.title}</div>
              <p className="mt-0.5 min-h-8 text-[11px] text-slate-500">{m.desc}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <InlineNumber value={v.current} onCommit={(n) => set((a) => void (a[m.key].current = n))} className="h-8 w-16 text-lg" />
                <span>/</span>
                <InlineNumber value={v.target} onCommit={(n) => set((a) => void (a[m.key].target = n))} className="w-12" />
                <span>{m.unit}</span>
              </div>
              <ProgressBar value={p} tone={p >= 100 ? "green" : p > 0 ? "blue" : "gray"} className="mt-3" />
              {m.key === "assetCards" && (
                <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  带动阿里云/PPU 后续商机
                  <InlineNumber value={av.businessLeads} onCommit={(n) => set((a) => void (a.businessLeads = n))} />个
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Panel title="与阿里云运营商团队边界规则" icon={Handshake}>
        <div className="grid grid-cols-4 gap-1">
          {BOUNDARY_ORDER.map((s, i) => (
            <button
              key={s}
              onClick={() => set((a) => void (a.boundaryStatus = s))}
              className={cn(
                "rounded border py-2 text-xs transition-colors",
                i < boundaryIdx && "border-emerald-200 bg-emerald-50 text-emerald-700",
                i === boundaryIdx && "border-blue-600 bg-blue-600 font-medium text-white",
                i > boundaryIdx && "border-slate-200 bg-white text-slate-400 hover:bg-slate-50",
              )}
            >
              {BOUNDARY_STATUS[s].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">点击切换对齐状态。建议对齐内容：谁主导、谁跟进、商机如何登记、冲突如何仲裁。</p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <NotesEditor key={av.notes.join("\n")} notes={av.notes} onSave={(notes) => set((a) => void (a.notes = notes))} />
        <LinksEditor links={av.evidenceLinks} onChange={(links) => set((a) => void (a.evidenceLinks = links))} />
      </div>
    </div>
  );
}

function NotesEditor({ notes, onSave }: { notes: string[]; onSave: (n: string[]) => void }) {
  const [text, setText] = useState(notes.join("\n"));
  const dirty = text !== notes.join("\n");
  return (
    <Panel
      title="价值陈述要点"
      icon={Quote}
      actions={
        <Button
          size="xs"
          disabled={!dirty}
          onClick={() => {
            onSave(text.split("\n").map((s) => s.trim()).filter(Boolean));
            toast.success("价值陈述要点已保存");
          }}
        >
          保存
        </Button>
      }
    >
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="text-sm" placeholder="每行一条要点" />
      <p className="mt-1 text-[11px] text-slate-400">每行一条要点</p>
    </Panel>
  );
}

function LinksEditor({ links, onChange }: { links: { title: string; url: string }[]; onChange: (l: { title: string; url: string }[]) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  return (
    <Panel title="事实底座链接" icon={Link2}>
      <ul className="divide-y divide-slate-100">
        {links.map((l, i) => (
          <li key={`${l.title}-${i}`} className="flex items-center gap-2 py-2 text-xs">
            <span className="font-medium text-slate-800">{l.title}</span>
            <a href={l.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-0.5 truncate text-blue-700 hover:underline">
              <span className="truncate">{l.url}</span> <ExternalLink className="size-3 shrink-0" />
            </a>
            <Button size="icon-xs" variant="ghost" className="ml-auto" onClick={() => onChange(links.filter((_, j) => j !== i))} aria-label="删除链接">
              <Trash2 />
            </Button>
          </li>
        ))}
        {!links.length && <li className="py-3 text-xs text-slate-400">还没有事实底座链接</li>}
      </ul>
      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !url.trim()) return;
          onChange([...links, { title: title.trim(), url: url.trim() }]);
          setTitle("");
          setUrl("");
        }}
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" className="h-8 text-xs sm:w-40" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="h-8 flex-1 text-xs" />
        <Button size="sm" type="submit" variant="outline" disabled={!title.trim() || !url.trim()}>
          <Plus /> 添加
        </Button>
      </form>
    </Panel>
  );
}
