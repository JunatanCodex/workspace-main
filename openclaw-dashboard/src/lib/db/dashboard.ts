import type { OverviewStats } from "@/lib/types";
import { EXPECTED_FLEET } from "@/lib/fleet";
import { getDigest } from "@/lib/fs/digest";
import { getRoutingMap } from "@/lib/fs/routing";
import { getDashboardAgents } from "@/lib/db/agents";
import { getDashboardTasks } from "@/lib/db/tasks";
import { getDashboardAlerts } from "@/lib/db/alerts";
import { readCliHistory } from "@/lib/cli/history";
import { getTaskLabel, isTaskFailed, isTaskStalled } from "@/lib/fs/tasks";
import { parseDate } from "@/lib/utils/time";

export async function getDashboardOverviewStats(): Promise<OverviewStats> {
  const [agents, tasks, digest, routing] = await Promise.all([
    getDashboardAgents(),
    getDashboardTasks(),
    getDigest(),
    getRoutingMap(),
  ]);
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

export async function getDashboardRecentActivity(limit = 12) {
  const [agents, tasks, alerts, cli] = await Promise.all([
    getDashboardAgents(),
    getDashboardTasks(),
    getDashboardAlerts(),
    readCliHistory(20),
  ]);

  const items = [
    ...cli.map((entry) => ({
      title: entry.label,
      description: entry.ok ? "CLI-backed action completed." : `CLI-backed action failed${entry.note ? `: ${entry.note}` : "."}`,
      href: "/cli",
      at: entry.timestamp,
    })),
    ...tasks.slice(0, 10).map((task) => ({
      title: getTaskLabel(task),
      description: `Task is currently ${task.status || "queued"}${task.owner ? ` for ${task.owner}` : ""}.`,
      href: `/tasks/${task.id || "unknown"}`,
      at: task.updatedAt || task.createdAt || "—",
    })),
    ...agents.slice(0, 10).map((agent) => ({
      title: agent.name,
      description: agent.summary,
      href: `/agents/${agent.id}`,
      at: agent.lastRunTime || agent.lastOutputTime || "—",
    })),
    ...alerts.slice(0, 5).map((alert) => ({
      title: alert.title,
      description: alert.description,
      href: alert.href || "/alerts",
      at: new Date().toISOString(),
    })),
  ];

  return items
    .sort((a, b) => {
      const aDate = parseDate(a.at)?.getTime() ?? 0;
      const bDate = parseDate(b.at)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, limit);
}

export async function getDashboardHistoryMetrics() {
  const [agents, tasks] = await Promise.all([getDashboardAgents(), getDashboardTasks()]);
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const byAgent = agents.map((agent) => {
    const agentTasks = tasks.filter((task) => task.owner === agent.id);
    const done = agentTasks.filter((task) => task.status === "done");
    const approvals = agentTasks.filter((task) => task.status === "needs_approval");
    const doneToday = done.filter((task) => {
      const date = parseDate(task.updatedAt || task.createdAt);
      return date ? date >= dayAgo : false;
    }).length;
    const doneWeek = done.filter((task) => {
      const date = parseDate(task.updatedAt || task.createdAt);
      return date ? date >= weekAgo : false;
    }).length;

    const completionHours = done
      .map((task) => {
        const created = parseDate(task.createdAt);
        const updated = parseDate(task.updatedAt);
        if (!created || !updated) return null;
        return (updated.getTime() - created.getTime()) / 1000 / 60 / 60;
      })
      .filter((value): value is number => value !== null);

    const avgCompletionHours = completionHours.length
      ? completionHours.reduce((sum, value) => sum + value, 0) / completionHours.length
      : null;

    return {
      agentId: agent.id,
      name: agent.name,
      completed: done.length,
      completedToday: doneToday,
      completedWeek: doneWeek,
      approvals: approvals.length,
      avgCompletionHours,
      pending: agent.pendingTasks.length,
    };
  });

  const sorted = [...byAgent].sort((a, b) => b.completed - a.completed);
  return {
    byAgent,
    mostActive: sorted[0] || null,
    leastActive: sorted[sorted.length - 1] || null,
  };
}
