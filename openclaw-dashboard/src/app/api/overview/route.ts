import { NextResponse } from "next/server";
import { getOverviewStats } from "@/lib/domain/overview";
import { getRecentActivity } from "@/lib/domain/activity";

export async function GET() {
  const [overview, activity] = await Promise.all([getOverviewStats(), getRecentActivity(8)]);
  return NextResponse.json({ overview, activity, updatedAt: new Date().toISOString() });
}
