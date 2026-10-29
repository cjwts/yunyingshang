"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  FileDown,
  FileText,
  Flag,
  Layers,
  LayoutDashboard,
  ListChecks,
  Menu,
  RotateCcw,
  Rocket,
  Target,
  Waypoints,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { allOwners, weekRange } from "@/lib/calc";
import { LAYER_IDS, LAYER_META, PHASE_IDS, PHASE_META, TONE_LABEL } from "@/lib/meta";
import { DEFAULT_FILTERS, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { downloadMarkdown, generateWeeklyMarkdown } from "@/lib/weekly";
import type { PhaseId, TimeRange, Tone } from "@/types";

export const NAV = [
  { href: "/", label: "总览", en: "Dashboard", icon: LayoutDashboard },
  { href: "/mainlines", label: "三层主线", en: "Mainlines", icon: Layers },
  { href: "/objectives", label: "目标与 KR", en: "Objectives", icon: Target },
  { href: "/tasks", label: "任务与里程碑", en: "Tasks", icon: ListChecks },
  { href: "/fde", label: "FDE 滩头验证", en: "FDE", icon: Rocket },
  { href: "/ecosystem", label: "Token 生态准入", en: "Ecosystem", icon: Waypoints },
  { href: "/assets", label: "方案卡与资产", en: "Assets", icon: FileText },
  { href: "/alibaba", label: "阿里价值证明", en: "Alibaba Value", icon: Building2 },
  { href: "/risks", label: "风险与问题", en: "Risks", icon: AlertTriangle },
  { href: "/weekly", label: "周报", en: "Weekly", icon: CalendarCheck },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {NAV.map((n) => {
        const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
              active ? "bg-white/10 font-medium text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{n.label}</span>
            <span className="text-[10px] text-slate-500">{n.en}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { reset } = useStore();
  return (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3.5">
        <div className="flex size-7 items-center justify-center rounded bg-blue-600 text-white">
          <Flag className="size-4" />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-white">主线目标跟踪</div>
          <div className="text-[11px] text-slate-400">运营商事业部 · 产品市场部</div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NavList onNavigate={onNavigate} />
      </div>
      <div className="shrink-0 space-y-1.5 border-t border-white/10 px-3 pt-3 pb-4">
        <p className="px-2.5 text-xs leading-5 text-slate-400">聚焦过程与资产 · 赋能一线打胜仗</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-300 hover:bg-white/10 hover:text-white"
          onClick={async () => {
            if (window.confirm("将清空本地修改并恢复示例数据，确认？")) {
              await reset();
              toast.success("已重置为示例数据");
            }
          }}
        >
          <RotateCcw /> 重置为示例数据
        </Button>
      </div>
    </div>
  );
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "all", label: "全部时间" },
  { value: "week", label: "本周到期" },
  { value: "30d", label: "30 天内到期" },
  { value: "90d", label: "90 天内到期" },
  { value: "overdue", label: "已逾期" },
];

function FilterSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className={cn("h-7 bg-white text-xs", value !== "all" && "border-blue-300 bg-blue-50", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { data, update, filters, setFilters } = useStore();
  const owners = allOwners(data);
  const active = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  const exportWeekly = () => {
    const md = generateWeeklyMarkdown(data);
    downloadMarkdown(md, `产品市场部主线周报_${weekRange().start}.md`);
    toast.success("周报已导出为 .md 文件");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-2.5 lg:px-6">
        <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={onMenu} aria-label="打开导航">
          <Menu />
        </Button>
        <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">运营商事业部产品市场部 · 主线目标跟踪</h1>
        <Select
          value={data.settings.currentPhase}
          onValueChange={(v) => update((d) => void (d.settings.currentPhase = v as PhaseId))}
        >
          <SelectTrigger
            size="sm"
            className="hidden h-6 border-blue-200 bg-blue-50 px-2 text-[11px] font-medium text-blue-800 md:flex"
            aria-label="当前阶段"
          >
            <span className="text-blue-500">当前阶段</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHASE_IDS.map((p) => (
              <SelectItem key={p} value={p} className="text-xs">
                {PHASE_META[p].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button size="sm" onClick={exportWeekly} className="bg-slate-900 hover:bg-slate-800">
            <FileDown /> 导出周报
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-1.5 lg:px-6">
        <span className="text-[11px] text-slate-500">全局筛选</span>
        <FilterSelect
          value={filters.layer}
          onChange={(v) => setFilters({ ...filters, layer: v as typeof filters.layer })}
          options={[{ value: "all", label: "全部主线" }, ...LAYER_IDS.map((id) => ({ value: id, label: LAYER_META[id].name }))]}
        />
        <FilterSelect
          value={filters.owner}
          onChange={(v) => setFilters({ ...filters, owner: v })}
          options={[{ value: "all", label: "全部负责人" }, ...owners.map((o) => ({ value: o, label: o }))]}
        />
        <FilterSelect
          value={filters.tone}
          onChange={(v) => setFilters({ ...filters, tone: v as Tone | "all" })}
          options={[{ value: "all", label: "全部状态" }, ...(Object.keys(TONE_LABEL) as Tone[]).map((t) => ({ value: t, label: TONE_LABEL[t] }))]}
        />
        <FilterSelect
          value={filters.timeRange}
          onChange={(v) => setFilters({ ...filters, timeRange: v as TimeRange })}
          options={TIME_RANGES}
        />
        {active && (
          <Button variant="ghost" size="xs" onClick={() => setFilters(DEFAULT_FILTERS)} className="text-slate-500">
            <X /> 清除筛选
          </Button>
        )}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 lg:block">
        <SidebarBody />
      </aside>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">导航</SheetTitle>
          <SidebarBody onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-56">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-[1440px] px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
