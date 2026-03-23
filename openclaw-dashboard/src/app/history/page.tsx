import { PageShell } from "@/components/layout/page-shell";
import { getHistoryMetrics } from "@/lib/domain/history";

export default async function HistoryPage() {
  const history = await getHistoryMetrics();
  return (
    <PageShell title="Productivity & history" description="Simple metrics computed from task timestamps where data exists.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <div className="text-sm text-zinc-500">Most active agent</div>
          <div className="mt-2 text-xl font-semibold text-zinc-100">{history.mostActive?.name || "No data"}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <div className="text-sm text-zinc-500">Least active agent</div>
          <div className="mt-2 text-xl font-semibold text-zinc-100">{history.leastActive?.name || "No data"}</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03] text-left text-zinc-400">
            <tr><th className="px-4 py-3">Agent</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Today</th><th className="px-4 py-3">This week</th><th className="px-4 py-3">Needs approval</th><th className="px-4 py-3">Avg completion (hrs)</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.byAgent.map((row) => (
              <tr key={row.agentId}>
                <td className="px-4 py-4 text-zinc-200">{row.name}</td>
                <td className="px-4 py-4 text-zinc-300">{row.completed}</td>
                <td className="px-4 py-4 text-zinc-300">{row.completedToday}</td>
                <td className="px-4 py-4 text-zinc-300">{row.completedWeek}</td>
                <td className="px-4 py-4 text-zinc-300">{row.approvals}</td>
                <td className="px-4 py-4 text-zinc-300">{row.avgCompletionHours ? row.avgCompletionHours.toFixed(1) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
