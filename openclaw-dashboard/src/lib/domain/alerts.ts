import type { AlertItem } from "@/lib/types";
import { getOpenClawConfig } from "@/lib/fs/openclaw";
import { getAgents } from "@/lib/fs/agents";
import { getRoutingMap } from "@/lib/fs/routing";
import { getTasks, isTaskFailed, isTaskStalled } from "@/lib/fs/tasks";
import { getSharedEvents } from "@/lib/fs/events";
import { isAgentUnstable, isHeartbeatLate, isQueuedOnDemandStuck } from "@/lib/domain/fleet-health";
import { getDiscordBotViews } from "@/lib/discord-bots/store";

export async function getAlerts(): Promise<AlertItem[]> {
  const [agents, tasks, routing, config, events, discordBots] = await Promise.all([getAgents(), getTasks(), getRoutingMap(), getOpenClawConfig(), getSharedEvents(), getDiscordBotViews()]);
  const alerts: AlertItem[] = [];
  const heartbeatEvery = config.agents?.defaults?.heartbeat?.every || "60m";

  for (const agent of agents.filter((item) => item.isExpected && !item.isRegistered)) {
    alerts.push({
      type: "missing_agent",
      title: `${agent.name} is expected but not registered`,
      severity: "warning",
      description: "This agent exists in the fleet model, but OpenClaw is not currently configured to run it.",
      href: `/agents/${agent.id}`,
    });
  }

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

  for (const agent of agents.filter((item) => item.isRegistered)) {
    for (const task of agent.pendingTasks.filter((task) => isQueuedOnDemandStuck(task, agent.triggerType))) {
      alerts.push({
        type: "stalled_task",
        title: `${agent.name} has a queued task stuck >30m`,
        severity: "warning",
        description: `${task.title || task.id || "Queued task"} has not advanced for more than 30 minutes.`,
        href: `/tasks/${task.id || "unknown"}`,
      });
    }

    if (isHeartbeatLate(agent, heartbeatEvery)) {
      alerts.push({
        type: "inactive_agent",
        title: `${agent.name} missed expected heartbeat window`,
        severity: "warning",
        description: `No run detected in more than 2x the configured heartbeat interval (${heartbeatEvery}).`,
        href: `/agents/${agent.id}`,
      });
    }

    if (await isAgentUnstable(agent.id)) {
      alerts.push({
        type: "failure",
        title: `${agent.name} appears unstable`,
        severity: "critical",
        description: "Recent runtime trigger logs show repeated errors for this agent.",
        href: `/runtime-logs`,
      });
    }
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

  for (const agent of agents.filter((item) => item.isRegistered && item.expectedOutputs.length > 0 && item.suggestedOutputFiles.length === 0)) {
    alerts.push({
      type: "missing_output",
      title: `${agent.name} has no role-matched outputs yet`,
      severity: "info",
      description: `Expected outputs include: ${agent.expectedOutputs.join(", ")}.`,
      href: `/agents/${agent.id}`,
    });
  }

  const knownAgents = new Set(agents.filter((agent) => agent.isRegistered).map((agent) => agent.id));
  for (const [taskType, owner] of Object.entries(routing.routes || {})) {
    if (!knownAgents.has(owner)) {
      alerts.push({
        type: "routing",
        title: `Invalid route for ${taskType}`,
        severity: "critical",
        description: `Routing map points to missing or unregistered agent: ${owner}`,
        href: "/routing",
      });
    }
  }

  for (const bot of discordBots.filter((item) => item.status === "failed" || item.status === "degraded" || item.health_score < 70)) {
    alerts.push({
      type: "discord_bot",
      title: `${bot.name} needs attention`,
      severity: bot.status === "failed" || bot.health_score < 40 ? "critical" : "warning",
      description: `Status ${bot.status}; health score ${bot.health_score}; incidents ${bot.incident_count}.`,
      href: `/discord-bots/${bot.bot_id}`,
    });
  }

  const recentMaintenance = events
    .filter((event) => event.action_taken === "cancelled_duplicate_downstream_tasks")
    .sort((a, b) => String(b.timestamp || "").localeCompare(String(a.timestamp || "")))[0];

  if (recentMaintenance) {
    alerts.push({
      type: "maintenance",
      title: "Queue hygiene automation ran",
      severity: "info",
      description: recentMaintenance.notes || "Deterministic automation cancelled duplicate downstream tasks.",
      href: "/digest",
    });
  }

  return alerts;
}
