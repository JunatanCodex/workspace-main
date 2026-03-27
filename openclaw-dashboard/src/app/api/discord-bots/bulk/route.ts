import { NextRequest, NextResponse } from "next/server";
import { runBotAction } from "@/lib/discord-bots/runtime/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const botIds = Array.isArray(body.botIds) ? body.botIds.map(String) : [];
  const action = String(body.action || "");
  if (!botIds.length || !action) return NextResponse.json({ ok: false, error: "botIds and action are required." }, { status: 400 });
  const results = await Promise.all(botIds.map((botId: string) => runBotAction(botId, action)));
  const ok = results.filter((row) => row.ok).length;
  return NextResponse.json({ ok: true, message: `${action} attempted for ${botIds.length} bot(s); ${ok} reported ok.` });
}
