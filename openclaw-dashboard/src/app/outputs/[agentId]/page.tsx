import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { FileTree } from "@/components/files/file-tree";
import { getAgentById } from "@/lib/fs/agents";
import { listTree } from "@/lib/fs/files";

export default async function AgentOutputsPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const agent = await getAgentById(agentId);
  if (!agent) notFound();
  const tree = await listTree(agent.workspace);

  return (
    <PageShell title={`Outputs · ${agent.name}`} description={`Browsing ${agent.workspace}`}>
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
        {tree.length ? <FileTree agentId={agent.id} nodes={tree} /> : <div className="text-sm text-zinc-400">No browsable files found.</div>}
      </div>
    </PageShell>
  );
}
