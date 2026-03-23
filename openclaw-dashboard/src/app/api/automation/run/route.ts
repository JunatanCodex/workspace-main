import { NextResponse } from "next/server";
import { runAutomationSweep } from "@/lib/automation/runner";

export async function POST() {
  const result = await runAutomationSweep();
  return NextResponse.json({ ...result, updatedAt: new Date().toISOString() });
}
