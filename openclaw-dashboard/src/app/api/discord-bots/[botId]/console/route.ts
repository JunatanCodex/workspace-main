import { NextResponse } from "next/server";
import { getBotConsoleLines } from "@/lib/discord-bots/runtime/service";

export async function GET(_: Request, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const lines = await getBotConsoleLines(botId);
  return NextResponse.json({ lines, updatedAt: new Date().toISOString() });
}
