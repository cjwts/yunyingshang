import { addDays, krProgress, todayISO, weekRange } from "@/lib/calc";
import type { AppData, KeyResult, LayerId, MainlineLayer, Priority, Task, TaskStatus } from "@/types";

export const DATA_VERSION = 5;

/**
 * 示例数据：日期以“今天”为基准相对生成，保证任何时候打开都处于合理的进度窗口。
 * 任务一律站在产品市场部职能视角，不设具体截止日。
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

  const task = (
    id: string,
    layerId: LayerId,
    title: string,
    owner: string,
    status: TaskStatus,
    priority: Priority,
    tags: string[],
    description: string,
  ): Task => ({
    id,
    layerId,
    title,
    description,
    owner,
    dueDate: "",
    priority,
    status,
    tags,
    dependencies: [],
    assetRefs: [],
    createdAt: D(-14),
  });

  const keyResults: KeyResult[] = [
    // 第1层：业务回血与信心重振线
    kr({ id: "kr-b1", layerId: "bloodline", phase: "p90", name: "跑通双轨模式下的首批项目回款", targetValue: 2, currentValue: 0, unit: "笔", targetNote: "首批笔数", currentNote: "跟进中", owner: "产品市场部负责人", dueDate: D(60), status: "in_progress", confidence: "medium" }),
    kr({ id: "kr-b2", layerId: "bloodline", phase: "p90", name: "发布极简版打单弹药，恢复核心销售信心", targetValue: 100, currentValue: 70, prev: 40, unit: "%", targetNote: "全员覆盖", currentNote: "编写中", owner: "产品市场部", dueDate: D(30), status: "in_progress", confidence: "high" }),
    kr({ id: "kr-b3", layerId: "bloodline", phase: "p90", name: "打通特价审批与垫资清算的快速通道", targetValue: 3, currentValue: 1, prev: 0, unit: "项", targetNote: "机制落地", currentNote: "草拟中", owner: "产品市场部负责人", dueDate: D(45), status: "in_progress", confidence: "medium" }),
    // 第2层：生态位构建线
    kr({ id: "kr-e1", layerId: "econiche", phase: "p90", name: "1个地市完成“存量算力→可计费Token”最小闭环验证", targetValue: 1, currentValue: 0, unit: "个", owner: "FDE负责人", dueDate: D(75), status: "in_progress", confidence: "medium" }),
    kr({ id: "kr-e2", layerId: "econiche", phase: "p90", name: "方案卡 V1 产出 3 张（存量GPU盘活/Token计量对接/政企Token套餐）", targetValue: 3, currentValue: 1, prev: 0, unit: "张", owner: "产品市场部", dueDate: D(60), status: "in_progress", confidence: "high" }),
    kr({ id: "kr-e3", layerId: "econiche", phase: "p6_12", name: "方案卡被至少 3 个省份销售实际使用", targetValue: 3, currentValue: 1, unit: "省", owner: "产品市场部", dueDate: D(180), status: "in_progress", confidence: "medium" }),
    // 第3层：阿里集团价值线
    kr({ id: "kr-a1", layerId: "alibaba", phase: "pAli", name: "输出首批《阿里AI+ZStack》联合拿单方案与报价体系", targetValue: 100, currentValue: 15, prev: 0, unit: "%", targetNote: "方案与报价体系发布", currentNote: "框架初稿", owner: "产品市场部", dueDate: D(60), status: "in_progress", confidence: "medium" }),
    kr({ id: "kr-a2", layerId: "alibaba", phase: "pAli", name: "确立与阿里云的‘线索互转与联合带货’分润/报备机制", targetValue: 1, currentValue: 0, unit: "项", targetNote: "机制签署", currentNote: "首轮沟通", owner: "产品市场部", dueDate: D(90), status: "not_started", confidence: "low" }),
    kr({ id: "kr-a3", layerId: "alibaba", phase: "pAli", name: "跑通首批联合带货标杆项目，验证渠道变现能力", targetValue: 2, currentValue: 0, unit: "个", owner: "产品市场部", dueDate: D(180), status: "not_started", confidence: "medium" }),
  ];

  const tasks: Task[] = [
    // 第1层：聚焦极简弹药与前线支援
    task("b-t1", "bloodline", "打包‘直客直销’与‘电信生态’双轨制一页纸方案", "产品市场部", "in_progress", "P0", ["方案包装"],
      "提炼两套极简方案：直客版（私有化算力盘活省钱方案）与电信版（Token生态并网达标方案）。直接给出基础配置清单和参考报价区间，让销售拿着就能去谈钱。"),
    task("b-t2", "bloodline", "陪同销售攻坚首批直客与电信关键节点拜访", "产品市场部", "in_progress", "P0", ["高层拜访"],
      "产品市场部负责人及核心骨干直接跟销售绑定。带着“阿里AI+ZStack”的业务逻辑去讲，用专家身份背书，当场解答客户疑虑，配合销售快速锁定POC意向或签单。"),
    task("b-t3", "bloodline", "扫清当前成单的技术与竞品路障", "产品市场部", "in_progress", "P1", ["扫清障碍"],
      "不搞重型测试环境，直接利用现有轻量级Demo演示。针对一线反馈的竞品（如SmartX）价格战或功能质疑，立刻输出应对FAQ和对比数据，不让项目停滞。"),
    task("b-t4", "bloodline", "配合推动首批直客与电信生态项目的商务闭环", "产品市场部", "in_progress", "P1", ["商务支撑"],
      "配合销售整理特价申请的材料支撑、联合体交付的技术边界划分说明。确保在商务谈判阶段后方材料不掉链子，助力项目快速进入合同流程。"),
    // 第2层：聚焦能力底座与交付标准
    task("e-t1", "econiche", "搭建标准化阿里AI（OpenTrek/PPU）+ZStack POC测试沙箱", "产品市场部", "in_progress", "P0", ["POC能力"],
      "利用现有测试环境完成联调。形成标准化的演示环境与测试流程，确保销售在面临客户“现场测一下”的需求时，团队能随时顶上，不因技术验证卡壳丢单。"),
    task("e-t2", "econiche", "启动首批FDE团队选拔与考核规则制定", "产品市场部", "in_progress", "P0", ["FDE建设"],
      "从具备底层技术背景的团队中选拔骨干。明确FDE的接单边界（不接纯人天外包、必须能产出可复用方案卡）。制定FDE在现场的交付SOP。"),
    task("e-t3", "econiche", "依托FDE开展首个地市滩头项目验证", "FDE团队 & 产品市场部", "in_progress", "P0", ["滩头验证"],
      "带“ZStack底座+阿里AI”进场，跑通“异构算力接入→容器承载→Token计量→计费”全链路，形成首个成功样板点。"),
    task("e-t4", "econiche", "沉淀《地市算力盘活与Token计费》标准化方案卡", "产品市场部", "in_progress", "P1", ["资产沉淀"],
      "将FDE验证过程中的配置规范、接口逻辑、定价模式提炼成可复制的方案卡V1。"),
    // 第3层：聚焦带货变现与要资源
    task("a-t1", "alibaba", "制定‘ZStack+阿里AI’联合销售的利益测算与激励规则", "产品市场部 & 销售负责人", "in_progress", "P0", ["机制设计"],
      "拆解阿里AI产品的利润空间，形成面向一线的利益测算模型。明确“底座+AI”搭售的高毛利优势，并联合制定专项销售提成与奖金激励政策，让一线看清收益，自发倾向主推联合方案。"),
    task("a-t2", "alibaba", "向阿里争取‘底价+高返点’的特价资源池", "产品市场部", "in_progress", "P0", ["商务谈判"],
      "用“帮阿里下沉带货”作为筹码，向阿里区域团队申请专属的特价折扣和项目返点。把争取来的底价转化为前端的打单优势，让销售有足够厚的利润垫。"),
    task("a-t3", "alibaba", "打通与阿里销售的‘绑定性报备’与联合打单机制", "产品市场部", "in_progress", "P1", ["联合打单"],
      "与阿里云一线销售建立利益共同体。只要客户有下沉或私有化需求，阿里的销售就愿意把线索交给我们，彼此算业绩，联合见客户以提升赢单率。"),
    task("a-t4", "alibaba", "出包装‘算过账’的极简打单报价器", "产品市场部", "todo", "P1", ["销售弹药"],
      "出个傻瓜式的“极简报价器”或利润测算表，输入客户规模，一键生成包含“ZStack底座+阿里AI+服务费”的打包报价，让销售一眼看出这单能赚多少钱。"),
    task("a-t5", "alibaba", "提炼‘带货战报’，向阿里输出渠道变现价值", "产品市场部", "todo", "P2", ["价值证明"],
      "将我们在电信体系拿下的商机、卖出的阿里产品数量整理成“带货战报”反馈给阿里。证明我们的渠道变现能力，换取后续更便宜的资源倾斜。"),
  ];

  const ids = (list: { id: string; layerId: LayerId }[], layerId: LayerId) =>
    list.filter((x) => x.layerId === layerId).map((x) => x.id);

  const layer = (l: Omit<MainlineLayer, "krList" | "taskList">): MainlineLayer => ({
    ...l,
    krList: ids(keyResults, l.id),
    taskList: ids(tasks, l.id),
  });

  return {
    version: DATA_VERSION,
    settings: {
      currentPhase: "p90",
      weeklyHighlights:
        "1. 历史欠款清收专班成立，按客户逐笔跟进回款，报销机制恢复方案已提交决策。\n2. 双轨制一页纸方案（直客版/电信版）完成初稿，福建、北京销售已开始试用。\n3. FDE首批人员选拔启动，POC沙箱联调方案确定，等待阿里测试资源到位。",
    },
    layers: [
      layer({
        id: "bloodline",
        order: 1,
        name: "业务回血与信心重振线",
        positioning:
          "直面千万级历史欠款与垫资死结。以“清欠款+防垫资”双管齐下：直客主打“零垫资快回款”稳健创收；电信主打“联合体+公司兜底”化解垫资风险。彻底恢复报销机制，用真实健康的现金流重塑一线销售信心。",
        problem:
          "历史欠款与项目垫资压力叠加，报销机制受阻，一线销售不敢接单、不会讲价值。产品市场部要用极简弹药、陪访和商务材料支撑，帮一线把单子安全地拿回来。",
        owner: "产品市场部负责人",
        participants: ["区域销售负责人", "财务BP", "商务"],
        startDate: D(-40),
        endDate: D(50),
        currentStage: "历史欠款清收专班推进中，直客打样与电信垫资机制重构并行。",
        progress: 35,
        status: "in_progress",
        updatedAt: D(-1),
        evidence: [
          { id: "ev-b1", title: "双轨制一页纸方案（直客版 / 电信版）草稿", kind: "方案卡", url: "https://example.com/docs/dual-track-onepager" },
          { id: "ev-b2", title: "历史欠款清收台账", kind: "数据看板", url: "https://example.com/dash/receivables" },
        ],
        weeklyUpdates: [
          {
            id: "wu-b1",
            date: D(-1),
            author: "产品市场部负责人",
            progress: "历史欠款清收专班已成立并按客户逐笔跟进；双轨制一页纸方案完成初稿，正在补充基础配置清单与参考报价区间。",
            nextPlan: "陪同销售完成首批直客与电信关键节点拜访；特价审批与垫资清算快速通道方案提交决策。",
            supportNeeded: "需要事业部明确报销恢复的审批口径；需要财务配合制定垫资清算规则。",
          },
        ],
      }),
      layer({
        id: "econiche",
        order: 2,
        name: "生态位构建线",
        positioning:
          "聚焦“ZStack底座+阿里AI产品”组合，构建地市Token运营现场落地层。从CMP团队抽人建FDE小分队，在滩头跑通“算力接入→Token计量”闭环，沉淀可复制的联合方案与POC交付能力。",
        problem:
          "地市存量算力利用率低、计量计费链路缺失。我们要用“ZStack底座+阿里AI”组合和FDE交付能力占住现场落地层，而不是做纯人天外包。",
        owner: "产品市场部 & FDE负责人",
        participants: ["FDE负责人", "CMP团队骨干", "区域销售"],
        startDate: D(-30),
        endDate: D(300),
        currentStage: "FDE首批人员选拔与POC联调准备。",
        progress: 20,
        status: "in_progress",
        updatedAt: D(-2),
        evidence: [
          { id: "ev-e1", title: "FDE接单边界与现场交付SOP（讨论稿）", kind: "文档", url: "https://example.com/docs/fde-sop" },
          { id: "ev-e2", title: "POC沙箱联调方案", kind: "文档", url: "https://example.com/docs/poc-sandbox" },
        ],
        weeklyUpdates: [
          {
            id: "wu-e1",
            date: D(-2),
            author: "产品市场部",
            progress: "FDE首批人员选拔启动，候选人来自CMP团队；POC沙箱联调方案确定，《地市存量GPU盘活》方案卡V1已发布。",
            nextPlan: "完成FDE接单边界与现场交付SOP；沙箱完成OpenTrek与ZStack AIOS首轮联调。",
            supportNeeded: "需要CMP团队负责人支持人员抽调；需要阿里侧提供OpenTrek/PPU测试资源。",
          },
        ],
      }),
      layer({
        id: "alibaba",
        order: 3,
        name: "阿里集团价值线",
        positioning:
          "发挥运营商事业部的下沉渠道与打包能力，做阿里AI产品在电信体系的“带货商”。将阿里AI（OpenTrek/PPU）与ZStack底座包装成销售能直接拿单的联合方案，帮一线赢单，帮阿里出货，确立我们在阿里生态内不可替代的渠道价值。",
        problem:
          "阿里AI产品缺少下沉到电信地市的渠道与打包能力，一线销售也缺少主推联合方案的利益驱动。我们要把方案、价格和激励打通，证明自己是阿里生态内不可替代的渠道。",
        owner: "产品市场部",
        participants: ["销售负责人", "阿里区域团队接口人"],
        startDate: D(-20),
        endDate: D(340),
        currentStage: "正梳理联合带货方案，并与阿里拉齐商务分润与资源支持机制。",
        progress: 5,
        status: "in_progress",
        updatedAt: D(-3),
        evidence: [
          { id: "ev-a1", title: "《阿里AI+ZStack》联合带货方案框架", kind: "文档", url: "https://example.com/docs/joint-offer" },
        ],
        weeklyUpdates: [
          {
            id: "wu-a1",
            date: D(-3),
            author: "产品市场部",
            progress: "联合带货方案框架初稿完成；与阿里区域团队完成首轮分润与报备思路沟通。",
            nextPlan: "完成联合销售利益测算模型初版；整理特价资源池申请材料。",
            supportNeeded: "需要事业部负责人出面与阿里区域负责人对齐分润原则。",
          },
        ],
      }),
    ],
    keyResults,
    tasks,
    milestones: [
      { id: "ms-1", layerId: "bloodline", name: "历史欠款清收专班成立", date: D(-10), status: "done", dependency: "", note: "按客户逐笔建立清收台账" },
      { id: "ms-2", layerId: "bloodline", name: "双轨制一页纸方案发布", date: D(14), status: "in_progress", dependency: "配置清单与参考报价区间", note: "直客版 + 电信版" },
      { id: "ms-3", layerId: "bloodline", name: "特价审批与垫资清算快速通道落地", date: D(45), status: "not_started", dependency: "事业部与财务审批", note: "" },
      { id: "ms-4", layerId: "econiche", name: "FDE首批人员到位", date: D(20), status: "in_progress", dependency: "CMP团队人员抽调", note: "含接单边界与现场交付SOP" },
      { id: "ms-5", layerId: "econiche", name: "首个地市最小闭环跑通", date: D(75), status: "not_started", dependency: "POC沙箱联调完成", note: "形成首个成功样板点" },
      { id: "ms-6", layerId: "alibaba", name: "联合拿单方案与报价体系V1发布", date: D(60), status: "not_started", dependency: "利益测算模型", note: "" },
      { id: "ms-7", layerId: "alibaba", name: "与阿里拉齐分润与报备机制", date: D(90), status: "at_risk", dependency: "事业部负责人出面对齐", note: "" },
    ],
    risks: [
      { id: "r-1", layerId: "bloodline", description: "历史欠款清收进展慢，报销机制迟迟无法恢复，一线信心难以修复", level: "high", impact: "销售不敢接单，回血线现金流目标落空", mitigation: "清收专班按客户逐笔跟进；报销恢复方案提交事业部决策", owner: "产品市场部负责人", dueDate: D(7), status: "open", createdAt: D(-6) },
      { id: "r-2", layerId: "bloodline", description: "电信项目仍普遍要求垫资，联合体与公司兜底机制未落地前可能被迫垫资", level: "medium", impact: "新增垫资风险，重蹈历史欠款覆辙", mitigation: "电信项目优先走联合体模式；垫资清算快速通道方案同步推进", owner: "产品市场部", dueDate: D(14), status: "mitigating", createdAt: D(-10) },
      { id: "r-3", layerId: "econiche", description: "FDE人员从CMP团队抽调受阻，或被拉去支援纯人天项目", level: "high", impact: "滩头验证周期被稀释，方案卡沉淀延迟", mitigation: "明确FDE接单边界与考核规则，由事业部负责人背书", owner: "产品市场部 & FDE负责人", dueDate: D(10), status: "open", createdAt: D(-4) },
      { id: "r-4", layerId: "econiche", description: "OpenTrek/PPU测试资源未到位，POC沙箱联调受影响", level: "medium", impact: "销售“现场测一下”的需求无法及时响应", mitigation: "通过阿里接口人加急申请；先用现有轻量Demo顶上", owner: "产品市场部", dueDate: D(8), status: "open", createdAt: D(-2) },
      { id: "r-5", layerId: "alibaba", description: "与阿里的分润/报备机制未拉齐，联合带货存在撞单与利益冲突", level: "high", impact: "阿里一线不愿交线索，联合带货难以规模化", mitigation: "先就“绑定性报备”规则达成一致，再谈特价资源池", owner: "产品市场部", dueDate: D(21), status: "open", createdAt: D(-3) },
    ],
    assets: [
      { id: "as-1", name: "地市存量GPU盘活方案卡", type: "solution_card", layerId: "econiche", version: "V1", owner: "产品市场部", status: "published", usedProvinces: ["福建"], usageCount: 3, updatedAt: D(-2), link: "https://example.com/cards/gpu-revive" },
      { id: "as-2", name: "省公司Token计量对接规范（草稿）", type: "solution_card", layerId: "econiche", version: "V0.8", owner: "产品市场部", status: "review", usedProvinces: ["福建"], usageCount: 1, updatedAt: D(-1), link: "https://example.com/cards/token-metering" },
      { id: "as-3", name: "政企Token套餐", type: "solution_card", layerId: "econiche", version: "V0.3", owner: "产品市场部", status: "draft", usedProvinces: [], usageCount: 0, updatedAt: D(-6), link: "https://example.com/cards/gov-token-package" },
      { id: "as-4", name: "双轨制一页纸方案（直客版 / 电信版）", type: "pitch_pack", layerId: "bloodline", version: "V0.9", owner: "产品市场部", status: "review", usedProvinces: ["福建", "北京"], usageCount: 4, updatedAt: D(-1), link: "https://example.com/docs/dual-track-onepager" },
    ],
    fdeTracks: [
      {
        id: "fde-1",
        scenario: "地市存量算力盘活 → 可计费 Token",
        city: "福建 · 首个滩头地市",
        customer: "本地政企客户 / 地市算力中心",
        members: [
          { role: "场景负责人", name: "FDE负责人" },
          { role: "交付工程师", name: "FDE骨干（CMP团队）" },
          { role: "产品市场接口人", name: "产品市场部" },
        ],
        successMetrics: [
          { name: "可计费 Token 量", target: "跑通首张账单", current: "未计量" },
          { name: "资源利用率", target: "较基线显著提升", current: "基线采集中" },
          { name: "服务开通周期", target: "≤ 3 个工作日", current: "未评估" },
          { name: "政企客户调用持续性", target: "≥ 3 家持续调用", current: "0" },
        ],
        stage: "define",
        ruleChecks: { isBeachheadScenario: true, hasBackflowList: true, tripartiteReviewed: false },
        assets: [
          { name: "配置模板", done: false },
          { name: "对接规范", done: false },
          { name: "报价逻辑", done: false },
          { name: "异议话术", done: false },
          { name: "方案卡版本（地市存量GPU盘活 V1）", done: true },
        ],
        risks: ["FDE人员抽调尚未完成", "OpenTrek/PPU测试资源未到位"],
        updatedAt: D(-2),
      },
    ],
    provinces: [
      { id: "pv-1", province: "福建", zone: "直客直销突破区", entryType: "direct_sales", conditionFit: 70, gaps: "首个POC客户待锁定", materialStatus: "preparing", contact: "产品市场部 / 区域销售", stage: "FDE 现场POC对接", nextStep: "不依赖电信渠道，销售直接对接本地政企客户。FDE带ZStack底座+阿里AI产品直接进场，跑通存量算力盘活，快速拿单回血。", dueDate: "", status: "in_progress" },
      { id: "pv-2", province: "北京", zone: "电信生态依赖区", entryType: "telecom_token", conditionFit: 60, gaps: "高层客情待打通；算力超市并网技术规范", materialStatus: "submitted", contact: "产品市场部 / 区域销售", stage: "生态准入申报与高层对接", nextStep: "高度依赖电信客情，销售顺着电信的Token经营战略。走Token供给主体直签或算力超市并网，把我们的底座变成电信的地市算力节点。", dueDate: "", status: "in_progress" },
      { id: "pv-3", province: "广东", zone: "渠道合作区（我方销售覆盖弱）", entryType: "si_consortium", conditionFit: 20, gaps: "缺少有电信客情的集成商伙伴", materialStatus: "not_started", contact: "产品市场部", stage: "伙伴寻源", nextStep: "寻找有电信客情的集成商，我们提供底座与方案，借船出海，不投入FDE资源。", dueDate: "", status: "not_started" },
      { id: "pv-4", province: "浙江", zone: "防御观望区", entryType: "ict_fallback", conditionFit: 0, gaps: "—", materialStatus: "not_started", contact: "区域销售", stage: "维持现状", nextStep: "不主动投入FDE资源，按常规项目评估。", dueDate: "", status: "not_started" },
    ],
    alibabaValue: {
      ppuNodes: { current: 0, target: 2 },
      openTrekInstances: { current: 0, target: 1 },
      assetCards: { current: 1, target: 5 },
      businessLeads: 0,
      boundaryStatus: "draft",
      notes: [
        "我们是阿里AI产品在电信体系的“带货商”：用下沉渠道和打包能力帮一线赢单、帮阿里出货。",
        "把“ZStack底座 + 阿里AI（OpenTrek/PPU）”包装成销售能直接拿单的联合方案，而不是单卖产品。",
        "用“带货战报”（商机数、阿里产品出货量）持续向阿里证明渠道变现价值，换取更优的资源倾斜。",
      ],
      evidenceLinks: [
        { title: "《阿里AI+ZStack》联合带货方案框架", url: "https://example.com/docs/joint-offer" },
        { title: "分润 / 报备机制讨论稿", url: "https://example.com/docs/revenue-share-draft" },
      ],
    },
  };
}
