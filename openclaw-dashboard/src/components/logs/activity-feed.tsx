import Link from "next/link";
import { formatReadableTimestamp } from "@/lib/utils/time";

export function ActivityFeed({ items }: { items: Array<{ title: string; description: string; href?: string; at: string }> }) {
  if (!items.length) {
    return <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-zinc-500">No recent activity yet.</div>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const content = (
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium text-zinc-100">{item.title}</div>
              <div className="text-xs text-zinc-500">{formatReadableTimestamp(item.at)}</div>
            </div>
            <div className="mt-2 text-sm text-zinc-400">{item.description}</div>
          </div>
        );
        return item.href ? <Link key={`${item.title}-${item.at}`} href={item.href} className="block">{content}</Link> : <div key={`${item.title}-${item.at}`} className="block">{content}</div>;
      })}
    </div>
  );
}
