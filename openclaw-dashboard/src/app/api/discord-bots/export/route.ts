import { NextResponse } from "next/server";
import { getDiscordBotRegistry, getDiscordDeployments, getDiscordHealthReport, getDiscordIncidents } from "@/lib/discord-bots/store";

export async function GET() {
  const [registry, deployments, incidents, health] = await Promise.all([
    getDiscordBotRegistry(),
    getDiscordDeployments(),
    getDiscordIncidents(),
    getDiscordHealthReport(),
  ]);
  return NextResponse.json({ exportedAt: new Date().toISOString(), registry, deployments, incidents, health });
}
