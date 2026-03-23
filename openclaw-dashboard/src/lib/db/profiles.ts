import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

export async function ensureProfileForUser(user: User): Promise<DbProfileRow | null> {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = createSupabaseAdminClient();
    const payload = {
      id: user.id,
      email: user.email ?? null,
      full_name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
      avatar_url: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("id,email,full_name,avatar_url,role,created_at,updated_at")
      .single();

    if (error) throw error;
    return data as DbProfileRow;
  } catch (error) {
    logDbFallback("profiles.ensureProfileForUser", error);
    return null;
  }
}
