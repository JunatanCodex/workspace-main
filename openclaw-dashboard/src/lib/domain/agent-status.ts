import type { AgentDetails } from "@/lib/types";
import { hoursSince } from "@/lib/utils/time";

/**
 * Inference rules are intentionally file-based because v1 does not have a
 * formal runtime event stream. We prefer honest heuristics over fake certainty.
 */
export function inferAgentStatus(agent: Pick<AgentDetails, "pendingTasks" | "lastRunTime" | "latestOutputFile">): AgentDetails["status"] {
  if (agent.pendingTasks.some((task) => task.status === "needs_approval")) return "needs approval";
  if (agent.pendingTasks.some((task) => task.status === "failed" || task.status === "error" || task.failureReason)) return "error";
  if (agent.pendingTasks.some((task) => task.status === "in_progress")) return "running";
  if (agent.pendingTasks.length > 0) {
    const hours = hoursSince(agent.lastRunTime);
    return hours !== null && hours > 48 ? "offline" : "waiting";
  }
  const hours = hoursSince(agent.lastRunTime);
  if (hours !== null && hours > 72) return "offline";
  return "idle";
}
