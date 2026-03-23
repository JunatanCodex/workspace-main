import { NextResponse } from "next/server";
import { requireOperationalAccess } from "@/lib/auth/guard";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { syncDashboardStateToSupabase } from "@/lib/sync/dashboard-state";

export async function POST() {
  const session = await requireOperationalAccess();

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 400 });
  }

  const result = await syncDashboardStateToSupabase({
    userId: session.user.id,
    role: session.profile.role,
  });

  return NextResponse.json({ ok: true, synced: result, updatedAt: new Date().toISOString() });
}
