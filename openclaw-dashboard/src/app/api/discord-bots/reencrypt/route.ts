import { NextResponse } from "next/server";
import { getDiscordBotSecrets, saveDiscordBotSecrets } from "@/lib/discord-bots/store";

export async function POST() {
  const secrets = await getDiscordBotSecrets();
  await saveDiscordBotSecrets(secrets);
  return NextResponse.json({ ok: true, message: "Discord bot secrets were re-encrypted using current key material." });
}
