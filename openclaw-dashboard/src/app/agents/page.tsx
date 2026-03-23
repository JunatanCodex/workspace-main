import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAgents } from "@/lib/fs/agents";
import { formatDateTime } from "@/lib/utils/time";

export default async function AgentsPage() {
  const agents = await getAgents();
  return (
    <PageShell title="Agent status" description="Per-agent status inferred from tasks, recent file activity, and available local artifacts.">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03] text-left text-zinc-400">
            <tr>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Last run</th>
              <th className="px-4 py-3">Latest output</th>
              <th className="px-4 py-3">Pending tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {agents.map((agent) => (
              <tr key={agent.id} className="align-top">
                <td className="px-4 py-4">
                  <Link href={`/agents/${agent.id}`} className="font-medium text-zinc-100 hover:text-white">{agent.emoji ? `${agent.emoji} ` : ""}{agent.name}</Link>
                  <div className="mt-1 max-w-md text-zinc-400">{agent.role || "No role extracted."}</div>
                  <div className="mt-2 text-xs text-zinc-500">{agent.workspace}</div>
                </td>
                <td className="px-4 py-4"><StatusBadge value={agent.status} /></td>
                <td className="px-4 py-4"><StatusBadge value={agent.triggerType} /></td>
                <td className="px-4 py-4 text-zinc-300">{formatDateTime(agent.lastRunTime)}</td>
                <td className="px-4 py-4 text-zinc-300">{agent.latestOutputFile?.name || "No output file yet"}</td>
                <td className="px-4 py-4 text-zinc-300">{agent.pendingTasks.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
