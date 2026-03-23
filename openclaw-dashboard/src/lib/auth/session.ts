import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { isAppRole, type AppRole } from "@/lib/auth/roles";
import { ensureProfileForUser } from "@/lib/db/profiles";

export type UserProfile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role: AppRole;
};

export const getCurrentSession = cache(async () => {
  if (!hasSupabaseEnv()) {
    return { user: null as User | null, profile: null as UserProfile | null, configured: false };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, configured: true };
  }

  const profileData = await ensureProfileForUser(user);

  const profile: UserProfile = {
    id: user.id,
    email: profileData?.email ?? user.email ?? null,
    full_name: profileData?.full_name ?? user.user_metadata?.full_name ?? null,
    avatar_url: profileData?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    role: isAppRole(profileData?.role) ? profileData.role : "viewer",
  };

  return { user, profile, configured: true };
});
