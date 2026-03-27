import { NextRequest, NextResponse } from "next/server";
import { setActiveRole } from "@/lib/discord-bots/permissions";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const role = String(body.role || 'viewer') as 'viewer' | 'operator' | 'admin';
  const policy = await setActiveRole(role);
  return NextResponse.json({ ok: true, activeRole: policy.activeRole });
}
