import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { appendCliHistory, type CliExecutionRecord } from "@/lib/cli/history";
import type { AppRole } from "@/lib/auth/roles";
import type { CliAuditStatus, DbCliAuditLogRow } from "@/lib/db/types";
import { logDbFallback, maybeSelect } from "@/lib/db/utils";

export async function appendCliAuditLog(record: DbCliAuditLogRow) {
  if (!hasSupabaseEnv()) {
    await appendCliHistory({
      id: record.id || `${record.command_id}-${record.created_at || new Date().toISOString()}`,
      commandId: record.command_id,
      label: record.label,
      support: "supported",
      ok: record.status === "success",
      timestamp: record.created_at || new Date().toISOString(),
      durationMs: record.duration_ms ?? undefined,
      stdout: record.stdout ?? undefined,
      stderr: record.stderr ?? undefined,
      note: record.note ?? undefined,
    });
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("cli_audit_logs").insert(record);
    if (error) throw error;
  } catch (error) {
    logDbFallback("cli-audit.append", error);
    await appendCliHistory({
      id: record.id || `${record.command_id}-${record.created_at || new Date().toISOString()}`,
      commandId: record.command_id,
      label: record.label,
      support: "supported",
      ok: record.status === "success",
      timestamp: record.created_at || new Date().toISOString(),
      durationMs: record.duration_ms ?? undefined,
      stdout: record.stdout ?? undefined,
      stderr: record.stderr ?? undefined,
      note: record.note ?? undefined,
    });
  }
}

export async function getCliAuditLogs(role: AppRole): Promise<CliExecutionRecord[]> {
  if (role !== "admin" && role !== "owner") {
    return [];
  }

  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await maybeSelect<DbCliAuditLogRow>(supabase, "cli_audit_logs");
    if (error || !data) throw error ?? new Error("No cli audit log rows returned.");
    return data
      .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
      .map((row) => ({
        id: row.id || `${row.command_id}-${row.created_at || new Date().toISOString()}`,
        commandId: row.command_id,
        label: row.label,
        support: "supported",
        ok: row.status === "success",
        timestamp: row.created_at || new Date().toISOString(),
        durationMs: row.duration_ms ?? undefined,
        stdout: row.stdout ?? undefined,
        stderr: row.stderr ?? undefined,
        note: row.note ?? undefined,
      }));
  } catch (error) {
    logDbFallback("cli-audit.get", error);
    return [];
  }
}

export function buildCliAuditRecord(input: {
  commandId: string;
  label: string;
  status: CliAuditStatus;
  requestedBy?: string | null;
  requestedRole?: AppRole | null;
  payload?: Record<string, unknown>;
  sanitizedArgs?: string[];
  stdout?: string;
  stderr?: string;
  note?: string;
  durationMs?: number;
}): DbCliAuditLogRow {
  return {
    command_id: input.commandId,
    label: input.label,
    status: input.status,
    requested_by: input.requestedBy ?? null,
    requested_role: input.requestedRole ?? null,
    input: input.payload ?? null,
    sanitized_args: input.sanitizedArgs ?? null,
    stdout: input.stdout ?? null,
    stderr: input.stderr ?? null,
    note: input.note ?? null,
    duration_ms: input.durationMs ?? null,
    created_at: new Date().toISOString(),
  };
}
