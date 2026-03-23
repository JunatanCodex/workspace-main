"use client";

import Link from "next/link";
import { ActivityFeed } from "@/components/logs/activity-feed";
import { CollapsiblePanel } from "@/components/layout/collapsible-panel";
import { AgentCard } from "@/components/agents/agent-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLiveJson } from "@/hooks/use-live-json";
import type { AgentDetails, AlertItem, OverviewStats } from "@/lib/types";
import { formatReadableTimestamp, formatRelative, formatTime } from "@/lib/utils/time";

type OverviewPayload = {
  overview: OverviewStats;
  agents: AgentDetails[];
  alerts: AlertItem[];
  activity: Array<{ title: string; description: string; href?: string; at: string }>;
  digestUpdatedAt?: string;
  updatedAt: string;
};

export function LiveOverview({ initial }: { initial: OverviewPayload }) {
  const { data, updatedAt } = useLiveJson<OverviewPayload>("/api/overview", initial);
  const overview = data.overview;
  const alerts = data.alerts || [];
  const agents = data.agents || [];
  const activity = data.activity || [];
  const orchestrator = agents.find((agent) => agent.id === "orchestrator");
  const runningAgents = agents.filter((agent) => agent.status === "running" || agent.status === "waiting");

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expected agents" value={overview.expectedAgents} hint={`Updated ${formatTime(updatedAt)}`} />
        <StatCard label="Registered agents" value={overview.registeredAgents} />
        <StatCard label="Queued tasks" value={overview.queuedTasks} />
        <StatCard label="In progress" value={overview.inProgressTasks} />
        <StatCard label="Completed" value={overview.completedTasks} />
        <StatCard label="Needs approval" value={overview.needsApprovalTasks} />
        <StatCard label="Failed / stalled" value={overview.failedOrStalledTasks} />
        <StatCard label="Inactive agents" value={agents.filter((agent) => agent.status === "offline" || agent.status === "missing").length} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Recent activity" description="Live feed from CLI executions, tasks, and agent state." />
            <ActivityFeed items={activity} />
          </div>

          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Currently running" description="Agents with active or queued work right now." />
            {runningAgents.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {runningAgents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
              </div>
            ) : <EmptyState title="No active agents" description="No agents are currently running or queued." />}
          </div>

          <CollapsiblePanel
            title="Fleet status"
            description="Fast scan of the current fleet with health, trigger mode, and freshest signal."
            action={<Link href="/agents" className="text-sm text-zinc-400 hover:text-white">View all</Link>}
            defaultOpen={false}
            collapsedPreview={
              <div className="grid gap-3 lg:grid-cols-2">
                {agents.slice(0, 6).map((agent) => (
                  <Link key={agent.id} href={`/agents/${agent.id}`} className="rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-zinc-100">{agent.emoji ? `${agent.emoji} ` : ""}{agent.name}</div>
                      <StatusBadge value={agent.status} />
                    </div>
                    <div className="mt-2 text-sm text-zinc-400">{agent.focus || agent.role || "No role extracted yet."}</div>
                  </Link>
                ))}
              </div>
            }
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </CollapsiblePanel>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Quick health" description="Live orchestrator and digest freshness." />
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-zinc-300">
                <div className="flex items-center gap-3"><StatusBadge value={orchestrator?.status || "unknown"} /><span>{orchestrator?.summary || "No orchestrator summary available yet."}</span></div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Last orchestrator run</div>
                <div className="mt-2 text-sm text-zinc-200">{formatRelative(overview.lastOrchestratorRun)} · {formatReadableTimestamp(overview.lastOrchestratorRun)}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Last digest update</div>
                <div className="mt-2 text-sm text-zinc-200">{formatRelative(overview.lastDigestUpdate)} · {formatReadableTimestamp(overview.lastDigestUpdate)}</div>
              </div>
            </div>
          </div>

          <CollapsiblePanel
            title="Alert center"
            description="Status-driven operational issues, approvals, and failures."
            action={<Link href="/alerts" className="text-sm text-zinc-400 hover:text-white">Open</Link>}
            defaultOpen={false}
            collapsedPreview={
              <div className="space-y-3">
                {alerts.length === 0 ? <EmptyState title="No active alerts" description="The system is currently quiet." /> : alerts.slice(0, 6).map((alert) => (
                  <Link key={`${alert.type}-${alert.title}`} href={alert.href || "/alerts"} className="block rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-2"><div className="font-medium text-zinc-100">{alert.title}</div><StatusBadge value={alert.severity === "critical" ? "needs_approval" : "blocked"} /></div>
                  </Link>
                ))}
              </div>
            }
          >
            <div className="space-y-3">
              {alerts.length === 0 ? <EmptyState title="No active alerts" description="The system is currently quiet." /> : alerts.slice(0, 10).map((alert) => (
                <Link key={`${alert.type}-${alert.title}`} href={alert.href || "/alerts"} className="block rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                  <div className="flex items-center justify-between gap-2"><div className="font-medium text-zinc-100">{alert.title}</div><StatusBadge value={alert.severity === "critical" ? "needs_approval" : "blocked"} /></div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{alert.description}</p>
                </Link>
              ))}
            </div>
          </CollapsiblePanel>
        </section>
      </div>
    </>
  );
}
