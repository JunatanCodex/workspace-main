import { NextResponse } from "next/server";
import { getDiscordBotViews, getDiscordDeployments, getDiscordHealthReport, getDiscordIncidents, getDiscordSummaryFiles } from "@/lib/discord-bots/store";

export async function GET() {
  const [bots, deployments, incidents, health, summaries] = await Promise.all([
    getDiscordBotViews(),
    getDiscordDeployments(),
    getDiscordIncidents(),
    getDiscordHealthReport(),
    getDiscordSummaryFiles(),
  ]);

  return NextResponse.json({
    bots,
    deployments,
    incidents,
    health,
    summaries,
    updatedAt: new Date().toISOString(),
  });
}
