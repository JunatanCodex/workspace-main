import { getAgents } from "@/lib/fs/agents";
import { getTasks, getTaskLabel } from "@/lib/fs/tasks";
import { readCliHistory } from "@/lib/cli/history";

export async function getRecentActivity(limit = 12) {
  const [agents, tasks, cli] = await Promise.all([getAgents(), getTasks(), readCliHistory(20)]);
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
  ];

  return items
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, limit);
}
