import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { getAlerts } from "@/lib/domain/alerts";
import { getOverviewStats } from "@/lib/domain/overview";
import { getRecentActivity } from "@/lib/domain/activity";
import { getAgents } from "@/lib/fs/agents";
import { LiveOverview } from "@/components/logs/live-overview";

export default async function Home() {
  const [overview, alerts, agents, activity] = await Promise.all([
    getOverviewStats(),
    getAlerts(),
    getAgents(),
    getRecentActivity(8),
  ]);

  return (
    <PageShell
      title="Overview"
      description="A premium control surface for your OpenClaw fleet. Fast metrics, recent signals, health checks, alerts, and live activity — optimized for daily developer use."
      actions={<Link href="/actions" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">Quick actions</Link>}
    >
      <section>
        <SectionHeader title="Live system view" description="Polling-backed overview with recent activity, running agents, and operational health." />
        <LiveOverview initial={{ overview, alerts, agents, activity, updatedAt: new Date().toISOString() }} />
      </section>
    </PageShell>
  );
}
