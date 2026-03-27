import path from "node:path";
import { promises as fs } from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { verifyExport } from "@/lib/discord-bots/export-signature";
import { AGENTS_ROOT } from "@/lib/config";

const BOT_OPS_ROOT = path.join(AGENTS_ROOT, 'discord-bot-ops');
const REGISTRY_FILE = path.join(BOT_OPS_ROOT, 'bot-registry.json');
const HEALTH_FILE = path.join(BOT_OPS_ROOT, 'health-report.json');
const DEPLOYMENTS_DIR = path.join(BOT_OPS_ROOT, 'deployments');
const INCIDENTS_DIR = path.join(BOT_OPS_ROOT, 'incidents');

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = String(body.payload || '');
  if (!payload) return NextResponse.json({ ok: false, error: 'payload is required.' }, { status: 400 });

  let parsed: any;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!Array.isArray(parsed.registry) || !Array.isArray(parsed.deployments) || !Array.isArray(parsed.incidents) || typeof parsed.health !== 'object') {
    return NextResponse.json({ ok: false, error: 'Payload missing required export sections.' }, { status: 400 });
  }

  const signedSection = {
    registry: parsed.registry,
    deployments: parsed.deployments,
    incidents: parsed.incidents,
    health: parsed.health,
    exportedAt: parsed.exportedAt,
  };
  const signatureValid = await verifyExport(signedSection, parsed.signature);
  if (!signatureValid) {
    return NextResponse.json({ ok: false, error: 'Export signature verification failed.' }, { status: 400 });
  }

  await fs.mkdir(DEPLOYMENTS_DIR, { recursive: true });
  await fs.mkdir(INCIDENTS_DIR, { recursive: true });
  await fs.writeFile(REGISTRY_FILE, `${JSON.stringify(parsed.registry, null, 2)}\n`, 'utf8');
  await fs.writeFile(HEALTH_FILE, `${JSON.stringify(parsed.health, null, 2)}\n`, 'utf8');

  await Promise.all((await fs.readdir(DEPLOYMENTS_DIR)).map((name) => fs.rm(path.join(DEPLOYMENTS_DIR, name), { force: true })));
  await Promise.all((await fs.readdir(INCIDENTS_DIR)).map((name) => fs.rm(path.join(INCIDENTS_DIR, name), { force: true })));

  await Promise.all(parsed.deployments.map((row: any) => fs.writeFile(path.join(DEPLOYMENTS_DIR, `${row.deployment_id}.json`), `${JSON.stringify(row, null, 2)}\n`, 'utf8')));
  await Promise.all(parsed.incidents.map((row: any) => fs.writeFile(path.join(INCIDENTS_DIR, `${row.incident_id}.json`), `${JSON.stringify(row, null, 2)}\n`, 'utf8')));

  return NextResponse.json({ ok: true, message: `Imported ${parsed.registry.length} bot(s), ${parsed.deployments.length} deployment(s), and ${parsed.incidents.length} incident(s).` });
}
