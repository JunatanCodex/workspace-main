import { UserMenu } from "@/components/auth/user-menu";
import { RefreshControl } from "@/components/ui/refresh-control";
import { getCurrentSession } from "@/lib/auth/session";

export async function TopBar() {
  const session = await getCurrentSession();

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-white/6 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Control plane</div>
        <div className="mt-1 text-sm text-zinc-400">Auto-refresh, live status, and operational controls.</div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <RefreshControl />
        {session.configured ? <UserMenu profile={session.profile} /> : null}
      </div>
    </div>
  );
}
