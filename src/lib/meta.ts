import type {
  AssetStatus,
  AssetType,
  BoundaryStatus,
  Confidence,
  EntryType,
  FdeStage,
  LayerId,
  MaterialStatus,
  PhaseId,
  Priority,
  RiskLevel,
  RiskStatus,
  TaskStatus,
  TaskTag,
  Tone,
  WorkStatus,
} from "@/types";

export const LAYER_META: Record<LayerId, { name: string; short: string; accent: string }> = {
  bloodline: { name: "业务回血与信心重振线", short: "回血", accent: "bg-sky-700" },
  econiche: { name: "生态位构建线", short: "生态位", accent: "bg-indigo-700" },
  alibaba: { name: "阿里集团价值线", short: "阿里价值", accent: "bg-slate-700" },
};
export const LAYER_IDS: LayerId[] = ["bloodline", "econiche", "alibaba"];

export const PHASE_META: Record<PhaseId, { name: string; window: string }> = {
  p90: { name: "90天回血与滩头验证期", window: "0-3 个月" },
  p6_12: { name: "6-12个月生态位站住期", window: "6-12 个月" },
  pAli: { name: "阿里价值证明期", window: "持续 · 季度复盘" },
};
export const PHASE_IDS: PhaseId[] = ["p90", "p6_12", "pAli"];

export const TONE_LABEL: Record<Tone, string> = {
  gray: "未开始",
  blue: "进行中",
  orange: "有风险/阻塞",
  green: "已完成",
};

export const TONE_CLASS: Record<Tone, { badge: string; bar: string; dot: string }> = {
  gray: { badge: "bg-slate-100 text-slate-600 border-slate-200", bar: "bg-slate-400", dot: "bg-slate-400" },
  blue: { badge: "bg-blue-50 text-blue-700 border-blue-200", bar: "bg-blue-600", dot: "bg-blue-600" },
  orange: { badge: "bg-orange-50 text-orange-700 border-orange-200", bar: "bg-orange-500", dot: "bg-orange-500" },
  green: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-600", dot: "bg-emerald-600" },
};

export const WORK_STATUS: Record<WorkStatus, { label: string; tone: Tone }> = {
  not_started: { label: "未开始", tone: "gray" },
  in_progress: { label: "进行中", tone: "blue" },
  at_risk: { label: "有风险", tone: "orange" },
  done: { label: "已完成", tone: "green" },
};

export const TASK_STATUS: Record<TaskStatus, { label: string; tone: Tone }> = {
  todo: { label: "待办", tone: "gray" },
  in_progress: { label: "进行中", tone: "blue" },
  blocked: { label: "阻塞", tone: "orange" },
  done: { label: "已完成", tone: "green" },
};
export const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];

export const RISK_STATUS: Record<RiskStatus, { label: string; tone: Tone }> = {
  open: { label: "开放", tone: "orange" },
  mitigating: { label: "缓解中", tone: "blue" },
  closed: { label: "已关闭", tone: "green" },
};

export const RISK_LEVEL: Record<RiskLevel, { label: string; className: string; weight: number }> = {
  high: { label: "高", className: "bg-red-50 text-red-700 border-red-200", weight: 3 },
  medium: { label: "中", className: "bg-amber-50 text-amber-700 border-amber-200", weight: 2 },
  low: { label: "低", className: "bg-slate-100 text-slate-600 border-slate-200", weight: 1 },
};

export const ASSET_STATUS: Record<AssetStatus, { label: string; tone: Tone }> = {
  draft: { label: "草稿", tone: "gray" },
  review: { label: "评审中", tone: "blue" },
  outdated: { label: "待更新", tone: "orange" },
  published: { label: "已发布", tone: "green" },
};

export const ASSET_TYPE: Record<AssetType, string> = {
  solution_card: "方案卡",
  sales_qa: "销售问答",
  pitch_pack: "话术包",
  consortium_template: "联合体模板",
  case: "案例",
  value_statement: "价值陈述",
};

export const PRIORITY: Record<Priority, { label: string; className: string }> = {
  P0: { label: "P0", className: "bg-red-50 text-red-700 border-red-200" },
  P1: { label: "P1", className: "bg-amber-50 text-amber-700 border-amber-200" },
  P2: { label: "P2", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export const CONFIDENCE: Record<Confidence, { label: string; className: string }> = {
  high: { label: "高", className: "text-emerald-700" },
  medium: { label: "中", className: "text-amber-700" },
  low: { label: "低", className: "text-red-700" },
};

export const TASK_TAGS: TaskTag[] = [
  "方案包装", "高层拜访", "扫清障碍", "商务支撑", "POC能力", "FDE建设", "滩头验证", "资产沉淀",
  "机制设计", "商务谈判", "联合打单", "销售弹药", "价值证明", "方案卡", "生态准入", "联合体",
];

export const FDE_STAGES: { id: FdeStage; label: string }[] = [
  { id: "define", label: "定义成功标准" },
  { id: "onsite", label: "进场" },
  { id: "loop", label: "最小闭环跑通" },
  { id: "backflow", label: "回流方案卡" },
  { id: "replicate", label: "复制评估" },
];

export const ENTRY_TYPE: Record<EntryType, string> = {
  direct_sales: "直客直销 / 本地私有化算力盘活",
  telecom_token: "Token生态伙伴 / 电信算力超市",
  si_consortium: "本地集成商联合体",
  ict_fallback: "传统ICT兜底",
};

export const MATERIAL_STATUS: Record<MaterialStatus, { label: string; tone: Tone }> = {
  not_started: { label: "未启动", tone: "gray" },
  preparing: { label: "准备中", tone: "blue" },
  submitted: { label: "已提交", tone: "blue" },
  approved: { label: "已通过", tone: "green" },
};

export const BOUNDARY_STATUS: Record<BoundaryStatus, { label: string; tone: Tone }> = {
  none: { label: "未沟通", tone: "gray" },
  draft: { label: "初稿", tone: "blue" },
  aligned: { label: "已对齐", tone: "green" },
  executing: { label: "执行中", tone: "green" },
};

export function toOptions<K extends string>(rec: Record<K, string | { label: string }>) {
  return (Object.keys(rec) as K[]).map((k) => {
    const v = rec[k];
    return { value: k, label: typeof v === "string" ? v : v.label };
  });
}
