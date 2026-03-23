import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { CollapsiblePanel } from "@/components/layout/collapsible-panel";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentCard } from "@/components/agents/agent-card";
import { getAlerts } from "@/lib/domain/alerts";
import { getOverviewStats } from "@/lib/domain/overview";
import { getSpecialistSignals } from "@/lib/domain/specialist-signals";
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
  const signals = getSpecialistSignals(agents);

  return (
    <PageShell
      title="Overview"
      description="A premium control surface for your OpenClaw fleet. Fast metrics, recent signals, health checks, and alerts — optimized for daily developer use."
      actions={<Link href="/actions" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">Quick actions</Link>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expected agents" value={overview.expectedAgents} />
        <StatCard label="Registered agents" value={overview.registeredAgents} />
        <StatCard label="Queued tasks" value={overview.queuedTasks} />
        <StatCard label="In progress" value={overview.inProgressTasks} />
        <StatCard label="Completed" value={overview.completedTasks} />
        <StatCard label="Needs approval" value={overview.needsApprovalTasks} />
        <StatCard label="System alerts" value={alerts.length} />
        <StatCard label="Routing health" value={overview.routingHealthy ? "Healthy" : "Warning"} />
      </div>

      <section>
        <SectionHeader title="Specialist signals" description="Highest-value signals surfaced from the agents that most often drive decisions." />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          {signals.map((signal) => (
            <Link key={signal.title} href={signal.href} className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5 transition hover:border-white/12 hover:bg-white/[0.02]">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">{signal.title}</div>
              <div className="mt-3 font-medium text-zinc-50">{signal.agentId}</div>
              <div className="mt-2 text-sm leading-6 text-zinc-400">{signal.summary}</div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-6">
          <CollapsiblePanel
            title="Fleet status"
            description="Fast scan of the current fleet with health, trigger mode, and freshest signal."
            action={<Link href="/agents" className="text-sm text-zinc-400 hover:text-white">View all</Link>}
            defaultOpen={false}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </CollapsiblePanel>

          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Orchestrator health" description="Queue, routing, and digest health in one place." action={<Link href="/agents/orchestrator" className="text-sm text-zinc-400 hover:text-white">Open</Link>} />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Queue state</div>
                <div className="mt-3 text-sm leading-6 text-zinc-200">{overview.queuedTasks} queued · {overview.inProgressTasks} in progress · {overview.needsApprovalTasks} need approval</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Routing</div>
                <div className="mt-3 text-sm leading-6 text-zinc-200">{overview.routingHealthy ? "Routing map points cleanly to registered agents." : "Routing warnings detected; inspect routing view."}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Digest freshness</div>
                <div className="mt-3 text-sm leading-6 text-zinc-200">{formatRelative(overview.lastDigestUpdate)}<div className="mt-1 text-zinc-500">{formatDateTime(overview.lastDigestUpdate)}</div></div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-zinc-300">
              <StatusBadge value={orchestrator?.status || "unknown"} />
              <span>{orchestrator?.summary || "No orchestrator summary available yet."}</span>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <CollapsiblePanel
            title="Alert center"
            description="Status-driven operational issues, approvals, and failures."
            action={<Link href="/alerts" className="text-sm text-zinc-400 hover:text-white">Open</Link>}
            defaultOpen={false}
          >
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <EmptyState title="No active alerts" description="The system is currently quiet. New approvals, failures, or routing issues will show up here." />
              ) : (
                alerts.slice(0, 8).map((alert) => (
                  <Link key={`${alert.type}-${alert.title}`} href={alert.href || "/alerts"} className="block rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-zinc-100">{alert.title}</div>
                      <StatusBadge value={alert.severity === "critical" ? "needs_approval" : "blocked"} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{alert.description}</p>
                  </Link>
                ))
              )}
            </div>
          </CollapsiblePanel>

          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Digest" description="Latest daily summary from the orchestrator." action={<Link href="/digest" className="text-sm text-zinc-400 hover:text-white">Open</Link>} />
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-zinc-400 whitespace-pre-wrap">{digest.content}</div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
