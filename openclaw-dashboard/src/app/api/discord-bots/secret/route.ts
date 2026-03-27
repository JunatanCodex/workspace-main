import { NextRequest, NextResponse } from "next/server";
import { getDiscordBotSecrets, saveDiscordBotSecrets } from "@/lib/discord-bots/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const botId = String(body.botId || "");
  if (!botId) return NextResponse.json({ ok: false, error: "botId is required." }, { status: 400 });
  const secrets = await getDiscordBotSecrets();
  const row = secrets[botId] || {};
  if (body.discordToken) row.DISCORD_TOKEN = String(body.discordToken);
  if (body.clientId) row.CLIENT_ID = String(body.clientId);
  if (body.guildId) row.GUILD_ID = String(body.guildId);
  secrets[botId] = row;
  await saveDiscordBotSecrets(secrets);
  return NextResponse.json({ ok: true });
}
