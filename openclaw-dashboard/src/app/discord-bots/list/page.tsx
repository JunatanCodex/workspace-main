import { PageShell } from "@/components/layout/page-shell";
import { DiscordBotsOverview } from "@/components/discord-bots/discord-bots-overview";
import { getDiscordBotViews, getDiscordDeployments, getDiscordHealthReport, getDiscordIncidents } from "@/lib/discord-bots/store";

export default async function DiscordBotsListPage() {
  const [bots, deployments, incidents, health] = await Promise.all([
    getDiscordBotViews(),
    getDiscordDeployments(),
    getDiscordIncidents(),
    getDiscordHealthReport(),
  ]);

  return (
    <PageShell title="Bots List" description="Detailed inventory of all registered Discord bots.">
      <DiscordBotsOverview initial={{ bots, deployments, incidents, health, updatedAt: new Date().toISOString() }} />
    </PageShell>
  );
}
