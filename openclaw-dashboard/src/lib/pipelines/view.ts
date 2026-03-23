import { getAgents } from "@/lib/fs/agents";
import { getTasks } from "@/lib/fs/tasks";
import { readPipelineDefs } from "@/lib/pipelines/store";

function stageStatus(agentId: string, tasks: Awaited<ReturnType<typeof getTasks>>) {
  const owned = tasks.filter((task) => task.owner === agentId);
  if (owned.some((task) => task.status === "needs_approval")) return "needs approval";
  if (owned.some((task) => task.status === "failed" || task.status === "error")) return "error";
  if (owned.some((task) => task.status === "in_progress")) return "running";
  if (owned.some((task) => task.status === "queued")) return "waiting";
  if (owned.some((task) => task.status === "done")) return "done";
  return "idle";
}

export async function getPipelineControlView() {
  const [defs, tasks, agents] = await Promise.all([readPipelineDefs(), getTasks(), getAgents()]);
  const byId = new Map(agents.map((agent) => [agent.id, agent]));

  return defs.map((pipeline) => ({
    ...pipeline,
    steps: pipeline.steps.map((step, index) => ({
      ...step,
      index,
      status: stageStatus(step.agentId, tasks),
      agentName: byId.get(step.agentId)?.name || step.agentId,
      latestOutput: byId.get(step.agentId)?.latestOutputFile?.name,
      pendingTasks: tasks.filter((task) => task.owner === step.agentId && ["queued", "in_progress", "needs_approval", "blocked"].includes(String(task.status))).length,
    })),
  }));
}
