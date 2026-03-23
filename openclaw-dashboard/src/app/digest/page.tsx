import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getDigest } from "@/lib/fs/digest";
import { formatDateTime } from "@/lib/utils/time";

function section(content: string, heading: string) {
  const match = content.match(new RegExp(`(?:^|\\n)#+\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n#+\\s|$)`, "i"));
  return match?.[1]?.trim() || "";
}

export default async function DigestPage() {
  const digest = await getDigest();
  const attention = section(digest.content, "attention") || section(digest.content, "needs attention");
  const blocked = section(digest.content, "blocked");
  const outputs = section(digest.content, "outputs") || section(digest.content, "new outputs");

  return (
    <PageShell title="Daily digest" description="A cleaner, section-aware digest view for recent outputs, blocked work, and attention items.">
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title="Digest metadata" description={`Last updated ${formatDateTime(digest.updatedAt)}`} />
            <div className="space-y-4">
              {attention ? <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] p-4 text-sm text-amber-100"><div className="font-medium text-amber-200">Needs attention</div><div className="mt-2 whitespace-pre-wrap">{attention}</div></div> : null}
              {blocked ? <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.08] p-4 text-sm text-red-100"><div className="font-medium text-red-200">Blocked</div><div className="mt-2 whitespace-pre-wrap">{blocked}</div></div> : null}
              {outputs ? <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.08] p-4 text-sm text-sky-100"><div className="font-medium text-sky-200">New outputs</div><div className="mt-2 whitespace-pre-wrap">{outputs}</div></div> : null}
              {!attention && !blocked && !outputs ? <EmptyState title="No structured digest sections yet" description="Once the digest includes headings like Attention, Blocked, or Outputs, they will be highlighted here automatically." /> : null}
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
          <SectionHeader title="Raw digest" description="Full digest markdown/text." />
          <article className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{digest.content}</article>
        </section>
      </div>
    </PageShell>
  );
}
