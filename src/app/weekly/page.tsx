"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common";
import { weekRange } from "@/lib/calc";
import { useStore } from "@/lib/store";
import { copyText, downloadMarkdown, generateWeeklyMarkdown } from "@/lib/weekly";

export default function WeeklyPage() {
  const { data } = useStore();
  const generated = useMemo(() => generateWeeklyMarkdown(data), [data]);
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? generated;
  const edited = draft !== null && draft !== generated;
  const { start, end } = weekRange();

  return (
    <div>
      <PageHeader
        title="周报"
        description={`根据当前数据自动生成 ${start} ~ ${end} 的 Markdown 周报。可直接修改文本后再复制或下载；手动修改不会回写数据。`}
        actions={
          <>
            {edited && <span className="text-[11px] text-orange-600">已手动修改</span>}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!edited || window.confirm("将丢弃手动修改，按最新数据重新生成，确认？")) {
                  setDraft(null);
                  toast.success("已按最新数据重新生成");
                }
              }}
            >
              <RefreshCw /> 重新生成
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const ok = await copyText(text);
                if (ok) toast.success("Markdown 已复制到剪贴板");
                else toast.error("复制失败，请手动全选复制");
              }}
            >
              <Copy /> 复制 Markdown
            </Button>
            <Button size="sm" onClick={() => downloadMarkdown(text, `产品市场部主线周报_${start}.md`)}>
              <Download /> 下载 .md
            </Button>
          </>
        }
      />
      <Textarea
        value={text}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        className="min-h-[70vh] bg-white font-mono text-xs leading-relaxed"
        aria-label="周报 Markdown"
      />
    </div>
  );
}
