import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAlerts } from "@/lib/domain/alerts";
import { getOverviewStats } from "@/lib/domain/overview";
import { getAgents } from "@/lib/fs/agents";
import { getDigest } from "@/lib/fs/digest";
import { formatDateTime, formatRelative } from "@/lib/utils/time";

export default async function Home() {
  const [overview, alerts, agents, digest] = await Promise.all([
    getOverviewStats(),
    getAlerts(),
    getAgents(),
    getDigest(),
  ]);

  return (
    <PageShell
      title="Overview"
      description="Operational snapshot of your OpenClaw fleet. Status is inferred from shared queue data, agent workspaces, and file timestamps. Empty states are shown honestly when the system has not produced activity yet."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total agents" value={overview.totalAgents} />
        <StatCard label="Queued tasks" value={overview.queuedTasks} />
        <StatCard label="In progress" value={overview.inProgressTasks} />
        <StatCard label="Completed" value={overview.completedTasks} />
        <StatCard label="Needs approval" value={overview.needsApprovalTasks} />
        <StatCard label="Failed / stalled" value={overview.failedOrStalledTasks} />
        <StatCard label="Last orchestrator run" value={formatRelative(overview.lastOrchestratorRun)} hint={formatDateTime(overview.lastOrchestratorRun)} />
        <StatCard label="Last digest update" value={formatRelative(overview.lastDigestUpdate)} hint={formatDateTime(overview.lastDigestUpdate)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-50">Agents</h2>
            <Link href="/agents" className="text-sm text-zinc-400 hover:text-white">View all</Link>
          </div>
          <div className="space-y-3">
            {agents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-zinc-100">{agent.emoji ? `${agent.emoji} ` : ""}{agent.name}</div>
                  <div className="mt-1 text-sm text-zinc-400">{agent.role || "No role extracted yet."}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={agent.status} />
                  <StatusBadge value={agent.triggerType} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-50">Attention center</h2>
            <div className="mt-4 space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">No active alerts right now.</div>
              ) : (
                alerts.slice(0, 6).map((alert) => (
                  <Link key={`${alert.type}-${alert.title}`} href={alert.href || "/alerts"} className="block rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-zinc-100">{alert.title}</div>
                      <StatusBadge value={alert.severity === "critical" ? "needs_approval" : "blocked"} />
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{alert.description}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-50">Daily digest</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-400">{digest.content}</p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
