import type { OverviewStats } from "@/lib/types";
import { EXPECTED_FLEET } from "@/lib/fleet";
import { getAgents } from "@/lib/fs/agents";
import { getDigest } from "@/lib/fs/digest";
import { getRoutingMap } from "@/lib/fs/routing";
import { getTasks, isTaskFailed, isTaskStalled } from "@/lib/fs/tasks";

export async function getOverviewStats(): Promise<OverviewStats> {
  const [agents, tasks, digest, routing] = await Promise.all([getAgents(), getTasks(), getDigest(), getRoutingMap()]);
  const orchestrator = agents.find((agent) => agent.id === "orchestrator");
  const knownAgents = new Set(agents.filter((agent) => agent.isRegistered).map((agent) => agent.id));
  const routingHealthy = Object.values(routing.routes || {}).every((owner) => knownAgents.has(owner));
  return {
    totalAgents: agents.length,
    registeredAgents: agents.filter((agent) => agent.isRegistered).length,
    expectedAgents: EXPECTED_FLEET.length,
    missingAgents: agents.filter((agent) => agent.isExpected && !agent.isRegistered).length,
    queuedTasks: tasks.filter((task) => task.status === "queued").length,
    inProgressTasks: tasks.filter((task) => task.status === "in_progress").length,
    completedTasks: tasks.filter((task) => task.status === "done").length,
    needsApprovalTasks: tasks.filter((task) => task.status === "needs_approval").length,
    failedOrStalledTasks: tasks.filter((task) => isTaskFailed(task) || isTaskStalled(task)).length,
    agentsWithoutSuggestedOutputs: agents.filter((agent) => agent.isRegistered && agent.expectedOutputs.length > 0 && agent.suggestedOutputFiles.length === 0).length,
    routingHealthy,
    lastOrchestratorRun: orchestrator?.lastRunTime,
    lastDigestUpdate: digest.updatedAt,
  };
}
