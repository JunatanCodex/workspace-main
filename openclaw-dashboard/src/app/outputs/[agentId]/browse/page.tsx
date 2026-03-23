import path from "node:path";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { FilePreview } from "@/components/files/file-preview";
import { getAgentById } from "@/lib/fs/agents";
import { readPreview } from "@/lib/fs/files";

export default async function OutputFilePage({ params }: { params: Promise<{ agentId: string; path?: string[] }> }) {
  const resolved = await params;
  const agent = await getAgentById(resolved.agentId);
  if (!agent) notFound();
  const pieces = resolved.path || [];
  if (pieces.length === 0) notFound();
  const fullPath = path.join(agent.workspace, ...pieces);
  const preview = await readPreview(fullPath);

  return (
    <PageShell title={pieces[pieces.length - 1]} description={fullPath}>
      <FilePreview kind={preview.kind} content={preview.content} />
    </PageShell>
  );
}
