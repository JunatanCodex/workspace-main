import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { BulkActions } from "@/components/discord-bots/bulk-actions";
import { DiscordBotsOverview } from "@/components/discord-bots/discord-bots-overview";
import { FleetActions } from "@/components/discord-bots/fleet-actions";
import { MetricsPanels } from "@/components/discord-bots/metrics-panels";
import { MonitorBotsButton } from "@/components/discord-bots/monitor-bots-button";
import { ReencryptSecretsButton } from "@/components/discord-bots/reencrypt-secrets";
import { PremiumPanel } from "@/components/ui/premium";
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
      <div className="mb-6">
        <MetricsPanels deployments={deployments.length} incidents={incidents.length} healthy={bots.filter((b) => b.status === 'healthy').length} attention={bots.filter((b) => ['failed', 'degraded'].includes(String(b.status))).length} />
      </div>
      <PremiumPanel className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FleetActions />
          <ReencryptSecretsButton />
        </div>
        <BulkActions botIds={bots.map((b) => b.bot_id)} />
      </PremiumPanel>
      <DiscordBotsOverview initial={{ bots, deployments, incidents, health, updatedAt: new Date().toISOString() }} />
    </PageShell>
  );
}
