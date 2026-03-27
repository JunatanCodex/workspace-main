import { NextResponse } from "next/server";
import { getBotConsoleLines } from "@/lib/discord-bots/runtime/service";

export async function GET(request: Request, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const url = new URL(request.url);
  const filter = (url.searchParams.get('filter') || 'all') as 'all' | 'info' | 'warn' | 'error';
  const search = url.searchParams.get('search') || '';
  const lines = await getBotConsoleLines(botId, filter, search);
  return NextResponse.json({ lines, updatedAt: new Date().toISOString() });
}
