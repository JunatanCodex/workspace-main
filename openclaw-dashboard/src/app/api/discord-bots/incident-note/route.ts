import path from "node:path";
import { promises as fs } from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { AGENTS_ROOT } from "@/lib/config";

const INCIDENTS_DIR = path.join(AGENTS_ROOT, 'discord-bot-ops', 'incidents');

export async function POST(request: NextRequest) {
  const body = await request.json();
  const incidentId = String(body.incidentId || '');
  const note = String(body.note || '').trim();
  if (!incidentId || !note) return NextResponse.json({ ok: false, error: 'incidentId and note are required.' }, { status: 400 });
  const file = path.join(INCIDENTS_DIR, `${incidentId}.json`);
  const data = JSON.parse(await fs.readFile(file, 'utf8')) as Record<string, any>;
  data.notes = Array.isArray(data.notes) ? data.notes : [];
  data.notes.push({ at: new Date().toISOString(), note });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return NextResponse.json({ ok: true });
}
