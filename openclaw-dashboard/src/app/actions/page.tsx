import { PageShell } from "@/components/layout/page-shell";
import { ManualActionPanel } from "@/components/forms/manual-action-panel";
import { getAgents } from "@/lib/fs/agents";
import { getTaskLabel, getTasks } from "@/lib/fs/tasks";

export default async function ActionsPage() {
  const [agents, tasks] = await Promise.all([getAgents(), getTasks()]);
  return (
    <PageShell title="Manual control" description="Safe file-backed actions first, runtime execution later. This page now supports real task creation and safe queue updates.">
      <ManualActionPanel
        agentOptions={agents.map((agent) => agent.id)}
        taskOptions={tasks.filter((task) => task.id).map((task) => ({ id: String(task.id), label: `${getTaskLabel(task)} (${task.status || "queued"})` }))}
      />
    </PageShell>
  );
}
