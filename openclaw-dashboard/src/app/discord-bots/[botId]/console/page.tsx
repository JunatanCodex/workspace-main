import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ConsoleView } from "@/components/discord-bots/console-view";
import { PremiumKicker, PremiumPanel } from "@/components/ui/premium";
import { getDiscordBotById } from "@/lib/discord-bots/store";
import { getBotConsoleLines } from "@/lib/discord-bots/runtime/service";

export default async function DiscordBotConsolePage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const bot = await getDiscordBotById(botId);
  if (!bot) return notFound();
  const lines = await getBotConsoleLines(botId);

  return (
    <PageShell title={`${bot.name} Console`} description="Bounded polling/tail log view with filterable JSONL runtime lines for this bot.">
      <PremiumPanel>
        <PremiumKicker>Console</PremiumKicker>
        <div className="mt-2 text-sm text-zinc-400">Recent runtime log lines for {bot.name}.</div>
        <div className="mt-4">
          <ConsoleView initialLines={lines.length ? lines : [`bot_id=${bot.bot_id}`, `status=${bot.status}`, "No runtime logs yet."]} />
        </div>
      </PremiumPanel>
    </PageShell>
  );
}
