import type { AgentDetails, TaskRecord } from "@/lib/types";
import { getAgents } from "@/lib/fs/agents";
import { getTasks } from "@/lib/fs/tasks";

function lineItems(agent: AgentDetails | undefined, fallback: string) {
  if (!agent) return [fallback];
  if (agent.suggestedOutputFiles.length) return agent.suggestedOutputFiles.map((file) => file.name).slice(0, 5);
  if (agent.pendingTasks.length) return agent.pendingTasks.map((task) => task.title || task.description || task.id || "Untitled task").slice(0, 5);
  return [fallback];
}

function tasksFor(agentId: string, tasks: TaskRecord[]) {
  return tasks.filter((task) => task.owner === agentId && ["queued", "in_progress", "needs_approval", "blocked"].includes(String(task.status)));
}

export async function getBusinessPipeline() {
  const [agents, tasks] = await Promise.all([getAgents(), getTasks()]);
  const byId = new Map(agents.map((agent) => [agent.id, agent]));
  return {
    nichesDiscovered: lineItems(byId.get("niche-scout"), "No niches discovered yet."),
    ideasValidated: lineItems(byId.get("validation-agent"), "No ideas validated yet."),
    factChecksCompleted: lineItems(byId.get("fact-checker"), "No fact checks completed yet."),
    gigsCreated: lineItems(byId.get("freelancing-optimizer"), "No gig drafts created yet."),
    opportunitiesReadyToBuild: tasksFor("implementation-agent", tasks).map((task) => task.title || task.description || task.id || "Untitled task").slice(0, 5),
    opportunitiesReadyToPitch: tasksFor("freelancing-optimizer", tasks).map((task) => task.title || task.description || task.id || "Untitled task").slice(0, 5),
  };
}

export async function getDeveloperPipeline() {
  const [agents, tasks] = await Promise.all([getAgents(), getTasks()]);
  const byId = new Map(agents.map((agent) => [agent.id, agent]));
  return {
    architectureDecisions: lineItems(byId.get("lead-developer"), "No architecture decisions yet."),
    featurePlans: lineItems(byId.get("feature-planner"), "No feature plans yet."),
    codeTasksInProgress: tasksFor("implementation-agent", tasks).map((task) => task.title || task.description || task.id || "Untitled task").slice(0, 5),
    pendingReviews: tasksFor("review-agent", tasks).map((task) => task.title || task.description || task.id || "Untitled task").slice(0, 5),
    activeIssues: lineItems(byId.get("debugger-agent"), "No active issue report yet."),
    infraWarnings: lineItems(byId.get("ops-agent"), "No infra warning yet."),
  };
}
