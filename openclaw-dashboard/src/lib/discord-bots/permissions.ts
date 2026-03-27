import path from "node:path";
import { promises as fs } from "node:fs";
import { AGENTS_ROOT } from "@/lib/config";

export type DiscordOpsRole = 'viewer' | 'operator' | 'admin';

const FILE = path.join(AGENTS_ROOT, 'discord-bot-ops', 'operator-policy.json');
const DEFAULT_POLICY = {
  activeRole: 'admin' as DiscordOpsRole,
  roles: {
    viewer: ['read'],
    operator: ['read', 'monitor', 'restart', 'redeploy'],
    admin: ['read', 'monitor', 'restart', 'redeploy', 'rollback', 'stop', 'import', 'secret', 'reencrypt'],
  },
};

export async function getOperatorPolicy() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8')) as typeof DEFAULT_POLICY;
  } catch {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, `${JSON.stringify(DEFAULT_POLICY, null, 2)}\n`, 'utf8');
    return DEFAULT_POLICY;
  }
}

export async function setActiveRole(role: DiscordOpsRole) {
  const policy = await getOperatorPolicy();
  policy.activeRole = role;
  await fs.writeFile(FILE, `${JSON.stringify(policy, null, 2)}\n`, 'utf8');
  return policy;
}

export async function canPerform(capability: string) {
  const policy = await getOperatorPolicy();
  const allowed = policy.roles[policy.activeRole] || [];
  return allowed.includes(capability);
}
