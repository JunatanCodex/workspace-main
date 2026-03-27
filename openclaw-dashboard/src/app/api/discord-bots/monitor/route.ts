import { NextResponse } from "next/server";
import { monitorDiscordBots, processDiscordBotQueue } from "@/lib/discord-bots/runtime/service";

export async function POST() {
  const [monitor, queue] = await Promise.all([monitorDiscordBots(), processDiscordBotQueue()]);
  return NextResponse.json({ ok: true, monitor, queue, updatedAt: new Date().toISOString() });
}
