import crypto from "node:crypto";
import { getOpenClawConfig } from "@/lib/fs/openclaw";

function deriveKey(secret: string) {
  return crypto.createHash("sha256").update(secret).digest();
}

async function getSecretMaterial() {
  const config = await getOpenClawConfig();
  const envKey = process.env.OPENCLAW_SECRET_BOX_KEY;
  const configKey = typeof (config as Record<string, unknown>).env === "object" ? String(((config as Record<string, any>).env || {}).OPENROUTER_API_KEY || "") : "";
  const secret = envKey || configKey;
  if (!secret) throw new Error("No secret material available for encrypting Discord bot secrets.");
  return deriveKey(secret);
}

export async function encryptSecret(value: string): Promise<string> {
  const key = await getSecretMaterial();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${Buffer.concat([iv, tag, encrypted]).toString("base64")}`;
}

export async function decryptSecret(value?: string): Promise<string | undefined> {
  if (!value) return undefined;
  if (!value.startsWith("enc:")) return value;
  const key = await getSecretMaterial();
  const raw = Buffer.from(value.slice(4), "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
