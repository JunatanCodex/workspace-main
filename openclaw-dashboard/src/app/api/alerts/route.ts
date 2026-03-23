import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/domain/alerts";

export async function GET() {
  const alerts = await getAlerts();
  return NextResponse.json({ alerts, updatedAt: new Date().toISOString() });
}
