import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { DiscordBotsOverview } from "@/components/discord-bots/discord-bots-overview";
import { FleetActions } from "@/components/discord-bots/fleet-actions";
import { MonitorBotsButton } from "@/components/discord-bots/monitor-bots-button";
import { ReencryptSecretsButton } from "@/components/discord-bots/reencrypt-secrets";
import { PremiumMetric, PremiumPanel } from "@/components/ui/premium";
import { getDiscordBotViews, getDiscordDeployments, getDiscordHealthReport, getDiscordIncidents } from "@/lib/discord-bots/store";

export default async function DiscordBotsPage() {
  const [bots, deployments, incidents, health] = await Promise.all([
    getDiscordBotViews(),
    getDiscordDeployments(),
    getDiscordIncidents(),
    getDiscordHealthReport(),
  ]);

  return (
    <PageShell
      title="Discord Bots"
      description="Deployment, monitoring, incidents, and operational controls for Discord bots managed by the discord-bot-ops specialist."
      actions={<><MonitorBotsButton /><Link href="/discord-bots/deploy" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">Deploy bot</Link></>}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <PremiumMetric label="Incidents" value={incidents.length} subtext="Tracked incident records" />
        <PremiumMetric label="Deployments" value={deployments.length} subtext="Recorded deployment events" />
        <PremiumMetric label="Healthy now" value={bots.filter((b) => b.status === 'healthy').length} subtext="Bots reporting healthy" />
        <PremiumMetric label="Need attention" value={bots.filter((b) => ['failed', 'degraded'].includes(String(b.status))).length} subtext="Failed or degraded bots" />
      </div>
      <PremiumPanel className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <FleetActions />
        <ReencryptSecretsButton />
      </PremiumPanel>
      <DiscordBotsOverview initial={{ bots, deployments, incidents, health, updatedAt: new Date().toISOString() }} />
    </PageShell>
  );
}
