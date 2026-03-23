import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/guard";
import { getDashboardAlerts } from "@/lib/db/alerts";

export async function GET() {
  await requireAuthenticatedUser();
  const alerts = await getDashboardAlerts();
  return NextResponse.json({ alerts, updatedAt: new Date().toISOString() });
}
