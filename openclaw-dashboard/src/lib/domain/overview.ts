import type { OverviewStats } from "@/lib/types";
import { getAgents } from "@/lib/fs/agents";
import { getDigest } from "@/lib/fs/digest";
import { getTasks, isTaskFailed, isTaskStalled } from "@/lib/fs/tasks";

export async function getOverviewStats(): Promise<OverviewStats> {
  const [agents, tasks, digest] = await Promise.all([getAgents(), getTasks(), getDigest()]);
  const orchestrator = agents.find((agent) => agent.id === "orchestrator");
  return {
    totalAgents: agents.length,
    queuedTasks: tasks.filter((task) => task.status === "queued").length,
    inProgressTasks: tasks.filter((task) => task.status === "in_progress").length,
    completedTasks: tasks.filter((task) => task.status === "done").length,
    needsApprovalTasks: tasks.filter((task) => task.status === "needs_approval").length,
    failedOrStalledTasks: tasks.filter((task) => isTaskFailed(task) || isTaskStalled(task)).length,
    lastOrchestratorRun: orchestrator?.lastRunTime,
    lastDigestUpdate: digest.updatedAt,
  };
}
