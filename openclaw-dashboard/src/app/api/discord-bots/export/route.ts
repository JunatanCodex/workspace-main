import { NextResponse } from "next/server";
import { signExport } from "@/lib/discord-bots/export-signature";
import { getDiscordBotRegistry, getDiscordDeployments, getDiscordHealthReport, getDiscordIncidents } from "@/lib/discord-bots/store";

export async function GET() {
  const [registry, deployments, incidents, health] = await Promise.all([
    getDiscordBotRegistry(),
    getDiscordDeployments(),
    getDiscordIncidents(),
    getDiscordHealthReport(),
  ]);
  const exportedAt = new Date().toISOString();
  const signedSection = { exportedAt, registry, deployments, incidents, health };
  const signature = await signExport(signedSection);
  return NextResponse.json({ ...signedSection, signature });
}
