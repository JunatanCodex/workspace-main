import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDashboardAlerts } from "@/lib/db/alerts";

export default async function AlertsPage() {
  const alerts = await getDashboardAlerts();
  const groups = {
    critical: alerts.filter((alert) => alert.severity === "critical"),
    warning: alerts.filter((alert) => alert.severity === "warning"),
    info: alerts.filter((alert) => alert.severity === "info"),
  };

  return (
    <PageShell title="Attention center" description="A grouped notification-style view for failures, approvals, routing issues, and system warnings.">
      {alerts.length === 0 ? (
        <EmptyState title="No active alerts" description="The system is currently quiet." />
      ) : (
        <div className="space-y-6">
          {(["critical", "warning", "info"] as const).map((severity) => (
            <section key={severity} className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
              <SectionHeader title={`${severity[0].toUpperCase()}${severity.slice(1)} alerts`} description={`${groups[severity].length} item(s)`} />
              <div className="space-y-3">
                {groups[severity].length ? groups[severity].map((alert) => (
                  <Link key={`${alert.type}-${alert.title}`} href={alert.href || "#"} className="block rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-zinc-100">{alert.title}</div>
                      <StatusBadge value={severity === "critical" ? "needs_approval" : severity === "warning" ? "blocked" : "idle"} />
                    </div>
                    <div className="mt-2 text-sm leading-6 text-zinc-400">{alert.description}</div>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">{alert.type}</div>
                  </Link>
                )) : <EmptyState title={`No ${severity} alerts`} description={`Nothing in the ${severity} bucket right now.`} />}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
