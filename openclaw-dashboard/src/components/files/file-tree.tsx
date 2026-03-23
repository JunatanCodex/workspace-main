import Link from "next/link";
import type { FileNode } from "@/lib/fs/files";

export function FileTree({ agentId, nodes, level = 0 }: { agentId: string; nodes: FileNode[]; level?: number }) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <div key={`${node.relativePath}-${node.type}`} style={{ marginLeft: level * 12 }}>
          {node.type === "directory" ? (
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm font-medium text-zinc-200">
              📁 {node.name}
            </div>
          ) : (
            <Link
              href={`/outputs/${agentId}/browse/${node.relativePath.split("/").map(encodeURIComponent).join("/")}`}
              className="block rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.03]"
            >
              📄 {node.name}
            </Link>
          )}
          {node.children?.length ? <div className="mt-2"><FileTree agentId={agentId} nodes={node.children} level={level + 1} /></div> : null}
        </div>
      ))}
    </div>
  );
}
