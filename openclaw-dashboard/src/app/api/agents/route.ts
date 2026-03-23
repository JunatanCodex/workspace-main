import { NextResponse } from "next/server";
import { getAgents } from "@/lib/fs/agents";

export async function GET() {
  const agents = await getAgents();
  return NextResponse.json({ agents, updatedAt: new Date().toISOString() });
}
