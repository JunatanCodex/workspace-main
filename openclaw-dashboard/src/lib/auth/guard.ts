import { redirect } from "next/navigation";
import { getCurrentSession, type UserProfile } from "@/lib/auth/session";
import { canManageOperations, type AppRole } from "@/lib/auth/roles";
import type { User } from "@supabase/supabase-js";

type AuthenticatedSession = {
  configured: true;
  user: User;
  profile: UserProfile;
};

export async function requireAuthenticatedUser(): Promise<AuthenticatedSession> {
  const session = await getCurrentSession();
  if (!session.configured) {
    throw new Error("Supabase is not configured.");
  }
  if (!session.user || !session.profile) {
    redirect("/login");
  }
  return {
    configured: true,
    user: session.user,
    profile: session.profile,
  };
}

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await requireAuthenticatedUser();
  if (!allowedRoles.includes(session.profile.role)) {
    throw new Error("You are not allowed to perform this action.");
  }
  return session;
}

export async function requireOperationalAccess() {
  const session = await requireAuthenticatedUser();
  if (!canManageOperations(session.profile.role)) {
    throw new Error("Admin or owner access is required.");
  }
  return session;
}
