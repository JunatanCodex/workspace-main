import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { getAlerts } from "@/lib/domain/alerts";

export default async function AlertsPage() {
  const alerts = await getAlerts();
  return (
    <PageShell title="Attention center" description="Tasks, fleet gaps, routing warnings, missing outputs, and agents that need your attention right now.">
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-zinc-400">No active alerts.</div>
        ) : alerts.map((alert) => (
          <Link key={`${alert.type}-${alert.title}`} href={alert.href || "#"} className="block rounded-2xl border border-white/10 bg-zinc-900 p-5 hover:bg-white/[0.03]">
            <div className="font-medium text-zinc-100">{alert.title}</div>
            <div className="mt-2 text-sm text-zinc-400">{alert.description}</div>
            <div className="mt-3 text-xs uppercase tracking-wide text-zinc-500">{alert.type} · {alert.severity}</div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
