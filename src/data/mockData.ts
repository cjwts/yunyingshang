import { addDays, krProgress, todayISO, weekRange } from "@/lib/calc";
import type { AppData, KeyResult } from "@/types";

export const DATA_VERSION = 4;

/**
 * 示例数据：日期以“今天”为基准相对生成，保证任何时候打开都处于合理的进度窗口。
 * 人名、省份、地市均为脱敏代称。
 */
export function createMockData(): AppData {
  const t = todayISO();
  const D = (n: number) => addDays(t, n);
  const { start: wk } = weekRange(t);
  const lastWeek = addDays(wk, -3);

  const kr = (k: Omit<KeyResult, "progress" | "history"> & { prev?: number }): KeyResult => {
    const { prev, ...rest } = k;
    const history = [{ date: addDays(t, -45), value: 0 }];
    if (prev !== undefined) history.push({ date: lastWeek, value: prev });
    if (rest.currentValue !== (prev ?? 0)) history.push({ date: D(-1), value: rest.currentValue });
    return { ...rest, progress: krProgress(rest), history };
  };

  return {
    version: DATA_VERSION,
    settings: {
      currentPhase: "p90",
      weeklyHighlights:
        "1. A省 Token 生态伙伴申报材料包进入二轮补材，缺口收敛到“运营服务案例”1 项。\n2. FDE 小分队在 A省·X市 完成进场，存量 GPU 盘点完成 70%。\n3. 方案卡《地市存量GPU盘活》V1 已在 2 个省份销售例会使用。",
    },
    layers: [
      {
        id: "bloodline",
        order: 1,
        name: "业务回血线",
        positioning:
          "摒弃单纯的人天项目依赖，以‘ZStack AI自研 + 阿里AI产品 + FDE交付能力’的组合拳切入高价值场景，加速商务闭环，确保团队基本盘与良性现金流。",
        problem:
          "现有收入高度依赖 ICT 定开流程，回款周期长、毛利薄；需要在 90 天内找到不依赖 ICT 流程的商机入口，同时把报销、垫资、价格授权等止血事项落到明确节点。",
        owner: "李航",
        participants: ["孙悦", "赵宁", "省区销售代表"],
        startDate: D(-40),
        endDate: D(50),
        stage: "首批高价值组合拳项目已启动，正打通重点省份直签与商务流程。",
        progress: 35,
        status: "in_progress",
        updatedAt: D(-1),
        evidence: [
          { id: "ev-b1", title: "场景化定开立项评审纪要", kind: "文档", url: "https://example.com/docs/scene-dev-review" },
          { id: "ev-b2", title: "A省 Token 生态准入材料包清单", kind: "文档", url: "https://example.com/docs/a-province-package" },
        ],
        weeklyUpdates: [
          {
            id: "wu-b1",
            date: D(-1),
            author: "李航",
            progress: "场景化定开项目 #1、#2 均完成立项评审，回流资产清单已附；A省准入材料进入二轮补材；B省首轮对接会筹备中。",
            nextPlan: "两个定开项目进场启动；B省完成首轮对接会，明确供给主体 vs 运营服务伙伴路线。",
            supportNeeded: "需要财务确认垫资审批节点；需要销售 VP 协调 B省省公司对接人。",
          },
          {
            id: "wu-b0",
            date: addDays(wk, -5),
            author: "李航",
            progress: "梳理 6 个候选场景化定开机会，筛出 2 个符合“回流资产”要求的项目。",
            nextPlan: "项目 #1 立项评审；A省准入材料补齐。",
            supportNeeded: "无",
          },
        ],
      },
      {
        id: "econiche",
        order: 2,
        name: "生态位构建线",
        positioning:
          "围绕‘ZStack AI自研 + 阿里AI产品 + FDE交付能力’，卡位地市Token运营的‘现场落地层’。通过全链路闭环验证，沉淀标准化方案，建立不可替代的专属生态位。",
        problem:
          "地市存量 GPU 利用率低、计量计费链路缺失，省公司 Token 运营平台缺少现场落地能力；我们要成为地市侧不可替代的落地层，而不是又一个 ICT 定开供应商。",
        owner: "王蕾",
        participants: ["周凯", "刘洋", "赵宁"],
        startDate: D(-30),
        endDate: D(300),
        stage: "FDE交付力量已进驻首个地市，正基于双引擎产品矩阵输出标准化方案卡。",
        progress: 20,
        status: "in_progress",
        updatedAt: D(-2),
        evidence: [
          { id: "ev-e1", title: "方案卡：地市存量GPU盘活 V1", kind: "方案卡", url: "https://example.com/cards/gpu-revive" },
          { id: "ev-e2", title: "X市 资源利用率周看板", kind: "数据看板", url: "https://example.com/dash/x-city-util" },
        ],
        weeklyUpdates: [
          {
            id: "wu-e1",
            date: D(-2),
            author: "王蕾",
            progress: "FDE 小分队完成 X市 进场，存量 GPU 盘点完成 70%；方案卡《地市存量GPU盘活》V1 发布，2 省销售例会已使用。",
            nextPlan: "跑通第一条“存量算力→Token 计量→账单”链路；《省公司Token计量对接》进入评审。",
            supportNeeded: "需要阿里侧提供 OpenTrek 计量模块的测试 License。",
          },
        ],
      },
      {
        id: "alibaba",
        order: 3,
        name: "阿里总部价值线",
        positioning:
          "明确‘阿里主攻省级集采、事业部主攻地市下沉’的协同边界。用‘地市算力上线节点、Token计量嵌入、方案卡带动商机’三大硬指标，证明我们是阿里AI生态在运营商落地的唯一纵深。",
        problem:
          "总部需要看到可统计、可复盘的价值贡献；同时必须与阿里云运营商团队划清边界，避免抢单或重复覆盖。",
        owner: "陈晨",
        participants: ["王蕾", "李航"],
        startDate: D(-20),
        endDate: D(340),
        stage: "正梳理三项核心指标口径，及与阿里云运营商团队的业务协同边界。",
        progress: 5,
        status: "at_risk",
        updatedAt: D(-3),
        evidence: [
          { id: "ev-a1", title: "三个可统计口径定义 v0.3", kind: "文档", url: "https://example.com/docs/ali-metrics" },
        ],
        weeklyUpdates: [
          {
            id: "wu-a1",
            date: D(-3),
            author: "陈晨",
            progress: "三个可统计口径定义 v0.3 完成；与阿里云运营商团队边界规则初稿已发出，待对方反馈。",
            nextPlan: "约一次边界对齐会；确认 PPU 首个地市上线节点的统计口径。",
            supportNeeded: "需要事业部负责人出面约阿里云运营商团队负责人。",
          },
        ],
      },
    ],
    keyResults: [
      kr({ id: "kr-b1", layerId: "bloodline", phase: "p90", name: "场景化定开项目立项数 ≥ 2 个，且每个项目有回流资产清单", targetValue: 2, currentValue: 2, prev: 1, unit: "个", owner: "李航", dueDate: D(30), status: "done", confidence: "high" }),
      kr({ id: "kr-b2", layerId: "bloodline", phase: "p90", name: "2 个省份完成 Token 生态伙伴/供给主体申报或进入对接流程", targetValue: 2, currentValue: 1, prev: 1, unit: "省", owner: "孙悦", dueDate: D(45), status: "in_progress", confidence: "medium" }),
      kr({ id: "kr-b3", layerId: "bloodline", phase: "p90", name: "第一个不经过 ICT 流程的商机出现", targetValue: 1, currentValue: 0, unit: "个", owner: "李航", dueDate: D(50), status: "at_risk", confidence: "low" }),
      kr({ id: "kr-b4", layerId: "bloodline", phase: "p90", name: "止血线关键事项推进状态（报销/垫资/价格授权）有明确节点", targetValue: 3, currentValue: 0, unit: "项", owner: "李航", dueDate: D(20), status: "at_risk", confidence: "medium" }),
      kr({ id: "kr-e1", layerId: "econiche", phase: "p90", name: "1 个地市完成“存量算力→可计费 Token”最小闭环验证", targetValue: 1, currentValue: 0, unit: "个", owner: "周凯", dueDate: D(55), status: "in_progress", confidence: "medium" }),
      kr({ id: "kr-e2", layerId: "econiche", phase: "p90", name: "方案卡 V1 产出 3 张（地市存量GPU盘活/省公司Token计量对接/政企Token套餐）", targetValue: 3, currentValue: 1, prev: 0, unit: "张", owner: "赵宁", dueDate: D(25), status: "in_progress", confidence: "high" }),
      kr({ id: "kr-e3", layerId: "econiche", phase: "p6_12", name: "方案卡被至少 3 个省份销售实际使用", targetValue: 3, currentValue: 2, prev: 1, unit: "省", owner: "赵宁", dueDate: D(120), status: "in_progress", confidence: "medium" }),
      kr({ id: "kr-e4", layerId: "econiche", phase: "p90", name: "FDE 小分队 90 天滩头验证完成，且未接普通 ICT 定开", targetValue: 1, currentValue: 0, unit: "次", owner: "周凯", dueDate: D(58), status: "in_progress", confidence: "medium" }),
      kr({ id: "kr-e5", layerId: "econiche", phase: "p6_12", name: "1 个省公司 OpenTrek 计量对接进入 POC 或实际承载", targetValue: 1, currentValue: 0, unit: "个", owner: "王蕾", dueDate: D(150), status: "not_started", confidence: "medium" }),
      kr({ id: "kr-a1", layerId: "alibaba", phase: "pAli", name: "地市 PPU 上线节点 ≥ 2 个", targetValue: 2, currentValue: 0, unit: "个", owner: "陈晨", dueDate: D(180), status: "not_started", confidence: "medium" }),
      kr({ id: "kr-a2", layerId: "alibaba", phase: "pAli", name: "OpenTrek 计量/分发实例 ≥ 1 个省公司", targetValue: 1, currentValue: 0, unit: "个", owner: "王蕾", dueDate: D(200), status: "not_started", confidence: "low" }),
      kr({ id: "kr-a3", layerId: "alibaba", phase: "pAli", name: "可复制方案卡 ≥ 5 张，并带动阿里云/PPU 后续商机", targetValue: 5, currentValue: 1, prev: 0, unit: "张", owner: "赵宁", dueDate: D(240), status: "in_progress", confidence: "medium" }),
      kr({ id: "kr-a4", layerId: "alibaba", phase: "pAli", name: "与阿里云运营商团队完成一次边界规则对齐", targetValue: 1, currentValue: 0, unit: "次", owner: "陈晨", dueDate: D(21), status: "at_risk", confidence: "low" }),
    ],
    tasks: [
      { id: "b-t1", layerId: "bloodline", title: "打包‘直客直销’与‘电信生态’双轨制一页纸方案", description: "针对销售不敢卖、不会卖的问题，提炼两套极简方案：一是面向直客的“私有化算力盘活版”，讲清如何帮客户省钱/创收；二是面向电信体系的“Token生态准入与算力并网版”，讲清如何帮电信完成Token指标。用一页纸直接给一线做敲门砖。", owner: "产品市场部", dueDate: "", priority: "P0", status: "in_progress", tags: ["方案包装", "弹药输出"], dependencies: [], assetRefs: [], createdAt: D(-14) },
      { id: "b-t2", layerId: "bloodline", title: "搭建并验证阿里AI+ZStack底座的轻量级POC演示沙箱", description: "利用现有测试环境完成OpenTrek Token计量与ZStack AIOS的联调。形成标准化的演示环境与测试流程，确保销售在直客或电信客户提出“现场测一下”的需求时，产品市场部能随时顶上，提供Demo支撑，不因技术验证卡壳丢单。", owner: "产品市场部", dueDate: "", priority: "P0", status: "in_progress", tags: ["POC能力", "技术兜底"], dependencies: [], assetRefs: [], createdAt: D(-14) },
      { id: "b-t3", layerId: "bloodline", title: "确立首批FDE人员及现场接单考核规则", description: "从具备底层技术背景的团队中选拔骨干组建FDE小分队。明确FDE的接单边界（不接纯人天外包、必须能产出可复用方案卡）。制定FDE在现场的交付SOP，确保前线销售清楚“什么项目可以拉FDE进场”，且后方技术交付质量可控。", owner: "产品市场部", dueDate: "", priority: "P0", status: "in_progress", tags: ["FDE建设", "交付协同"], dependencies: [], assetRefs: [], createdAt: D(-14) },
      { id: "b-t4", layerId: "bloodline", title: "制定面向电信体系关键节点的拜访计划与Pitch材料", description: "配合销售团队，梳理电信Token运营中心、算力超市负责人的核心KPI与关注点。制作“从存量算力到Token计费”的价值汇报材料，以产品专家身份参与关键客户的拜访，用业务逻辑帮助销售推进决策。", owner: "产品市场部", dueDate: "", priority: "P1", status: "in_progress", tags: ["高层拜访", "价值输出"], dependencies: [], assetRefs: [], createdAt: D(-14) },
      { id: "b-t5", layerId: "bloodline", title: "梳理阻碍直客与电信打单的真实卡点及应对预案", description: "收集一线在推进直客或电信项目中遇到的实际阻力（如：竞品价格更低、客户认为产品不够成熟、集成资质不够等），针对性地输出对比测试报告、特价支持诉求材料或技术解答FAQ，帮助销售在商务谈判中争取主动。", owner: "产品市场部", dueDate: "", priority: "P1", status: "in_progress", tags: ["竞品应对", "扫清障碍"], dependencies: [], assetRefs: [], createdAt: D(-14) },
      { id: "t-5", layerId: "econiche", title: "X市 存量 GPU 盘点与利用率基线", description: "输出资源清单与利用率基线，作为 Token 计量成功标准的起点。", owner: "刘洋", dueDate: D(2), priority: "P0", status: "in_progress", tags: ["FDE", "生态位"], dependencies: [], assetRefs: [], createdAt: D(-14) },
      { id: "t-6", layerId: "econiche", title: "方案卡《省公司Token计量对接》V1 评审", description: "与 FDE 回流的对接规范合并，进入评审。", owner: "赵宁", dueDate: D(6), priority: "P1", status: "todo", tags: ["方案卡", "销售赋能"], dependencies: ["t-5"], assetRefs: ["as-2"], createdAt: D(-4) },
      { id: "t-7", layerId: "econiche", title: "方案卡《地市存量GPU盘活》V1 发布并组织销售培训", description: "在 2 个省份销售例会讲解，收集异议话术。", owner: "赵宁", dueDate: D(-3), priority: "P1", status: "done", tags: ["方案卡", "销售赋能"], dependencies: [], assetRefs: ["as-1"], createdAt: D(-18), completedAt: D(-2) },
      { id: "t-8", layerId: "econiche", title: "FDE 三方评审机制固化为制度文件", description: "产品市场 / 交付 / 销售三方评审模板，FDE 接单前必过；报事业部发文。", owner: "王蕾", dueDate: D(12), priority: "P1", status: "todo", tags: ["FDE"], dependencies: [], assetRefs: [], createdAt: D(-25) },
      { id: "t-9", layerId: "alibaba", title: "与阿里云运营商团队边界规则对齐会", description: "基于初稿逐条对齐：谁主导、谁跟进、商机如何登记。", owner: "陈晨", dueDate: D(10), priority: "P0", status: "todo", tags: ["阿里价值", "联合体"], dependencies: ["事业部负责人约会"], assetRefs: [], createdAt: D(-3) },
      { id: "t-10", layerId: "alibaba", title: "三个可统计口径的数据底座表搭建", description: "PPU 上线节点、OpenTrek 承载实例、方案卡及带动商机，统一登记表与证据链接。", owner: "陈晨", dueDate: D(14), priority: "P1", status: "in_progress", tags: ["阿里价值"], dependencies: [], assetRefs: [], createdAt: D(-8) },
    ],
    milestones: [
      { id: "ms-1", layerId: "bloodline", name: "场景化定开项目 #1 立项", date: D(-5), status: "done", dependency: "", note: "已附回流资产清单" },
      { id: "ms-2", layerId: "bloodline", name: "两省生态准入进入对接流程", date: D(45), status: "in_progress", dependency: "A省补材 / B省对接会", note: "" },
      { id: "ms-3", layerId: "econiche", name: "X市 最小闭环跑通", date: D(40), status: "in_progress", dependency: "GPU 盘点 + 计量模块 License", note: "可计费 Token 首张账单" },
      { id: "ms-4", layerId: "econiche", name: "90 天滩头验证复盘", date: D(58), status: "not_started", dependency: "最小闭环跑通", note: "决定是否复制到第二个地市" },
      { id: "ms-5", layerId: "alibaba", name: "边界规则对齐会", date: D(10), status: "at_risk", dependency: "事业部负责人约会", note: "" },
      { id: "ms-6", layerId: "alibaba", name: "首个地市 PPU 上线节点", date: D(120), status: "not_started", dependency: "X市 闭环验证", note: "" },
    ],
    risks: [
      { id: "r-1", layerId: "bloodline", description: "垫资审批节点不明确，场景化定开项目可能被迫延期启动", level: "high", impact: "回血线 90 天现金流目标落空", mitigation: "本周内与财务 BP 确定审批节点；准备分阶段付款方案", owner: "李航", dueDate: D(5), status: "open", createdAt: D(-6) },
      { id: "r-2", layerId: "econiche", description: "FDE 小分队被拉去支援普通 ICT 定开项目", level: "high", impact: "滩头验证周期被稀释，方案卡回流延迟", mitigation: "坚持三方评审；FDE 考核不看人天，由事业部负责人背书", owner: "王蕾", dueDate: D(7), status: "mitigating", createdAt: D(-10) },
      { id: "r-3", layerId: "alibaba", description: "与阿里云运营商团队边界未对齐，存在商机重叠争议", level: "high", impact: "阿里总部对价值口径不认可", mitigation: "尽快召开对齐会，先对齐“谁登记商机”规则", owner: "陈晨", dueDate: D(10), status: "open", createdAt: D(-4) },
      { id: "r-4", layerId: "econiche", description: "OpenTrek 计量模块测试 License 未到位", level: "medium", impact: "X市 闭环验证延后约 2 周", mitigation: "通过阿里接口人走加急流程；先用模拟计量数据跑链路", owner: "周凯", dueDate: D(8), status: "open", createdAt: D(-2) },
      { id: "r-5", layerId: "bloodline", description: "B省 入口类型判断不清，材料包可能返工", level: "low", impact: "B省 准入延迟一个申报窗口", mitigation: "首轮对接会前准备两套材料包骨架", owner: "孙悦", dueDate: D(9), status: "open", createdAt: D(-1) },
    ],
    assets: [
      { id: "as-1", name: "地市存量GPU盘活方案卡", type: "solution_card", layerId: "econiche", version: "V1", owner: "赵宁", status: "published", usedProvinces: ["A省", "B省"], usageCount: 5, updatedAt: D(-2), link: "https://example.com/cards/gpu-revive" },
      { id: "as-2", name: "省公司Token计量对接规范（草稿）", type: "solution_card", layerId: "econiche", version: "V0.8", owner: "赵宁", status: "review", usedProvinces: ["A省"], usageCount: 2, updatedAt: D(-1), link: "https://example.com/cards/token-metering" },
      { id: "as-3", name: "政企Token套餐", type: "solution_card", layerId: "bloodline", version: "V0.3", owner: "李航", status: "draft", usedProvinces: [], usageCount: 0, updatedAt: D(-6), link: "https://example.com/cards/gov-token-package" },
    ],
    fdeTracks: [
      {
        id: "fde-1",
        scenario: "地市存量 GPU 盘活 → 可计费 Token",
        city: "A省·X市",
        customer: "X市分公司 政企部 / 云网运营中心",
        members: [
          { role: "场景负责人", name: "周凯" },
          { role: "交付工程师", name: "刘洋" },
          { role: "产品市场接口人", name: "王蕾" },
        ],
        successMetrics: [
          { name: "可计费 Token 量", target: "≥ 5 亿 Token/月", current: "未计量" },
          { name: "资源利用率", target: "≥ 45%", current: "18%（基线）" },
          { name: "服务开通周期", target: "≤ 3 个工作日", current: "约 15 个工作日" },
          { name: "政企客户调用持续性", target: "≥ 3 家连续 4 周调用", current: "0" },
        ],
        stage: "onsite",
        ruleChecks: { isBeachheadScenario: true, hasBackflowList: true, tripartiteReviewed: true },
        assets: [
          { name: "配置模板", done: true },
          { name: "对接规范", done: false },
          { name: "报价逻辑", done: false },
          { name: "异议话术", done: false },
          { name: "方案卡版本（地市存量GPU盘活 V1）", done: true },
        ],
        risks: ["OpenTrek 计量模块 License 未到位", "存在被抽调支援 ICT 定开的压力"],
        updatedAt: D(-2),
      },
    ],
    provinces: [
      { id: "pv-1", province: "A省", entryType: "token_supplier", conditionFit: 75, gaps: "运营服务案例 1 项", materialStatus: "submitted", contact: "孙悦", stage: "二轮补材", nextStep: "补齐运营服务案例并提交", dueDate: D(3), status: "in_progress" },
      { id: "pv-2", province: "B省", entryType: "ops_partner", conditionFit: 40, gaps: "入口类型未定；本地服务团队证明；联合体协议", materialStatus: "preparing", contact: "孙悦", stage: "首轮对接", nextStep: "召开首轮对接会，确定入口类型", dueDate: D(9), status: "at_risk" },
    ],
    alibabaValue: {
      ppuNodes: { current: 0, target: 2 },
      openTrekInstances: { current: 0, target: 1 },
      assetCards: { current: 1, target: 5 },
      businessLeads: 1,
      boundaryStatus: "draft",
      notes: [
        "我们做的是阿里云不做的“地市落地纵深”：现场盘活、计量对接、政企套餐落地。",
        "每一个 PPU 上线节点、OpenTrek 承载实例都可登记、可复盘，形成总部可统计的事实底座。",
        "方案卡是放大器：一张卡被多省复用，带动阿里云/PPU 后续商机。",
      ],
      evidenceLinks: [
        { title: "三个可统计口径定义 v0.3", url: "https://example.com/docs/ali-metrics" },
        { title: "边界规则初稿", url: "https://example.com/docs/boundary-draft" },
      ],
    },
  };
}
