import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/guard";
import { getDashboardAgents } from "@/lib/db/agents";

export async function GET() {
  await requireAuthenticatedUser();
  const agents = await getDashboardAgents();
  return NextResponse.json({ agents, updatedAt: new Date().toISOString() });
}
