"use client";

import { AgentCard } from "@/components/agents/agent-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { useLiveJson } from "@/hooks/use-live-json";
import type { AgentDetails } from "@/lib/types";

export function LiveAgentsPage({ initialAgents }: { initialAgents: AgentDetails[] }) {
  const { data, updatedAt } = useLiveJson<{ agents: AgentDetails[]; updatedAt: string }>("/api/agents", { agents: initialAgents, updatedAt: new Date().toISOString() });
  const agents = data.agents || initialAgents;

  return (
    <>
      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="All agents" description={`Live fleet view · last updated ${new Date(updatedAt).toLocaleTimeString()}`} />
        {agents.length === 0 ? (
          <EmptyState title="No agents found" description="Agent workspaces or OpenClaw config entries have not been detected yet." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        )}
      </section>
    </>
  );
}
