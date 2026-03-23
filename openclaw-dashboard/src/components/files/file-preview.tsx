export function FilePreview({ kind, content }: { kind: string; content: string | null }) {
  if (kind === "missing") {
    return <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">File could not be read.</div>;
  }
  if (kind === "unsupported") {
    return <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">Preview not supported for this file type yet.</div>;
  }
  if (!content) {
    return <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">No content available.</div>;
  }
  return <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-zinc-300 whitespace-pre-wrap">{content}</pre>;
}
