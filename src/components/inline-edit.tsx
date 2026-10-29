"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { StatusBadge } from "@/components/common";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

/** 以状态徽标作为触发器的行内下拉 */
export function InlineStatusSelect<K extends string>({
  value,
  meta,
  onChange,
  order,
}: {
  value: K;
  meta: Record<K, { label: string; tone: Tone }>;
  onChange: (v: K) => void;
  order?: K[];
}) {
  const keys = order ?? (Object.keys(meta) as K[]);
  return (
    <Select value={value} onValueChange={(v) => onChange(v as K)}>
      <SelectTrigger
        size="sm"
        className="h-auto w-auto gap-0.5 border-0 bg-transparent p-0 shadow-none hover:opacity-80 focus-visible:ring-1 [&>svg]:size-3"
        aria-label="修改状态"
      >
        <StatusBadge tone={meta[value].tone} label={meta[value].label} />
      </SelectTrigger>
      <SelectContent>
        {keys.map((k) => (
          <SelectItem key={k} value={k} className="text-xs">
            <StatusBadge tone={meta[k].tone} label={meta[k].label} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function InlineTextSelect<K extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: K;
  options: { value: K; label: string; className?: string }[];
  onChange: (v: K) => void;
  className?: string;
}) {
  const cur = options.find((o) => o.value === value);
  return (
    <Select value={value} onValueChange={(v) => onChange(v as K)}>
      <SelectTrigger
        size="sm"
        className={cn("h-6 w-auto gap-1 border-transparent bg-transparent px-1 text-xs shadow-none hover:border-slate-200", cur?.className, className)}
      >
        {cur?.label}
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

/** 失焦或回车时提交的数字输入 */
export function InlineNumber({ value, onCommit, className }: { value: number; onCommit: (v: number) => void; className?: string }) {
  const [text, setText] = useState<string | null>(null);
  const commit = () => {
    if (text === null) return;
    const n = Number(text);
    if (text.trim() !== "" && Number.isFinite(n) && n !== value) onCommit(n);
    setText(null);
  };
  return (
    <input
      type="number"
      step="any"
      value={text ?? String(value)}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setText(null);
      }}
      className={cn(
        "h-6 w-14 rounded border border-slate-200 bg-white px-1.5 text-right text-xs tabular-nums font-medium text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
        className,
      )}
      aria-label="当前值"
    />
  );
}
