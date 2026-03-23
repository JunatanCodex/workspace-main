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

  const orchestrator = agents.find((agent) => agent.id === "orchestrator");

  return (
    <PageShell
      title="Overview"
      description="Operational snapshot of your OpenClaw fleet. Status is inferred from shared queue data, agent workspaces, fleet expectations, and file timestamps. Expected-but-missing agents are shown explicitly so the dashboard reflects the intended system, not just whatever happens to be on disk."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expected agents" value={overview.expectedAgents} />
        <StatCard label="Registered agents" value={overview.registeredAgents} />
        <StatCard label="Missing fleet agents" value={overview.missingAgents} />
        <StatCard label="Queued tasks" value={overview.queuedTasks} />
        <StatCard label="In progress" value={overview.inProgressTasks} />
        <StatCard label="Completed" value={overview.completedTasks} />
        <StatCard label="Needs approval" value={overview.needsApprovalTasks} />
        <StatCard label="Failed / stalled" value={overview.failedOrStalledTasks} />
        <StatCard label="Agents missing outputs" value={overview.agentsWithoutSuggestedOutputs} />
        <StatCard label="Routing health" value={overview.routingHealthy ? "Healthy" : "Warning"} />
        <StatCard label="Last orchestrator run" value={formatRelative(overview.lastOrchestratorRun)} hint={formatDateTime(overview.lastOrchestratorRun)} />
        <StatCard label="Last digest update" value={formatRelative(overview.lastDigestUpdate)} hint={formatDateTime(overview.lastDigestUpdate)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-50">Fleet status</h2>
              <Link href="/agents" className="text-sm text-zinc-400 hover:text-white">View all</Link>
            </div>
            <div className="space-y-3">
              {agents.map((agent) => (
                <Link key={agent.id} href={`/agents/${agent.id}`} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-zinc-100">{agent.emoji ? `${agent.emoji} ` : ""}{agent.name}</div>
                    <div className="mt-1 text-sm text-zinc-400">{agent.focus || agent.role || "No role extracted yet."}</div>
                    {!agent.isRegistered ? <div className="mt-1 text-xs text-amber-300">Expected, but not registered yet.</div> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={agent.status} />
                    <StatusBadge value={agent.triggerType} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-50">Orchestrator health</h2>
              <Link href="/agents/orchestrator" className="text-sm text-zinc-400 hover:text-white">Open</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Queue state</div>
                <div className="mt-2 text-sm text-zinc-200">{overview.queuedTasks} queued · {overview.inProgressTasks} in progress · {overview.needsApprovalTasks} need approval</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Routing</div>
                <div className="mt-2 text-sm text-zinc-200">{overview.routingHealthy ? "Routing map points to registered agents." : "Routing warnings exist; inspect routing view."}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Digest freshness</div>
                <div className="mt-2 text-sm text-zinc-200">Last digest update: {formatRelative(overview.lastDigestUpdate)}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-zinc-400">{orchestrator?.summary || "No orchestrator summary available yet."}</div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-50">Attention center</h2>
            <div className="mt-4 space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">No active alerts right now.</div>
              ) : (
                alerts.slice(0, 8).map((alert) => (
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
