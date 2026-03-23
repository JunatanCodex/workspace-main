import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { ManualActionPanel } from "@/components/forms/manual-action-panel";
import { AgentRoleWidgets } from "@/components/agents/agent-role-widgets";
import { getDashboardAgentById, getDashboardAgents } from "@/lib/db/agents";
import { getDashboardTasks } from "@/lib/db/tasks";
import { formatDateTime } from "@/lib/utils/time";
import { getTaskLabel } from "@/lib/fs/tasks";

export default async function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const [agent, agents, tasks] = await Promise.all([getDashboardAgentById(agentId), getDashboardAgents(), getDashboardTasks()]);
  if (!agent) notFound();

  return (
    <PageShell
      title={`${agent.emoji ? `${agent.emoji} ` : ""}${agent.name}`}
      description={agent.role || "No role extracted from SOUL.md yet."}
      actions={<Link href={`/outputs/${agent.id}`} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">Browse outputs</Link>}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Run summary" description="Current role, health, and recent execution signal." />
            <div className="flex flex-wrap gap-2"><StatusBadge value={agent.status} /><StatusBadge value={agent.triggerType} /></div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-zinc-500">Workspace</dt><dd className="mt-1 text-zinc-200">{agent.workspace}</dd></div>
              <div><dt className="text-zinc-500">Last run</dt><dd className="mt-1 text-zinc-200">{formatDateTime(agent.lastRunTime)}</dd></div>
              <div><dt className="text-zinc-500">Last output</dt><dd className="mt-1 text-zinc-200">{formatDateTime(agent.lastOutputTime)}</dd></div>
              <div><dt className="text-zinc-500">Latest output file</dt><dd className="mt-1 text-zinc-200">{agent.latestOutputFile?.name || "None"}</dd></div>
              <div><dt className="text-zinc-500">Expected outputs</dt><dd className="mt-1 text-zinc-200">{agent.expectedOutputs.length ? agent.expectedOutputs.join(", ") : "No explicit output profile"}</dd></div>
              <div><dt className="text-zinc-500">Focus</dt><dd className="mt-1 text-zinc-200">{agent.focus || "—"}</dd></div>
            </dl>
            {!agent.isRegistered ? <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] p-4 text-sm text-amber-200">This agent is part of your expected v2 fleet model, but it is not currently registered in OpenClaw.</div> : null}
          </div>

          <AgentRoleWidgets agent={agent} />

          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Startup instructions" description="Parsed from AGENTS.md for quick reference." />
            {agent.startupInstructions.length ? (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-300">
                {agent.startupInstructions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : <EmptyState title="No startup instructions parsed" description="The AGENTS.md startup section has not been parsed into structured steps yet." />}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Assigned tasks" description="Current work items tied to this agent." />
            <div className="space-y-3">
              {agent.pendingTasks.length ? agent.pendingTasks.map((task) => (
                <Link key={task.id || getTaskLabel(task)} href={`/tasks/${task.id || "unknown"}`} className="block rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-zinc-100">{getTaskLabel(task)}</div>
                    <StatusBadge value={task.status || "queued"} />
                  </div>
                </Link>
              )) : <EmptyState title="No assigned tasks" description="This agent has no active tasks right now." />}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Suggested outputs" description="Role-matched artifacts ranked for usefulness." />
            <div className="space-y-3">
              {agent.suggestedOutputFiles.length ? agent.suggestedOutputFiles.map((file) => (
                <Link key={file.path} href={`/outputs/${agent.id}/browse/${encodeURIComponent(file.name)}`} className="block rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                  <div className="font-medium text-zinc-100">{file.name}</div>
                  <div className="mt-1 text-sm text-zinc-500">{formatDateTime(file.modifiedAt)}</div>
                </Link>
              )) : <EmptyState title="No suggested outputs" description="No role-matched output artifacts were detected yet." />}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Recent files" description="Most recent files from the workspace." />
            <div className="space-y-3">
              {agent.recentFiles.length ? agent.recentFiles.map((file) => (
                <Link key={file.path} href={`/outputs/${agent.id}/browse/${encodeURIComponent(file.name)}`} className="block rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                  <div className="font-medium text-zinc-100">{file.name}</div>
                  <div className="mt-1 text-sm text-zinc-500">{formatDateTime(file.modifiedAt)}</div>
                </Link>
              )) : <EmptyState title="No recent files" description="The workspace does not yet contain any recent files to inspect." />}
            </div>
          </div>
        </section>
      </div>
      <ManualActionPanel
        agentOptions={agents.filter((item) => item.isRegistered).map((item) => item.id)}
        taskOptions={tasks.filter((task) => task.id).map((task) => ({ id: String(task.id), label: `${getTaskLabel(task)} (${task.status || "queued"})` }))}
      />
    </PageShell>
  );
}
