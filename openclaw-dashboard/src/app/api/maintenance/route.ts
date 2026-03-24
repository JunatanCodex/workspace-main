import { NextResponse } from "next/server";
import { getMaintenanceEvents, getMaintenanceSummary } from "@/lib/domain/maintenance";

export async function GET() {
  const [events, summary] = await Promise.all([getMaintenanceEvents(100), getMaintenanceSummary()]);
  return NextResponse.json({ events, summary, updatedAt: new Date().toISOString() });
}
