import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export function PipelineStage({ title, items, href, status }: { title: string; items: string[]; href?: string; status: string }) {
  const content = (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5 transition hover:border-white/12 hover:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-50">{title}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">Pipeline stage</div>
        </div>
        <StatusBadge value={status} />
      </div>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-300">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No items yet.</li>}
      </ul>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
