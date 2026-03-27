import { NextRequest, NextResponse } from "next/server";
import { runBotAction } from "@/lib/discord-bots/runtime/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const botId = String(body.botId || "");
  if (!botId) return NextResponse.json({ ok: false, error: "botId is required." }, { status: 400 });
  const result = await runBotAction(botId, "rollback");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
