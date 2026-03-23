import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FileTree } from "@/components/files/file-tree";
import { FilePreview } from "@/components/files/file-preview";
import { getAgentById } from "@/lib/fs/agents";
import { listTree, readPreview } from "@/lib/fs/files";

export default async function AgentOutputsPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const agent = await getAgentById(agentId);
  if (!agent) notFound();
  const tree = await listTree(agent.workspace);
  const initialFile = agent.suggestedOutputFiles[0] || agent.recentFiles[0];
  const preview = initialFile ? await readPreview(initialFile.path) : { kind: "missing", content: null };

  return (
    <PageShell title={`Outputs · ${agent.name}`} description={`${agent.focus || "Browsing agent workspace outputs."} ${agent.expectedOutputs.length ? `Expected outputs: ${agent.expectedOutputs.join(", ")}.` : ""}`}>
      <div className="grid gap-6 xl:grid-cols-[0.24fr_0.28fr_0.48fr]">
        <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
          <SectionHeader title="Suggested outputs" description="Best role-matched entry points into this workspace." />
          <div className="space-y-3">
            {agent.suggestedOutputFiles.length ? agent.suggestedOutputFiles.map((file) => (
              <Link key={file.path} href={`/outputs/${agent.id}/browse/${encodeURIComponent(file.name)}`} className="block rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                <div className="font-medium text-zinc-100">{file.name}</div>
                <div className="mt-1 text-sm text-zinc-500">{file.modifiedAt}</div>
              </Link>
            )) : <EmptyState title="No suggested outputs" description="No role-matched artifacts were detected yet." />}
          </div>
        </section>

        <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
          <SectionHeader title="Files" description="Workspace browser." />
          <div className="max-h-[70vh] overflow-auto">
            {tree.length ? <FileTree agentId={agent.id} nodes={tree} /> : <EmptyState title="No files found" description="This workspace does not yet contain browsable files." />}
          </div>
        </section>

        <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
          <SectionHeader title="Preview" description={initialFile ? `Showing ${initialFile.name}` : "Open a file from the explorer to preview it."} />
          <FilePreview kind={preview.kind} content={preview.content} />
        </section>
      </div>
    </PageShell>
  );
}
