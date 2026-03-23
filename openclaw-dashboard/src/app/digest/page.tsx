import { PageShell } from "@/components/layout/page-shell";
import { getDigest } from "@/lib/fs/digest";
import { formatDateTime } from "@/lib/utils/time";

export default async function DigestPage() {
  const digest = await getDigest();
  return (
    <PageShell title="Daily digest" description="Rendered directly from ~/.openclaw/shared/digest.md with a simple empty-state-friendly presentation.">
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
        <div className="text-sm text-zinc-500">Last updated: {formatDateTime(digest.updatedAt)}</div>
        <article className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{digest.content}</article>
      </div>
    </PageShell>
  );
}
