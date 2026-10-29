export type LayerId = "bloodline" | "econiche" | "alibaba";

export type PhaseId = "p90" | "p6_12" | "pAli";

/** 统一的状态色调：未开始灰 / 进行中蓝 / 有风险或阻塞橙 / 已完成绿 */
export type Tone = "gray" | "blue" | "orange" | "green";

export type WorkStatus = "not_started" | "in_progress" | "at_risk" | "done";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type Priority = "P0" | "P1" | "P2";
export type Confidence = "high" | "medium" | "low";
export type RiskLevel = "high" | "medium" | "low";
export type RiskStatus = "open" | "mitigating" | "closed";
export type AssetType = "solution_card" | "sales_qa" | "pitch_pack" | "consortium_template" | "case" | "value_statement";
export type AssetStatus = "draft" | "review" | "published" | "outdated";
export type MilestoneStatus = "not_started" | "in_progress" | "at_risk" | "done";

/** 标签可自定义；TASK_TAGS 为常用预设 */
export type TaskTag = string;

export interface WeeklyUpdate {
  id: string;
  date: string;
  progress: string;
  nextPlan: string;
  supportNeeded: string;
  author: string;
}

export interface EvidenceLink {
  id: string;
  title: string;
  kind: "方案卡" | "文档" | "案例" | "数据看板" | "其他";
  url: string;
}

export interface MainlineLayer {
  id: LayerId;
  order: number;
  name: string;
  positioning: string;
  problem: string;
  owner: string;
  participants: string[];
  startDate: string;
  endDate: string;
  currentStage: string;
  /** 总进度（%）：可手动调整，该主线 KR 变动时按 KR 均值重算 */
  progress: number;
  status: WorkStatus;
  /** 该主线下 KR / 任务的 id 列表（有序），由 store 与 keyResults / tasks 集合自动保持同步 */
  krList: string[];
  taskList: string[];
  weeklyUpdates: WeeklyUpdate[];
  evidence: EvidenceLink[];
  updatedAt: string;
}

export interface KrHistoryPoint {
  date: string;
  value: number;
}

export interface KeyResult {
  id: string;
  layerId: LayerId;
  phase: PhaseId;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  /** 定性口径说明，如“全员覆盖”“编写中”，与数值并列展示 */
  targetNote?: string;
  currentNote?: string;
  /** 由 currentValue / targetValue 计算，保存时同步 */
  progress: number;
  owner: string;
  dueDate: string;
  status: WorkStatus;
  confidence: Confidence;
  history: KrHistoryPoint[];
}

export interface Task {
  id: string;
  layerId: LayerId;
  title: string;
  description: string;
  owner: string;
  /** 为空表示不设截止日 */
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  tags: TaskTag[];
  dependencies: string[];
  assetRefs: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  layerId: LayerId;
  name: string;
  date: string;
  status: MilestoneStatus;
  dependency: string;
  note: string;
}

export interface Risk {
  id: string;
  layerId: LayerId;
  description: string;
  level: RiskLevel;
  impact: string;
  mitigation: string;
  owner: string;
  dueDate: string;
  status: RiskStatus;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  layerId: LayerId;
  version: string;
  owner: string;
  status: AssetStatus;
  usedProvinces: string[];
  usageCount: number;
  updatedAt: string;
  link: string;
}

export type FdeStage = "define" | "onsite" | "loop" | "backflow" | "replicate";

export interface FdeMember {
  role: "场景负责人" | "交付工程师" | "产品市场接口人";
  name: string;
}

export interface FdeMetric {
  name: string;
  target: string;
  current: string;
}

export interface FdeTrack {
  id: string;
  scenario: string;
  city: string;
  customer: string;
  members: FdeMember[];
  successMetrics: FdeMetric[];
  stage: FdeStage;
  ruleChecks: {
    isBeachheadScenario: boolean;
    hasBackflowList: boolean;
    tripartiteReviewed: boolean;
  };
  assets: { name: string; done: boolean }[];
  risks: string[];
  updatedAt: string;
}

export type EntryType = "direct_sales" | "telecom_token" | "si_consortium" | "ict_fallback";
export type MaterialStatus = "not_started" | "preparing" | "submitted" | "approved";

export interface ProvinceEcosystem {
  id: string;
  province: string;
  /** 一省一策的策略定位，如“直客直销突破区” */
  zone: string;
  entryType: EntryType;
  conditionFit: number;
  gaps: string;
  materialStatus: MaterialStatus;
  contact: string;
  stage: string;
  nextStep: string;
  dueDate: string;
  status: WorkStatus;
}

export type BoundaryStatus = "none" | "draft" | "aligned" | "executing";

export interface AlibabaValue {
  ppuNodes: { current: number; target: number };
  openTrekInstances: { current: number; target: number };
  assetCards: { current: number; target: number };
  businessLeads: number;
  boundaryStatus: BoundaryStatus;
  notes: string[];
  evidenceLinks: { title: string; url: string }[];
}

export interface AppSettings {
  currentPhase: PhaseId;
  weeklyHighlights: string;
}

export interface AppData {
  version: number;
  layers: MainlineLayer[];
  keyResults: KeyResult[];
  tasks: Task[];
  milestones: Milestone[];
  risks: Risk[];
  assets: Asset[];
  fdeTracks: FdeTrack[];
  provinces: ProvinceEcosystem[];
  alibabaValue: AlibabaValue;
  settings: AppSettings;
}

export type TimeRange = "all" | "week" | "30d" | "90d" | "overdue";

export interface GlobalFilters {
  layer: LayerId | "all";
  owner: string | "all";
  tone: Tone | "all";
  timeRange: TimeRange;
}
