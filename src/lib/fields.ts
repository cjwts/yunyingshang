import type { FieldDef } from "@/components/entity-dialog";
import { addDays, todayISO, uid } from "@/lib/calc";
import {
  ASSET_STATUS,
  ASSET_TYPE,
  CONFIDENCE,
  ENTRY_TYPE,
  LAYER_IDS,
  LAYER_META,
  MATERIAL_STATUS,
  PHASE_IDS,
  PHASE_META,
  PRIORITY,
  RISK_LEVEL,
  RISK_STATUS,
  TASK_STATUS,
  TASK_TAGS,
  WORK_STATUS,
  toOptions,
} from "@/lib/meta";
import type {
  Asset,
  EvidenceLink,
  KeyResult,
  LayerId,
  Milestone,
  ProvinceEcosystem,
  Risk,
  Task,
  WeeklyUpdate,
} from "@/types";

const layerOptions = LAYER_IDS.map((id) => ({ value: id, label: LAYER_META[id].name }));
const phaseOptions = PHASE_IDS.map((id) => ({ value: id, label: PHASE_META[id].name }));
const workStatusOptions = toOptions(WORK_STATUS);

export const layerInfoFields: FieldDef[] = [
  { key: "positioning", label: "一句话定位", type: "textarea", required: true },
  { key: "problem", label: "要解决的问题", type: "textarea" },
  { key: "owner", label: "负责人", type: "text", required: true },
  { key: "participants", label: "参与人", type: "list" },
  { key: "startDate", label: "开始日期", type: "date" },
  { key: "endDate", label: "结束日期", type: "date" },
  { key: "currentStage", label: "当前阶段", type: "text", full: true },
  { key: "progress", label: "总进度（%）", type: "number" },
  { key: "status", label: "状态", type: "select", options: workStatusOptions },
];

export const krFields: FieldDef[] = [
  { key: "name", label: "KR 名称", type: "text", required: true, full: true },
  { key: "layerId", label: "所属层级", type: "select", options: layerOptions },
  { key: "phase", label: "所属阶段", type: "select", options: phaseOptions },
  { key: "targetValue", label: "目标值", type: "number" },
  { key: "currentValue", label: "当前值", type: "number" },
  { key: "unit", label: "单位", type: "text" },
  { key: "targetNote", label: "目标说明（定性）", type: "text", placeholder: "如：全员覆盖" },
  { key: "currentNote", label: "当前说明（定性）", type: "text", placeholder: "如：编写中" },
  { key: "owner", label: "负责人", type: "text", required: true },
  { key: "dueDate", label: "截止日", type: "date" },
  { key: "status", label: "状态", type: "select", options: workStatusOptions },
  { key: "confidence", label: "置信度", type: "select", options: toOptions(CONFIDENCE) },
];

export const newKr = (layerId: LayerId = "bloodline"): KeyResult => ({
  id: uid("kr"),
  layerId,
  phase: "p90",
  name: "",
  targetValue: 1,
  currentValue: 0,
  unit: "个",
  progress: 0,
  owner: "",
  dueDate: addDays(todayISO(), 30),
  status: "not_started",
  confidence: "medium",
  history: [],
});

export const taskFields: FieldDef[] = [
  { key: "title", label: "任务标题", type: "text", required: true, full: true },
  { key: "description", label: "描述", type: "textarea" },
  { key: "layerId", label: "所属层级", type: "select", options: layerOptions },
  { key: "owner", label: "负责人", type: "text", required: true },
  { key: "dueDate", label: "截止日", type: "date" },
  { key: "priority", label: "优先级", type: "select", options: toOptions(PRIORITY) },
  { key: "status", label: "状态", type: "select", options: toOptions(TASK_STATUS) },
  { key: "dependencies", label: "依赖", type: "list" },
  { key: "tags", label: "标签", type: "multiselect", options: TASK_TAGS.map((t) => ({ value: t, label: t })), full: true },
];

export const newTask = (layerId: LayerId = "bloodline"): Task => ({
  id: uid("t"),
  layerId,
  title: "",
  description: "",
  owner: "",
  dueDate: addDays(todayISO(), 7),
  priority: "P1",
  status: "todo",
  tags: [],
  dependencies: [],
  assetRefs: [],
  createdAt: todayISO(),
});

export const milestoneFields: FieldDef[] = [
  { key: "name", label: "里程碑名称", type: "text", required: true, full: true },
  { key: "layerId", label: "所属层级", type: "select", options: layerOptions },
  { key: "date", label: "日期", type: "date" },
  { key: "status", label: "状态", type: "select", options: workStatusOptions },
  { key: "dependency", label: "依赖", type: "text" },
  { key: "note", label: "说明", type: "textarea" },
];

