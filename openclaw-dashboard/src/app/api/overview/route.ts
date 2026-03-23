import { NextResponse } from "next/server";
import { getOverviewStats } from "@/lib/domain/overview";
import { getRecentActivity } from "@/lib/domain/activity";
import { getAlerts } from "@/lib/domain/alerts";
import { getAgents } from "@/lib/fs/agents";

export async function GET() {
  const [overview, activity, alerts, agents] = await Promise.all([getOverviewStats(), getRecentActivity(8), getAlerts(), getAgents()]);
  return NextResponse.json({ overview, activity, alerts, agents, updatedAt: new Date().toISOString() });
}
