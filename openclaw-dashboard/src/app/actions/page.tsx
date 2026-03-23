import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { ManualActionPanel } from "@/components/forms/manual-action-panel";
import { getAgents } from "@/lib/fs/agents";
import { getTaskLabel, getTasks } from "@/lib/fs/tasks";

export default async function ActionsPage() {
  const [agents, tasks] = await Promise.all([getAgents(), getTasks()]);
  return (
    <PageShell title="Manual control" description="File-backed queue actions and runtime triggers for the local OpenClaw fleet.">
      <div className="flex justify-end">
        <Link href="/runtime-logs" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.03]">View runtime logs</Link>
      </div>
      <ManualActionPanel
        agentOptions={agents.map((agent) => agent.id)}
        taskOptions={tasks.filter((task) => task.id).map((task) => ({ id: String(task.id), label: `${getTaskLabel(task)} (${task.status || "queued"})` }))}
      />
    </PageShell>
  );
}
