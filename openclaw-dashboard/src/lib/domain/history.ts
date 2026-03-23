import { getAgents } from "@/lib/fs/agents";
import { getTasks } from "@/lib/fs/tasks";
import { parseDate } from "@/lib/utils/time";

export async function getHistoryMetrics() {
  const [agents, tasks] = await Promise.all([getAgents(), getTasks()]);
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
