import type { SupabaseClient } from "@supabase/supabase-js";

export async function maybeSelect<T>(
  client: SupabaseClient,
  table: string,
  columns = "*",
) {
  const result = await client.from(table).select(columns);
  if (result.error) {
    return { data: null as T[] | null, error: result.error };
  }
  return { data: (result.data ?? []) as T[], error: null };
}

export async function maybeInsert<T extends Record<string, unknown>>(
  client: SupabaseClient,
  table: string,
  value: T,
) {
  const result = await client.from(table).insert(value);
  return result.error ?? null;
}

export function logDbFallback(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[db-fallback:${scope}] ${message}`);
}
