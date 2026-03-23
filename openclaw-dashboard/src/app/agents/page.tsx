import { PageShell } from "@/components/layout/page-shell";
import { LiveAgentsPage } from "@/components/agents/live-agents-page";
import { getDashboardAgents } from "@/lib/db/agents";

export default async function AgentsPage() {
  const agents = await getDashboardAgents();
  return (
    <PageShell title="Agents" description="Status-driven fleet view inspired by Linear: quick to scan, fast to navigate, and now polling-backed for live health visibility.">
      <LiveAgentsPage initialAgents={agents} />
    </PageShell>
  );
}
