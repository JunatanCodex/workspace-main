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
    <PageShell title={`Outputs · ${agent.name}`} description={`${agent.focus || "Browsing agent workspace outputs."} ${agent.expectedOutputs.length ? `Expected outputs: ${agent.expectedOutputs.join(", ")}.` : ""}`}>
      {agent.suggestedOutputFiles.length ? (
        <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold text-zinc-50">Suggested role-matched outputs</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {agent.suggestedOutputFiles.map((file) => (
              <a key={file.path} href={`/outputs/${agent.id}/browse/${encodeURIComponent(file.name)}`} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300 hover:bg-white/[0.03]">
                <div className="font-medium text-zinc-100">{file.name}</div>
                <div className="mt-1 text-zinc-500">{file.modifiedAt}</div>
              </a>
            ))}
          </div>
        </div>
      ) : null}
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
        {tree.length ? <FileTree agentId={agent.id} nodes={tree} /> : <div className="text-sm text-zinc-400">No browsable files found.</div>}
      </div>
    </PageShell>
  );
}
