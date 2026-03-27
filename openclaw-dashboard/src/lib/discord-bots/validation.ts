const ALLOWLIST = [
  /^npm (ci|install)$/,
  /^npm run [a-zA-Z0-9:_-]+$/,
  /^node [./a-zA-Z0-9_-]+$/,
  /^python(3)? -m pip install -r [a-zA-Z0-9_./-]+$/,
  /^python(3)? -m venv [a-zA-Z0-9_./-]+$/,
  /^python(3)? -m compileall \.$/,
  /^python(3)? [./a-zA-Z0-9_-]+$/,
  /^\.venv\/bin\/pip install -r [a-zA-Z0-9_./-]+$/,
  /^\.venv\/bin\/python -m compileall \.$/,
  /^\.venv\/bin\/python [./a-zA-Z0-9_-]+$/,
  /^docker compose (pull|build|ps|up -d)$/,
  /^pnpm (install)$/,
  /^pnpm run [a-zA-Z0-9:_-]+$/,
  /^yarn( install)?$/,
  /^yarn [a-zA-Z0-9:_-]+$/,
];

function hasUnsafeShellChars(value: string): boolean {
  return /[|;&><`]/.test(value);
}

export function isAllowedCommand(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (hasUnsafeShellChars(trimmed)) return false;
  return ALLOWLIST.some((pattern) => pattern.test(trimmed));
}

export function validateCommandSet(commands: Record<string, string | undefined>): string[] {
  const errors: string[] = [];
  for (const [label, command] of Object.entries(commands)) {
    if (!command) continue;
    if (!isAllowedCommand(command)) errors.push(`${label} command is not in the safe allowlist.`);
  }
  return errors;
}

export function validateRepoUrl(url: string): boolean {
  return /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(url.trim());
}

export function normalizeBotId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
