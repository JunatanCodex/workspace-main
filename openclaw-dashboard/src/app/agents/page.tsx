import { PageShell } from "@/components/layout/page-shell";
import { getAgents } from "@/lib/fs/agents";
import { LiveAgentsPage } from "@/components/agents/live-agents-page";

export default async function AgentsPage() {
  const agents = await getAgents();
  return (
    <PageShell title="Agents" description="Status-driven fleet view inspired by Linear: quick to scan, fast to navigate, and now polling-backed for live health visibility.">
      <LiveAgentsPage initialAgents={agents} />
    </PageShell>
  );
}
