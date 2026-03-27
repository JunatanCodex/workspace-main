import { NextRequest, NextResponse } from "next/server";
import { queueDiscordBotAction, registerDiscordBot } from "@/lib/discord-bots/actions";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const kind = String(body.kind || "");

  if (kind === "register") {
    const result = await registerDiscordBot({
      name: String(body.name || ""),
      repo_url: String(body.repo_url || ""),
      branch: String(body.branch || "main"),
      runtime_type: String(body.runtime_type || "node"),
      working_directory: String(body.working_directory || ""),
      install: String(body.install || ""),
      build: String(body.build || ""),
      start: String(body.start || ""),
      healthCheck: String(body.healthCheck || ""),
      discordToken: body.discordToken ? String(body.discordToken) : undefined,
      clientId: body.clientId ? String(body.clientId) : undefined,
      guildId: body.guildId ? String(body.guildId) : undefined,
      additionalEnv: typeof body.additionalEnv === "object" && body.additionalEnv ? body.additionalEnv : {},
      autoFixEnabled: Boolean(body.autoFixEnabled),
      restartPolicy: String(body.restartPolicy || "always"),
      rollbackEnabled: Boolean(body.rollbackEnabled),
      template: body.template ? String(body.template) : undefined,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (kind === "action") {
    const botId = String(body.botId || "");
    const action = String(body.action || "") as Parameters<typeof queueDiscordBotAction>[1];
    const result = await queueDiscordBotAction(botId, action);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  return NextResponse.json({ ok: false, error: "Unsupported discord bot action request." }, { status: 400 });
}
