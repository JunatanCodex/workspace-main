import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface CommandResult {
  ok: boolean;
  command: string;
  cwd: string;
  stdout: string;
  stderr: string;
  code?: number | null;
  error?: string;
  startedAt: string;
  finishedAt: string;
}

export async function runSafeCommand(command: string, cwd: string, env?: Record<string, string>): Promise<CommandResult> {
  const startedAt = new Date().toISOString();
  const shell = process.env.SHELL || "/bin/bash";
  try {
    const { stdout, stderr } = await execFileAsync(shell, ["-lc", command], {
      cwd,
      timeout: 120_000,
      maxBuffer: 1024 * 1024 * 8,
      env: { ...process.env, ...env },
    });
    return {
      ok: true,
      command,
      cwd,
      stdout: stdout || "",
      stderr: stderr || "",
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string; code?: number | null };
    return {
      ok: false,
      command,
      cwd,
      stdout: err.stdout || "",
      stderr: err.stderr || "",
      code: err.code,
      error: err.message,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }
}
