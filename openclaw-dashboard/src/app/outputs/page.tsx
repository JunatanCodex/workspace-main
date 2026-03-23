import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { getAgents } from "@/lib/fs/agents";
import { formatDateTime } from "@/lib/utils/time";

export default async function OutputsPage() {
  const agents = await getAgents();
  return (
    <PageShell title="Output explorer" description="Browse each agent workspace. v1 focuses on latest-file visibility first; deeper file browsing can follow in the next pass.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.id}`} className="rounded-2xl border border-white/10 bg-zinc-900 p-5 hover:bg-white/[0.03]">
            <div className="font-medium text-zinc-100">{agent.emoji ? `${agent.emoji} ` : ""}{agent.name}</div>
            <div className="mt-2 text-sm text-zinc-400">Latest output: {agent.latestOutputFile?.name || "None yet"}</div>
            <div className="mt-1 text-xs text-zinc-500">{formatDateTime(agent.lastOutputTime)}</div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
