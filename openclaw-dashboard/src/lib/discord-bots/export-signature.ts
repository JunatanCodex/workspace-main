import crypto from "node:crypto";
import { getOpenClawConfig } from "@/lib/fs/openclaw";

async function getSigningKey() {
  const config = await getOpenClawConfig();
  const envKey = process.env.OPENCLAW_SECRET_BOX_KEY;
  const fallback = typeof (config as Record<string, unknown>).env === 'object' ? String(((config as Record<string, any>).env || {}).OPENROUTER_API_KEY || '') : '';
  return envKey || fallback || 'openclaw-local-signing-fallback';
}

export async function signExport(payload: unknown) {
  const key = await getSigningKey();
  const raw = JSON.stringify(payload);
  return crypto.createHmac('sha256', key).update(raw).digest('hex');
}

export async function verifyExport(payload: unknown, signature?: string) {
  if (!signature) return false;
  const expected = await signExport(payload);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
