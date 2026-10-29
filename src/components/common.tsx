import { cn } from "@/lib/utils";
import { LAYER_META, TONE_CLASS } from "@/lib/meta";
import type { LayerId, Tone } from "@/types";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function StatusBadge({ tone, label, className }: { tone: Tone; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded border px-1.5 text-[11px] font-medium whitespace-nowrap",
        TONE_CLASS[tone].badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", TONE_CLASS[tone].dot)} />
      {label}
    </span>
  );
}

export function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[11px] font-medium whitespace-nowrap",
        className ?? "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {children}
    </span>
  );
}

export function LayerBadge({ layerId }: { layerId: LayerId }) {
  return (
    <span className="inline-flex h-5 shrink-0 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 text-[11px] font-medium whitespace-nowrap text-slate-700">
      <span className={cn("size-1.5 rounded-sm", LAYER_META[layerId].accent)} />
      {LAYER_META[layerId].short}
    </span>
  );
}

export function ProgressBar({ value, tone = "blue", className }: { value: number; tone?: Tone; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div className={cn("h-full rounded-full", TONE_CLASS[tone].bar)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  icon: Icon,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            {Icon && <Icon className="size-4 text-slate-500" />}
            {title}
          </h2>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-xs text-slate-400">
      <Inbox className="size-5" />
      <p>{text}</p>
      {action}
    </div>
  );
}

export function DueDate({ date, done }: { date: string; done?: boolean }) {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const overdue = !done && date && date < iso;
  return (
    <span className={cn("tabular-nums", overdue ? "font-medium text-orange-700" : "text-slate-500")}>
      {date || "—"}
      {overdue && " 逾期"}
    </span>
  );
}
