import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/guard";
import { getOverviewStats } from "@/lib/domain/overview";
import { getRecentActivity } from "@/lib/domain/activity";
import { getDashboardAlerts } from "@/lib/db/alerts";
import { getDashboardAgents } from "@/lib/db/agents";

export async function GET() {
  await requireAuthenticatedUser();
  const [overview, activity, alerts, agents] = await Promise.all([getOverviewStats(), getRecentActivity(8), getDashboardAlerts(), getDashboardAgents()]);
  return NextResponse.json({ overview, activity, alerts, agents, updatedAt: new Date().toISOString() });
}
