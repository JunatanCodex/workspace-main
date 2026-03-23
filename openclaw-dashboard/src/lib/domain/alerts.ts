import type { AlertItem } from "@/lib/types";
import { getAgents } from "@/lib/fs/agents";
import { getRoutingMap } from "@/lib/fs/routing";
import { getTasks, isTaskFailed, isTaskStalled } from "@/lib/fs/tasks";

export async function getAlerts(): Promise<AlertItem[]> {
  const [agents, tasks, routing] = await Promise.all([getAgents(), getTasks(), getRoutingMap()]);
  const alerts: AlertItem[] = [];

  for (const task of tasks.filter((item) => item.status === "needs_approval")) {
    alerts.push({
      type: "needs_approval",
      title: task.title || task.id || "Task needs approval",
      severity: "critical",
      description: task.needsApprovalReason || "Task was marked needs_approval.",
      href: `/tasks/${task.id || "unknown"}`,
    });
  }

  for (const task of tasks.filter((item) => isTaskStalled(item))) {
    alerts.push({
      type: "stalled_task",
      title: task.title || task.id || "Stalled task",
      severity: "warning",
      description: `Task has been ${task.status} without an update for too long.`,
      href: `/tasks/${task.id || "unknown"}`,
    });
  }

  for (const task of tasks.filter((item) => isTaskFailed(item))) {
    alerts.push({
      type: "failure",
      title: task.title || task.id || "Task failure",
      severity: "critical",
      description: String(task.failureReason || task.notes || "Task has a failure marker."),
      href: `/tasks/${task.id || "unknown"}`,
    });
  }

  for (const agent of agents.filter((item) => item.status === "offline")) {
    alerts.push({
      type: "inactive_agent",
      title: `${agent.name} appears offline`,
      severity: "warning",
      description: "No recent activity beyond the expected interval inferred from file timestamps.",
      href: `/agents/${agent.id}`,
    });
  }

  const knownAgents = new Set(agents.map((agent) => agent.id));
  for (const [taskType, owner] of Object.entries(routing.routes || {})) {
    if (!knownAgents.has(owner)) {
      alerts.push({
        type: "routing",
        title: `Invalid route for ${taskType}`,
        severity: "critical",
        description: `Routing map points to missing agent: ${owner}`,
        href: "/routing",
      });
    }
  }

  return alerts;
}
