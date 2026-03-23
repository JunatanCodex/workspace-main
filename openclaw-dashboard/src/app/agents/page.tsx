import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentCard } from "@/components/agents/agent-card";
import { getAgents } from "@/lib/fs/agents";

export default async function AgentsPage() {
  const agents = await getAgents();
  return (
    <PageShell title="Agents" description="Status-driven fleet view inspired by Linear: quick to scan, fast to navigate, and dense with the right metadata.">
      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="All agents" description="Each card shows role, health, trigger mode, task count, and freshest output signal." />
        {agents.length === 0 ? (
          <EmptyState title="No agents found" description="Agent workspaces or OpenClaw config entries have not been detected yet." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        )}
      </section>
    </PageShell>
  );
}
