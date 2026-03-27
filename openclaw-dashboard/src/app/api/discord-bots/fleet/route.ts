import { NextRequest, NextResponse } from "next/server";
import { monitorDiscordBots, processDiscordBotQueue, runBotAction } from "@/lib/discord-bots/runtime/service";
import { getDiscordBotRegistry } from "@/lib/discord-bots/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = String(body.action || "");

  if (action === "monitor") {
    const [monitor, queue] = await Promise.all([monitorDiscordBots(), processDiscordBotQueue()]);
    return NextResponse.json({ ok: true, message: `Fleet monitor updated ${monitor.bots.length} bot(s); queue handled ${queue.handled.length}.` });
  }

  if (action === "restart-degraded") {
    const bots = await getDiscordBotRegistry();
    const targets = bots.filter((bot) => ["degraded", "failed"].includes(String(bot.status)));
    const results = await Promise.all(targets.map((bot) => runBotAction(bot.bot_id, "restart")));
    const ok = results.filter((row) => row.ok).length;
    return NextResponse.json({ ok: true, message: `Restart attempted for ${targets.length} bot(s); ${ok} reported ok.` });
  }

  return NextResponse.json({ ok: false, error: "Unsupported fleet action." }, { status: 400 });
}
