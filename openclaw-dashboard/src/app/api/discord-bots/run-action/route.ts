import { NextRequest, NextResponse } from "next/server";
import { runBotAction } from "@/lib/discord-bots/runtime/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const botId = String(body.botId || "");
  const action = String(body.action || "");
  if (!botId || !action) return NextResponse.json({ ok: false, error: "botId and action are required." }, { status: 400 });
  const result = await runBotAction(botId, action);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
