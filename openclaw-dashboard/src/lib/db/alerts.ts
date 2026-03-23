import type { AlertItem } from "@/lib/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAlerts as getFileAlerts } from "@/lib/domain/alerts";
import { logDbFallback, maybeSelect } from "@/lib/db/utils";
import type { DbAlertRow } from "@/lib/db/types";

function mapAlertRow(row: DbAlertRow): AlertItem {
  return {
    type: row.type as AlertItem["type"],
    title: row.title,
    severity: row.severity as AlertItem["severity"],
    description: row.description,
    href: row.href ?? undefined,
  };
}

export async function getDashboardAlerts(): Promise<AlertItem[]> {
  if (!hasSupabaseEnv()) return getFileAlerts();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await maybeSelect<DbAlertRow>(supabase, "alerts");
    if (error || !data || data.length === 0) throw error ?? new Error("No alert rows returned.");
    return data.map(mapAlertRow);
  } catch (error) {
    logDbFallback("alerts.getDashboardAlerts", error);
    return getFileAlerts();
  }
}
