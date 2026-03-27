import { PageShell } from "@/components/layout/page-shell";
import { PremiumPanel } from "@/components/ui/premium";
import { getDiscordBotViews, getDiscordDeployments, getDiscordIncidents } from "@/lib/discord-bots/store";

export default async function DiscordBotMetricsPage() {
  const [bots, deployments, incidents] = await Promise.all([getDiscordBotViews(), getDiscordDeployments(), getDiscordIncidents()]);
  const healthy = bots.filter((b) => b.status === 'healthy').length;
  const degraded = bots.filter((b) => b.status === 'degraded').length;
  const failed = bots.filter((b) => b.status === 'failed').length;

  return (
    <PageShell title="Discord Bot Metrics" description="Simple historical and current-state metrics for the bot fleet.">
      <div className="grid gap-4 md:grid-cols-3">
        <PremiumPanel><div className="text-sm text-zinc-500">Healthy</div><div className="mt-2 text-3xl font-semibold text-zinc-100">{healthy}</div></PremiumPanel>
        <PremiumPanel><div className="text-sm text-zinc-500">Degraded</div><div className="mt-2 text-3xl font-semibold text-zinc-100">{degraded}</div></PremiumPanel>
        <PremiumPanel><div className="text-sm text-zinc-500">Failed</div><div className="mt-2 text-3xl font-semibold text-zinc-100">{failed}</div></PremiumPanel>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PremiumPanel><div className="text-sm text-zinc-500">Total deployments</div><div className="mt-2 text-3xl font-semibold text-zinc-100">{deployments.length}</div></PremiumPanel>
        <PremiumPanel><div className="text-sm text-zinc-500">Total incidents</div><div className="mt-2 text-3xl font-semibold text-zinc-100">{incidents.length}</div></PremiumPanel>
      </div>
    </PageShell>
  );
}