export const newMilestone = (layerId: LayerId = "bloodline"): Milestone => ({
  id: uid("ms"),
  layerId,
  name: "",
  date: addDays(todayISO(), 30),
  status: "not_started",
  dependency: "",
  note: "",
});

export const riskFields: FieldDef[] = [
  { key: "description", label: "风险描述", type: "textarea", required: true },
  { key: "layerId", label: "所属层级", type: "select", options: layerOptions },
  { key: "level", label: "等级", type: "select", options: toOptions(RISK_LEVEL) },
  { key: "impact", label: "影响", type: "text", full: true },
  { key: "mitigation", label: "应对措施", type: "textarea" },
  { key: "owner", label: "负责人", type: "text", required: true },
  { key: "dueDate", label: "截止日", type: "date" },
  { key: "status", label: "状态", type: "select", options: toOptions(RISK_STATUS) },
];

export const newRisk = (layerId: LayerId = "bloodline"): Risk => ({
  id: uid("r"),
  layerId,
  description: "",
  level: "medium",
  impact: "",
  mitigation: "",
  owner: "",
  dueDate: addDays(todayISO(), 7),
  status: "open",
  createdAt: todayISO(),
});

export const assetFields: FieldDef[] = [
  { key: "name", label: "资产名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", options: toOptions(ASSET_TYPE) },
  { key: "layerId", label: "所属层级", type: "select", options: layerOptions },
  { key: "version", label: "版本", type: "text" },
  { key: "owner", label: "负责人", type: "text", required: true },
  { key: "status", label: "状态", type: "select", options: toOptions(ASSET_STATUS) },
  { key: "usedProvinces", label: "被使用省份", type: "list" },
  { key: "usageCount", label: "销售实际使用次数", type: "number" },
  { key: "updatedAt", label: "最近更新", type: "date" },
  { key: "link", label: "链接", type: "text" },
];

export const newAsset = (layerId: LayerId = "econiche"): Asset => ({
  id: uid("as"),
  name: "",
  type: "solution_card",
  layerId,
  version: "V0.1",
  owner: "",
  status: "draft",
  usedProvinces: [],
  usageCount: 0,
  updatedAt: todayISO(),
  link: "",
});

export const provinceFields: FieldDef[] = [
  { key: "province", label: "省份", type: "text", required: true },
  { key: "zone", label: "策略定位", type: "text", placeholder: "如：直客直销突破区" },
  { key: "entryType", label: "入口类型", type: "select", options: toOptions(ENTRY_TYPE) },
  { key: "conditionFit", label: "准入条件满足度（%）", type: "number" },
  { key: "materialStatus", label: "材料包状态", type: "select", options: toOptions(MATERIAL_STATUS) },
  { key: "gaps", label: "缺口项", type: "text", full: true },
  { key: "contact", label: "对接人", type: "text" },
  { key: "stage", label: "当前阶段", type: "text" },
  { key: "nextStep", label: "下一步", type: "text" },
  { key: "dueDate", label: "截止日", type: "date" },
  { key: "status", label: "状态", type: "select", options: workStatusOptions },
];

export const newProvince = (): ProvinceEcosystem => ({
  id: uid("pv"),
  province: "",
  zone: "",
  entryType: "direct_sales",
  conditionFit: 0,
  gaps: "",
  materialStatus: "not_started",
  contact: "",
  stage: "",
  nextStep: "",
  dueDate: addDays(todayISO(), 14),
  status: "not_started",
});

export const weeklyUpdateFields: FieldDef[] = [
  { key: "date", label: "日期", type: "date" },
  { key: "author", label: "填写人", type: "text", required: true },
  { key: "progress", label: "本周进展", type: "textarea", required: true },
  { key: "nextPlan", label: "下周计划", type: "textarea" },
  { key: "supportNeeded", label: "需要支持", type: "textarea" },
];

export const newWeeklyUpdate = (author = ""): WeeklyUpdate => ({
  id: uid("wu"),
  date: todayISO(),
  author,
  progress: "",
  nextPlan: "",
  supportNeeded: "",
});

export const evidenceFields: FieldDef[] = [
  { key: "title", label: "标题", type: "text", required: true },
  {
    key: "kind",
    label: "类型",
    type: "select",
    options: ["方案卡", "文档", "案例", "数据看板", "其他"].map((v) => ({ value: v, label: v })),
  },
  { key: "url", label: "链接", type: "text", full: true, placeholder: "https://" },
];

export const newEvidence = (): EvidenceLink => ({ id: uid("ev"), title: "", kind: "文档", url: "" });
