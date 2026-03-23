import type { AgentDetails, TaskRecord } from "@/lib/types";
import { hoursSince } from "@/lib/utils/time";
import { getRecentAgentErrors } from "@/lib/runtime/read-trigger-logs";

function parseIntervalHours(text?: string): number | null {
  if (!text) return null;
  const match = text.trim().match(/^(\d+)(m|h)$/i);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  return unit === "m" ? value / 60 : value;
}

export function isQueuedOnDemandStuck(task: TaskRecord, triggerType: AgentDetails["triggerType"]): boolean {
  if (triggerType !== "on_demand") return false;
  if (task.status !== "queued") return false;
  const age = hoursSince(task.updatedAt || task.createdAt);
  return age !== null && age > 0.5;
}

export function isHeartbeatLate(agent: AgentDetails, defaultHeartbeat = "60m"): boolean {
  if (agent.triggerType !== "heartbeat") return false;
  const expected = parseIntervalHours(defaultHeartbeat) || 1;
  const age = hoursSince(agent.lastRunTime);
  return age !== null && age > expected * 2;
}

export async function isAgentUnstable(agentId: string): Promise<boolean> {
  const recentErrors = await getRecentAgentErrors(agentId, 24);
  return recentErrors.length >= 2;
}
