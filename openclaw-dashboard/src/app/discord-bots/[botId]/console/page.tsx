import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { getDiscordBotById } from "@/lib/discord-bots/store";

export default async function DiscordBotConsolePage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const bot = await getDiscordBotById(botId);
  if (!bot) return notFound();

  return (
    <PageShell title={`${bot.name} Console`} description="MVP console view with latest runtime metadata. Live log streaming can be added in the hardening pass.">
      <div className="rounded-2xl border border-white/8 bg-[#09090c] p-5">
        <div className="text-sm text-zinc-400">Live console is staged as a bounded polling/tail view in a later pass.</div>
        <div className="mt-4 rounded-xl border border-white/6 bg-black/30 p-4 font-mono text-xs text-zinc-300">
          bot_id={bot.bot_id}{"\n"}
          status={bot.status}{"\n"}
          branch={bot.branch}{"\n"}
          current_commit={bot.current_commit || "unknown"}{"\n"}
          last_deployed_at={bot.last_deployed_at || "never"}{"\n"}
          uptime={bot.uptime_label}{"\n"}
        </div>
      </div>
    </PageShell>
  );
}
