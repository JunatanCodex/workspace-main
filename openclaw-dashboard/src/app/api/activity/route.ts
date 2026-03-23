import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/guard";
import { getRecentActivity } from "@/lib/domain/activity";

export async function GET() {
  await requireAuthenticatedUser();
  const activity = await getRecentActivity(12);
  return NextResponse.json({ activity, updatedAt: new Date().toISOString() });
}
