function tryPrettyJson(content: string): string {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}

function simpleMarkdownPreview(content: string): string {
  return content
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

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

  const rendered = kind === "json" ? tryPrettyJson(content) : kind === "markdown" ? simpleMarkdownPreview(content) : content;
  return <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-zinc-300 whitespace-pre-wrap">{rendered}</pre>;
}
