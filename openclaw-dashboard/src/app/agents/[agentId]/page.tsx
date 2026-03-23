import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { ManualActionPanel } from "@/components/forms/manual-action-panel";
import { getAgentById } from "@/lib/fs/agents";
import { formatDateTime } from "@/lib/utils/time";
import { getTaskLabel } from "@/lib/fs/tasks";

export default async function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const agent = await getAgentById(agentId);
  if (!agent) notFound();

  return (
    <PageShell title={`${agent.emoji ? `${agent.emoji} ` : ""}${agent.name}`} description={agent.role || "No role extracted from SOUL.md yet."}>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="flex flex-wrap gap-2"><StatusBadge value={agent.status} /><StatusBadge value={agent.triggerType} /></div>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-zinc-500">Workspace</dt><dd className="text-zinc-200">{agent.workspace}</dd></div>
              <div><dt className="text-zinc-500">Last run</dt><dd className="text-zinc-200">{formatDateTime(agent.lastRunTime)}</dd></div>
              <div><dt className="text-zinc-500">Last output</dt><dd className="text-zinc-200">{formatDateTime(agent.lastOutputTime)}</dd></div>
              <div><dt className="text-zinc-500">Latest output file</dt><dd className="text-zinc-200">{agent.latestOutputFile?.name || "None"}</dd></div>
              <div><dt className="text-zinc-500">Open output explorer</dt><dd className="text-zinc-200"><Link href={`/outputs/${agent.id}`} className="underline decoration-zinc-700 underline-offset-4 hover:text-white">Browse workspace files</Link></dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-50">Startup instructions</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
              {agent.startupInstructions.length ? agent.startupInstructions.map((item) => <li key={item}>{item}</li>) : <li>No startup section parsed yet.</li>}
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-50">Assigned tasks</h2>
            <div className="mt-3 space-y-3">
              {agent.pendingTasks.length ? agent.pendingTasks.map((task) => (
                <Link key={task.id || getTaskLabel(task)} href={`/tasks/${task.id || "unknown"}`} className="block rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.03]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-zinc-100">{getTaskLabel(task)}</div>
                    <StatusBadge value={task.status || "queued"} />
                  </div>
                </Link>
              )) : <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">No pending tasks assigned.</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-50">Recent files</h2>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              {agent.recentFiles.length ? agent.recentFiles.map((file) => (
                <Link key={file.path} href={`/outputs/${agent.id}/browse/${encodeURIComponent(file.name)}`} className="block rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-white/[0.03]">
                  <div className="font-medium text-zinc-100">{file.name}</div>
                  <div className="mt-1 text-zinc-500">{formatDateTime(file.modifiedAt)}</div>
                </Link>
              )) : <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">No files found.</div>}
            </div>
          </div>
        </section>
      </div>
      <ManualActionPanel />
    </PageShell>
  );
}
