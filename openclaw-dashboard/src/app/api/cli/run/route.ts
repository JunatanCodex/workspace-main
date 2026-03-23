import { NextRequest, NextResponse } from "next/server";
import { runCliAction } from "@/lib/cli/runner";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const commandId = String(body.commandId || "");
  const input = typeof body.input === "object" && body.input ? body.input : {};
  if (!commandId) return NextResponse.json({ error: "commandId required" }, { status: 400 });
  const result = await runCliAction(commandId, input as Record<string, string>);
  return NextResponse.json(result);
}
