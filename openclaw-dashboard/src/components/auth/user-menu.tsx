import type { UserProfile } from "@/lib/auth/session";

export function UserMenu({ profile }: { profile: UserProfile | null }) {
  if (!profile) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <div className="text-sm text-zinc-200">{profile.full_name || profile.email || "Authenticated user"}</div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-500">{profile.role}</div>
      </div>
      <form action="/api/auth/logout" method="post">
        <button type="submit" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/[0.06]">
          Sign out
        </button>
      </form>
    </div>
  );
}
