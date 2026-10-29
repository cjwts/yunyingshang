import { inRange, layerProgress, layerStats, phaseProgress, weekRange } from "@/lib/calc";
import {
  ASSET_STATUS,
  ASSET_TYPE,
  BOUNDARY_STATUS,
  ENTRY_TYPE,
  FDE_STAGES,
  LAYER_META,
  MATERIAL_STATUS,
  PHASE_IDS,
  PHASE_META,
  RISK_STATUS,
  TASK_STATUS,
  WORK_STATUS,
} from "@/lib/meta";
import type { AppData, KeyResult } from "@/types";

function valueAt(kr: KeyResult, date: string): number {
  let v = 0;
  for (const h of kr.history) if (h.date < date) v = h.value;
  return v;
}

const clean = (s: string) => (s || "—").replace(/\n+/g, " ");

export function generateWeeklyMarkdown(data: AppData, ref?: string): string {
  const { start, end } = weekRange(ref);
  const L: string[] = [];
  const layers = [...data.layers].sort((a, b) => a.order - b.order);

  L.push(`# 运营商事业部产品市场部 · 主线目标跟踪周报`);
  L.push("");
  L.push(`> 周期：${start} ~ ${end}　|　当前阶段：${PHASE_META[data.settings.currentPhase].name}`);
  L.push(`> 口径说明：本周报跟踪过程指标与可复用资产，不统计签约收入。`);
  L.push("");

  L.push(`## 一、三层主线进度概览`);
  L.push("");
  L.push(`| 主线 | 负责人 | 进度 | 状态 | KR 完成 | 任务完成 | 未关闭风险 |`);
  L.push(`| --- | --- | --- | --- | --- | --- | --- |`);
  for (const l of layers) {
    const s = layerStats(data, l.id);
    L.push(
      `| ${l.name} | ${l.owner} | ${layerProgress(data, l)}% | ${WORK_STATUS[l.status].label} | ${s.krDone}/${s.krTotal} | ${s.taskDone}/${s.taskTotal} | ${s.openRisks}（高 ${s.highRisks}） |`,
    );
  }
  L.push("");
  L.push(`阶段完成度：${PHASE_IDS.map((p) => `${PHASE_META[p].name} ${phaseProgress(data, p)}%`).join("；")}`);
  L.push("");

  if (data.settings.weeklyHighlights.trim()) {
    L.push(`### 本周关键变化`);
    L.push("");
    L.push(data.settings.weeklyHighlights.trim());
    L.push("");
  }

  L.push(`## 二、各主线进展`);
  L.push("");
  for (const l of layers) {
    L.push(`### ${l.name}（${l.owner}）`);
    L.push("");
    const wu = [...l.weeklyUpdates].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!wu) {
      L.push(`- 暂无周更新记录`);
    } else {
      const stale = !inRange(wu.date, start, end) ? `（最近更新 ${wu.date}，本周未更新）` : `（${wu.date} · ${wu.author}）`;
      L.push(`- **本周进展**${stale}：${clean(wu.progress)}`);
      L.push(`- **下周计划**：${clean(wu.nextPlan)}`);
      L.push(`- **需要支持**：${clean(wu.supportNeeded)}`);
    }
    L.push("");
  }

  L.push(`## 三、KR 变化`);
  L.push("");
  const changed = data.keyResults.filter((k) => valueAt(k, start) !== k.currentValue);
  if (!changed.length) L.push(`- 本周无 KR 当前值变化`);
  for (const k of changed) {
    L.push(
      `- [${LAYER_META[k.layerId].short}] ${k.name}：${valueAt(k, start)} → **${k.currentValue}** / ${k.targetValue} ${k.unit}（${k.progress}%，${WORK_STATUS[k.status].label}）`,
    );
  }
  const riskyKr = data.keyResults.filter((k) => k.status === "at_risk" || k.confidence === "low");
  if (riskyKr.length) {
    L.push("");
    L.push(`需关注 KR（有风险或置信度低）：`);
    for (const k of riskyKr) L.push(`- [${LAYER_META[k.layerId].short}] ${k.name}：${k.currentValue} / ${k.targetValue} ${k.unit}`);
  }
  L.push("");

  L.push(`## 四、任务`);
  L.push("");
  const done = data.tasks.filter((t) => inRange(t.completedAt, start, end));
  const added = data.tasks.filter((t) => inRange(t.createdAt, start, end));
  const blocked = data.tasks.filter((t) => t.status === "blocked");
  L.push(`**本周完成（${done.length}）**`);
  if (!done.length) L.push(`- 无`);
  done.forEach((t) => L.push(`- [${LAYER_META[t.layerId].short}] ${t.title}（${t.owner}）`));
  L.push("");
  L.push(`**本周新增（${added.length}）**`);
  if (!added.length) L.push(`- 无`);
  added.forEach((t) => L.push(`- [${LAYER_META[t.layerId].short}] ${t.title}（${t.owner}，截止 ${t.dueDate}，${TASK_STATUS[t.status].label}）`));
  if (blocked.length) {
    L.push("");
    L.push(`**阻塞中（${blocked.length}）**`);
    blocked.forEach((t) =>
      L.push(`- [${LAYER_META[t.layerId].short}] ${t.title}（${t.owner}）依赖：${t.dependencies.join("、") || "—"}`),
    );
  }
  L.push("");

  L.push(`## 五、高风险项`);
  L.push("");
  const high = data.risks.filter((r) => r.level === "high" && r.status !== "closed");
  if (!high.length) L.push(`- 当前无未关闭的高风险项`);
  high.forEach((r) =>
    L.push(`- [${LAYER_META[r.layerId].short}] ${r.description}（${RISK_STATUS[r.status].label}，${r.owner}，${r.dueDate}）应对：${r.mitigation}`),
  );
  const otherOpen = data.risks.filter((r) => r.level !== "high" && r.status !== "closed").length;
  if (otherOpen) L.push(`- 另有中/低风险 ${otherOpen} 项未关闭`);
  L.push("");

  L.push(`## 六、本周产出资产`);
  L.push("");
  const assets = data.assets.filter((a) => inRange(a.updatedAt, start, end));
  if (!assets.length) L.push(`- 本周无资产更新`);
  assets.forEach((a) =>
    L.push(
      `- ${ASSET_TYPE[a.type]}《${a.name}》${a.version}（${ASSET_STATUS[a.status].label}）· 被 ${a.usedProvinces.length} 省使用 / ${a.usageCount} 次`,
    ),
  );
  L.push("");

  L.push(`## 七、FDE / 生态准入 / 阿里价值关键进展`);
  L.push("");
  L.push(`**FDE 滩头验证**`);
  data.fdeTracks.forEach((f) => {
    const stage = FDE_STAGES.find((s) => s.id === f.stage)?.label;
    const assetsDone = f.assets.filter((a) => a.done).length;
    L.push(`- ${f.city} · ${f.scenario}：当前阶段「${stage}」，回流资产 ${assetsDone}/${f.assets.length}`);
  });
  L.push("");
  L.push(`**Token 生态准入**`);
  data.provinces.forEach((p) =>
    L.push(
      `- ${p.province}（${ENTRY_TYPE[p.entryType]}）：${p.stage}，条件满足度 ${p.conditionFit}%，材料包${MATERIAL_STATUS[p.materialStatus].label}；缺口：${p.gaps || "无"}；下一步：${p.nextStep}`,
    ),
  );
  L.push("");
  const av = data.alibabaValue;
  L.push(`**阿里价值证明**`);
  L.push(`- PPU 地市上线节点：${av.ppuNodes.current} / ${av.ppuNodes.target}`);
  L.push(`- OpenTrek 省公司承载实例：${av.openTrekInstances.current} / ${av.openTrekInstances.target}`);
  L.push(`- 可复制方案卡：${av.assetCards.current} / ${av.assetCards.target}，带动阿里云/PPU 商机 ${av.businessLeads} 个`);
  L.push(`- 与阿里云运营商团队边界规则：${BOUNDARY_STATUS[av.boundaryStatus].label}`);
  L.push("");
  L.push(`---`);
  L.push(`_由“主线目标跟踪”工具根据当前数据自动生成。_`);

  return L.join("\n");
}

export function downloadMarkdown(md: string, filename: string) {
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}
