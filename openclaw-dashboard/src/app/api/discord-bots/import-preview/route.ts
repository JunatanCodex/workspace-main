import { NextRequest, NextResponse } from "next/server";
import { verifyExport } from "@/lib/discord-bots/export-signature";

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

  const signedSection = {
    registry: parsed.registry,
    deployments: parsed.deployments,
    incidents: parsed.incidents,
    health: parsed.health,
    exportedAt: parsed.exportedAt,
  };

  const signatureValid = await verifyExport(signedSection, parsed.signature);

  return NextResponse.json({
    ok: true,
    registryCount: Array.isArray(parsed.registry) ? parsed.registry.length : 0,
    deploymentCount: Array.isArray(parsed.deployments) ? parsed.deployments.length : 0,
    incidentCount: Array.isArray(parsed.incidents) ? parsed.incidents.length : 0,
    signatureValid,
  });
}
