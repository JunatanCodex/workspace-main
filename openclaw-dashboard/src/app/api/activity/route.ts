import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/domain/activity";

export async function GET() {
  const activity = await getRecentActivity(12);
  return NextResponse.json({ activity, updatedAt: new Date().toISOString() });
}
