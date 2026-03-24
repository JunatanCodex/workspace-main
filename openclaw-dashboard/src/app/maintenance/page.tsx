import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { formatReadableTimestamp } from "@/lib/utils/time";
import { getMaintenanceEvents, getMaintenanceSummary } from "@/lib/domain/maintenance";

const tones: Record<string, string> = {
  cleanup: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-100",
  automation: "border-sky-500/20 bg-sky-500/[0.08] text-sky-100",
  pipeline: "border-violet-500/20 bg-violet-500/[0.08] text-violet-100",
  system: "border-zinc-500/20 bg-zinc-500/[0.08] text-zinc-100",
};

export default async function MaintenancePage() {
  const [events, summary] = await Promise.all([getMaintenanceEvents(100), getMaintenanceSummary()]);

  return (
    <PageShell
      title="Automation & maintenance log"
      description="A first-class audit view for deterministic sweeps, queue cleanup, and pipeline/system maintenance events."
      actions={<Link href="/digest" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.03]">Open digest</Link>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked events" value={summary.total} hint={summary.latestAt ? `Latest ${formatReadableTimestamp(summary.latestAt)}` : "No maintenance events yet"} />
        <StatCard label="Cleanup events" value={summary.cleanup} hint="Queue hygiene, duplicate cancellation, pruning" />
        <StatCard label="Automation events" value={summary.automation} hint="Deterministic sweeps and automation actions" />
        <StatCard label="Pipeline events" value={summary.pipeline} hint="Pipeline completes, stops, and transitions" />
      </div>

      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="Event stream" description={`${events.length} recent shared events`} />
        {events.length === 0 ? (
          <EmptyState title="No maintenance events yet" description="Once sweeps and cleanup actions write to the shared event log, they will appear here." />
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <article key={`${event.timestamp || "na"}-${event.action_taken || event.event_type || index}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${tones[event.category] || tones.system}`}>{event.category}</span>
                      <div className="text-sm font-medium text-zinc-100">{event.action_taken || event.event_type || "Shared event"}</div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-zinc-400">{event.notes || "No additional notes recorded."}</div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span>Source agent: {event.source_agent || "—"}</span>
                      <span>Source task: {event.source_task_id || "—"}</span>
                      <span>Created task: {event.created_task_id || "—"}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-zinc-500">{formatReadableTimestamp(event.timestamp)}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
