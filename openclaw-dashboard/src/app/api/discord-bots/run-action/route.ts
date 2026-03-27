import { NextRequest, NextResponse } from "next/server";
import { runBotAction } from "@/lib/discord-bots/runtime/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const botId = String(body.botId || "");
    const action = String(body.action || "");
    if (!botId || !action) return NextResponse.json({ ok: false, error: "botId and action are required." }, { status: 400 });
    const result = await Promise.race([
      runBotAction(botId, action),
      new Promise<{ ok: false; error: string }>((resolve) => setTimeout(() => resolve({ ok: false, error: "Bot action timed out before completion." }), 180_000)),
    ]);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
