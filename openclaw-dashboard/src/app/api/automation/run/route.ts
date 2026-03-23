import { NextResponse } from "next/server";
import { requireOperationalAccess } from "@/lib/auth/guard";
import { runAutomationSweep } from "@/lib/automation/runner";

export async function POST() {
  await requireOperationalAccess();
  const result = await runAutomationSweep();
  return NextResponse.json({ ...result, updatedAt: new Date().toISOString() });
}
