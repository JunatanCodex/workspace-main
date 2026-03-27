import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { DiscordBotsOverview } from "@/components/discord-bots/discord-bots-overview";
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
      actions={<Link href="/discord-bots/deploy" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">Deploy bot</Link>}
    >
      <DiscordBotsOverview initial={{ bots, deployments, incidents, health, updatedAt: new Date().toISOString() }} />
    </PageShell>
  );
}
