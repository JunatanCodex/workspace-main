import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { logDbFallback } from "@/lib/db/utils";
import type { DbProfileRow } from "@/lib/db/types";

export async function getProfileById(userId: string): Promise<DbProfileRow | null> {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,avatar_url,role,created_at,updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as DbProfileRow | null;
  } catch (error) {
    logDbFallback("profiles.getProfileById", error);
    return null;
  }
}
