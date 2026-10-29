# 运营商事业部产品市场部 · 主线目标跟踪

内部管理工具，用来跟踪产品市场部围绕「业务回血 → 生态位构建 → 阿里总部价值体现」三层主线的进展：KR、任务与里程碑、FDE 滩头验证、Token 生态准入、方案卡资产、风险，以及阿里价值证明，并一键生成 Markdown 周报。

跟踪的是**过程指标和可复用资产**，不是签约收入。

## 运行

```bash
npm install
npm run dev        # http://localhost:4317
```

其他命令：`npm run build`、`npm run lint`、`npx tsc --noEmit`。

无需登录、后端或数据库。首次打开时写入示例数据到浏览器 localStorage，之后所有修改都保存在本地；左下角「重置为示例数据」可恢复。

## 技术栈

Next.js（App Router）+ TypeScript + Tailwind CSS + shadcn/ui + lucide-react。Recharts 已安装，留给第二轮图表使用。

## 目录结构

```
src/
  types.ts                 数据模型（MainlineLayer / KeyResult / Task / Risk / Asset / FdeTrack ...）
  data/mockData.ts         示例数据（日期相对“今天”生成，人名/省份为脱敏代称）
  lib/
    dataService.ts         DataService 接口 + localStorage 实现（后续替换为 Supabase）
    store.tsx              React Context 全局状态、增删改、全局筛选、派生字段维护
    calc.ts                进度计算、日期、筛选工具
    meta.ts                状态/标签/颜色字典（未开始灰、进行中蓝、风险/阻塞橙、完成绿）
    fields.ts              各实体的表单字段定义与新建模板
    weekly.ts              周报 Markdown 生成、复制、下载
  components/
    app-shell.tsx          左侧导航 + 顶部标题/阶段标签/全局筛选/导出周报
    entity-dialog.tsx      通用编辑弹窗（按字段定义渲染）
    kr-table.tsx           KR 表格（行内改当前值/状态/置信度）
    task-board.tsx         任务看板（按钮切换状态）
    milestone-list.tsx     里程碑时间线
    risk-table.tsx         风险表
  app/
    page.tsx               总览 Dashboard
    mainlines/             三层主线看板 + [id] 主线详情
    objectives/ tasks/ fde/ ecosystem/ assets/ alibaba/ risks/ weekly/
```

## 数据规则

- KR 进度 = 当前值 / 目标值；阶段完成度 = 该阶段 KR 进度均值。
- 主线总进度为存储值：可在主线详情「编辑」中手动调整；该主线任一 KR 的当前值/目标值变动时，自动重算为 KR 进度均值。
- 示例数据结构变化时提升 `DATA_VERSION`，浏览器中的旧版本数据会被自动替换为新示例数据。
- KR 当前值每次变化都会记入 `history`，周报据此计算「本周 KR 变化」。
- 任务改为「已完成」时自动记录 `completedAt`，用于周报「本周完成」。
- 风险统一存放在 `risks` 集合，通过 `layerId` 关联主线。
- KR 与任务的完整数据存放在 `keyResults` / `tasks` 集合；主线上的 `krList` / `taskList` 是对应的 id 列表，由 store 自动保持同步。
- KR 可附带定性说明 `targetNote` / `currentNote`（如“全员覆盖 / 编写中”），与数值进度并列展示。

## 替换为 Supabase

实现 `src/lib/dataService.ts` 中的 `DataService`（`load / save / reset`），并把导出的 `dataService` 指向新实现即可，页面代码无需改动。
