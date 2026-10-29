"use client";

import { Flag } from "lucide-react";
import { PageHeader, Panel } from "@/components/common";
import { MilestoneList } from "@/components/milestone-list";
import { TaskBoard } from "@/components/task-board";

export default function TasksPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="任务与里程碑" description="点击卡片底部的状态按钮或左右箭头即可改变任务状态；点击标题编辑详情。" />
      <TaskBoard />
      <Panel title="里程碑时间线" icon={Flag}>
        <MilestoneList />
      </Panel>
    </div>
  );
}
